import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, NavLink, Outlet, useNavigate, useOutletContext } from 'react-router-dom';
 
const communityToTags = {
    'Rajahmundry': ['#local', '#event', '#food', '#homemade'],
    'College Students': ['#books', '#study', '#semester', '#teaching', '#onlineclass'],
    'Developers': ['#webdesign', '#UI', '#UX', '#consultation'],
    'Designers': ['#design', '#branding', '#UI', '#UX', '#logo', '#graphics', '#socialmedia']
};

// --- MOCK BACKEND & DATA ---

const mockUsers = {
    "teja@gmail.com": { id: 101, name: "Teja", email: "teja@gmail.com", password: "1234", wallet: 750 },
    "balu@gmail.com": { id: 102, name: "Balu", email: "balu@gmail.com", password: "123", wallet: 500 },
};
const initialGigs = [
    { id: 1, user: 'Charlie Brown', time: '5 minutes ago', title: 'Sell Old Books (5 Pack)', description: 'Set of 5 old textbooks including Mathematics, Physics, Chemistry, Graphics Engineering, and DPM Dec. Useful for semester prep.', tags: ['#books', '#study', '#semester'], price: 200, unit: 'N/A' },
    { id: 2, user: 'Diana Prince', time: '15 minutes ago', title: 'Online Teaching (DSCA)', description: '10 DSCA classes for a flat fee. Covers basics + exam-focused problem solving. Online sessions, flexible timings.', tags: ['#teaching', '#DSCA', '#onlineclass'], price: 200, unit: 'N/A' },
    { id: 3, user: 'Alice Johnson', time: '30 minutes ago', title: 'Temporary Streaming Access', description: 'Get temporary login access to a streaming account for 2-3 days with restrictions applied.', tags: ['#streaming', '#entertainment', '#weekend'], price: 150, unit: '3 Days' },
    { id: 4, user: 'Eve Adams', time: '1 hour ago', title: 'Homemade Food Order', description: 'Homemade food service. Includes rice + 3 curries. Veggie add-ons available for ₹50/order. Fully customizable.', tags: ['#food', '#homemade', '#local'], price: 100, unit: 'Per Order' },
    { id: 5, user: 'Bob Williams', time: '2 hours ago', title: 'Need a Local Cameraman', description: 'Looking for a cameraman to shoot a short speech for a local event. Quick and affordable service needed.', tags: ['#cameraman', '#event', '#local'], price: 50, unit: 'Per Event' },
    { id: 6, user: 'Demo User', time: '3 hours ago', title: 'Website Design Consultation', description: 'One-hour consultation session to review your website UI/UX. Provide actionable feedback and suggestions for improvement.', tags: ['#webdesign', '#UI', '#UX', '#consultation'], price: 250, unit: 'Per Consultation' },
];

// --- INTERFACES ---
interface Gig {
    id: number; user: string; time: string; title: string; description: string; tags: string[]; price: number; unit: string;
}
interface User {
    id: number; name: string; email: string; wallet: number;
}
interface Message {
    text: string;
    type: 'sent' | 'received';
}
type NewGigData = Omit<Gig, 'id' | 'user' | 'time'>;

// --- COMPONENTS ---

const AuthPage = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleLogin = () => {
        const user = mockUsers[email];
        if (user && user.password === password) {
            onLogin(user);
        } else {
            setError('Invalid email or password.');
        }
    };

    const handleRegister = () => {
        if (mockUsers[email]) {
            setError('User with this email already exists.');
            return;
        }
        const newUser = {
            id: Date.now(),
            name,
            email,
            password, // In a real app, hash this password
            wallet: 100, // Starting wallet balance
        };
        mockUsers[email] = newUser;
        onLogin(newUser);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (isLogin) {
            handleLogin();
        } else {
            handleRegister();
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header"><h1>{isLogin ? 'Login' : 'Sign Up'}</h1></div>
                <form className="login-form" onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="form-group">
                            <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                    )}
                    <div className="form-group">
                        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    {error && <p className="error-message" style={{textAlign: 'center', marginTop: '-10px', marginBottom: '10px'}}>{error}</p>}
                    <button className="login-btn" type="submit">{isLogin ? 'Sign In' : 'Create Account'}</button>
                </form>
                <div className="login-footer">
                    <button className="link-button" onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                    </button>
                </div>
            </div>
        </div>
    );
};

