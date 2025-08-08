import React, { useState } from "react";
import {
    Users,
    Truck,
    Bell,
    Settings as SettingsIcon,
    Shield,
    Plus,
    Edit,
    Trash,
    ToggleLeft,
    ToggleRight,

} from "lucide-react";

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState("users");
    const [users] = useState([
        {
            username: "admin",
            role: "ADMIN",
            assignedVehicle: null,
            status: "Active",
            lastLogin: "2025-08-06",
        },
        {
            username: "driver1",
            role: "DRIVER",
            assignedVehicle: "CAR001",
            status: "Active",
            lastLogin: "2025-08-05",
        },
    ]);

    const [vehicles] = useState([
        { id: "CAR001", model: "Tesla Model 3", year: 2023, status: "Active", assignedDriver: "driver1" },
        { id: "CAR002", model: "Ford F-150", year: 2022, status: "Maintenance", assignedDriver: null },
    ]);

    const [notifications, setNotifications] = useState({
        email: true,
        sms: false,
        criticalOnly: false,
        maintenanceReminders: true,
    });

    const [alertThresholds, setAlertThresholds] = useState({
        fuel: 25,
        temperature: 100,
        speed: 80,
    });

    const [systemSettings, setSystemSettings] = useState({
        autoRefresh: true,
        refreshInterval: 60,
        dataRetention: 90,
        maxSpeedLimit: 75,
    });

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const toggleNotification = (key) => {
        setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="pt-16">
        <div className="p-6 bg-gray-100 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold">System Settings</h1>
                <p className="text-gray-600">Manage users, vehicles, and configure system settings</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b pb-2">
                <button
                    onClick={() => handleTabChange("users")}
                    className={`flex items-center gap-2 px-3 py-2 rounded ${activeTab === "users" ? "bg-blue-500 text-white" : "hover:bg-gray-200"
                        }`}
                >
                    <Users size={18} /> User Management
                </button>
                <button
                    onClick={() => handleTabChange("fleet")}
                    className={`flex items-center gap-2 px-3 py-2 rounded ${activeTab === "fleet" ? "bg-blue-500 text-white" : "hover:bg-gray-200"
                        }`}
                >
                    <Truck size={18} /> Fleet Management
                </button>
                <button
                    onClick={() => handleTabChange("notifications")}
                    className={`flex items-center gap-2 px-3 py-2 rounded ${activeTab === "notifications" ? "bg-blue-500 text-white" : "hover:bg-gray-200"
                        }`}
                >
                    <Bell size={18} /> Notifications
                </button>
                <button
                    onClick={() => handleTabChange("system")}
                    className={`flex items-center gap-2 px-3 py-2 rounded ${activeTab === "system" ? "bg-blue-500 text-white" : "hover:bg-gray-200"
                        }`}
                >
                    <SettingsIcon size={18} /> System
                </button>
            </div>

            {/* Tab Content */}
            <div className="bg-white p-6 rounded-lg shadow">
                {activeTab === "users" && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">User Management</h2>
                            <button className="flex items-center gap-2 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600">
                                <Plus size={16} /> Add User
                            </button>
                        </div>
                        <table className="w-full border">
                            <thead>
                                <tr className="bg-gray-100 text-left">
                                    <th className="p-2">Username</th>
                                    <th className="p-2">Role</th>
                                    <th className="p-2">Assigned Vehicle</th>
                                    <th className="p-2">Status</th>
                                    <th className="p-2">Last Login</th>
                                    <th className="p-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, index) => (
                                    <tr key={index} className="border-t">
                                        <td className="p-2">{user.username}</td>
                                        <td className="p-2">
                                            <span
                                                className={`px-2 py-1 text-xs rounded ${user.role === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700"
                                                    }`}
                                            >
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-2">{user.assignedVehicle || "None"}</td>
                                        <td className="p-2">{user.status}</td>
                                        <td className="p-2">{user.lastLogin}</td>
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

                {activeTab === "fleet" && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">Fleet Management</h2>
                            <button className="flex items-center gap-2 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600">
                                <Plus size={16} /> Add Vehicle
                            </button>
                        </div>
                        <table className="w-full border">
                            <thead>
                                <tr className="bg-gray-100 text-left">
                                    <th className="p-2">ID</th>
                                    <th className="p-2">Model</th>
                                    <th className="p-2">Year</th>
                                    <th className="p-2">Status</th>
                                    <th className="p-2">Assigned Driver</th>
                                    <th className="p-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vehicles.map((vehicle, index) => (
                                    <tr key={index} className="border-t">
                                        <td className="p-2">{vehicle.id}</td>
                                        <td className="p-2">{vehicle.model}</td>
                                        <td className="p-2">{vehicle.year}</td>
                                        <td className="p-2">{vehicle.status}</td>
                                        <td className="p-2">{vehicle.assignedDriver || "None"}</td>
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

                {activeTab === "notifications" && (
                    <div>
                        <h3 className="text-lg font-bold mt-6">Alert Thresholds</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <div>
                                <label className="block text-sm mb-1">Low Fuel (%)</label>
                                <input
                                    type="number"
                                    value={alertThresholds.fuel}
                                    onChange={(e) => setAlertThresholds({ ...alertThresholds, fuel: e.target.value })}
                                    className="border px-3 py-2 rounded w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">High Temperature (°F)</label>
                                <input
                                    type="number"
                                    value={alertThresholds.temperature}
                                    onChange={(e) => setAlertThresholds({ ...alertThresholds, temperature: e.target.value })}
                                    className="border px-3 py-2 rounded w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Speed Violation (mph)</label>
                                <input
                                    type="number"
                                    value={alertThresholds.speed}
                                    onChange={(e) => setAlertThresholds({ ...alertThresholds, speed: e.target.value })}
                                    className="border px-3 py-2 rounded w-full"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "system" && (
                    <div>
                        <h2 className="text-lg font-bold mb-4">System Settings</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border p-3 rounded">
                                <span>Auto Refresh</span>
                                <button
                                    onClick={() => setSystemSettings((prev) => ({ ...prev, autoRefresh: !prev.autoRefresh }))}
                                    className="text-blue-500"
                                >
                                    {systemSettings.autoRefresh ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                                </button>
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Refresh Interval (sec)</label>
                                <input
                                    type="number"
                                    value={systemSettings.refreshInterval}
                                    onChange={(e) => setSystemSettings({ ...systemSettings, refreshInterval: e.target.value })}
                                    className="border px-3 py-2 rounded w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Data Retention (days)</label>
                                <input
                                    type="number"
                                    value={systemSettings.dataRetention}
                                    onChange={(e) => setSystemSettings({ ...systemSettings, dataRetention: e.target.value })}
                                    className="border px-3 py-2 rounded w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Max Speed Limit (mph)</label>
                                <input
                                    type="number"
                                    value={systemSettings.maxSpeedLimit}
                                    onChange={(e) => setSystemSettings({ ...systemSettings, maxSpeedLimit: e.target.value })}
                                    className="border px-3 py-2 rounded w-full"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
    );
};

export default SettingsPage;
