import React, { useState, useEffect } from 'react';
import { socket } from '../socket';
import { jwtDecode } from 'jwt-decode';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [toId, setToId] = useState('');

  const token = localStorage.getItem('token');
  const { user: { id: fromId } } = jwtDecode(token);

  useEffect(() => {
    socket.on('message:receive', (message) => {
      setMessages(prev => [...prev, message]);
    });
    return () => socket.off('message:receive');
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !toId) return;

    const messageData = { fromId, toId, text: newMessage };
    socket.emit('message:send', messageData);
    setMessages(prev => [...prev, { ...messageData, from: fromId }]);
    setNewMessage('');
  };

  return (
    <div>
      <h1>Chat Page</h1>
      <input type="text" placeholder="Enter User ID to chat with" value={toId} onChange={e => setToId(e.target.value)} />
      <div style={{ height: '300px', border: '1px solid #ccc', overflowY: 'scroll', marginBottom: '10px', padding: '10px' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ textAlign: msg.from === fromId ? 'right' : 'left' }}><p>{msg.text}</p></div>
        ))}
      </div>
      <form onSubmit={handleSendMessage}><input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type a message..." /><button type="submit" disabled={!toId}>Send</button></form>
    </div>
  );
};

export default Chat;