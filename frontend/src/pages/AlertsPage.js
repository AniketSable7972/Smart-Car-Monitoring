// AlertsPage.js
import React, { useState, useEffect, useMemo } from "react";
import { AlertTriangle, Fuel, Thermometer, Wrench, Zap } from "lucide-react";
import api from "../api/client";

const formatDisplayTime = (ts) => new Date(ts).toLocaleString();

const AlertsPage = ({ user }) => {
  const [alerts, setAlerts] = useState([]);
  const [carId, setCarId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");

  const loadDriverCar = async () => {
    if (user.role !== "DRIVER") return;
    try {
      const dres = await api.get(`/drivers/user/${user.id}`);
      const d = dres?.data?.data;
      setCarId(d?.assignedCarId || null);
    } catch (_) {
      setCarId(null);
    }
  };

  const loadAlerts = async () => {
    try {
      if (user.role === "DRIVER") {
        if (!carId) return;
        const res = await api.get(`/alerts/car/${carId}`);
        setAlerts(res?.data?.data || []);
      } else {
        const res = await api.get("/alerts");
        setAlerts(res?.data?.data || []);
      }
    } catch (_) { }
  };

  // Toggle acknowledgment only for admin
  const toggleAcknowledge = async (alertId, currentValue) => {
    if (user.role !== "ADMIN") return;
    try {
      await api.put(`/alerts/${alertId}/acknowledge`, {
        acknowledged: !currentValue,
      });
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alertId ? { ...a, acknowledged: !currentValue } : a
        )
      );
    } catch (err) {
      console.error("Failed to update acknowledgment", err);
    }
  };

  useEffect(() => {
    loadDriverCar();
  }, [user.id, user.role]);
  useEffect(() => {
    loadAlerts();
  }, [carId, user.role]);

  const getAlertIcon = (type) => {
    switch ((type || "").toLowerCase()) {
      case "low_fuel":
      case "fuel":
        return <Fuel className="text-blue-500" size={18} />;
      case "high_temperature":
      case "temperature":
        return <Thermometer className="text-red-500" size={18} />;
      case "maintenance":
        return <Wrench className="text-yellow-500" size={18} />;
      case "high_speed":
      case "speed":
        return <Zap className="text-green-500" size={18} />;
      default:
        return <AlertTriangle className="text-gray-500" size={18} />;
    }
  };

  const severityColor = {
    LOW: "bg-green-200 text-green-800",
    MEDIUM: "bg-yellow-200 text-yellow-800",
    HIGH: "bg-orange-200 text-orange-800",
    CRITICAL: "bg-red-200 text-red-800",
  };

  // Filtered and searched alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      const matchesSearch = a.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSeverity = severityFilter === "ALL" || a.severity === severityFilter;
      return matchesSearch && matchesSeverity;
    });
  }, [alerts, searchTerm, severityFilter]);

  const renderTableRows = (alertList) =>
    alertList.map((a) => (
      <tr key={a.id} className="border-b">
        <td className="p-3 flex items-center gap-2">
          {getAlertIcon(a.type)} {a.type}
        </td>
        {user.role === "ADMIN" && <td className="p-3">{a.carId ?? "-"}</td>}
        <td className="p-3">
          <span
            className={`px-2 py-1 rounded text-xs ${severityColor[a.severity] || "bg-gray-100 text-gray-600"
              }`}
          >
            {a.severity}
          </span>
        </td>
        <td className="p-3">
          {user.role === "ADMIN" ? (
            <button
              className={`px-3 py-1 rounded text-xs font-medium ${a.acknowledged ? "bg-green-500 text-white" : "bg-red-500 text-white"
                }`}
              onClick={() => toggleAcknowledge(a.id, a.acknowledged)}
            >
              {a.acknowledged ? "Yes" : "No"}
            </button>
          ) : (
            <span
              className={`px-3 py-1 rounded text-xs font-medium ${a.acknowledged ? "bg-green-500 text-white" : "bg-red-500 text-white"
                }`}
            >
              {a.acknowledged ? "Yes" : "No"}
            </span>
          )}
        </td>
        <td className="p-3">{new Date(a.timestamp).toLocaleString()}</td>
      </tr>
    ));

  return (
    <div className="pt-16">
      <div className="p-6 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold mb-4">Alerts</h1>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mb-4">
          <input
            type="text"
            placeholder="Search by alert type..."
            className="px-3 py-2 border rounded w-full md:w-1/3"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="px-3 py-2 border rounded"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="ALL">All Severities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-3">Type</th>
                {user.role === "ADMIN" && <th className="p-3">Car</th>}
                <th className="p-3">Severity</th>
                <th className="p-3">Acknowledged</th>
                <th className="p-3">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.length > 0 ? (
                renderTableRows(filteredAlerts)
              ) : (
                <tr>
                  <td className="p-3 text-gray-500" colSpan={user.role === "ADMIN" ? 5 : 4}>
                    No alerts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AlertsPage;
