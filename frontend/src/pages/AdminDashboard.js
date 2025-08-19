// AdminDashboard.js
import React, { useState, useEffect, useMemo } from "react";
import { FaMapMarkerAlt, FaGasPump, FaThermometerHalf } from "react-icons/fa";
import api from "../api/client";

const AdminDashboard = () => {
    const [vehicles, setVehicles] = useState([]);
    const [driversByCarId, setDriversByCarId] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [alertCounts, setAlertCounts] = useState({ totalAlerts: 0, unacknowledgedAlerts: 0, criticalAlerts: 0 });

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
            const counts = alertsStatsRes?.data?.data || { totalAlerts: 0, unacknowledgedAlerts: 0, criticalAlerts: 0 };
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

    useEffect(() => { fetchData(); }, []);
    useEffect(() => {
        if (!autoRefresh) return;
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [autoRefresh]);

    const filteredVehicles = useMemo(() =>
        vehicles.filter((v) =>
            String(v.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(v.driver).toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(v.location).toLowerCase().includes(searchTerm.toLowerCase())
        ), [vehicles, searchTerm]
    );

    const activeCount = vehicles.filter((v) => v.status === "active").length;
    const idleCount = vehicles.filter((v) => v.status === "idle").length;

    const getFuelColor = (fuel) => fuel > 50 ? "green" : fuel > 25 ? "orange" : "red";
    const getTempColor = (temp) => temp <= 95 ? "green" : temp <= 100 ? "orange" : "red";

    return (
        <div className="pt-16">
            <div className="p-6 bg-gray-100 min-h-screen">
                <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-4 rounded shadow">
                        <h2 className="text-lg font-bold">Active Vehicles</h2>
                        <p className="text-2xl">{activeCount}</p>
                    </div>
                    <div className="bg-white p-4 rounded shadow">
                        <h2 className="text-lg font-bold">Idle Vehicles</h2>
                        <p className="text-2xl">{idleCount}</p>
                    </div>
                    <div className="bg-white p-4 rounded shadow">
                        <h2 className="text-lg font-bold">Alerts</h2>
                        <p className="text-2xl text-red-500">{alertCounts.totalAlerts}</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="flex justify-between items-center mb-6">
                    <input
                        type="text"
                        placeholder="Search by ID, driver, or location"
                        className="border px-4 py-2 rounded w-1/2"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="text-sm text-gray-600">Auto refresh every 30s</div>
                </div>

                {/* Vehicle Table */}
                <table className="w-full bg-white shadow rounded">
                    <thead>
                        <tr className="bg-gray-200 text-left">
                            <th className="p-3">Car ID</th>
                            <th className="p-3">Driver</th>
                            <th className="p-3">Location</th>
                            <th className="p-3">Speed (km/h)</th>
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
                                    <span style={{ color: getTempColor(v.temp) }}>{v.temp}°C</span>
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
