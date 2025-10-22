
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

interface Message {
  sender: string;
  receiver: string;
  text: string;
}

const Chat: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const myUserId = 'get this from auth'; // Replace with actual user ID from auth

  useEffect(() => {
    socket.on('receiveMessage', (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, []);

  const sendMessage = () => {
    if (userId) {
      socket.emit('sendMessage', { sender: myUserId, receiver: userId, text });
      setText('');
    }
  };

  return (
    <div>
      <h1>Chat with User</h1>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <p>{msg.text}</p>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;
