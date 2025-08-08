import React, { useState } from "react";
import { Calendar, Download, MapPin, Fuel, Gauge } from "lucide-react";

const HistoryPage = ({ user }) => {
    const [timeFilter, setTimeFilter] = useState("30days");
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const trips = [
        {
            id: "TRP001",
            date: "2025-08-01 09:30",
            startLocation: "New York, NY",
            endLocation: "Philadelphia, PA",
            distance: 95,
            duration: "1h 45m",
            avgSpeed: 54,
            fuelUsed: 4.5,
            status: "completed"
        },
        {
            id: "TRP002",
            date: "2025-08-02 14:15",
            startLocation: "Boston, MA",
            endLocation: "New York, NY",
            distance: 215,
            duration: "4h 10m",
            avgSpeed: 52,
            fuelUsed: 10.2,
            status: "ongoing"
        },
        {
            id: "TRP003",
            date: "2025-07-30 08:20",
            startLocation: "Chicago, IL",
            endLocation: "Detroit, MI",
            distance: 283,
            duration: "5h 25m",
            avgSpeed: 50,
            fuelUsed: 13.1,
            status: "cancelled"
        }
    ];

    const GALLON_TO_LITER = 3.78541;
    const MILE_TO_KM = 1.60934;

    const totalDistanceMiles = trips.reduce((acc, t) => acc + t.distance, 0);
    const totalDistanceKm = (totalDistanceMiles * MILE_TO_KM).toFixed(1);
    const totalFuelGallons = trips.reduce((acc, t) => acc + t.fuelUsed, 0);
    const totalFuelLiters = (totalFuelGallons * GALLON_TO_LITER).toFixed(1);
    const avgSpeed = (trips.reduce((acc, t) => acc + t.avgSpeed, 0) / trips.length).toFixed(1);
    const efficiency = (totalDistanceKm / totalFuelLiters).toFixed(1);

    const getStatusBadge = (status) => {
        switch (status) {
            case "completed":
                return <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs">Completed</span>;
            case "ongoing":
                return <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">Ongoing</span>;
            case "cancelled":
                return <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs">Cancelled</span>;
            default:
                return <span className="border border-gray-400 text-gray-500 px-2 py-1 rounded text-xs">Unknown</span>;
        }
    };

    const filteredTrips = trips.filter((trip) => {
        const matchesSearch =
            trip.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            trip.startLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
            trip.endLocation.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
            statusFilter === "all" || trip.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="pt-16">
        <div className="p-6 bg-gray-100 min-h-screen">
            {/* Header */}
            <div className="mb-6 flex flex-wrap justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">
                        {user.role === "DRIVER" ? "Trip History" : "Fleet History"}
                    </h1>
                    <p className="text-gray-600">
                        {user.role === "DRIVER"
                            ? "View your driving history and performance metrics"
                            : "Analyze historical trip data across the fleet"}
                    </p>
                </div>
                <div className="flex gap-4 mt-4 md:mt-0">
                    <select
                        className="border px-3 py-2 rounded"
                        value={timeFilter}
                        onChange={(e) => setTimeFilter(e.target.value)}
                    >
                        <option value="7days">Last 7 days</option>
                        <option value="30days">Last 30 days</option>
                        <option value="90days">Last 90 days</option>
                        <option value="year">Last Year</option>
                    </select>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-600">
                        <Download size={16} /> Export
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded shadow flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-gray-600">Total Distance</h2>
                        <MapPin size={24} className="text-blue-500" />
                    </div>
                    <p className="text-2xl font-bold">{totalDistanceKm} km</p>
                    <p className="text-green-600 text-sm">+8% from last period</p>
                </div>

                <div className="bg-white p-4 rounded shadow flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-gray-600">Fuel Consumed</h2>
                        <Fuel size={20} className="text-green-500" />
                    </div>
                    <p className="text-2xl font-bold">{totalFuelLiters} L</p>
                    <p className="text-sm text-gray-500">{efficiency} km/L efficiency</p>
                </div>

                <div className="bg-white p-4 rounded shadow flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-gray-600">Average Speed</h2>
                        <Gauge size={24} className="text-orange-500" />
                    </div>
                    <p className="text-2xl font-bold">{avgSpeed} mph</p>
                    <p className="text-sm text-gray-500">Includes traffic stops</p>
                </div>
            </div>
            {/* Trip History Table */}
            <div className="bg-white p-4 rounded shadow">
                <div className="flex items-center mb-4">
                    <Calendar className="text-blue-500 mr-2" size={20} />
                    <h3 className="text-lg font-semibold">Trip History</h3>
                </div>
                <p className="text-gray-500 mb-4">
                    {user.role === "DRIVER"
                        ? `Detailed history of all trips for vehicle ${user.assignedCarId}`
                        : "Detailed history of all trips"}
                </p>

                {/* Search and Filter Controls */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Search by location or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border px-3 py-2 rounded w-full md:w-1/2"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border px-3 py-2 rounded w-full md:w-1/4"
                    >
                        <option value="all">All Statuses</option>
                        <option value="completed">Completed</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-200 text-left text-sm">
                                <th className="p-2 border">Trip ID</th>
                                <th className="p-2 border">Date & Time</th>
                                <th className="p-2 border">Route</th>
                                <th className="p-2 border">Distance (mi)</th>
                                <th className="p-2 border">Duration</th>
                                <th className="p-2 border">Avg Speed</th>
                                <th className="p-2 border">Fuel Used (L)</th>
                                <th className="p-2 border">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTrips.length > 0 ? (
                                filteredTrips.map((trip) => (
                                    <tr key={trip.id} className="hover:bg-gray-100 text-sm">
                                        <td className="p-2 border">{trip.id}</td>
                                        <td className="p-2 border">{trip.date}</td>
                                        <td className="p-2 border">
                                            {trip.startLocation} → {trip.endLocation}
                                        </td>
                                        <td className="p-2 border">{trip.distance}</td>
                                        <td className="p-2 border">{trip.duration}</td>
                                        <td className="p-2 border">{trip.avgSpeed}</td>
                                        <td className="p-2 border">{(trip.fuelUsed * GALLON_TO_LITER).toFixed(1)} L</td>
                                        <td className="p-2 border">{getStatusBadge(trip.status)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center p-4 text-gray-500">
                                        No trips match your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    );
};

export default HistoryPage;

