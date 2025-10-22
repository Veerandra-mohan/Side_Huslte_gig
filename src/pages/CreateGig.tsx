
import React, { useState } from 'react';
import axios from 'axios';

const CreateGig: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    community: '',
  });

  const { title, description, price, community } = formData;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      };
      const res = await axios.post('http://localhost:5000/api/gigs', formData, config);
      console.log(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <input
        type="text"
        placeholder="Title"
        name="title"
        value={title}
        onChange={onChange}
        required
      />
      <input
        type="text"
        placeholder="Description"
        name="description"
        value={description}
        onChange={onChange}
        required
      />
      <input
        type="number"
        placeholder="Price"
        name="price"
        value={price}
        onChange={onChange}
        required
      />
      <input
        type="text"
        placeholder="Community"
        name="community"
        value={community}
        onChange={onChange}
        required
      />
      <input type="submit" value="Create Gig" />
    </form>
  );
};

export default CreateGig;
