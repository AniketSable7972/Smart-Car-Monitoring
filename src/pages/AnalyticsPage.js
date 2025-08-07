import React, { useState } from "react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
    ResponsiveContainer
} from "recharts";
import { TrendingUp, TrendingDown, Car, AlertTriangle } from "lucide-react";

const AnalyticsPage = () => {
    const [vehicle, setVehicle] = useState("All Vehicles");
    const [timeRange, setTimeRange] = useState("Last 7 days");

    // Sample Data
    const fuelEfficiencyData = [
        { day: "Mon", actual: 25, target: 28 },
        { day: "Tue", actual: 27, target: 28 },
        { day: "Wed", actual: 24, target: 28 },
        { day: "Thu", actual: 29, target: 28 },
        { day: "Fri", actual: 26, target: 28 },
        { day: "Sat", actual: 28, target: 28 },
        { day: "Sun", actual: 30, target: 28 }
    ];

    const speedData = [
        { name: "CAR001", avg: 55, max: 80 },
        { name: "CAR002", avg: 60, max: 90 },
        { name: "CAR003", avg: 50, max: 70 }
    ];

    const tempData = [
        { time: "6 AM", temp: 90 },
        { time: "9 AM", temp: 100 },
        { time: "12 PM", temp: 105 },
        { time: "3 PM", temp: 110 },
        { time: "6 PM", temp: 95 },
        { time: "9 PM", temp: 85 }
    ];

    const alertDistribution = [
        { name: "Fuel", value: 30 },
        { name: "Temperature", value: 20 },
        { name: "Maintenance", value: 25 },
        { name: "Speed", value: 15 },
        { name: "System", value: 10 }
    ];

    const COLORS = ["#0088FE", "#FF8042", "#00C49F", "#FFBB28", "#AA336A"];

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Fleet Analytics</h1>
                <p className="text-gray-600">
                    Comprehensive insights and performance metrics for your fleet
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
                <select
                    className="border px-4 py-2 rounded"
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                >
                    <option>All Vehicles</option>
                    <option>CAR001</option>
                    <option>CAR002</option>
                    <option>CAR003</option>
                </select>

                <select
                    className="border px-4 py-2 rounded"
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                >
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                </select>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded shadow flex justify-between items-center">
                    <div>
                        <h2 className="text-gray-600">Fleet Efficiency (MPG)</h2>
                        <p className="text-2xl font-bold">27.5</p>
                        <p className="text-green-600 flex items-center">
                            <TrendingUp size={16} className="mr-1" /> +5%
                        </p>
                    </div>
                    <Car size={32} className="text-blue-500" />
                </div>

                <div className="bg-white p-4 rounded shadow flex justify-between items-center">
                    <div>
                        <h2 className="text-gray-600">Total Distance (mi)</h2>
                        <p className="text-2xl font-bold">12,540</p>
                        <p className="text-green-600 flex items-center">
                            <TrendingUp size={16} className="mr-1" /> +8%
                        </p>
                    </div>
                    <Car size={32} className="text-green-500" />
                </div>

                <div className="bg-white p-4 rounded shadow flex justify-between items-center">
                    <div>
                        <h2 className="text-gray-600">Active Hours (hrs)</h2>
                        <p className="text-2xl font-bold">1,240</p>
                        <p className="text-red-600 flex items-center">
                            <TrendingDown size={16} className="mr-1" /> -3%
                        </p>
                    </div>
                    <Car size={32} className="text-yellow-500" />
                </div>

                <div className="bg-white p-4 rounded shadow flex justify-between items-center">
                    <div>
                        <h2 className="text-gray-600">Active Alerts</h2>
                        <p className="text-2xl font-bold text-red-500">45</p>
                        <p className="text-red-600 flex items-center">
                            <TrendingUp size={16} className="mr-1" /> +10%
                        </p>
                    </div>
                    <AlertTriangle size={32} className="text-red-500" />
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Fuel Efficiency Trend */}
                <div className="bg-white p-4 rounded shadow">
                    <h3 className="text-lg font-semibold mb-4">Fuel Efficiency Trend</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={fuelEfficiencyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="actual" stroke="#0088FE" />
                            <Line
                                type="monotone"
                                dataKey="target"
                                stroke="#FF0000"
                                strokeDasharray="5 5"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Speed Analysis */}
                <div className="bg-white p-4 rounded shadow">
                    <h3 className="text-lg font-semibold mb-4">Speed Analysis by Vehicle</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={speedData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="avg" fill="#0088FE" name="Avg Speed" />
                            <Bar dataKey="max" fill="#FF0000" name="Max Speed" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Temperature Patterns */}
                <div className="bg-white p-4 rounded shadow">
                    <h3 className="text-lg font-semibold mb-4">Engine Temperature Patterns</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={tempData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="temp" stroke="#FF8042" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Alert Distribution */}
                <div className="bg-white p-4 rounded shadow">
                    <h3 className="text-lg font-semibold mb-4">Alert Distribution</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={alertDistribution}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label
                            >
                                {alertDistribution.map((entry, index) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Fleet Performance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                    <h4 className="font-semibold mb-2">✅ Performing Well</h4>
                    <ul className="list-disc ml-5 text-green-700">
                        <li>CAR001 exceeded fuel efficiency target</li>
                        <li>Average speed is within safe limits</li>
                        <li>Minimal downtime recorded</li>
                    </ul>
                </div>
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <h4 className="font-semibold mb-2">⚠️ Needs Attention</h4>
                    <ul className="list-disc ml-5 text-red-700">
                        <li>CAR002 engine temperature exceeded threshold</li>
                        <li>Increased alert count in last 7 days</li>
                        <li>Maintenance overdue for CAR003</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
