<<<<<<< HEAD
// MapView.js with a hardcoded user role
import React, { useState, useEffect } from "react";
=======
// MapView.js
import React, { useState, useEffect, useRef } from "react";
>>>>>>> 48e95dcd9674235d4f845faf53ace9767b33505e
import {
    MapPin,
    RefreshCcw,
    Car,
    Gauge,
    Fuel,
    Thermometer,
    LogOut
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

<<<<<<< HEAD
// Fix for default marker icon missing in some setups
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// A custom component to handle centering the map
const ChangeView = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, map.getZoom());
        }
    }, [center, map]);
    return null;
};

const MapView = () => {
    // Hardcoded vehicle data
    const allVehicles = [
        {
            id: "CAR001",
            driver: "Rajesh Kumar",
            lat: 28.6139, // New Delhi
            lng: 77.2090,
            address: "New Delhi, India",
=======
const MapView = ({ user }) => {
    const [vehicles] = useState([
        {
            id: "CAR001",
            driver: "John Doe",
            lat: 40.7128,
            lng: -74.0060,
            address: "New York, NY",
>>>>>>> 48e95dcd9674235d4f845faf53ace9767b33505e
            speed: 55,
            fuelLevel: 70,
            engineTemp: 95,
            status: "active"
        },
        {
            id: "CAR002",
<<<<<<< HEAD
            driver: "Priya Sharma",
            lat: 19.0760, // Mumbai
            lng: 72.8777,
            address: "Mumbai, Maharashtra",
=======
            driver: "Alice Smith",
            lat: 34.0522,
            lng: -118.2437,
            address: "Los Angeles, CA",
>>>>>>> 48e95dcd9674235d4f845faf53ace9767b33505e
            speed: 60,
            fuelLevel: 40,
            engineTemp: 105,
            status: "idle"
        },
        {
            id: "CAR003",
<<<<<<< HEAD
            driver: "Amit Patel",
            lat: 23.0225, // Ahmedabad
            lng: 72.5714,
            address: "Ahmedabad, Gujarat",
=======
            driver: "Mike Johnson",
            lat: 41.8781,
            lng: -87.6298,
            address: "Chicago, IL",
>>>>>>> 48e95dcd9674235d4f845faf53ace9767b33505e
            speed: 45,
            fuelLevel: 20,
            engineTemp: 110,
            status: "maintenance"
        }
    ];

    // --- Hardcoded User State ---
    // The application now starts with a user already defined.
    // To switch the view, change the `hardcodedUser` object below.
    // Uncomment the 'admin' user to view the full fleet.
    // Uncomment the 'driver' user to view only CAR001.
    
    // Admin user: sees all vehicles
    const hardcodedUser = { username: "admin1", role: "admin" };
    
    // Driver user: sees only their assigned vehicle (CAR001)
    // const hardcodedUser = { username: "driver1", role: "driver", vehicleId: "CAR001" };

    const [user, setUser] = useState(hardcodedUser);

    // Filter vehicles based on the hardcoded user's role
    const vehiclesToShow = user?.role === "driver"
        ? allVehicles.filter(v => v.id === user.vehicleId)
        : allVehicles;

    // Use state to manage the selected vehicle
    const [selectedVehicle, setSelectedVehicle] = useState(null);
<<<<<<< HEAD
=======
    const [zoom, setZoom] = useState(1);
    const mapContainerRef = useRef(null);

    // filter vehicles by role
    const filteredVehicles =
        user.role === "DRIVER"
            ? vehicles.filter((v) => v.id === user.assignedCarId)
            : vehicles;

    // auto-select for drivers
>>>>>>> 48e95dcd9674235d4f845faf53ace9767b33505e
    useEffect(() => {
        // Automatically select the first vehicle from the filtered list on initial load
        if (vehiclesToShow.length > 0) {
            setSelectedVehicle(vehiclesToShow[0]);
        }
<<<<<<< HEAD
    }, []);

    // UI helper functions for styling
=======
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
>>>>>>> 48e95dcd9674235d4f845faf53ace9767b33505e
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

<<<<<<< HEAD
    const defaultCenter = [20.5937, 78.9629]; // Central location for India
    const mapCenter = selectedVehicle ? [selectedVehicle.lat, selectedVehicle.lng] : defaultCenter;
=======
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
>>>>>>> 48e95dcd9674235d4f845faf53ace9767b33505e

    // The entire application UI is rendered directly
    return (
    <div className="pt-16">
        <div className="p-6 bg-gray-100 min-h-screen flex flex-col md:flex-row gap-6">

            {/* Map Panel */}
            <div className="w-full md:w-2/3 bg-white rounded-lg shadow p-4 relative">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <MapPin size={20} />
                        Fleet Map
                    </h2>
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center gap-2 text-blue-500 hover:text-blue-700"
                    >
                        <RefreshCcw size={18} /> Refresh
                    </button>
                </div>

<<<<<<< HEAD
                {/* Map Container */}
                <div className="w-full h-96 border rounded overflow-hidden">
                    <MapContainer
                        center={mapCenter}
                        zoom={selectedVehicle ? 13 : 4} // Zoom in on the vehicle if one is selected
                        scrollWheelZoom={true}
                        style={{ height: "100%", width: "100%" }}
=======
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
>>>>>>> 48e95dcd9674235d4f845faf53ace9767b33505e
                    >
                        <ChangeView center={mapCenter} />
                        <TileLayer
                            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {vehiclesToShow.map((v) => (
                            <Marker
                                key={v.id}
                                position={[v.lat, v.lng]}
                                eventHandlers={{
                                    click: () => setSelectedVehicle(v),
                                }}
                            >
                                <Popup>
                                    <div>
                                        <h4 className="font-bold">{v.id}</h4>
                                        <p>{v.address}</p>
                                        <span
                                            className={`text-xs px-2 py-1 rounded text-white ${getStatusColor(v.status)}`}
                                        >
                                            {v.status}
                                        </span>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </div>

            {/* Sidebar */}
            <div className="w-full md:w-1/3 flex flex-col gap-4">
<<<<<<< HEAD
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Car size={18} /> Fleet Vehicles
                    </h3>
                    <ul className="space-y-2">
                        {vehiclesToShow.map((v) => (
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
=======
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
>>>>>>> 48e95dcd9674235d4f845faf53ace9767b33505e

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
<<<<<<< HEAD
=======

                        <button
                            onClick={() => centerMapOn(selectedVehicle.id)}
                            className="mt-4 flex items-center gap-2 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
                        >
                            <Crosshair size={16} /> Center Map
                        </button>
>>>>>>> 48e95dcd9674235d4f845faf53ace9767b33505e
                    </div>
                )}
            </div>
        </div>
    </div>
    );
};

export default MapView;
