import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';

// Import our new page components
import LandingPage from './components/LandingPage.jsx';
import LoginPage from './components/LoginPage.jsx';
import SignupPage from './components/SignupPage.jsx';
import MainApp from './pages/MainApp.jsx';
import PrivateRoute from './components/PrivateRoute';
import { socket } from './socket';
import { jwtDecode } from 'jwt-decode';


const App = () => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogin = (newToken) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
        const { user } = jwtDecode(newToken);
        socket.auth = { userId: user.id };
        socket.connect();
        socket.emit('user:online', user.id);
        navigate('/app');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
        socket.disconnect();
        navigate('/login');
    };

    useEffect(() => {
        if (token && !socket.connected) {
            const { user } = jwtDecode(token);
            socket.auth = { userId: user.id };
            socket.connect();
            socket.emit('user:online', user.id);
        }
    }, [token, location]);

    return (
        <>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/app" element={<PrivateRoute><MainApp onLogout={handleLogout} /></PrivateRoute>} />
                {/* Redirect old /gigs route to the new /app route */}
                <Route path="/gigs" element={<PrivateRoute><MainApp onLogout={handleLogout} /></PrivateRoute>} />
            </Routes>
        </>
    );
};

export default App;