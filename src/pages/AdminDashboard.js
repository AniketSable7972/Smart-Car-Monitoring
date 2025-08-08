import React, { useState, useEffect } from "react";
import { FaMapMarkerAlt, FaGasPump, FaThermometerHalf } from "react-icons/fa";

const AdminDashboard = () => {
    const [vehicles, setVehicles] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [autoRefresh, setAutoRefresh] = useState(true);

    // Sample Vehicle Data
    const generateVehicles = () => [
        {
            id: "CAR001",
            driver: "John Doe",
            location: "New York",
            speed: Math.floor(Math.random() * 80),
            fuel: Math.floor(Math.random() * 100),
            temp: Math.floor(Math.random() * 120),
            status: "active",
            lastUpdate: new Date().toLocaleTimeString(),
        },
        {
            id: "CAR002",
            driver: "Alice Smith",
            location: "Chicago",
            speed: Math.floor(Math.random() * 80),
            fuel: Math.floor(Math.random() * 100),
            temp: Math.floor(Math.random() * 120),
            status: "idle",
            lastUpdate: new Date().toLocaleTimeString(),
        },
        {
            id: "CAR003",
            driver: "Mike Johnson",
            location: "Los Angeles",
            speed: Math.floor(Math.random() * 100),
            fuel: Math.floor(Math.random() * 100),
            temp: Math.floor(Math.random() * 120),
            status: "maintenance",
            lastUpdate: new Date().toLocaleTimeString(),
        },
    ];

    useEffect(() => {
        setVehicles(generateVehicles());
    }, []);

    useEffect(() => {
        if (autoRefresh) {
            const interval = setInterval(() => {
                setVehicles(generateVehicles());
            }, 30000); // Auto-refresh every 30 seconds
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    // Handle manual refresh
    function handleRefresh() {
        setVehicles(generateVehicles());
    }

    const filteredVehicles = vehicles.filter(
        (v) =>
            v.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Dashboard Metrics
    const activeCount = vehicles.filter((v) => v.status === "active").length;
    const idleCount = vehicles.filter((v) => v.status === "idle").length;
    const maintenanceCount = vehicles.filter((v) => v.status === "maintenance").length;
    const alertCount = vehicles.filter((v) => v.fuel < 25 || v.temp > 100).length;

    // Helper for styling fuel and temperature
    const getFuelColor = (fuel) => {
        if (fuel > 50) return "green";
        if (fuel > 25) return "orange";
        return "red";
    };

    const getTempColor = (temp) => {
        if (temp <= 95) return "green";
        if (temp <= 100) return "orange";
        return "red";
    };

    return (
        <div className="pt-16">
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>

            {/* Dashboard Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-lg font-bold">Active Vehicles</h2>
                    <p className="text-2xl">{activeCount}</p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-lg font-bold">Idle Vehicles</h2>
                    <p className="text-2xl">{idleCount}</p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-lg font-bold">Under Maintenance</h2>
                    <p className="text-2xl">{maintenanceCount}</p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-lg font-bold">Alerts</h2>
                    <p className="text-2xl text-red-500">{alertCount}</p>
                </div>
            </div>

            {/* Search & Refresh */}
            <div className="flex justify-between items-center mb-6">
                <input
                    type="text"
                    placeholder="Search by ID, driver or location"
                    className="border px-4 py-2 rounded w-1/2"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Vehicle Table */}
            <table className="w-full bg-white shadow rounded">
                <thead>
                    <tr className="bg-gray-200 text-left">
                        <th className="p-3">Car ID</th>
                        <th className="p-3">Driver</th>
                        <th className="p-3">Location</th>
                        <th className="p-3">Speed (mph)</th>
                        <th className="p-3">Fuel Level</th>
                        <th className="p-3">Engine Temp</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Last Update</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredVehicles.map((v, i) => (
                        <tr key={i} className="border-b">
                            <td className="p-3">{v.id}</td>
                            <td className="p-3">{v.driver}</td>
                            <td className="p-3 flex items-center">
                                <FaMapMarkerAlt className="text-blue-500 mr-2" />
                                {v.location}
                            </td>
                            <td className="p-3">{v.speed}</td>
                            <td className="p-3 items-center">
                                <FaGasPump className="mr-2" />
                                <span style={{ color: getFuelColor(v.fuel) }}>{v.fuel}%</span>
                            </td>
                            <td className="p-3 items-center">
                                <FaThermometerHalf className="mr-2" />
                                <span style={{ color: getTempColor(v.temp) }}>{v.temp}°F</span>
                            </td>
                            <td className="p-3">
                                <span className={`px-2 py-1 rounded text-white ${v.status === "active" ? "bg-green-500"
                                    : v.status === "idle" ? "bg-yellow-500"
                                        : "bg-red-500"
                                    }`}>
                                    {v.status}
                                </span>
                            </td>
                            <td className="p-3">{v.lastUpdate}</td>
                        </tr>
                    ))}
                </tbody>

            </table>
        </div>
    </div> 
    );
};

export default AdminDashboard;
