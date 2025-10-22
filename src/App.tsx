
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Register from './pages/Register';
import Login from './pages/Login';
import Gigs from './pages/Gigs';
import CreateGig from './pages/CreateGig';
import Chat from './pages/Chat';

const App: React.FC = () => {
  return (
    <Router>
      <Header />
      <main className="container">
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/gigs" element={<Gigs />} />
          <Route path="/create-gig" element={<CreateGig />} />
          <Route path="/chat/:userId" element={<Chat />} />
          <Route path="/" element={<Gigs />} />
        </Routes>
      </main>
    </Router>
  );
};

export default App;
