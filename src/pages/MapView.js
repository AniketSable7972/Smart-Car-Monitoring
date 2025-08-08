// MapView.js with a hardcoded user role
import React, { useState, useEffect } from "react";
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
            speed: 55,
            fuelLevel: 70,
            engineTemp: 95,
            status: "active"
        },
        {
            id: "CAR002",
            driver: "Priya Sharma",
            lat: 19.0760, // Mumbai
            lng: 72.8777,
            address: "Mumbai, Maharashtra",
            speed: 60,
            fuelLevel: 40,
            engineTemp: 105,
            status: "idle"
        },
        {
            id: "CAR003",
            driver: "Amit Patel",
            lat: 23.0225, // Ahmedabad
            lng: 72.5714,
            address: "Ahmedabad, Gujarat",
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
    useEffect(() => {
        // Automatically select the first vehicle from the filtered list on initial load
        if (vehiclesToShow.length > 0) {
            setSelectedVehicle(vehiclesToShow[0]);
        }
    }, []);

    // UI helper functions for styling
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

    const defaultCenter = [20.5937, 78.9629]; // Central location for India
    const mapCenter = selectedVehicle ? [selectedVehicle.lat, selectedVehicle.lng] : defaultCenter;

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
