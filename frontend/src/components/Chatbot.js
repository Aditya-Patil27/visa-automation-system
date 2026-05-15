import React, { useState } from 'react';
import Button from './ui/Button';
import { api } from '../services/api';
import { L } from '../config/labels';

function Chatbot({ token }) {
  const [history, setHistory] = useState([]);
  const [question, setQuestion] = useState('');

  const sendQuestion = async () => {
    const data = await api.post('/chat', { question });
    setHistory([...history, { question, answer: data.answer }]);
    setQuestion('');
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>{L.CHATBOT}</h2>
      <div>
        {history.map((turn, idx) => (
          <div key={idx} style={{ marginBottom: '1rem' }}>
            <strong>You:</strong> {turn.question}
            <br />
            <strong>Bot:</strong> {turn.answer}
          </div>
        ))}
      </div>
      <div>
        <input value={question} onChange={(e) => setQuestion(e.target.value)} style={{ width: '60%' }} />
        <Button onClick={sendQuestion}>{L.SEND}</Button>
      </div>
    </div>
  );
}

export default Chatbot;
