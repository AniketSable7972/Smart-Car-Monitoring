// RegisterPage.js
import React, { useState } from 'react';
import api from '../api/client';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    password: '',
    role: 'DRIVER', // default role
    name: '',
    age: 25,
    gender: 'MALE',
    contactNumber: '',
    email: '',
    licenseNumber: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validation
      if (!form.username || form.username.length < 3) throw new Error('Username must be at least 3 characters');
      if (!form.password || form.password.length < 6) throw new Error('Password must be at least 6 characters');
      if (!form.name) throw new Error('Name is required');
      if (!form.age || Number(form.age) < 18) throw new Error('Age must be at least 18');
      if (!form.contactNumber) throw new Error('Contact number is required');
      if (!form.email) throw new Error('Email is required');
      if (!form.licenseNumber) throw new Error('License number is required');

      // Payload with dynamic role
      const payload = {
        username: form.username,
        password: form.password,
        role: form.role, // dynamic, not hardcoded
        name: form.name,
        age: Number(form.age),
        gender: form.gender,
        contactNumber: form.contactNumber,
        email: form.email,
        licenseNumber: form.licenseNumber
      };

      const res = await api.post('/users/register', payload);
      const user = res?.data?.data;
      if (!user?.id) throw new Error(res?.data?.message || 'Registration failed');

      setSuccess('Registered successfully! You can now log in.');
      setForm({
        username: '',
        password: '',
        role: 'DRIVER',
        name: '',
        age: 25,
        gender: 'MALE',
        contactNumber: '',
        email: '',
        licenseNumber: ''
      });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-16">
      <div className="max-w-xl mx-auto p-6">
        <div className="bg-white p-6 shadow rounded">
          <h1 className="text-2xl font-bold mb-4">Create your account</h1>
          {error && <div className="bg-red-100 text-red-700 p-2 mb-3 rounded">{error}</div>}
          {success && <div className="bg-green-100 text-green-700 p-2 mb-3 rounded">{success}</div>}
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4">

            {/* Username */}
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                name="username"
                placeholder="Enter username"
                className="w-full border px-3 py-2 rounded"
                value={form.username}
                onChange={onChange}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                name="password"
                type="password"
                placeholder="Enter password"
                className="w-full border px-3 py-2 rounded"
                value={form.password}
                onChange={onChange}
                required
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                name="role"
                className="w-full border px-3 py-2 rounded"
                value={form.role}
                onChange={onChange}
              >
                <option value="DRIVER">Driver</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                name="name"
                placeholder="Full Name"
                className="w-full border px-3 py-2 rounded"
                value={form.name}
                onChange={onChange}
                required
              />
            </div>

            {/* Age & Gender */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Age</label>
                <input
                  name="age"
                  type="number"
                  min="18"
                  max="100"
                  placeholder="Age"
                  className="w-full border px-3 py-2 rounded"
                  value={form.age}
                  onChange={onChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Gender</label>
                <select
                  name="gender"
                  className="w-full border px-3 py-2 rounded"
                  value={form.gender}
                  onChange={onChange}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-sm font-medium mb-1">Contact Number</label>
              <input
                name="contactNumber"
                placeholder="e.g. 9999999999"
                className="w-full border px-3 py-2 rounded"
                value={form.contactNumber}
                onChange={onChange}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                name="email"
                type="email"
                placeholder="Email"
                className="w-full border px-3 py-2 rounded"
                value={form.email}
                onChange={onChange}
                required
              />
            </div>

            {/* License Number */}
            <div>
              <label className="block text-sm font-medium mb-1">License Number</label>
              <input
                name="licenseNumber"
                placeholder="Enter vehicle license number"
                className="w-full border px-3 py-2 rounded"
                value={form.licenseNumber}
                onChange={onChange}
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded"
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
