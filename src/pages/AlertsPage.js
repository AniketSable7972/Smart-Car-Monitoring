import React, { useState, useEffect } from "react";
import {
    AlertTriangle,
    Fuel,
    Thermometer,
    Wrench,
    Zap
} from "lucide-react";

const AlertsPage = ({ role, assignedVehicleId }) => {
    const [alerts, setAlerts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [severityFilter, setSeverityFilter] = useState("");

    // Sample alert data
    const generateAlerts = () => [
        {
            id: "A001",
            vehicleId: "CAR001",
            driver: "John Doe",
            type: "fuel",
            severity: "high",
            status: "active",
            message: "Fuel level dropped below 20%",
            timestamp: new Date().toLocaleString(),
            location: "New York"
        },
        {
            id: "A002",
            vehicleId: "CAR002",
            driver: "Alice Smith",
            type: "temperature",
            severity: "critical",
            status: "acknowledged",
            message: "Engine temperature exceeded 110°F",
            timestamp: new Date().toLocaleString(),
            location: "Chicago"
        },
        {
            id: "A003",
            vehicleId: "CAR003",
            driver: "Mike Johnson",
            type: "maintenance",
            severity: "medium",
            status: "resolved",
            message: "Scheduled maintenance overdue",
            timestamp: new Date().toLocaleString(),
            location: "Los Angeles"
        }
    ];

    useEffect(() => {
        setAlerts(generateAlerts());
    }, []);

    // Role-based filtering
    const visibleAlerts =
        role === "DRIVER"
            ? alerts.filter((a) => a.vehicleId === assignedVehicleId)
            : alerts;

    // Search and filter logic
    const filteredAlerts = visibleAlerts.filter((alert) => {
        return (
            (statusFilter === "" || alert.status === statusFilter) &&
            (severityFilter === "" || alert.severity === severityFilter) &&
            (alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                alert.vehicleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                alert.driver.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    });

    // Metrics
    const activeCount = visibleAlerts.filter((a) => a.status === "active").length;
    const acknowledgedCount = visibleAlerts.filter(
        (a) => a.status === "acknowledged"
    ).length;
    const resolvedCount = visibleAlerts.filter(
        (a) => a.status === "resolved"
    ).length;
    const criticalCount = visibleAlerts.filter(
        (a) => a.severity === "critical"
    ).length;

    // Icon mapping
    const getAlertIcon = (type) => {
        switch (type) {
            case "fuel":
                return <Fuel className="text-blue-500" size={18} />;
            case "temperature":
                return <Thermometer className="text-red-500" size={18} />;
            case "maintenance":
                return <Wrench className="text-yellow-500" size={18} />;
            case "speed":
                return <Zap className="text-green-500" size={18} />;
            default:
                return <AlertTriangle className="text-gray-500" size={18} />;
        }
    };

    // Severity badge color
    const severityColor = {
        low: "bg-green-200 text-green-800",
        medium: "bg-yellow-200 text-yellow-800",
        high: "bg-orange-200 text-orange-800",
        critical: "bg-red-200 text-red-800"
    };

    // Status badge color
    const statusColor = {
        active: "bg-red-500 text-white",
        acknowledged: "bg-yellow-500 text-white",
        resolved: "bg-green-500 text-white"
    };

    // Action handlers (simulate state update)
    const acknowledgeAlert = (id) => {
        setAlerts((prev) =>
            prev.map((a) =>
                a.id === id ? { ...a, status: "acknowledged" } : a
            )
        );
    };

    const resolveAlert = (id) => {
        setAlerts((prev) =>
            prev.map((a) => (a.id === id ? { ...a, status: "resolved" } : a))
        );
    };

    return (
        <div className="pt-16">
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold mb-4">Alerts</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-lg font-semibold">Active</h2>
                    <p className="text-2xl">{activeCount}</p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-lg font-semibold">Acknowledged</h2>
                    <p className="text-2xl">{acknowledgedCount}</p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-lg font-semibold">Resolved</h2>
                    <p className="text-2xl">{resolvedCount}</p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-lg font-semibold">Critical</h2>
                    <p className="text-2xl text-red-500">{criticalCount}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Search alerts..."
                    className="border px-4 py-2 rounded w-full md:w-1/3"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                    className="border px-4 py-2 rounded"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="acknowledged">Acknowledged</option>
                    <option value="resolved">Resolved</option>
                </select>
                <select
                    className="border px-4 py-2 rounded"
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                >
                    <option value="">All Severity</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                </select>
            </div>

            {/* Alerts Table */}
            <div className="overflow-x-auto bg-white rounded shadow">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-200 text-left">
                            <th className="p-3">Type</th>
                            <th className="p-3">Vehicle</th>
                            <th className="p-3">Message</th>
                            <th className="p-3">Severity</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Timestamp</th>
                            {role === "ADMIN" && <th className="p-3">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAlerts.map((alert) => (
                            <tr key={alert.id} className="border-b">
                                <td className="p-3 flex items-center gap-2">
                                    {getAlertIcon(alert.type)} {alert.type}
                                </td>
                                <td className="p-3">{alert.vehicleId}</td>
                                <td className="p-3">{alert.message}</td>
                                <td className="p-3">
                                    <span
                                        className={`px-2 py-1 rounded text-xs ${severityColor[alert.severity]}`}
                                    >
                                        {alert.severity}
                                    </span>
                                </td>
                                <td className="p-3">
                                    <span
                                        className={`px-2 py-1 rounded text-xs ${statusColor[alert.status]}`}
                                    >
                                        {alert.status}
                                    </span>
                                </td>
                                <td className="p-3">{alert.timestamp}</td>
                                {role === "ADMIN" && (
                                    <td className="p-3 flex gap-2">
                                        {alert.status === "active" && (
                                            <button
                                                onClick={() => acknowledgeAlert(alert.id)}
                                                className="bg-yellow-500 text-white px-2 py-1 rounded"
                                            >
                                                Acknowledge
                                            </button>
                                        )}
                                        {alert.status !== "resolved" && (
                                            <button
                                                onClick={() => resolveAlert(alert.id)}
                                                className="bg-green-500 text-white px-2 py-1 rounded"
                                            >
                                                Resolve
                                            </button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    );
};

export default AlertsPage;
