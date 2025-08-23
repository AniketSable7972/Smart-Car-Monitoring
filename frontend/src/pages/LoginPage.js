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
            setError(
                err?.response?.data?.message ||
                err.message ||
                "Invalid username or password"
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="pt-16">
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
                <div className="bg-white/70 backdrop-blur-md shadow-xl rounded-2xl p-8 w-full max-w-md border border-gray-200">
                    {/* Header */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="bg-gradient-to-r from-indigo-400 to-purple-400 p-3 rounded-full mb-4 shadow-md">
                            <Car className="text-white" size={32} />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-700">
                            Fleet Management
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Sign in to access your dashboard
                        </p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="flex items-center bg-red-50 text-red-600 p-3 mb-4 rounded-lg border border-red-200">
                            <AlertCircle className="mr-2" size={18} />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-600">
                                Username
                            </label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white/60"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-600">
                                Password
                            </label>
                            <input
                                type="password"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white/60"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-indigo-400 to-purple-400 text-white py-2 rounded-lg shadow hover:opacity-90 transition disabled:opacity-70"
                            disabled={isLoading}
                        >
                            {isLoading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    {/* Quick Links */}
                    <div className="flex justify-between items-center mt-5 text-sm">
                        <span className="text-gray-500">New driver?</span>
                        <Link to="/register" className="text-indigo-500 hover:underline">
                            Register here
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