const GigPost: React.FC<{ gig: Gig; onViewChat: (gig: Gig) => void }> = ({ gig, onViewChat }) => (
    <div className="gig-post" aria-labelledby={`gig-title-${gig.id}`}>
        <div className="gig-header"><span className="poster-info">{gig.user}</span><span className="post-time">{gig.time}</span></div>
        <h3 id={`gig-title-${gig.id}`} className="gig-title">{gig.title}</h3>
        <p className="gig-description">{gig.description}</p>
        <div className="gig-tags">{gig.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}</div>
        <div className="gig-footer">
            <span className="gig-price">₹{gig.price} <small>/ {gig.unit}</small></span>
            <button className="view-chat-btn" onClick={() => onViewChat(gig)}>View & Chat</button>
        </div>
    </div>
);

const CreateGigView = ({ closeModal, onCreateGig }) => {
    const [prompt, setPrompt] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [price, setPrice] = useState('');
    const [unit, setUnit] = useState('N/A');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsLoading(true);
        setError('');
        // AI generation logic has been removed as requested.
        // You can add a mock response or a different implementation here.
        setTimeout(() => {
            setError('AI generation is currently disabled.');
            setIsLoading(false);
        }, 500);
    };

    const handlePostGig = () => {
        if (!title || !description || !price) {
            alert("Please fill in Title, Description, and Price.");
            return;
        }
        const newGigData: NewGigData = {
            title,
            description,
            tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
            price: Number(price),
            unit,
        };
        onCreateGig(newGigData);
    };

    return (
        <div className="create-gig-view">
             <header className="create-gig-header">
                <h1>Create a New Gig</h1>
            </header>
            <div className="create-gig-content">
                <div className="ai-panel">
                    <h2>Generate with AI</h2>
                    <p>Describe your gig idea, and let AI fill in the details for you.</p>
                     <div className="form-group">
                        <label htmlFor="ai-prompt">Your Gig Idea</label>
                        <textarea id="ai-prompt" value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="e.g., help with math homework for college exams" rows={4}></textarea>
                    </div>
                    <button className="generate-ai-btn" onClick={handleGenerate} disabled={isLoading}>
                        {isLoading ? 'Generating...' : '✨ Generate with AI'}
                    </button>
                    {error && <p className="error-message">{error}</p>}
                </div>
                 <div className="form-panel">
                    <h2>Gig Details</h2>
                    <div className="form-group"><label htmlFor="title">Title</label><input id="title" type="text" value={title} onChange={e => setTitle(e.target.value)} /></div>
                    <div className="form-group"><label htmlFor="description">Description</label><textarea id="description" value={description} onChange={e => setDescription(e.target.value)}></textarea></div>
                    <div className="form-group"><label htmlFor="tags">Tags (comma separated)</label><input id="tags" type="text" value={tags} onChange={e => setTags(e.target.value)} /></div>
                    <div className="form-group"><label htmlFor="price">Price (INR)</label><input id="price" type="number" value={price} onChange={e => setPrice(e.target.value)} /></div>
                    <div className="form-group"><label htmlFor="unit">Unit</label><input id="unit" type="text" value={unit} onChange={e => setUnit(e.target.value)} /></div>
                 </div>
            </div>
             <div className="create-gig-actions">
                    <button className="action-btn cancel-btn" onClick={closeModal}>Cancel</button>
                    <button className="action-btn post-btn" onClick={handlePostGig}>Post Gig</button>
            </div>
        </div>
    );
};

