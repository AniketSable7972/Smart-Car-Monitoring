// MapView.js
import React, { useState, useEffect } from "react";
import { MapPin, RefreshCcw } from "lucide-react";
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

  // Fetch driver car with correct car name
  const fetchDriverCar = async () => {
    try {
      const dRes = await api.get(`/drivers/user/${user.id}`);
      const driver = dRes?.data?.data;
      if (!driver?.assignedCarId) {
        setCars([]);
        return;
      }

      // Get car info
      const carRes = await api.get(`/cars/${driver.assignedCarId}`);
      const carInfo = carRes?.data?.data;

      // Get latest telemetry
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

      if (car.location && CITY_COORDS[car.location]) setCenter(CITY_COORDS[car.location]);
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

      // Center on first car with valid coords
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

  if (user.role === "DRIVER" && cars.length === 0) {
    return (
      <div className="pt-16">
        <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow text-center max-w-md">
            <h2 className="text-xl font-semibold mb-2">No vehicle assigned</h2>
            <p className="text-gray-600">
              You will see the map once a vehicle is assigned to you.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleCardClick = (car) => {
    if (car.location && CITY_COORDS[car.location]) setCenter(CITY_COORDS[car.location]);
  };

  return (
    <div className="pt-16">
      <div className="p-6 bg-gray-100 min-h-screen space-y-4">
        {/* Car Cards */}
        <div className="flex gap-4 overflow-x-auto">
          {cars.map((car, idx) => (
            <div
              key={idx}
              onClick={() => handleCardClick(car)}
              className="cursor-pointer bg-white p-4 rounded shadow min-w-[200px] hover:shadow-lg transition"
            >
              <h4 className="font-bold text-lg">{car.id}</h4>
              <p>Driver: {car.driver}</p>
              <p>Location: {car.location}</p>
              <p>Speed: {car.speed} km/h</p>
              <p>Fuel: {car.fuel}%</p>
              <p>Temp: {car.temp}°C</p>
            </div>
          ))}
        </div>

        {/* Map */}
        <div className="w-full h-96 border rounded overflow-hidden">
          <MapContainer
            center={center}
            zoom={cars.length ? 13 : 4}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
          >
            <ChangeView center={center} />
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {cars.map((car, idx) => {
              const coords = CITY_COORDS[car.location];
              if (!coords) return null;
              return (
                <Marker key={idx} position={coords}>
                  <Popup>
                    <div>
                      <h4 className="font-bold">Car {car.id}</h4>
                      <p>Driver: {car.driver}</p>
                      <p>Location: {car.location}</p>
                      <p>Speed: {car.speed} km/h</p>
                      <p>Fuel: {car.fuel}%</p>
                      <p>Temp: {car.temp}°C</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default MapView;
