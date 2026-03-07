import React, { useEffect, useState } from 'react';

function AdminDashboard({ token }) {
  const [visas, setVisas] = useState([]);
  const [form, setForm] = useState({ country: '', visa_type: '', documents: '', processing_time: '' });

  const loadVisas = async () => {
    const res = await fetch('http://localhost:8000/visa', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setVisas(data);
  };

  useEffect(() => {
    loadVisas();
  }, []);

  const handleAdd = async () => {
    const body = {
      country: form.country,
      visa_type: form.visa_type,
      documents: form.documents.split(',').map((s) => s.trim()),
      processing_time: form.processing_time,
    };
    await fetch('http://localhost:8000/visa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    loadVisas();
  };

  const handleDelete = async (id) => {
    await fetch(`http://localhost:8000/visa/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    loadVisas();
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
      <h2>Admin Dashboard</h2>
      <div>
        <h3>Add visa requirement</h3>
        <input placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
        <input placeholder="Visa type" value={form.visa_type} onChange={(e) => setForm({ ...form, visa_type: e.target.value })} />
        <input placeholder="Documents comma separated" value={form.documents} onChange={(e) => setForm({ ...form, documents: e.target.value })} />
        <input placeholder="Processing time" value={form.processing_time} onChange={(e) => setForm({ ...form, processing_time: e.target.value })} />
        <button onClick={handleAdd}>Add</button>
      </div>
      <div>
        <h3>Existing visas</h3>
        <ul>
          {visas.map((v) => (
            <li key={v._id}>
              {v.country} - {v.visa_type}{' '}
              <button onClick={() => handleDelete(v._id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AdminDashboard;
