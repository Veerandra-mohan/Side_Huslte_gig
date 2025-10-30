// File: backend/server.ts

import express, { Request, Response, NextFunction } from 'express'; // <-- CHANGED
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const clients = new Set<WebSocket>();

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
    console.error('MONGO_URI is not defined in your .env file');
    process.exit(1);
}

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
    console.error('JWT_SECRET is not defined in your .env file');
    process.exit(1);
}

const client = new MongoClient(mongoUri);
let db: Db;

async function connectToDb() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        db = client.db("soc_app_db");
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    }
}

connectToDb().then(() => {
    app.use(express.json());

    // v--v--v--v--v--v--v--v--v--v--v--v--v--v--v--v--v--v--v--v--v
    // CHANGED: Added types for req, res, and next
    const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
    // ^--^--^--^--^--^--^--^--^--^--^--^--^--^--^--^--^--^--^--^--^
        const authHeader = req.headers.authorization;

        if (authHeader) {
            const token = authHeader.split(' ')[1];

            // v--v--v--v--v--v--v--v--v--v--v--v--v--v--v--v--v--v--v--v--v
            // CHANGED: Added types for err and user
            jwt.verify(token, jwtSecret, (err: any, user: any) => {
            // ^--^--^--^--^--^--^--^--^--^--^--^--^--^--^--^--^--^--^--^--^
                if (err) {
                    return res.sendStatus(403);
                }

                req.user = user;
                next();
            });
        } else {
            res.sendStatus(401);
        }
    };

    app.post('/api/register', async (req: Request, res: Response) => {
        try {
            const { username, email, password } = req.body;
            if (!username || !email || !password) {
                return res.status(400).json({ message: 'Username, email, and password are required' });
            }

            const usersCollection = db.collection('users');
            const existingUser = await usersCollection.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'User with this email already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const result = await usersCollection.insertOne({ username, email, password: hashedPassword, createdAt: new Date() });
            
            res.status(201).json({ message: 'User created successfully', userId: result.insertedId });
        } catch (error) {
            console.error('Failed to create user:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });

    app.post('/api/login', async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ message: 'Email and password are required' });
            }

            const usersCollection = db.collection('users');
            const user = await usersCollection.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const token = jwt.sign({ userId: user._id, email: user.email }, jwtSecret, { expiresIn: '1h' });

            res.status(200).json({ token });
        } catch (error) {
            console.error('Failed to login:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });

    app.post('/api/gigs', authenticateJWT, async (req: Request, res: Response) => {
        try {
            const { title, description, price, tags } = req.body;
            if (!title || !description || !price || !tags) {
                return res.status(400).json({ message: 'Title, description, price, and tags are required' });
            }

            const gigsCollection = db.collection('gigs');
            // This line below will work now thanks to the types.d.ts file
            const newGig = { title, description, price, tags, createdAt: new Date(), userId: req.user.userId };
            const result = await gigsCollection.insertOne(newGig);

            const createdGig = await gigsCollection.findOne({ _id: result.insertedId });

            const broadcastMessage = JSON.stringify({ type: 'NEW_GIG', payload: createdGig });
            for (const client of clients) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(broadcastMessage);
                }
            }
            
            res.status(201).json(createdGig);
        } catch (error) {
            console.error('Failed to create gig:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });

    app.get('/api/gigs', authenticateJWT, async (req: Request, res: Response) => {
        try {
            const gigsCollection = db.collection('gigs');
            const gigs = await gigsCollection.find({}).sort({ createdAt: -1 }).toArray();
            res.status(200).json(gigs);
        } catch (error) {
            console.error('Failed to get gigs:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });

    wss.on('connection', (ws: WebSocket) => {
        clients.add(ws);
        console.log('Client connected');
    
        ws.on('message', async (message: string) => {
            console.log('received: %s', message);
            try {
                const parsedMessage = JSON.parse(message);
                const messagesCollection = db.collection('messages');
                const result = await messagesCollection.insertOne({ 
                    ...parsedMessage, 
                    createdAt: new Date() 
                });

                const savedMessage = { ...parsedMessage, _id: result.insertedId, createdAt: new Date() };
                const broadcastMessage = JSON.stringify(savedMessage);

                for (const client of clients) {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(broadcastMessage);
                    }
                }
            } catch (error) {
                console.error('Failed to process message:', error);
            }
        });
    
        ws.on('close', () => {
            clients.delete(ws);
            console.log('Client disconnected');
        });
    
        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
    });
    
    const port = process.env.PORT || 8080;
    server.listen(port, () => {
        console.log(`Server is listening on port ${port}`);
    });
});

process.on('SIGINT', async () => {
    await client.close();
    console.log('MongoDB connection closed');
    process.exit(0);
});
