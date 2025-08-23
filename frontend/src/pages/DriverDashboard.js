// DriverDashboard.js
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Gauge, Fuel, Thermometer, MapPin, AlertTriangle } from "lucide-react";
import api from "../api/client";

const formatLocalDateTime = (date) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const THRESHOLDS = { speed: 100, fuel: 20, temperature: 100 };
const compactCause = (type, valueStr) => {
  const t = (type || "").toLowerCase();
  const num = parseFloat((valueStr || "").replace(/[^0-9.\-]/g, ""));
  if (t.includes("speed")) return `Overspeed: ${num} km/h > ${THRESHOLDS.speed}`;
  if (t.includes("fuel")) return `Low Fuel: ${num}% < ${THRESHOLDS.fuel}%`;
  if (t.includes("temp")) return `Overheat: ${num}°C > ${THRESHOLDS.temperature}°C`;
  return "Threshold exceeded";
};

const DriverDashboard = ({ user }) => {
  const [carId, setCarId] = useState(null);
  const [latest, setLatest] = useState(null);
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDriverCar = async () => {
    try {
      const dres = await api.get(`/drivers/user/${user.id}`);
      const d = dres?.data?.data;
      setCarId(d?.assignedCarId || null);
      if (!d?.assignedCarId) setLoading(false);
    } catch {
      setCarId(null);
      setLoading(false);
    }
  };

  const fetchStats = async (carIdArg) => {
    try {
      const end = new Date();
      const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
      const sRes = await api.get(`/telemetry/stats/car/${carIdArg}`, {
        params: { startTime: formatLocalDateTime(start), endTime: formatLocalDateTime(end) },
      });
      setStats(sRes?.data?.data || null);
    } catch {
      setStats(null);
    }
  };

  const fetchLatest = async (carIdArg) => {
    try {
      const tRes = await api.get(`/telemetry/car/${carIdArg}/latest`);
      setLatest((tRes?.data?.data || [])[0] || null);
    } catch {
      setLatest(null);
    }
  };

  const fetchAlerts = async (carIdArg) => {
    try {
      const aRes = await api.get(`/alerts/car/${carIdArg}`);
      const arr = (aRes?.data?.data || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setAlerts(arr);
      return arr;
    } catch {
      setAlerts([]);
      return [];
    }
  };

  const fetchRecentAlertValues = async (carIdArg, baseAlerts) => {
    try {
      const candidate = (baseAlerts || []).slice(0, 3);
      if (candidate.length === 0) { setRecentAlerts([]); return; }
      const minTs = new Date(Math.min(...candidate.map(a => new Date(a.timestamp).getTime())));
      const maxTs = new Date(Math.max(...candidate.map(a => new Date(a.timestamp).getTime())));
      const start = new Date(minTs.getTime() - 10 * 60 * 1000);
      const end = new Date(maxTs.getTime() + 10 * 60 * 1000);
      const tRes = await api.get(`/telemetry/car/${carIdArg}/range`, {
        params: { startTime: formatLocalDateTime(start), endTime: formatLocalDateTime(end) }
      });
      const tList = tRes?.data?.data || [];
      const nearest = (ts) => {
        let best = null, bestDiff = Number.MAX_SAFE_INTEGER;
        for (const rec of tList) {
          const diff = Math.abs(new Date(rec.timestamp).getTime() - new Date(ts).getTime());
          if (diff < bestDiff) { best = rec; bestDiff = diff; }
        }
        return best;
      };
      const withValues = candidate.map(a => {
        const rec = nearest(a.timestamp);
        let value = null;
        const type = (a.type || "").toLowerCase();
        if (rec) {
          if (type.includes("fuel")) value = `${rec.fuelLevel}%`;
          else if (type.includes("temp")) value = `${rec.temperature}°C`;
          else if (type.includes("speed")) value = `${rec.speed} km/h`;
        }
        return { ...a, derivedValue: value, cause: compactCause(a.type, value) };
      });
      setRecentAlerts(withValues);
    } catch {
      setRecentAlerts((baseAlerts || []).slice(0, 3));
    }
  };

  const fetchAll = async () => {
    if (!carId) return;
    try {
      await Promise.all([
        fetchLatest(carId),
        fetchStats(carId),
        (async () => {
          const arr = await fetchAlerts(carId);
          await fetchRecentAlertValues(carId, arr);
        })(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDriverCar(); }, [user.id]);
  useEffect(() => { fetchAll(); }, [carId]);
  useEffect(() => { const id = setInterval(fetchAll, 10000); return () => clearInterval(id); }, [carId]);

  if (loading && carId === null) {
    return (
      <div className="pt-16 flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!carId) {
    return (
      <div className="pt-16 flex justify-center items-center min-h-screen bg-gray-100">
        <div className="bg-white p-6 rounded-xl shadow-lg text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">No vehicle assigned</h2>
          <p className="text-gray-600">You will see your dashboard once a vehicle is assigned.</p>
        </div>
      </div>
    );
  }

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const alertsLast24h = alerts.filter(a => new Date(a.timestamp) >= twentyFourHoursAgo);

  // ---------- UI CARDS ----------
  const Card = ({ color, icon, label, value }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-2xl shadow-lg p-4 transition hover:shadow-xl border-t-4"
      style={{ borderColor: color }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-full`} style={{ backgroundColor: `${color}20`, color }}>
          {icon}
        </div>
        <h3 className="text-gray-600 font-medium">{label}</h3>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </motion.div>
  );

  const topCards = (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card color="#3B82F6" icon={<Gauge size={20} />} label="Current Speed" value={`${latest?.speed ?? 0} km/h`} />
      <Card color="#10B981" icon={<Fuel size={20} />} label="Fuel Level" value={`${latest?.fuelLevel ?? 0}%`} />
      <Card color="#F97316" icon={<Thermometer size={20} />} label="Engine Temp" value={`${latest?.temperature ?? 0}°C`} />
      <Card color="#8B5CF6" icon={<MapPin size={20} />} label="Location" value={latest?.location || "-"} />
    </div>
  );

  const middleAlerts = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="bg-white p-5 rounded-2xl shadow-lg mb-6"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle size={20} className="text-red-500" /> Recent Alerts
        </h3>
        <motion.span
          key={alertsLast24h.length}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.6 }}
          className="text-sm text-gray-500"
        >
          {alertsLast24h.length} in last 24h
        </motion.span>
      </div>

      {recentAlerts.length === 0 ? (
        <p className="text-gray-500 text-sm">No recent alerts.</p>
      ) : (
        <div className="relative border-l-2 border-gray-200 ml-3">
          {recentAlerts.map((a, i) => (
            <div key={a.id} className="mb-5 ml-4">
              <div className="absolute w-3 h-3 bg-red-500 rounded-full -left-[7px] top-2"></div>
              <div className="text-xs text-gray-500">{new Date(a.timestamp).toLocaleTimeString()}</div>
              <div className="flex items-center gap-2 font-semibold">
                {a.type.toLowerCase().includes("speed") && <Gauge size={16} className="text-blue-500" />}
                {a.type.toLowerCase().includes("fuel") && <Fuel size={16} className="text-green-500" />}
                {a.type.toLowerCase().includes("temp") && <Thermometer size={16} className="text-orange-500" />}
                {a.type}
              </div>
              <div className="text-sm text-gray-600">{a.cause || a.message}</div>
              <div className="text-xs text-gray-500">Value: {a.derivedValue || "-"}</div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );

  const bottomStats = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="grid grid-cols-1 md:grid-cols-4 gap-4"
    >
      <Card color="#3B82F6" icon={<Gauge size={20} />} label="Avg Speed (24h)" value={`${stats?.averageSpeed ?? 0} km/h`} />
      <Card color="#10B981" icon={<Fuel size={20} />} label="Avg Fuel (24h)" value={`${stats?.averageFuel ?? 0}%`} />
      <Card color="#F97316" icon={<Thermometer size={20} />} label="Avg Temp (24h)" value={`${stats?.averageTemperature ?? 0}°C`} />
      <Card color="#EF4444" icon={<AlertTriangle size={20} />} label="Alerts (24h)" value={alertsLast24h.length} />
    </motion.div>
  );

  return (
    <div className="pt-16">
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Driver Dashboard</h1>
          <p className="text-gray-600">Vehicle ID: {carId}</p>
          {latest && <p className="text-xs text-gray-500">Last updated: {new Date(latest.timestamp).toLocaleTimeString()}</p>}
        </div>
        {topCards}
        {middleAlerts}
        {bottomStats}
      </div>
    </div>
  );
};

export default DriverDashboard;