const GigChatView: React.FC<{ gig: Gig; onBack: () => void }> = ({ gig, onBack }) => {
    const [messages, setMessages] = useState<Message[]>([
        { text: `Hey! I'm interested in your offer for '${gig.title}'.`, type: 'received' },
        { text: 'Hi there! Great to hear. Do you have any questions?', type: 'sent' },
    ]);
    const [newMessage, setNewMessage] = useState('');

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;

        const messageToSend: Message = { text: newMessage, type: 'sent' };
        setMessages(prev => [...prev, messageToSend]);
        setNewMessage('');

        // Simulate a reply after a short delay
        setTimeout(() => {
            const reply: Message = { text: 'Got it. Let me check on that for you.', type: 'received' };
            setMessages(prev => [...prev, reply]);
        }, 1000);
    };

    return (
        <div className="gig-chat-view">
            <header className="chat-header">
                <button onClick={onBack} className="back-btn" aria-label="Go back">←</button>
                <h1>{gig.title}</h1>
            </header>
            <div className="chat-content-wrapper">
                <section className="gig-details-panel">
                    <h2>Gig Details</h2>
                    <div className="detail-item"><strong>Posted by:</strong> <span>{gig.user}</span></div>
                    <div className="detail-item"><strong>Description:</strong> <span>{gig.description}</span></div>
                    <div className="detail-item"><strong>Price:</strong> <span className="gig-price">₹{gig.price} <small>/ {gig.unit}</small></span></div>
                    <div className="detail-item"><strong>Tags:</strong> <div className="gig-tags">{gig.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}</div></div>
                </section>
                <section className="chat-window">
                    <h2>Chat with {gig.user}</h2>
                    <div className="message-list">
                        {messages.map((msg, index) => <div key={index} className={`message ${msg.type}`}>{msg.text}</div>)}
                    </div>
                    <form className="chat-input-area" onSubmit={handleSendMessage}>
                        <input type="text" placeholder="Type your message..." value={newMessage} onChange={e => setNewMessage(e.target.value)} />
                        <button type="submit">Send</button>
                    </form>
                </section>
            </div>
        </div>
    );
};

