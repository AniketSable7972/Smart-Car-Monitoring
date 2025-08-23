// SettingsPage.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Users, Truck, Plus, Edit, Trash } from "lucide-react";

// The corrected SettingsPage component
const SettingsPage = () => {
    // State to manage the active tab and data from the backend
    const [activeTab, setActiveTab] = useState("users");
    const [users, setUsers] = useState([]);
    const [cars, setCars] = useState([]);

    /**
     * Handles the tab change event to switch between User and Fleet Management.
     * @param {string} tab - The name of the tab to switch to ("users" or "fleet").
     */
    const handleTabChange = (tab) => setActiveTab(tab);

    /**
     * Custom function to format a date string into a more readable format.
     * @param {string} dateString - The date string from the backend.
     * @returns {string} The formatted date string or a hyphen if invalid.
     */
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    };

    /**
     * useEffect hook to fetch data from the backend on component mount.
     */
    useEffect(() => {
        // Fetch users from backend
        const fetchUsers = async () => {
            try {
                const res = await axios.get("http://localhost:8080/api/users");
                if (res.data && res.data.data) {
                    setUsers(res.data.data);
                }
            } catch (err) {
                console.error("Error fetching users:", err);
            }
        };

        // Fetch cars from backend
        const fetchCars = async () => {
            try {
                const res = await axios.get("http://localhost:8080/api/cars");
                if (res.data && res.data.data) {
                    setCars(res.data.data);
                }
            } catch (err) {
                console.error("Error fetching cars:", err);
            }
        };

        // Call the fetch functions
        fetchUsers();
        fetchCars();
    }, []);

    return (
        <div className="pt-16">
            <div className="p-6 bg-gray-100 min-h-screen">
                {/* Header Section */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">System Settings</h1>
                    <p className="text-gray-600">Manage users and fleet</p>
                </div>

                {/* Tabs for Navigation */}
                <div className="flex gap-4 mb-6 border-b pb-2">
                    <button
                        onClick={() => handleTabChange("users")}
                        className={`flex items-center gap-2 px-3 py-2 rounded ${activeTab === "users" ? "bg-blue-500 text-white" : "hover:bg-gray-200"}`}
                    >
                        <Users size={18} /> User Management
                    </button>
                    <button
                        onClick={() => handleTabChange("fleet")}
                        className={`flex items-center gap-2 px-3 py-2 rounded ${activeTab === "fleet" ? "bg-blue-500 text-white" : "hover:bg-gray-200"}`}
                    >
                        <Truck size={18} /> Fleet Management
                    </button>
                </div>

                {/* Tab Content Section */}
                <div className="bg-white p-6 rounded-lg shadow">
                    {/* User Management Tab Content */}
                    {activeTab === "users" && (
                        <div className="overflow-x-auto">
                            <h2 className="text-lg font-bold mb-4">User Management</h2>
                            <table className="w-full min-w-[1000px] border">
                                <thead>
                                    <tr className="bg-gray-100 text-left">
                                        <th className="p-2">Name</th>
                                        <th className="p-2">Role</th>
                                        <th className="p-2">Age</th>
                                        <th className="p-2">Contact Number</th>
                                        <th className="p-2">Gender</th>
                                        <th className="p-2">Assigned Vehicle</th>
                                        <th className="p-2">Status</th>
                                        <th className="p-2">Email</th>
                                        <th className="p-2">Last Update</th>
                                        <th className="p-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} className="border-t">
                                            <td className="p-2">{user.name}</td>
                                            <td className="p-2">
                                                <span className={`px-2 py-1 text-xs rounded ${user.role === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700"}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="p-2">{user.age || "-"}</td>
                                            <td className="p-2">{user.contactNumber || "-"}</td>
                                            <td className="p-2">{user.gender || "-"}</td>
                                            <td className="p-2">{user.assigned_car_id || "None"}</td>
                                            <td className="p-2">
                                                <span className={`px-2 py-1 text-xs rounded ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                    {user.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="p-2">{user.email}</td>
                                            <td className="p-2">{formatDate(user.lastUpdateOn)}</td>
                                            <td className="p-2 flex gap-2">
                                                <button className="text-blue-500 hover:text-blue-700">
                                                    <Edit size={16} />
                                                </button>
                                                <button className="text-red-500 hover:text-red-700">
                                                    <Trash size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Fleet Management Tab Content */}
                    {activeTab === "fleet" && (
                        <div className="overflow-x-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold">Fleet Management</h2>
                                <button className="flex items-center gap-2 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600">
                                    <Plus size={16} /> Add Vehicle
                                </button>
                            </div>
                            <table className="w-full min-w-[600px] border">
                                <thead>
                                    <tr className="bg-gray-100 text-left">
                                        <th className="p-2">ID</th>
                                        <th className="p-2">Number Plate</th>
                                        <th className="p-2">Status</th>
                                        <th className="p-2">Driver</th>
                                        <th className="p-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cars.map((car) => {
                                        const driver = users.find(user => user.id === car.assignedDriverId);
                                        return (
                                            <tr key={car.id} className="border-t">
                                                <td className="p-2">{car.id}</td>
                                                <td className="p-2">{car.numberPlate || "-"}</td>
                                                <td className="p-2">{car.status}</td>
                                                <td className="p-2">{driver ? driver.name : "None"}</td>
                                                <td className="p-2 flex gap-2">
                                                    <button className="text-blue-500 hover:text-blue-700">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button className="text-red-500 hover:text-red-700">
                                                        <Trash size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
