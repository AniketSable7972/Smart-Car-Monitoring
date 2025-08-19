// LoginPage.js
import React, { useState } from "react";
import { Car, AlertCircle } from "lucide-react";
import api from "../api/client";
import { Link } from "react-router-dom";

const LoginPage = ({ onLogin }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        try {
            const res = await api.post("/users/login", { username, password });
            const { success, data, message } = res.data || {};
            if (!success || !data) {
                throw new Error(message || "Login failed");
            }
            const { token, userId, username: uName, role, name } = data;
            localStorage.setItem("token", token || "");
            localStorage.setItem("userId", String(userId));
            localStorage.setItem("username", uName);
            localStorage.setItem("role", role);
            onLogin({ id: userId, username: uName, role, name });
        } catch (err) {
            setError(err?.response?.data?.message || err.message || "Invalid username or password");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="pt-16">
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200">
                <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
                    {/* Header */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="bg-blue-500 p-3 rounded-full mb-4">
                            <Car className="text-white" size={32} />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">Fleet Management System</h1>
                        <p className="text-gray-500 text-sm">Sign in to access your dashboard</p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="flex items-center bg-red-100 text-red-600 p-3 mb-4 rounded">
                            <AlertCircle className="mr-2" size={18} />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Username</label>
                            <input
                                type="text"
                                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Password</label>
                            <input
                                type="password"
                                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-70"
                            disabled={isLoading}
                        >
                            {isLoading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    {/* Quick Links */}
                    <div className="flex justify-between items-center mt-4 text-sm">
                        <span className="text-gray-600">New driver?</span>
                        <Link to="/register" className="text-blue-600 hover:underline">Register here</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