const CommunityForum = () => {
    const communities = ['Rajahmundry', 'College Students', 'Developers', 'Designers'];
    const [active, setActive] = useState('Rajahmundry');
    const { gigs, onViewChat } = useOutletContext<OutletContextType>();
    const filteredGigs = gigs.filter(gig => {
        const relevantTags = communityToTags[active];
        if (!relevantTags) return false;
        return gig.tags.some(tag => relevantTags.includes(tag));
    });

    return (
        <div className="community-forum-container">
            <header className="header"><h1>Community Forum</h1></header>
            <p className="forum-description">Discover gigs and opportunities within your favorite communities.</p>
            <div className="community-topics">{communities.map(item => (<div key={item} className={`topic-card ${active === item ? 'active' : ''}`} onClick={() => setActive(item)}><span className="topic-icon">#</span><span className="topic-name">{item}</span></div>))}</div>
            <section className="community-content">
                <h2>{active} Gigs</h2>
                <div className="gig-list">{filteredGigs.length > 0 ? (filteredGigs.map(gig => <GigPost key={gig.id} gig={gig} onViewChat={onViewChat} />)) : (<p>No gigs found for this community.</p>)}</div>
            </section>
        </div>
    );
}

const UserProfile = () => {
    const { gigs, onViewChat, currentUser } = useOutletContext<OutletContextType>();
    const myGigs = gigs.filter(gig => gig.user === currentUser.name);
    return (
        <div className="user-profile-page">
            <header className="header"><h1>User Profile</h1></header>
            <div className="profile-details-card">
                 <div className="profile-info">
                     <h2>{currentUser.name}</h2><p className="profile-rating">⭐⭐⭐⭐⭐ 4.8</p>
                     <div className="profile-stats-inline"><span><strong>{myGigs.length}</strong> Projects</span><span><strong>18</strong> Reviews</span></div>
                 </div>
            </div>
            <section className="user-gigs-section">
                <h2>My Gigs</h2>
                <div className="gig-list">{myGigs.length > 0 ? (myGigs.map(gig => <GigPost key={gig.id} gig={gig} onViewChat={onViewChat} />)) : (<p>You haven't created any gigs yet.</p>)}</div>
            </section>
        </div>
    );
};

interface OutletContextType {
    gigs: Gig[];
    openCreateView: () => void;
    onViewChat: (gig: Gig) => void;
    currentUser: User;
}

const FreelanceForum = () => {
    const { gigs, openCreateView, onViewChat } = useOutletContext<OutletContextType>();
    return (
        <>
            <section className="hero-section">
                <h2>Find Your Next Opportunity</h2><p>Connect with local talent, find gigs, or hire professionals.</p>
                <div className="hero-actions"><button className="hero-btn primary">Find a Gig</button><button className="hero-btn secondary">Hire a Freelancer</button></div>
            </section>
            <main className="main-content">
                <header className="header">
                    <h1>Freelancing Forum</h1>
                    <button className="create-post-btn" onClick={openCreateView}>+ Create Post</button>
                </header>
                <section>
                    <div className="gig-list">{gigs.map(gig => <GigPost key={gig.id} gig={gig} onViewChat={onViewChat} />)}</div>
                </section>
            </main>
        </>
    );
};

const AppHeader = ({ currentUser }) => {
    const navItems = ['Freelancing Forum', 'Community Forum', 'User Profile'];
    return (
        <header className="app-header">
            <div className="logo">GigConnect</div>
            <nav className="main-nav"><ul>{navItems.map(item => (<li key={item}><NavLink to={`/${item.toLowerCase().replace(/\s+/g, '-')}`}>{item}</NavLink></li>))}</ul></nav>
            <div className="header-right"><div className="user-menu"><span>{currentUser.name}</span></div></div>
        </header>
    );
};

const InfoSidebar = ({ currentUser }) => (
    <aside className="info-sidebar">
        <div className="info-card wallet-card">
            <h4>My Wallet</h4><div className="balance-amount">₹{currentUser.wallet.toLocaleString()}</div><p className="balance-label">Available Balance</p>
            <div className="wallet-actions"><button>+ Add Funds</button><button>Withdraw</button></div>
        </div>
        <div className="info-card profile-card">
            <h4>My Profile</h4>
            <div className="profile-summary">
                <div className="profile-details"><span className="profile-name">{currentUser.name}</span><span className="profile-rating">⭐⭐⭐⭐⭐ 4.8</span></div>
            </div>
             <div className="profile-stats"><div><span>24</span> Projects</div><div><span>18</span> Reviews</div></div>
            <button className="view-profile-btn">View Full Profile</button>
        </div>
    </aside>
);

const AppLayout = ({ currentUser }) => {
    const [gigs, setGigs] = useState<Gig[]>([]);
    const [isLoadingGigs, setIsLoadingGigs] = useState(true);
    const [isCreatingGig, setIsCreatingGig] = useState(false);
    const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
    const navigate = useNavigate();

    // Fetch gigs on component mount
    useEffect(() => {
        // Simulate fetching gigs from a backend API
        const fetchGigs = async () => {
            console.log("Fetching gigs from backend...");
            // In a real app: const response = await fetch(`${process.env.REACT_APP_API_URL}/api/gigs`);
            // const data = await response.json();
            setGigs(initialGigs); // Using mock data for now
            setIsLoadingGigs(false);
        };
        fetchGigs();
    }, []);

    const handleCreateGig = (newGigData: NewGigData) => {
        const newGig: Gig = {
            id: Date.now(),
            user: currentUser.name,
            time: 'Just now',
            ...newGigData
        };
        // Simulate POST request to backend
        // In a real app: await fetch(`${process.env.REACT_APP_API_URL}/api/gigs', { method: 'POST', body: JSON.stringify(newGig), ... });
        console.log("Posting new gig to backend:", newGig);
        initialGigs.unshift(newGig); // Add to our mock data source
        setGigs([newGig, ...gigs]);
        setIsCreatingGig(false);
    };

    const handleViewChat = (gig: Gig) => setSelectedGig(gig);
    const handleBack = () => setSelectedGig(null);

    return (
        <div className="main-app-container">
            <AppHeader currentUser={currentUser} />
            <div className="main-app-content-wrapper">
                <div className="main-content-column">
                    {isLoadingGigs ? (
                        <div>Loading gigs...</div>
                    ) : isCreatingGig ? (
                        <CreateGigView closeModal={() => setIsCreatingGig(false)} onCreateGig={handleCreateGig} />
                    ) : selectedGig ? (
                        <GigChatView gig={selectedGig} onBack={handleBack} />
                    ) : (
                        <Outlet context={{ gigs, openCreateView: () => setIsCreatingGig(true), onViewChat: handleViewChat, currentUser }} />
                    )}
                </div>
                {!selectedGig && !isCreatingGig && <InfoSidebar currentUser={currentUser} />}
            </div>
        </div>
    )
}

const App = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    if (!currentUser) { 
        return <AuthPage onLogin={setCurrentUser} />; 
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<AppLayout currentUser={currentUser} />}>
                    <Route index element={<FreelanceForum />} />
                    <Route path="freelancing-forum" element={<FreelanceForum />} />
                    <Route path="community-forum" element={<CommunityForum />} />
                    <Route path="user-profile" element={<UserProfile />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
