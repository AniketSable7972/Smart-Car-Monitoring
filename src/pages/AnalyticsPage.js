import React, { useState, useEffect } from "react";
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

// Helper function to dynamically generate sample data for the last N days
const generateDynamicData = (days) => {
    const today = new Date();
    const data = [];
    for (let i = 0; i < days; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - (days - 1 - i));
        const dateString = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
        data.push({
            date: dateString,
            actual: 25 + Math.floor(Math.random() * 5),
            target: 28,
            vehicle: `CAR00${(i % 3) + 1}`,
            temp: 90 + Math.floor(Math.random() * 20),
        });
    }
    return data;
};

const AnalyticsPage = () => {
    const [vehicle, setVehicle] = useState("All Vehicles");
    const [timeRange, setTimeRange] = useState("Last 7 days");
    const [dynamicData, setDynamicData] = useState([]);

    useEffect(() => {
        // Generate data for the last 7 days on initial load
        setDynamicData(generateDynamicData(7));
    }, []);

    // Sample data for other charts
    const speedData = [
        { name: "CAR001", avg: 55, max: 80 },
        { name: "CAR002", avg: 60, max: 90 },
        { name: "CAR003", avg: 50, max: 70 }
    ];

    const alertDistributionData = {
        "All Vehicles": [
            { name: "Fuel", value: 30 },
            { name: "Temperature", value: 20 },
            { name: "Maintenance", value: 25 },
            { name: "Speed", value: 15 },
            { name: "System", value: 10 }
        ],
        CAR001: [
            { name: "Fuel", value: 15 },
            { name: "Temperature", value: 10 },
            { name: "Maintenance", value: 5 },
            { name: "Speed", value: 3 },
            { name: "System", value: 2 }
        ],
        CAR002: [
            { name: "Fuel", value: 10 },
            { name: "Temperature", value: 5 },
            { name: "Maintenance", value: 10 },
            { name: "Speed", value: 7 },
            { name: "System", value: 3 }
        ],
        CAR003: [
            { name: "Fuel", value: 5 },
            { name: "Temperature", value: 5 },
            { name: "Maintenance", value: 10 },
            { name: "Speed", value: 5 },
            { name: "System", value: 5 }
        ]
    };

    const COLORS = ["#0088FE", "#FF8042", "#00C49F", "#FFBB28", "#AA336A"];

    // Helper to compute date limit
    const getDateLimit = (range) => {
        const today = new Date();
        switch (range) {
            case "Last 7 days":
                return new Date(today.setDate(today.getDate() - 7));
            case "Last 30 days":
                return new Date(today.setDate(today.getDate() - 30));
            case "Last 90 days":
                return new Date(today.setDate(today.getDate() - 90));
            default:
                return new Date("2000-01-01");
        }
    };

    const dateLimit = getDateLimit(timeRange);

    // Filter data by selected vehicle and date limit
    const filteredData = dynamicData.filter((entry) => {
        const entryDate = new Date(entry.date);
        const matchesVehicle = vehicle === "All Vehicles" || entry.vehicle === vehicle;
        return matchesVehicle && entryDate >= dateLimit;
    });

    const filteredSpeedData = speedData.filter(
        (entry) => vehicle === "All Vehicles" || entry.name === vehicle
    );

    const filteredAlertData =
        alertDistributionData[vehicle] || alertDistributionData["All Vehicles"];

    // Function to format date for the XAxis
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    };

    return (
        <div className="pt-16">
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
                        onChange={(e) => {
                            setTimeRange(e.target.value);
                            // Generate new data if the time range changes
                            let days = 7;
                            if (e.target.value === "Last 30 days") days = 30;
                            if (e.target.value === "Last 90 days") days = 90;
                            setDynamicData(generateDynamicData(days));
                        }}
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
                            <p className="text-2xl font-bold">
                                {(
                                    filteredData.reduce((sum, d) => sum + d.actual, 0) /
                                    filteredData.length || 0
                                ).toFixed(1)}
                            </p>
                            <p className="text-green-600 flex items-center">
                                <TrendingUp size={16} className="mr-1" /> +5%
                            </p>
                        </div>
                        <Car size={32} className="text-blue-500" />
                    </div>

                    <div className="bg-white p-4 rounded shadow flex justify-between items-center">
                        <div>
                            <h2 className="text-gray-600">Total Distance (entries)</h2>
                            <p className="text-2xl font-bold">{filteredData.length}</p>
                            <p className="text-green-600 flex items-center">
                                <TrendingUp size={16} className="mr-1" /> +8%
                            </p>
                        </div>
                        <Car size={32} className="text-green-500" />
                    </div>

                    <div className="bg-white p-4 rounded shadow flex justify-between items-center">
                        <div>
                            <h2 className="text-gray-600">Active Hours (hrs)</h2>
                            <p className="text-2xl font-bold">{filteredData.length}</p>
                            <p className="text-red-600 flex items-center">
                                <TrendingDown size={16} className="mr-1" /> -3%
                            </p>
                        </div>
                        <Car size={32} className="text-yellow-500" />
                    </div>

                    <div className="bg-white p-4 rounded shadow flex justify-between items-center">
                        <div>
                            <h2 className="text-gray-600">Active Alerts</h2>
                            <p className="text-2xl font-bold text-red-500">
                                {filteredAlertData.reduce((sum, d) => sum + d.value, 0)}
                            </p>
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
                        <h3 className="text-lg font-semibold mb-4">
                            Fuel Efficiency Trend
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={filteredData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" tickFormatter={formatDate} />
                                <YAxis />
                                <Tooltip labelFormatter={formatDate} />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="actual"
                                    stroke="#0088FE"
                                    name="Actual MPG"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="target"
                                    stroke="#FF0000"
                                    strokeDasharray="5 5"
                                    name="Target MPG"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Speed Analysis */}
                    <div className="bg-white p-4 rounded shadow">
                        <h3 className="text-lg font-semibold mb-4">
                            Speed Analysis by Vehicle
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={filteredSpeedData}>
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
                        <h3 className="text-lg font-semibold mb-4">
                            Engine Temperature Patterns
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={filteredData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" tickFormatter={formatDate} />
                                <YAxis />
                                <Tooltip labelFormatter={formatDate} />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="temp"
                                    stroke="#FF8042"
                                    name="Temp (°F)"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Alert Distribution */}
                    <div className="bg-white p-4 rounded shadow">
                        <h3 className="text-lg font-semibold mb-4">
                            Alert Distribution
                        </h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={filteredAlertData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label
                                >
                                    {filteredAlertData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
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
                            <li>Vehicles meeting fuel efficiency targets</li>
                            <li>Speeds within safe operating ranges</li>
                            <li>Stable engine temperatures</li>
                        </ul>
                    </div>
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                        <h4 className="font-semibold mb-2">⚠️ Needs Attention</h4>
                        <ul className="list-disc ml-5 text-red-700">
                            <li>High alert counts in selected period</li>
                            <li>Maintenance overdue reminders</li>
                            <li>Temperature spikes detected</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
