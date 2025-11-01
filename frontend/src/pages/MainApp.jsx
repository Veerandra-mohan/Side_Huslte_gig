import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { socket } from '../socket';
import { jwtDecode } from 'jwt-decode';


const communityToTags = {
    'Rajahmundry': ['#local', '#event', '#food', '#homemade'],
    'College Students': ['#books', '#study', '#semester', '#teaching', '#onlineclass'],
    'Developers': ['#webdesign', '#UI', '#UX', '#consultation'],
    'Designers': ['#design', '#branding', '#UI', '#UX', '#logo', '#graphics', '#socialmedia']
};

// --- COMPONENTS ---

const GigPost = ({ gig, onViewChat }) => (
    <div className="gig-post" aria-labelledby={`gig-title-${gig.id}`}>
        <div style={{display: 'flex', justifyContent: 'space-between'}}><span className="poster-info">{gig.user?.name || 'User'}</span><span className="post-time">{new Date(gig.createdAt).toLocaleString()}</span></div>
        <h3 id={`gig-title-${gig.id}`} className="gig-title">{gig.title}</h3>
        <p className="gig-description">{gig.description}</p>
        <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '16px 0'}}>{gig.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}</div>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto'}}>
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
        setIsLoading(true);
        setError('AI Generation is currently disabled. Please fill in the details manually.');
        setTimeout(() => setIsLoading(false), 1500);
    };

    const handlePostGig = () => {
        if (!title || !description || !price) {
            alert("Please fill in Title, Description, and Price.");
            return;
        }
        const newGigData = {
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

const GigChatView = ({ gig, onBack, currentUser }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messageListRef = useRef(null);

    useEffect(() => {
        // This is where you would fetch existing messages for this gig/chat
        // For now, we'll start with a clean slate.

        const onMessageReceive = (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        };
        socket.on('message:receive', onMessageReceive);

        return () => {
            socket.off('message:receive', onMessageReceive);
        };
    }, [gig]);

    useEffect(() => {
        // Auto-scroll to the bottom of the message list
        if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = () => {
        if (!newMessage.trim() || !currentUser) return;

        const messageData = {
            fromId: currentUser.id,
            toId: gig.user._id, // The ID of the user who posted the gig
            text: newMessage,
        };

        socket.emit('message:send', messageData);
        // Add the message to our own list immediately for a responsive feel
        setMessages((prev) => [...prev, { ...messageData, from: currentUser.id }]);
        setNewMessage('');
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
                    <div className="detail-item"><strong>Posted by:</strong> <span>{gig.user?.name || 'User'}</span></div>
                    <div className="detail-item"><strong>Description:</strong> <span>{gig.description}</span></div>
                    <div className="detail-item"><strong>Price:</strong> <span className="gig-price">₹{gig.price} <small>/ {gig.unit}</small></span></div>
                    <div className="detail-item"><strong>Tags:</strong> <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>{gig.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}</div></div>
                </section>
                <section className="chat-window">
                    <h2>Chat with {gig.user?.name || 'User'}</h2>
                    <div className="message-list" ref={messageListRef}>
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.from === currentUser.id ? 'sent' : 'received'}`}>
                                {msg.text}
                            </div>
                        ))}
                    </div>
                    <div className="chat-input-area">
                        <input
                            type="text"
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <button onClick={handleSendMessage}>Send</button>
                    </div>
                </section>
            </div>
        </div>
    );
};

const CommunityForum = ({ gigs, onViewChat }) => {
    const communities = ['Rajahmundry', 'College Students', 'Developers', 'Designers'];
    const [active, setActive] = useState('Rajahmundry');
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

const FreelanceForum = ({ gigs, openCreateView, onViewChat }) => (
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
                <div className="gig-list">{gigs.map(gig => <GigPost key={gig._id} gig={gig} onViewChat={onViewChat} />)}</div>
            </section>
        </main>
    </>
);

const AppHeader = ({ activeSection, setActiveSection, onLogout }) => {
    const navItems = ['Freelancing Forum', 'Community Forum', 'User Profile'];
    return (
        <header className="app-header">
            <div className="logo">GigConnect</div>
            <nav className="main-nav"><ul>{navItems.map(item => (<li key={item} className={activeSection === item ? 'active' : ''}><button onClick={() => setActiveSection(item)}>{item}</button></li>))}</ul></nav>
            <div className="header-right">
                <div className="user-menu" onClick={onLogout} style={{cursor: 'pointer'}}>
                    <img src="https://i.pravatar.cc/40?u=demouser" alt="User Avatar" title="Logout" />
                </div>
            </div>
        </header>
    );
};

const InfoSidebar = () => (
    <aside className="info-sidebar">
        <div className="info-card wallet-card">
            <h4>My Wallet</h4><div className="balance-amount">₹500</div><p className="balance-label">Available Balance</p>
            <div className="wallet-actions"><button>+ Add Funds</button><button>Withdraw</button></div>
        </div>
        <div className="info-card profile-card">
            <h4>My Profile</h4>
            <div className="profile-summary">
                <img src="https://i.pravatar.cc/60?u=demouser" alt="User Avatar" /><div className="profile-details"><span className="profile-name">Demo User</span><span className="profile-rating">⭐⭐⭐⭐⭐ 4.8</span></div>
            </div>
             <div className="profile-stats"><div><span>24</span> Projects</div><div><span>18</span> Reviews</div></div>
            <button className="view-profile-btn">View Full Profile</button>
        </div>
    </aside>
);

const MainApp = ({ onLogout }) => {
    const [gigs, setGigs] = useState([]);
    const [isCreatingGig, setIsCreatingGig] = useState(false);
    const [activeSection, setActiveSection] = useState('Freelancing Forum');
    const [selectedGig, setSelectedGig] = useState(null);

    const currentUser = useMemo(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwtDecode(token);
            return decoded.user;
        }
        return null;
    }, []);

    useEffect(() => {
        const fetchGigs = async () => {
            try {
                const res = await axios.get('/api/gigs', { headers: { 'x-auth-token': localStorage.getItem('token') } });
                setGigs(res.data);
            } catch (err) {
                console.error("Failed to fetch gigs", err);
            }
        };
        fetchGigs();

        const onGigCreated = (newGig) => {
            setGigs((prevGigs) => [newGig, ...prevGigs]);
        };

        socket.on('gig:created', onGigCreated);

        return () => {
            socket.off('gig:created', onGigCreated);
        };
    }, []);

    const handleCreateGig = (newGigData) => {
        if (!currentUser) {
            alert('You must be logged in to create a gig.');
            return;
        }
        socket.emit('gig:create', { ...newGigData, user: currentUser.id });
        setIsCreatingGig(false);
    };

    const handleViewChat = (gig) => setSelectedGig(gig);
    const handleBack = () => {
        setSelectedGig(null);
        setIsCreatingGig(false);
    }

    const renderSection = () => {
        if (isCreatingGig) {
            return <CreateGigView closeModal={() => setIsCreatingGig(false)} onCreateGig={handleCreateGig} />;
        }
        if (selectedGig) {
            return <GigChatView gig={selectedGig} onBack={handleBack} currentUser={currentUser} />;
        }
        switch (activeSection) {
            case 'Freelancing Forum': return <FreelanceForum gigs={gigs} openCreateView={() => setIsCreatingGig(true)} onViewChat={handleViewChat} />;
            case 'Community Forum': return <CommunityForum gigs={gigs} onViewChat={handleViewChat} />;
            default: return <FreelanceForum gigs={gigs} openCreateView={() => setIsCreatingGig(true)} onViewChat={handleViewChat} />;
        }
    }

    return (
        <div className="main-app-container">
            <AppHeader activeSection={activeSection} setActiveSection={setActiveSection} onLogout={onLogout} />
            <div className="main-app-content-wrapper">
                <div className="main-content-column">{renderSection()}</div>
                {!selectedGig && !isCreatingGig && <InfoSidebar />}
            </div>
        </div>
    )
}

export default MainApp;