import React, { useState, useEffect } from "react";
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
    const [vehicles, setVehicles] = useState([
        {
            id: "CAR001",
            driver: "John Doe",
            lat: 40.7128,
            lng: -74.006,
            address: "New York, NY",
            speed: 55,
            fuelLevel: 70,
            engineTemp: 95,
            status: "active"
        },
        {
            id: "CAR002",
            driver: "Jane Smith",
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
            driver: "Mike Ross",
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

    // Filter vehicles based on user role
    const filteredVehicles =
        user.role === "DRIVER"
            ? vehicles.filter((v) => v.id === user.assignedCarId)
            : vehicles;

    useEffect(() => {
        if (user.role === "DRIVER" && filteredVehicles.length > 0) {
            setSelectedVehicle(filteredVehicles[0]);
        }
    }, [user, filteredVehicles]);

    const handleSelectVehicle = (vehicle) => {
        setSelectedVehicle(vehicle);
    };

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

    const getFuelColor = (fuel) => {
        if (fuel > 50) return "text-green-600";
        if (fuel >= 25) return "text-yellow-600";
        return "text-red-600";
    };

    const getTempColor = (temp) => {
        if (temp <= 95) return "text-green-600";
        if (temp <= 100) return "text-yellow-600";
        return "text-red-600";
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

                {/* Simulated Map */}
                <div
                    className="relative w-full h-96 border rounded overflow-hidden bg-gray-50"
                    style={{
                        backgroundImage:
                            "linear-gradient(0deg, transparent 24%, rgba(0,0,0,0.05) 25%), linear-gradient(90deg, transparent 24%, rgba(0,0,0,0.05) 25%)",
                        backgroundSize: "40px 40px"
                    }}
                >
                    {filteredVehicles.map((vehicle, index) => (
                        <div
                            key={vehicle.id}
                            className={`absolute cursor-pointer ${getStatusColor(
                                vehicle.status
                            )} w-4 h-4 rounded-full`}
                            style={{
                                top: `${30 + index * 20}%`,
                                left: `${40 + index * 10}%`
                            }}
                            title={vehicle.id}
                            onClick={() => handleSelectVehicle(vehicle)}
                        ></div>
                    ))}

                    {/* Crosshair */}
                    <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                        <Crosshair className="text-gray-400" size={32} />
                    </div>
                </div>

                {/* Map Controls */}
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
                {/* Fleet Vehicle List (Admin Only) */}
                {user.role === "ADMIN" && (
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <Car size={18} /> Fleet Vehicles
                        </h3>
                        <ul className="space-y-2">
                            {filteredVehicles.map((vehicle) => (
                                <li
                                    key={vehicle.id}
                                    onClick={() => handleSelectVehicle(vehicle)}
                                    className={`p-3 rounded border cursor-pointer flex justify-between items-center ${selectedVehicle?.id === vehicle.id
                                        ? "bg-blue-50 border-blue-500"
                                        : "hover:bg-gray-50"
                                        }`}
                                >
                                    <div>
                                        <p className="font-medium">{vehicle.id}</p>
                                        <p className="text-sm text-gray-500 truncate">
                                            {vehicle.driver} - {vehicle.address}
                                        </p>
                                    </div>
                                    <span
                                        className={`text-xs px-2 py-1 rounded ${getStatusColor(
                                            vehicle.status
                                        )} text-white`}
                                    >
                                        {vehicle.status}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Selected Vehicle Details */}
                {selectedVehicle && (
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <Car size={18} /> {selectedVehicle.id} Details
                        </h3>
                        <p className="text-gray-600 mb-2">{selectedVehicle.driver}</p>
                        <p className="text-sm text-gray-500 mb-4">
                            {selectedVehicle.address}
                        </p>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Gauge size={18} className="text-blue-500" />
                                <span className="font-medium">
                                    Speed: {selectedVehicle.speed} mph
                                </span>
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
                            onClick={() => handleSelectVehicle(selectedVehicle)}
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
