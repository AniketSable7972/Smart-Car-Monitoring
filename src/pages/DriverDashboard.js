import React, { useState, useEffect } from "react";
import {
    Gauge,
    Fuel,
    Thermometer,
    MapPin,
    AlertTriangle,
    Car,
    Timer,
    TrendingUp
} from "lucide-react";

const DriverDashboard = ({ user }) => {
    const [telemetry, setTelemetry] = useState({
        speed: 0,
        fuelLevel: 100,
        engineTemp: 90,
        location: {
            lat: 40.7128,
            lng: -74.006,
            address: "123 Main Street, New York, NY"
        },
        lastUpdate: new Date()
    });

    const [alerts, setAlerts] = useState([]);

    // Simulate driving stats
    const [dailyStats, setDailyStats] = useState({
        distance: 0,
        driveTime: 0,
        avgSpeed: 0
    });

    useEffect(() => {
        const interval = setInterval(() => {
            // Random speed between 0 and 80
            const newSpeed = Math.floor(Math.random() * 81);
            const newFuel = telemetry.fuelLevel > 0 ? telemetry.fuelLevel - 0.2 : 0;
            const newTemp = 80 + Math.floor(Math.random() * 41);

            // Update telemetry
            setTelemetry((prev) => ({
                ...prev,
                speed: newSpeed,
                fuelLevel: parseFloat(newFuel.toFixed(1)),
                engineTemp: newTemp,
                lastUpdate: new Date()
            }));

            // Update driving stats
            setDailyStats((prev) => ({
                ...prev,
                distance: parseFloat((prev.distance + newSpeed / 360).toFixed(2)), // miles per 10 sec
                driveTime: prev.driveTime + (newSpeed > 0 ? 10 : 0), // seconds
                avgSpeed: parseFloat(((prev.avgSpeed + newSpeed) / 2).toFixed(1))
            }));

            // Manage alerts
            let newAlerts = [];
            if (newFuel < 25) {
                newAlerts.push({
                    type: "warning",
                    message: "Low Fuel Level",
                    severity: "high",
                    timestamp: new Date().toLocaleTimeString()
                });
            }
            if (newTemp > 100) {
                newAlerts.push({
                    type: "warning",
                    message: "High Engine Temperature",
                    severity: "critical",
                    timestamp: new Date().toLocaleTimeString()
                });
            }
            setAlerts(newAlerts);
        }, 10000);

        return () => clearInterval(interval);
    }, [telemetry.fuelLevel]);

    const formatDriveTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        return `${mins} mins`;
    };

    return (
        <div className="pt-16">
        <div className="p-6 bg-gray-100 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Driver Dashboard</h1>
                <p className="text-gray-600">Vehicle ID: {user.assignedCarId}</p>
                <p className="text-sm text-gray-500">
                    Last updated: {telemetry.lastUpdate.toLocaleTimeString()}
                </p>
            </div>

            {/* Telemetry Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {/* Speed */}
                <div className="bg-white p-4 rounded shadow flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-gray-600">Current Speed</h2>
                        <Gauge size={24} className="text-blue-500" />
                    </div>
                    <p className="text-2xl font-bold">{telemetry.speed} mph</p>
                    <p className="text-sm text-gray-500">Speed limit: 80 mph</p>
                </div>

                {/* Fuel */}
                <div className="bg-white p-4 rounded shadow flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-gray-600">Fuel Level</h2>
                        <Fuel size={24} className="text-green-500" />
                    </div>
                    <p
                        className={`text-2xl font-bold ${telemetry.fuelLevel > 50
                            ? "text-green-600"
                            : telemetry.fuelLevel > 25
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                    >
                        {telemetry.fuelLevel}%
                    </p>
                    <div className="w-full bg-gray-200 rounded h-2 mt-2">
                        <div
                            className={`h-2 rounded ${telemetry.fuelLevel > 50
                                ? "bg-green-500"
                                : telemetry.fuelLevel > 25
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                            style={{ width: `${telemetry.fuelLevel}%` }}
                        ></div>
                    </div>
                    <p className="text-sm text-gray-500">Min. Fuel limit: 25%</p>
                </div>

                {/* Engine Temp */}
                <div className="bg-white p-4 rounded shadow flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-gray-600">Engine Temp</h2>
                        <Thermometer size={24} className="text-orange-500" />
                    </div>
                    <p
                        className={`text-2xl font-bold ${telemetry.engineTemp <= 95
                            ? "text-green-600"
                            : telemetry.engineTemp <= 100
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                    >
                        {telemetry.engineTemp}°F
                    </p>
                    <p className="text-sm text-gray-500">Normal: 80-100°F</p>
                </div>

                {/* Location */}
                <div className="bg-white p-4 rounded shadow flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-gray-600">Location</h2>
                        <MapPin size={24} className="text-purple-500" />
                    </div>
                    <p className="text-sm font-semibold truncate">{telemetry.location.address}</p>
                    <p className="text-xs text-gray-500">
                        {telemetry.location.lat}, {telemetry.location.lng}
                    </p>
                </div>
            </div>

            {/* Active Alerts */}
            <div className="bg-white p-4 rounded shadow mb-6">
                <div className="flex items-center mb-4">
                    <AlertTriangle className="text-red-500 mr-2" size={20} />
                    <h3 className="text-lg font-semibold">Active Alerts</h3>
                </div>
                {alerts.length > 0 ? (
                    <ul className="space-y-2">
                        {alerts.map((alert, idx) => (
                            <li
                                key={idx}
                                className="flex justify-between items-center p-2 border rounded"
                            >
                                <span>{alert.message}</span>
                                <span
                                    className={`text-xs px-2 py-1 rounded ${alert.severity === "critical"
                                        ? "bg-red-100 text-red-600"
                                        : "bg-yellow-100 text-yellow-600"
                                        }`}
                                >
                                    {alert.severity}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">No active alerts at this time.</p>
                )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded shadow flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-gray-600">Today's Distance</h2>
                        <Car size={24} className="text-blue-500" />
                    </div>
                    <p className="text-2xl font-bold">{dailyStats.distance} mi</p>
                    <p className="text-green-600 flex items-center text-sm">
                        <TrendingUp size={16} className="mr-1" /> +12% from yesterday
                    </p>
                </div>

                <div className="bg-white p-4 rounded shadow flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-gray-600">Drive Time</h2>
                        <Timer size={24} className="text-purple-500" />
                    </div>
                    <p className="text-2xl font-bold">{formatDriveTime(dailyStats.driveTime)}</p>
                    <p className="text-sm text-gray-500">Includes stops</p>
                </div>

                <div className="bg-white p-4 rounded shadow flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-gray-600">Avg Speed</h2>
                        <Gauge size={24} className="text-orange-500" />
                    </div>
                    <p className="text-2xl font-bold">{dailyStats.avgSpeed} mph</p>
                    <p className="text-sm text-gray-500">Overall average today</p>
                </div>
            </div>
        </div>
    </div>
    );
};

export default DriverDashboard;
