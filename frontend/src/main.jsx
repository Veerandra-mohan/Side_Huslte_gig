import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import './App.css'; // Corrected path
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';

// Set the base URL for axios. Use VITE_API_URL for production, otherwise it's relative to the proxy.
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '/';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);