// AdminDashboard.js
import React, { useState, useEffect, useMemo } from "react";
import {
    FaMapMarkerAlt,
    FaGasPump,
    FaThermometerHalf,
    FaSearch,
    FaSyncAlt,
    FaCar,
    FaBell,
    FaCheckCircle,
} from "react-icons/fa";
import api from "../api/client";

const AdminDashboard = () => {
    const [vehicles, setVehicles] = useState([]);
    const [driversByCarId, setDriversByCarId] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [alertCounts, setAlertCounts] = useState({
        totalAlerts: 0,
        unacknowledgedAlerts: 0,
        criticalAlerts: 0,
    });

    const fetchData = async () => {
        try {
            const [telemetryRes, driversRes, alertsStatsRes, carsRes] = await Promise.all([
                api.get("/telemetry/latest/all"),
                api.get("/drivers/assigned"),
                api.get("/alerts/stats/count"),
                api.get("/cars"),
            ]);

            const telemetryList = telemetryRes?.data?.data || [];
            const drivers = (driversRes?.data?.data || []).reduce((acc, d) => {
                if (d.assignedCarId) acc[d.assignedCarId] = d.name || d.username;
                return acc;
            }, {});
            const counts = alertsStatsRes?.data?.data || {
                totalAlerts: 0,
                unacknowledgedAlerts: 0,
                criticalAlerts: 0,
            };
            const cars = carsRes?.data?.data || [];

            const rows = cars.map((car) => {
                const t = telemetryList.find((te) => te.carId === car.id);
                let formattedTime = "-";
                if (t?.timestamp) {
                    const dt = new Date(t.timestamp);
                    formattedTime = dt.toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: true,
                    });
                }

                return {
                    id: car.id,
                    driver: drivers[car.id] || "-",
                    location: t?.location || "-",
                    speed: t?.speed ?? 0,
                    fuel: t?.fuelLevel ?? 0,
                    temp: t?.temperature ?? 0,
                    status: (t?.speed ?? 0) > 0 ? "active" : "idle",
                    lastUpdate: formattedTime,
                };
            });

            setVehicles(rows);
            setDriversByCarId(drivers);
            setAlertCounts(counts);
        } catch (e) {
            console.error("Error fetching dashboard data", e);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredVehicles = useMemo(
        () =>
            vehicles.filter(
                (v) =>
                    String(v.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
                    String(v.driver).toLowerCase().includes(searchTerm.toLowerCase()) ||
                    String(v.location).toLowerCase().includes(searchTerm.toLowerCase())
            ),
        [vehicles, searchTerm]
    );

    const activeCount = vehicles.filter((v) => v.status === "active").length;
    const idleCount = vehicles.filter((v) => v.status === "idle").length;

    const getFuelColor = (fuel) =>
        fuel > 50 ? "text-green-600" : fuel > 25 ? "text-yellow-500" : "text-red-500";
    const getTempColor = (temp) =>
        temp <= 95 ? "text-green-600" : temp <= 100 ? "text-yellow-500" : "text-red-500";

    return (
        <div className="pt-16">
            <div className="p-6 bg-gray-100 min-h-screen">
                <h1 className="text-3xl font-bold mb-6">🚘 Admin Dashboard</h1>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow flex items-center space-x-4">
                        <FaCar className="text-green-500 text-3xl" />
                        <div>
                            <h2 className="text-lg font-semibold text-gray-600">Active Vehicles</h2>
                            <p className="text-2xl font-bold">{activeCount}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow flex items-center space-x-4">
                        <FaCheckCircle className="text-yellow-500 text-3xl" />
                        <div>
                            <h2 className="text-lg font-semibold text-gray-600">Idle Vehicles</h2>
                            <p className="text-2xl font-bold">{idleCount}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow flex items-center space-x-4">
                        <FaBell className="text-red-500 text-3xl" />
                        <div>
                            <h2 className="text-lg font-semibold text-gray-600">Total Alerts</h2>
                            <p className="text-2xl font-bold text-red-600">{alertCounts.totalAlerts}</p>
                        </div>
                    </div>
                </div>

                {/* Search & Controls */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="relative w-full md:w-1/2">
                        <FaSearch className="absolute top-3 left-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by ID, driver, or location"
                            className="border pl-10 pr-4 py-2 rounded-lg w-full shadow-sm focus:ring focus:ring-blue-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Vehicle Table */}
                <div className="overflow-x-auto bg-white rounded-2xl shadow">
                    <table className="w-full">
                        <thead className="bg-gray-100 sticky top-0">
                            <tr>
                                <th className="p-3 text-left">Car ID</th>
                                <th className="p-3 text-left">Driver</th>
                                <th className="p-3 text-left">Location</th>
                                <th className="p-3 text-left">Speed</th>
                                <th className="p-3 text-left">Fuel</th>
                                <th className="p-3 text-left">Temp</th>
                                <th className="p-3 text-left">Status</th>
                                <th className="p-3 text-left">Last Update</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVehicles.map((v, i) => (
                                <tr
                                    key={i}
                                    className="border-b hover:bg-gray-50 transition text-sm"
                                >
                                    <td className="p-3 font-semibold">{v.id}</td>
                                    <td className="p-3">{v.driver}</td>
                                    <td className="p-3 flex items-center gap-2">
                                        <FaMapMarkerAlt className="text-blue-500" />
                                        {v.location}
                                    </td>
                                    <td className="p-3">{v.speed} km/h</td>
                                    <td className="p-3">
                                        <div className="flex flex-col items-center">
                                            <FaGasPump className="text-gray-600" />
                                            <span className={getFuelColor(v.fuel)}>{v.fuel}%</span>
                                        </div>
                                    </td>

                                    <td className="p-3">
                                        <div className="flex flex-col items-center">
                                            <FaThermometerHalf className="text-gray-600" />
                                            <span className={getTempColor(v.temp)}>{v.temp}°C</span>
                                        </div>
                                    </td>

                                    <td className="p-3">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${v.status === "active"
                                                ? "bg-green-500"
                                                : v.status === "idle"
                                                    ? "bg-yellow-500"
                                                    : "bg-red-500"
                                                }`}
                                        >
                                            {v.status}
                                        </span>
                                    </td>
                                    <td className="p-3 text-gray-600">{v.lastUpdate}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
