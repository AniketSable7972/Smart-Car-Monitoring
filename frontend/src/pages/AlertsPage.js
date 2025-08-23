// AlertsPage.js
import React, { useState, useEffect, useMemo } from "react";
import { AlertTriangle, Fuel, Thermometer, Wrench, Zap } from "lucide-react";
import api from "../api/client";

const StatCard = ({ label, value, color }) => (
  <div
    className={`p-4 rounded-lg shadow bg-white border-l-4 ${color} flex flex-col`}
  >
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-2xl font-bold">{value}</span>
  </div>
);

const AlertsPage = ({ user }) => {
  const [alerts, setAlerts] = useState([]);
  const [carId, setCarId] = useState(null);
  const [cars, setCars] = useState([]);
  const [selectedCarId, setSelectedCarId] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const alertsPerPage = 10;

  const loadDriverCar = async () => {
    if (user.role !== "DRIVER") return;
    try {
      const dres = await api.get(`/drivers/user/${user.id}`);
      const d = dres?.data?.data;
      setCarId(d?.assignedCarId || null);
    } catch {
      setCarId(null);
    }
  };

  const loadCars = async () => {
    if (user.role !== "ADMIN") return;
    try {
      const res = await api.get("/cars");
      setCars(res?.data?.data || []);
    } catch {
      setCars([]);
    }
  };

  const loadAlerts = async () => {
    try {
      if (user.role === "DRIVER") {
        if (!carId) return;
        const res = await api.get(`/alerts/car/${carId}`);
        setAlerts(res?.data?.data || []);
      } else {
        if (selectedCarId === "ALL") {
          const res = await api.get("/alerts");
          setAlerts(res?.data?.data || []);
        } else {
          const res = await api.get(`/alerts/car/${selectedCarId}`);
          setAlerts(res?.data?.data || []);
        }
      }
    } catch {
      setAlerts([]);
    }
  };

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
    loadCars();
  }, [user.id, user.role]);

  useEffect(() => {
    loadAlerts();
  }, [carId, selectedCarId, user.role]);

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

  const breakdown = useMemo(() => {
    const counts = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    alerts.forEach((a) => {
      if (counts[a.severity] !== undefined) counts[a.severity]++;
    });
    return counts;
  }, [alerts]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      const matchesSearch = a.type
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesSeverity =
        severityFilter === "ALL" || a.severity === severityFilter;
      return matchesSearch && matchesSeverity;
    });
  }, [alerts, searchTerm, severityFilter]);

  // ✅ Pagination logic
  const indexOfLastAlert = currentPage * alertsPerPage;
  const indexOfFirstAlert = indexOfLastAlert - alertsPerPage;
  const currentAlerts = filteredAlerts.slice(
    indexOfFirstAlert,
    indexOfLastAlert
  );
  const totalPages = Math.ceil(filteredAlerts.length / alertsPerPage);

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

        {/* Overview Section */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <StatCard
            label="Total Alerts"
            value={alerts.length}
            color="border-blue-500"
          />
          <StatCard label="Low" value={breakdown.LOW} color="border-green-500" />
          <StatCard
            label="Medium"
            value={breakdown.MEDIUM}
            color="border-yellow-500"
          />
          <StatCard label="High" value={breakdown.HIGH} color="border-orange-500" />
          <StatCard
            label="Critical"
            value={breakdown.CRITICAL}
            color="border-red-500"
          />
        </div>

        {/* Admin Car Dropdown */}
        {user.role === "ADMIN" && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Select Car</h2>
            <select
              className="px-4 py-2 rounded shadow border w-full md:w-1/3"
              value={selectedCarId}
              onChange={(e) => setSelectedCarId(e.target.value)}
            >
              <option value="ALL">All Cars</option>
              {cars.map((car) => (
                <option key={car.id} value={car.id}>
                  {car.model || `Car ${car.id}`}
                </option>
              ))}
            </select>
          </div>
        )}

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

        {/* Alerts Table */}
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
              {currentAlerts.length > 0 ? (
                renderTableRows(currentAlerts)
              ) : (
                <tr>
                  <td
                    className="p-3 text-gray-500"
                    colSpan={user.role === "ADMIN" ? 5 : 4}
                  >
                    No alerts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-center gap-2 mt-3">
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            ◀ Prev
          </button>

          <span className="text-sm">
            Page {currentPage} of {totalPages || 1}
          </span>

          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next ▶
          </button>
        </div>

      </div>
    </div>
  );
};

export default AlertsPage;
