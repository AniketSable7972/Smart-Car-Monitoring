// MapView.js
import React, { useState, useEffect, useRef } from "react";
import { Search, Car, Fuel, Thermometer, Gauge } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import api from "../api/client";

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Smooth map fly to updated center
const ChangeView = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, map.getZoom());
  }, [center, map]);
  return null;
};

// Minimal city-to-coordinates mapping
const CITY_COORDS = {
  "New York, NY": [40.7128, -74.006],
  "Los Angeles, CA": [34.0522, -118.2437],
  "Chicago, IL": [41.8781, -87.6298],
  "Houston, TX": [29.7604, -95.3698],
  "Phoenix, AZ": [33.4484, -112.074],
  "Philadelphia, PA": [39.9526, -75.1652],
  "San Antonio, TX": [29.4241, -98.4936],
  "San Diego, CA": [32.7157, -117.1611],
  "Dallas, TX": [32.7767, -96.797],
  "San Jose, CA": [37.3382, -121.8863],
};

const MapView = ({ user }) => {
  const [cars, setCars] = useState([]);
  const [center, setCenter] = useState([40, -100]); // default center
  const [selectedCar, setSelectedCar] = useState(null);
  const [search, setSearch] = useState("");
  const markerRefs = useRef({}); // store refs for each marker

  // Fetch driver car
  const fetchDriverCar = async () => {
    try {
      const dRes = await api.get(`/drivers/user/${user.id}`);
      const driver = dRes?.data?.data;
      if (!driver?.assignedCarId) {
        setCars([]);
        return;
      }
      const carRes = await api.get(`/cars/${driver.assignedCarId}`);
      const carInfo = carRes?.data?.data;
      const tRes = await api.get(
        `/telemetry/car/${driver.assignedCarId}/latest`
      );
      const latest = tRes?.data?.data[0] || null;

      const car = {
        id: carInfo?.displayId || carInfo?.id,
        location: latest?.location || "-",
        speed: latest?.speed ?? 0,
        fuel: latest?.fuelLevel ?? 0,
        temp: latest?.temperature ?? 0,
        driver: driver.name || driver.username,
        timestamp: latest?.timestamp || null,
      };

      setCars([car]);
      if (car.location && CITY_COORDS[car.location])
        setCenter(CITY_COORDS[car.location]);
    } catch (e) {
      console.error("Error fetching driver car:", e);
    }
  };

  // Fetch all cars for admin
  const fetchAdminCars = async () => {
    try {
      const [carsRes, telemetryRes, driversRes] = await Promise.all([
        api.get("/cars"),
        api.get("/telemetry/latest/all"),
        api.get("/drivers/assigned"),
      ]);

      const carsList = carsRes?.data?.data || [];
      const telemetryList = telemetryRes?.data?.data || [];
      const drivers = (driversRes?.data?.data || []).reduce((acc, d) => {
        if (d.assignedCarId) acc[d.assignedCarId] = d.name || d.username;
        return acc;
      }, {});

      const combined = carsList.map((car) => {
        const t = telemetryList.find((te) => te.carId === car.id);
        return {
          id: car.displayId || car.id,
          location: t?.location || "-",
          speed: t?.speed ?? 0,
          fuel: t?.fuelLevel ?? 0,
          temp: t?.temperature ?? 0,
          driver: drivers[car.id] || "-",
          timestamp: t?.timestamp || null,
        };
      });

      setCars(combined);
      const firstLoc = combined.find((c) => CITY_COORDS[c.location]);
      if (firstLoc) setCenter(CITY_COORDS[firstLoc.location]);
    } catch (e) {
      console.error("Error fetching admin cars:", e);
    }
  };

  const fetchData = async () => {
    if (user.role === "DRIVER") await fetchDriverCar();
    else if (user.role === "ADMIN") await fetchAdminCars();
  };

  useEffect(() => {
    fetchData();
  }, [user.id, user.role]);

  useEffect(() => {
    const id = setInterval(fetchData, 10000);
    return () => clearInterval(id);
  }, [user.id, user.role]);

  // Safe search
  const filteredCars = cars.filter((car) => {
    const idStr = String(car.id || "").toLowerCase();
    const driverStr = String(car.driver || "").toLowerCase();
    return (
      idStr.includes(search.toLowerCase()) ||
      driverStr.includes(search.toLowerCase())
    );
  });

  // Handle card click → move map + open popup
  const handleCardClick = (car) => {
    setSelectedCar(car);
    if (car.location && CITY_COORDS[car.location]) {
      setCenter(CITY_COORDS[car.location]);
      const marker = markerRefs.current[car.id];
      if (marker) marker.openPopup();
    }
  };

  return (
    <div className="pt-16">
      <div className="p-6 bg-gray-100 min-h-screen grid grid-cols-3 gap-4">
        {/* Map */}
        <div className="col-span-2 w-full h-[85vh] border rounded overflow-hidden">
          <MapContainer
            center={center}
            zoom={cars.length ? 13 : 4}
            scrollWheelZoom
            style={{ height: "100%", width: "100%" }}
          >
            <ChangeView center={center} />
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredCars.map((car) => {
              const coords = CITY_COORDS[car.location];
              if (!coords) return null;
              return (
                <Marker
                  key={car.id}
                  position={coords}
                  ref={(ref) => (markerRefs.current[car.id] = ref)}
                >
                  <Popup>
                    <div className="p-2">
                      <h4 className="font-semibold text-blue-600 mb-1">
                        🚗 Car {car.id}
                      </h4>
                      <p className="text-sm">👤 {car.driver}</p>
                      <p className="text-xs text-gray-500">{car.location}</p>
                      <div className="mt-2 flex justify-between text-xs">
                        <span className="flex items-center gap-1">
                          <Gauge size={12} /> {car.speed} km/h
                        </span>
                        <span className="flex items-center gap-1">
                          <Fuel size={12} className="text-green-600" />{" "}
                          {car.fuel}%
                        </span>
                        <span className="flex items-center gap-1">
                          <Thermometer size={12} className="text-red-500" />{" "}
                          {car.temp}°C
                        </span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Sidebar */}
        <div className="col-span-1 bg-white rounded shadow p-4 flex flex-col">
          {/* Search bar */}
          <div className="flex items-center border border-gray-300 rounded-full px-3 py-2 mb-4 shadow-sm focus-within:ring-2 focus-within:ring-blue-400">
            <Search size={18} className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search by driver or car ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full outline-none text-sm bg-transparent"
            />
          </div>

          {/* Car List */}
          <div className="space-y-3 overflow-y-auto flex-1 pr-2 custom-scrollbar">
            {filteredCars.length === 0 ? (
              <p className="text-gray-500">No cars found</p>
            ) : (
              filteredCars.map((car) => (
                <div
                  key={car.id}
                  onClick={() => handleCardClick(car)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md hover:border-blue-400 ${selectedCar?.id === car.id
                      ? "bg-blue-50 border-blue-400"
                      : "bg-white border-gray-200"
                    }`}
                >
                  <h4 className="font-semibold text-lg flex items-center gap-2">
                    <Car size={18} className="text-blue-600" /> {car.id}
                  </h4>
                  <p className="text-sm text-gray-600">👤 {car.driver}</p>
                  <p className="text-xs text-gray-400">{car.location}</p>

                  {/* Stats Row */}
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="flex items-center gap-1">
                      <Gauge size={14} className="text-gray-500" /> {car.speed}{" "}
                      km/h
                    </span>
                    <span className="flex items-center gap-1">
                      <Fuel size={14} className="text-green-600" /> {car.fuel}%
                    </span>
                    <span className="flex items-center gap-1">
                      <Thermometer size={14} className="text-red-500" />{" "}
                      {car.temp}°C
                    </span>
                  </div>

                  {/* Conditional badges */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {car.fuel < 20 && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                        Low Fuel
                      </span>
                    )}
                    {car.temp > 90 && (
                      <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                        Overheating
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
