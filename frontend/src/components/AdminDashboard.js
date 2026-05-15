import React, { useEffect, useState } from 'react';
import Button from './ui/Button';
import { api } from '../services/api';
import { L } from '../config/labels';

function AdminDashboard({ token }) {
  const [visas, setVisas] = useState([]);
  const [form, setForm] = useState({ country: '', visa_type: '', documents: '', processing_time: '' });

  const loadVisas = async () => {
    const data = await api.get('/visa');
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
    await api.post('/visa', body);
    loadVisas();
  };

  const handleDelete = async (id) => {
    await api.del(`/visa/${id}`);
    loadVisas();
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
      <h2>{L.ADMIN}</h2>
      <div>
        <h3>Add visa requirement</h3>
        <input placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
        <input placeholder="Visa type" value={form.visa_type} onChange={(e) => setForm({ ...form, visa_type: e.target.value })} />
        <input placeholder="Documents comma separated" value={form.documents} onChange={(e) => setForm({ ...form, documents: e.target.value })} />
        <input placeholder="Processing time" value={form.processing_time} onChange={(e) => setForm({ ...form, processing_time: e.target.value })} />
        <Button onClick={handleAdd}>{L.SUBMIT}</Button>
      </div>
      <div>
        <h3>Existing visas</h3>
        <ul>
          {visas.map((v) => (
            <li key={v._id}>
              {v.country} - {v.visa_type}{' '}
              <Button variant="danger" size="sm" onClick={() => handleDelete(v._id)}>{L.DELETE}</Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AdminDashboard;
