// MapView.js
import React, { useState, useEffect, useRef } from "react";
import {
    MapPin,
    RefreshCcw,
    Crosshair,
    ZoomIn,
    ZoomOut,
    Car,
    Gauge,
    Fuel,
    Thermometer
} from "lucide-react";

const MapView = ({ user }) => {
    const [vehicles] = useState([
        {
            id: "CAR001",
            driver: "John Doe",
            lat: 40.7128,
            lng: -74.0060,
            address: "New York, NY",
            speed: 55,
            fuelLevel: 70,
            engineTemp: 95,
            status: "active"
        },
        {
            id: "CAR002",
            driver: "Alice Smith",
            lat: 34.0522,
            lng: -118.2437,
            address: "Los Angeles, CA",
            speed: 60,
            fuelLevel: 40,
            engineTemp: 105,
            status: "idle"
        },
        {
            id: "CAR003",
            driver: "Mike Johnson",
            lat: 41.8781,
            lng: -87.6298,
            address: "Chicago, IL",
            speed: 45,
            fuelLevel: 20,
            engineTemp: 110,
            status: "maintenance"
        }
    ]);

    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [zoom, setZoom] = useState(1);
    const mapContainerRef = useRef(null);

    // filter vehicles by role
    const filteredVehicles =
        user.role === "DRIVER"
            ? vehicles.filter((v) => v.id === user.assignedCarId)
            : vehicles;

    // auto-select for drivers
    useEffect(() => {
        if (user.role === "DRIVER" && filteredVehicles.length > 0) {
            setSelectedVehicle(filteredVehicles[0]);
        }
    }, [user.role, filteredVehicles]);

    // bounding box
    const lats = filteredVehicles.map((v) => v.lat);
    const lngs = filteredVehicles.map((v) => v.lng);
    const maxLat = Math.max(...lats);
    const minLat = Math.min(...lats);
    const maxLng = Math.max(...lngs);
    const minLng = Math.min(...lngs);

    // convert to 0–100%
    const toPercent = (value, min, max) => ((value - min) / (max - min)) * 100;

    // styling helpers
    const getStatusColor = (status) => {
        switch (status) {
            case "active":
                return "bg-green-500";
            case "idle":
                return "bg-yellow-500";
            case "maintenance":
                return "bg-red-500";
            default:
                return "bg-gray-500";
        }
    };
    const getFuelColor = (fuel) =>
        fuel > 50 ? "text-green-600" : fuel >= 25 ? "text-yellow-600" : "text-red-600";
    const getTempColor = (t) =>
        t <= 95 ? "text-green-600" : t <= 100 ? "text-yellow-600" : "text-red-600";

    // center selected marker in scrollable area
    const centerMapOn = (vehicleId) => {
        const container = mapContainerRef.current;
        if (!container) return;
        const marker = container.querySelector(`[data-id="${vehicleId}"]`);
        if (marker) {
            marker.scrollIntoView({
                behavior: "smooth",
                block: "center",
                inline: "center"
            });
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen flex flex-col md:flex-row gap-6">

            {/* Map Panel */}
            <div className="w-full md:w-2/3 bg-white rounded-lg shadow p-4 relative">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <MapPin size={20} />
                        {user.role === "DRIVER" ? "Vehicle Location" : "Fleet Map"}
                    </h2>
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center gap-2 text-blue-500 hover:text-blue-700"
                    >
                        <RefreshCcw size={18} /> Refresh
                    </button>
                </div>

                {/* Scrollable Grid Container */}
                <div
                    ref={mapContainerRef}
                    className="relative w-full h-96 border rounded overflow-auto bg-gray-50"
                >
                    {/* Scalable Content */}
                    <div
                        className="relative w-full h-full"
                        style={{
                            backgroundImage:
                                "linear-gradient(0deg, transparent 24%, rgba(0,0,0,0.05) 25%)," +
                                "linear-gradient(90deg, transparent 24%, rgba(0,0,0,0.05) 25%)",
                            backgroundSize: "40px 40px",
                            transform: `scale(${zoom})`,
                            transformOrigin: "center center"
                        }}
                    >
                        {filteredVehicles.map((v) => {
                            const topPct = toPercent(maxLat - v.lat, maxLat - minLat);
                            const leftPct = toPercent(v.lng, minLng, maxLng);
                            return (
                                <div
                                    key={v.id}
                                    data-id={v.id}
                                    className={`absolute w-4 h-4 rounded-full cursor-pointer ${getStatusColor(v.status)}`}
                                    style={{
                                        top: `${topPct}%`,
                                        left: `${leftPct}%`,
                                        transform: "translate(-50%, -50%)"
                                    }}
                                    onClick={() => setSelectedVehicle(v)}
                                    title={`${v.id}\n${v.address}`}
                                />
                            );
                        })}

                        {/* Crosshair */}
                        <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                            <Crosshair className="text-gray-400" size={32} />
                        </div>
                    </div>
                </div>

                {/* Zoom Controls */}
                <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                    <button
                        className="bg-white p-2 rounded shadow hover:bg-gray-100"
                        onClick={() => setZoom((z) => z + 0.1)}
                    >
                        <ZoomIn size={16} />
                    </button>
                    <button
                        className="bg-white p-2 rounded shadow hover:bg-gray-100"
                        onClick={() => setZoom((z) => Math.max(1, z - 0.1))}
                    >
                        <ZoomOut size={16} />
                    </button>
                </div>

                <div className="absolute bottom-4 left-4 bg-white px-3 py-1 rounded shadow text-sm">
                    Map Type: <span className="font-semibold">Grid View</span>
                </div>
            </div>

            {/* Sidebar */}
            <div className="w-full md:w-1/3 flex flex-col gap-4">
                {user.role === "ADMIN" && (
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <Car size={18} /> Fleet Vehicles
                        </h3>
                        <ul className="space-y-2">
                            {filteredVehicles.map((v) => (
                                <li
                                    key={v.id}
                                    onClick={() => setSelectedVehicle(v)}
                                    className={`p-3 rounded border cursor-pointer flex justify-between items-center ${selectedVehicle?.id === v.id ? "bg-blue-50 border-blue-500" : "hover:bg-gray-50"
                                        }`}
                                >
                                    <div>
                                        <p className="font-medium">{v.id}</p>
                                        <p className="text-sm text-gray-500 truncate">
                                            {v.driver} – {v.address}
                                        </p>
                                    </div>
                                    <span
                                        className={`text-xs px-2 py-1 rounded text-white ${getStatusColor(v.status)}`}
                                    >
                                        {v.status}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {selectedVehicle && (
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <Car size={18} /> {selectedVehicle.id} Details
                        </h3>
                        <p className="text-gray-600 mb-2">{selectedVehicle.driver}</p>
                        <p className="text-sm text-gray-500 mb-4">{selectedVehicle.address}</p>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Gauge size={18} className="text-blue-500" />
                                <span className="font-medium">Speed: {selectedVehicle.speed} mph</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Fuel size={18} className="text-green-500" />
                                <span className={`font-medium ${getFuelColor(selectedVehicle.fuelLevel)}`}>
                                    Fuel: {selectedVehicle.fuelLevel}%
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Thermometer size={18} className="text-orange-500" />
                                <span className={`font-medium ${getTempColor(selectedVehicle.engineTemp)}`}>
                                    Engine Temp: {selectedVehicle.engineTemp}°F
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => centerMapOn(selectedVehicle.id)}
                            className="mt-4 flex items-center gap-2 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
                        >
                            <Crosshair size={16} /> Center Map
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MapView;
