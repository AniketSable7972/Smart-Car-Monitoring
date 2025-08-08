// MapView.js
import React, { useState, useEffect } from "react";
import {
    MapPin,
    RefreshCcw,
    Car,
    Gauge,
    Fuel,
    Thermometer
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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

    const defaultCenter = [40, -100]; // A reasonable default for the USA
    const mapCenter = selectedVehicle ? [selectedVehicle.lat, selectedVehicle.lng] : defaultCenter;

    return (
        <div className="pt-16">
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

                {/* Map Container */}
                <div className="w-full h-96 border rounded overflow-hidden">
                    <MapContainer
                        center={mapCenter}
                        zoom={selectedVehicle ? 13 : 4} // Zoom in on the vehicle if one is selected
                        scrollWheelZoom={true}
                        style={{ height: "100%", width: "100%" }}
                    >
                        <ChangeView center={mapCenter} />
                        <TileLayer
                            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {filteredVehicles.map((v) => (
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
                    </div>
                )}
            </div>
        </div>
    </div>
    );
};

export default MapView;
