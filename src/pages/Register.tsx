
import React, { useState } from 'react';
import axios from 'axios';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const { name, email, password } = formData;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);
      console.log(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <input
        type="text"
        placeholder="Name"
        name="name"
        value={name}
        onChange={onChange}
        required
      />
      <input
        type="email"
        placeholder="Email Address"
        name="email"
        value={email}
        onChange={onChange}
        required
      />
      <input
        type="password"
        placeholder="Password"
        name="password"
        value={password}
        onChange={onChange}
        minLength={6}
        required
      />
      <input type="submit" value="Register" />
    </form>
  );
};

export default Register;
