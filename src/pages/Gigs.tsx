
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

interface Gig {
  _id: string;
  title: string;
  description: string;
  userName: string;
  user: string;
}

const Gigs: React.FC = () => {
  const [gigs, setGigs] = useState<Gig[]>([]);

  useEffect(() => {
    const fetchGigs = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/gigs');
        setGigs(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchGigs();
  }, []);

  return (
    <div>
      <h1>Gigs</h1>
      <div>
        {gigs.map((gig) => (
          <div key={gig._id}>
            <h2>{gig.title}</h2>
            <p>{gig.description}</p>
            <p>Posted by: {gig.userName}</p>
            <Link to={`/chat/${gig.user}`}>View and Chat</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gigs;
