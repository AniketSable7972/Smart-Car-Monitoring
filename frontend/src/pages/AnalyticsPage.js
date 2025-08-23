// AnalyticsPage.js
import React, { useEffect, useMemo, useState } from "react";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Car, AlertTriangle } from "lucide-react";
import api from "../api/client";

const formatTimestamp = (ts) => {
    if (!ts) return "";
    return new Date(ts).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const getDateLimit = (range) => {
    const d = new Date();
    if (range === "Last 7 days") d.setDate(d.getDate() - 7);
    else if (range === "Last 30 days") d.setDate(d.getDate() - 30);
    else if (range === "Last 90 days") d.setDate(d.getDate() - 90);
    else d.setFullYear(2000, 0, 1);
    return d;
};

const COLORS = ["#0088FE", "#FF8042", "#00C49F", "#FFBB28", "#AA336A"];

const AnalyticsPage = () => {
    const [vehicle, setVehicle] = useState("All Vehicles");
    const [timeRange, setTimeRange] = useState("Last 7 days");
    const [telemetry, setTelemetry] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                setLoading(true);
                const [tRes, aRes] = await Promise.all([api.get("/telemetry"), api.get("/alerts")]);
                if (!mounted) return;

                const t = (tRes?.data?.data || []).map((row) => ({
                    ...row,
                    vehicleId: row?.car?.displayId ?? row?.car?.id ?? String(row?.carId ?? "UNKNOWN"),
                    ts: row?.timestamp,
                }));

                const a = (aRes?.data?.data || []).map((row) => ({
                    ...row,
                    vehicleId: row?.car?.displayId ?? row?.car?.id ?? String(row?.carId ?? "UNKNOWN"),
                    ts: row?.timestamp,
                }));

                setTelemetry(t);
                setAlerts(a);
                setLastUpdated(new Date());
            } catch (e) {
                console.error("Analytics fetch error:", e);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, []);

    const vehicleOptions = useMemo(() => {
        const set = new Set(telemetry.map((r) => r.vehicleId));
        return Array.from(set).sort();
    }, [telemetry]);

    const dateLimit = useMemo(() => getDateLimit(timeRange), [timeRange]);

    const filteredTelemetry = useMemo(() => {
        return telemetry.filter((r) => {
            const tsOk = r.ts ? new Date(r.ts) >= dateLimit : false;
            const vehOk = vehicle === "All Vehicles" || r.vehicleId === vehicle;
            return tsOk && vehOk;
        });
    }, [telemetry, dateLimit, vehicle]);

    const filteredAlerts = useMemo(() => {
        return alerts.filter((r) => {
            const tsOk = r.ts ? new Date(r.ts) >= dateLimit : false;
            const vehOk = vehicle === "All Vehicles" || r.vehicleId === vehicle;
            return tsOk && vehOk;
        });
    }, [alerts, dateLimit, vehicle]);

    const speedByVehicle = useMemo(() => {
        const agg = new Map();
        filteredTelemetry.forEach((r) => {
            const v = r.vehicleId;
            if (!agg.has(v)) agg.set(v, { total: 0, count: 0, max: 0 });
            const a = agg.get(v);
            a.total += Number(r.speed ?? 0);
            a.count += 1;
            a.max = Math.max(a.max, Number(r.speed ?? 0));
        });
        return Array.from(agg.entries()).map(([name, v]) => ({
            name,
            avg: v.count ? Number((v.total / v.count).toFixed(2)) : 0,
            max: v.max,
        }));
    }, [filteredTelemetry]);

    const tempSeries = useMemo(() => {
        return filteredTelemetry
            .filter((r) => r.ts)
            .map((r) => ({
                time: formatTimestamp(r.ts),
                temp: Number(r.temperature ?? 0),
                date: r.ts,
            }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [filteredTelemetry]);

    const alertsPie = useMemo(() => {
        const byType = new Map();
        filteredAlerts.forEach((a) => {
            const key = a.type || "Unknown";
            byType.set(key, (byType.get(key) || 0) + 1);
        });
        const rows = Array.from(byType.entries()).map(([name, value]) => ({ name, value }));
        return rows.length ? rows : [{ name: "No Alerts", value: 1 }];
    }, [filteredAlerts]);

    const tempPoints = tempSeries.length;
    const totalAlerts = alertsPie.reduce((s, x) => s + x.value, 0);

    const secondsAgo = lastUpdated ? Math.floor((new Date() - lastUpdated) / 1000) : null;

    return (
        <div className="pt-16">
            <div className="p-6 bg-gray-100 min-h-screen">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Fleet Analytics</h1>
                        <p className="text-gray-600">
                            Comprehensive insights and performance metrics for your fleet
                        </p>
                    </div>
                    {secondsAgo !== null && (
                        <span className="text-gray-500 text-sm">Last updated: {secondsAgo}s ago</span>
                    )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <select className="border px-4 py-2 rounded" value={vehicle} onChange={(e) => setVehicle(e.target.value)}>
                        <option>All Vehicles</option>
                        {vehicleOptions.map((v) => (
                            <option key={v}>{v}</option>
                        ))}
                    </select>

                    <select className="border px-4 py-2 rounded" value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
                        <option>Last 7 days</option>
                        <option>Last 30 days</option>
                        <option>Last 90 days</option>
                    </select>
                </div>

                {loading ? (
                    <div className="bg-white p-6 rounded shadow text-gray-500">Loading analytics…</div>
                ) : (
                    <>
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            {/* Total Vehicles */}
                            <div className="bg-white p-4 rounded shadow flex justify-between items-center">
                                <div>
                                    <h2 className="text-gray-600">Total Vehicles</h2>
                                    <p className="text-2xl font-bold">{vehicleOptions.length}</p>
                                </div>
                                <Car size={32} className="text-blue-500" />
                            </div>

                            {/* Average Engine Temp */}
                            <div className="bg-white p-4 rounded shadow flex justify-between items-center">
                                <div>
                                    <h2 className="text-gray-600">Avg Engine Temp (°C)</h2>
                                    <p className="text-2xl font-bold">
                                        {filteredTelemetry.length
                                            ? (
                                                filteredTelemetry.reduce((s, x) => s + Number(x.temperature ?? 0), 0) /
                                                filteredTelemetry.length
                                            ).toFixed(1)
                                            : 0}
                                    </p>
                                </div>
                                <TrendingDown size={32} className="text-red-500" />
                            </div>

                            {/* Existing KPI: Temp Samples */}
                            <div className="bg-white p-4 rounded shadow flex justify-between items-center">
                                <div>
                                    <h2 className="text-gray-600">Temp Samples</h2>
                                    <p className="text-2xl font-bold">{tempPoints}</p>
                                </div>
                                <Car size={32} className="text-yellow-500" />
                            </div>

                            {/* Existing KPI: Active Alerts */}
                            <div className="bg-white p-4 rounded shadow flex justify-between items-center">
                                <div>
                                    <h2 className="text-gray-600">Active Alerts</h2>
                                    <p className="text-2xl font-bold text-red-500">{totalAlerts}</p>
                                </div>
                                <AlertTriangle size={32} className="text-red-500" />
                            </div>
                        </div>


                        {/* Charts */}
                        <div className="grid grid-cols-1 gap-6 mb-6">
                            {/* Speed Analysis + Alerts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                {/* Speed Analysis */}
                                <div className="bg-white p-5 rounded-2xl shadow-md overflow-x-auto">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-700">🚗 Speed Analysis by Vehicle</h3>
                                    <div style={{ minWidth: `${speedByVehicle.length * 70}px` }}>
                                        <ResponsiveContainer width="100%" height={280}>
                                            <BarChart data={speedByVehicle}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                <XAxis dataKey="name" interval={0} angle={-30} textAnchor="end" tick={{ fontSize: 12 }} />
                                                <YAxis tick={{ fontSize: 12 }} />
                                                <Tooltip contentStyle={{ borderRadius: "10px", boxShadow: "0px 2px 6px rgba(0,0,0,0.15)" }} />
                                                <Legend />
                                                <Bar
                                                    dataKey="avg"
                                                    fill="#3B82F6"
                                                    name="Avg Speed"
                                                    barSize={18}
                                                    radius={[6, 6, 0, 0]}
                                                    isAnimationActive={true}
                                                    animationDuration={1200}
                                                    animationEasing="ease-out"
                                                />
                                                <Bar
                                                    dataKey="max"
                                                    fill="#EF4444"
                                                    name="Max Speed"
                                                    barSize={18}
                                                    radius={[6, 6, 0, 0]}
                                                    isAnimationActive={true}
                                                    animationDuration={1400}
                                                    animationEasing="ease-out"
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Alerts Pie */}
                                <div className="bg-white p-5 rounded-2xl shadow-md">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-700">⚠️ Alert Distribution</h3>
                                    <ResponsiveContainer width="100%" height={280}>
                                        <PieChart>
                                            <Pie
                                                data={alertsPie}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={100}
                                                label={({ name, value }) => `${name}: ${value}`}
                                                isAnimationActive={true}
                                                animationDuration={1500}
                                                animationEasing="ease-in-out"
                                            >
                                                {alertsPie.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ borderRadius: "10px", boxShadow: "0px 2px 6px rgba(0,0,0,0.15)" }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Engine Temperature Patterns full width */}
                            <div className="bg-white p-5 rounded-2xl shadow-md">
                                <h3 className="text-lg font-semibold mb-4 text-gray-700">🌡️ Engine Temperature Patterns</h3>
                                <ResponsiveContainer width="100%" height={320}>
                                    <LineChart data={tempSeries}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis
                                            dataKey="time"
                                            tickFormatter={(t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            tick={{ fontSize: 12 }}
                                        />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip contentStyle={{ borderRadius: "10px", boxShadow: "0px 2px 6px rgba(0,0,0,0.15)" }} />
                                        <Line
                                            type="monotone"
                                            dataKey="temp"
                                            stroke="#F97316"
                                            name="Temp (°C)"
                                            strokeWidth={2.5}
                                            dot={{ r: 3 }}
                                            activeDot={{ r: 6, fill: "#F97316" }}
                                            isAnimationActive={true}
                                            animationDuration={2000}
                                            animationEasing="ease-in-out"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>



                    </>
                )}
            </div>
        </div>
    );
};

export default AnalyticsPage;

