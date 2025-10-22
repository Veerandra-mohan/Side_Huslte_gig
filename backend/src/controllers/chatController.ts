
import { Request, Response } from 'express';
import Message from '../models/Message';
import Gig from '../models/Gig';

export const getMessages = async (req: Request, res: Response) => {
  const { gigId, receiverId } = req.params;
  const senderId = req.user!.id;

  try {
    // Find the gig to ensure the receiver is the gig owner
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ msg: 'Gig not found' });
    }

    const gigOwnerId = gig.user.toString();

    // Determine the correct receiver based on who is making the request
    const actualReceiverId = senderId === gigOwnerId ? receiverId : gigOwnerId;

    const messages = await Message.find({
      gig: gigId,
      $or: [
        { sender: senderId, receiver: actualReceiverId },
        { sender: actualReceiverId, receiver: senderId },
      ],
    })
      .populate('sender', ['name', 'email'])
      .populate('receiver', ['name', 'email'])
      .sort({ createdAt: 'asc' });

    res.json(messages);
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).send('Server error');
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  const { gigId, receiverId, message } = req.body;
  const senderId = req.user!.id;

  try {
    const newMessage = new Message({
      gig: gigId,
      sender: senderId,
      receiver: receiverId,
      message,
    });

    const savedMessage = await newMessage.save();
    
    // Populate sender and receiver details for the response
    const populatedMessage = await Message.findById(savedMessage._id)
        .populate('sender', ['name', 'email'])
        .populate('receiver', ['name', 'email']);

    res.status(201).json(populatedMessage);
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).send('Server error');
  }
};
