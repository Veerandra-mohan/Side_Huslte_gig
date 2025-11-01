import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import './App.css'; // Corrected path
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';

// Set the base URL for all axios requests to your deployed backend
axios.defaults.baseURL = 'https://side-huslte-gig-backend.onrender.com';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);