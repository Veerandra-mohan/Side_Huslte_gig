import React, { useState, useEffect } from 'react';
import api from '../api';
import { socket } from '../socket';

const Gigs = () => {
  const [gigs, setGigs] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    api.get('/gigs').then(res => setGigs(res.data));
    socket.on('gig:created', (newGig) => {
      setGigs(prevGigs => [newGig, ...prevGigs]);
    });
    return () => socket.off('gig:created');
  }, []);

  const handleCreateGig = async (e) => {
    e.preventDefault();
    try {
      const newGig = { title, description, price: Number(price), tags: [], unit: 'N/A' };
      await api.post('/gigs', newGig);
      setTitle('');
      setDescription('');
      setPrice('');
    } catch (error) {
      console.error("Failed to create gig", error);
    }
  };

  return (
    <div>
      <h1>Gigs Page</h1>
      <form onSubmit={handleCreateGig}>
        <h2>Create a New Gig</h2>
        <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
        <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required />
        <input type="number" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} required />
        <button type="submit">Create Gig</button>
      </form>
      <h2>All Gigs</h2>
      {gigs.map(gig => (
        <div key={gig._id} className="gig">
          <h3>{gig.title}</h3>
          <p>{gig.description}</p>
          <p>Price: ${gig.price}</p>
          <p>By: {gig.user?.name || 'A user'}</p>
        </div>
      ))}
    </div>
  );
};

export default Gigs;