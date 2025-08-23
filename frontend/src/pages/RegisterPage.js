// RegisterPage.js
import React, { useState } from "react";
import api from "../api/client";
import { useNavigate, Link } from "react-router-dom";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "DRIVER",
    name: "",
    age: 25,
    gender: "MALE",
    contactNumber: "",
    email: "",
    licenseNumber: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (!form.username || form.username.length < 3)
        throw new Error("Username must be at least 3 characters");
      if (!form.password || form.password.length < 6)
        throw new Error("Password must be at least 6 characters");
      if (!form.name) throw new Error("Name is required");
      if (!form.age || Number(form.age) < 18)
        throw new Error("Age must be at least 18");
      if (!form.contactNumber)
        throw new Error("Contact number is required");
      if (!form.email) throw new Error("Email is required");
      if (!form.licenseNumber)
        throw new Error("License number is required");

      const payload = {
        ...form,
        age: Number(form.age),
      };

      const res = await api.post("/users/register", payload);
      const user = res?.data?.data;
      if (!user?.id) throw new Error(res?.data?.message || "Registration failed");

      setSuccess("Registered successfully! You can now log in.");
      setForm({
        username: "",
        password: "",
        role: "DRIVER",
        name: "",
        age: 25,
        gender: "MALE",
        contactNumber: "",
        email: "",
        licenseNumber: "",
      });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
      <div className="max-w-lg w-full bg-white/70 backdrop-blur-md p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Create your account
        </h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 mb-4 rounded-md text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 text-green-700 p-3 mb-4 rounded-md text-sm">
            {success}
          </div>
        )}

        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4">
          {/* Username */}
          <input
            name="username"
            placeholder="Username"
            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            value={form.username}
            onChange={onChange}
            required
          />

          {/* Password */}
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            value={form.password}
            onChange={onChange}
            required
          />

          {/* Role */}
          <select
            name="role"
            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            value={form.role}
            onChange={onChange}
          >
            <option value="DRIVER">Driver</option>
            <option value="ADMIN">Admin</option>
          </select>

          {/* Full Name */}
          <input
            name="name"
            placeholder="Full Name"
            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            value={form.name}
            onChange={onChange}
            required
          />

          {/* Age & Gender */}
          <div className="grid grid-cols-2 gap-3">
            <input
              name="age"
              type="number"
              min="18"
              max="100"
              placeholder="Age"
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              value={form.age}
              onChange={onChange}
              required
            />
            <select
              name="gender"
              className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              value={form.gender}
              onChange={onChange}
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Contact Number */}
          <input
            name="contactNumber"
            placeholder="Contact Number"
            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            value={form.contactNumber}
            onChange={onChange}
            required
          />

          {/* Email */}
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            value={form.email}
            onChange={onChange}
            required
          />

          {/* License Number */}
          <input
            name="licenseNumber"
            placeholder="License Number"
            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            value={form.licenseNumber}
            onChange={onChange}
            required
          />

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 transition text-white font-medium py-2 rounded-lg shadow-md"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* Login link */}
        <p className="text-center text-gray-600 text-sm mt-4">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-500 hover:underline font-medium"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
