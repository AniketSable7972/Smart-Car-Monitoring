// DriverDashboard.js
import React, { useEffect, useState } from "react";
import { Gauge, Fuel, Thermometer, MapPin, AlertTriangle } from "lucide-react";
import api from "../api/client";

const formatLocalDateTime = (date) => {
  const pad = (n) => String(n).padStart(2, "0");
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${y}-${m}-${d}T${hh}:${mm}:${ss}`;
};

const THRESHOLDS = { speed: 100, fuel: 20, temperature: 100 };
const compactCause = (type, valueStr) => {
  const t = (type || "").toLowerCase();
  const num = parseFloat((valueStr || "").replace(/[^0-9.\-]/g, ""));
  if (t.includes("speed")) return `Speed ${isNaN(num) ? valueStr : num} > ${THRESHOLDS.speed} (overspeed)`;
  if (t.includes("fuel")) return `Fuel ${isNaN(num) ? valueStr : num}% < ${THRESHOLDS.fuel}% (low fuel)`;
  if (t.includes("temp")) return `Temp ${isNaN(num) ? valueStr : num}°C > ${THRESHOLDS.temperature}°C (overheat)`;
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
      const assigned = d?.assignedCarId || null;
      setCarId(assigned);
      if (!assigned) setLoading(false);
    } catch (_) {
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
    } catch (_) {
      setStats(null);
    }
  };

  const fetchLatest = async (carIdArg) => {
    try {
      const tRes = await api.get(`/telemetry/car/${carIdArg}/latest`);
      const list = tRes?.data?.data || [];
      setLatest(list[0] || null);
    } catch (_) {
      setLatest(null);
    }
  };

  const fetchAlerts = async (carIdArg) => {
    try {
      const aRes = await api.get(`/alerts/car/${carIdArg}`);
      const arr = (aRes?.data?.data || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setAlerts(arr);
      return arr;
    } catch (_) {
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
        if (tList.length === 0) return null;
        const t = new Date(ts).getTime();
        let best = null, bestDiff = Number.MAX_SAFE_INTEGER;
        for (const rec of tList) {
          const diff = Math.abs(new Date(rec.timestamp).getTime() - t);
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
        const cause = compactCause(a.type, value);
        return { ...a, derivedValue: value, cause };
      });
      setRecentAlerts(withValues);
    } catch (_) {
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
        <div className="bg-white p-6 rounded shadow text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">No vehicle assigned</h2>
          <p className="text-gray-600">You will see your dashboard data once a vehicle is assigned to you.</p>
        </div>
      </div>
    );
  }

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const alertsLast24h = alerts.filter(a => new Date(a.timestamp) >= twentyFourHoursAgo);

  const topCards = (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
      <div className="bg-white p-3 rounded shadow flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <Gauge size={18} className="text-blue-500" />
          <h3 className="text-gray-600">Current Speed</h3>
        </div>
        <p className="text-2xl font-bold">{latest?.speed ?? 0} km/h</p>
      </div>
      <div className="bg-white p-3 rounded shadow flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <Fuel size={18} className="text-green-500" />
          <h3 className="text-gray-600">Fuel Level</h3>
        </div>
        <p className="text-2xl font-bold">{latest?.fuelLevel ?? 0}%</p>
      </div>
      <div className="bg-white p-3 rounded shadow flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <Thermometer size={18} className="text-orange-500" />
          <h3 className="text-gray-600">Engine Temp</h3>
        </div>
        <p className="text-2xl font-bold">{latest?.temperature ?? 0}°C</p>
      </div>
      <div className="bg-white p-3 rounded shadow flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <MapPin size={18} className="text-purple-500" />
          <h3 className="text-gray-600">Location</h3>
        </div>
        <p className="font-medium">{latest?.location || "-"}</p>
      </div>
    </div>
  );

  const middleAlerts = (
    <div className="bg-white p-3 rounded shadow mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle size={18} className="text-red-500" /> Recent Alerts
        </h3>
        <span className="text-sm text-gray-500">Last 3 events</span>
      </div>
      {recentAlerts.length === 0 ? (
        <p className="text-gray-500 text-sm">No recent alerts.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {recentAlerts.map((a) => (
            <div key={a.id} className="border rounded p-3">
              <div className="text-sm text-gray-600">{new Date(a.timestamp).toLocaleString()}</div>
              <div className="font-semibold mt-1 flex items-center gap-1">
                {a.type.toLowerCase().includes("speed") && <Gauge size={16} className="text-blue-500" />}
                {a.type.toLowerCase().includes("fuel") && <Fuel size={16} className="text-green-500" />}
                {a.type.toLowerCase().includes("temp") && <Thermometer size={16} className="text-orange-500" />}
                {a.type.toLowerCase().includes("location") && <MapPin size={16} className="text-purple-500" />}
                {!(a.type.toLowerCase().includes("speed") || a.type.toLowerCase().includes("fuel") || a.type.toLowerCase().includes("temp") || a.type.toLowerCase().includes("location")) &&
                  <AlertTriangle size={16} className="text-red-500" />}
                {a.type}
              </div>
              <div className="text-gray-600 text-sm">{a.cause || a.message || "-"}</div>
              <div className="text-sm mt-1">
                <span className="text-gray-500">Value:</span> {a.derivedValue || "-"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const bottomStats = (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
      <div className="bg-white p-3 rounded shadow flex flex-col">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-gray-600">Avg Speed (24h)</h2>
          <Gauge size={20} className="text-blue-500" />
        </div>
        <p className="text-2xl font-bold">{stats?.averageSpeed ?? 0} km/h</p>
        <p className="text-xs text-gray-500">Min {stats?.minSpeed ?? 0} • Max {stats?.maxSpeed ?? 0}</p>
      </div>
      <div className="bg-white p-3 rounded shadow flex flex-col">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-gray-600">Avg Fuel (24h)</h2>
          <Fuel size={20} className="text-green-500" />
        </div>
        <p className="text-2xl font-bold">{stats?.averageFuel ?? 0}%</p>
        <p className="text-xs text-gray-500">Min {stats?.minFuel ?? 0}% • Max {stats?.maxFuel ?? 0}%</p>
      </div>
      <div className="bg-white p-3 rounded shadow flex flex-col">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-gray-600">Avg Temp (24h)</h2>
          <Thermometer size={20} className="text-orange-500" />
        </div>
        <p className="text-2xl font-bold">{stats?.averageTemperature ?? 0}°C</p>
        <p className="text-xs text-gray-500">Min {stats?.minTemperature ?? 0}°C • Max {stats?.maxTemperature ?? 0}°C</p>
      </div>
      <div className="bg-white p-3 rounded shadow flex flex-col">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-gray-600">Alerts (24h)</h2>
          <AlertTriangle size={20} className="text-red-500" />
        </div>
        <p className="text-2xl font-bold text-red-600">{alertsLast24h.length}</p>
        <p className="text-xs text-gray-500">Fuel/Temp/Speed issues</p>
      </div>
    </div>
  );

  return (
    <div className="pt-16">
      <div className="p-4 bg-gray-100 min-h-screen">
        <div className="mb-3">
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
