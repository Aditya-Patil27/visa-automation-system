import React, { useState } from 'react';

function Chatbot({ token }) {
  const [history, setHistory] = useState([]);
  const [question, setQuestion] = useState('');

  const sendQuestion = async () => {
    const res = await fetch('http://localhost:8000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ question }),
    });
    const data = await res.json();
    setHistory([...history, { question, answer: data.answer }]);
    setQuestion('');
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>Chatbot</h2>
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
        <button onClick={sendQuestion}>Send</button>
      </div>
    </div>
  );
}

export default Chatbot;
