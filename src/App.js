// App.js
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import AlertsPage from "./pages/AlertsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import MapView from "./pages/MapView";
import HistoryPage from "./pages/HistoryPage";
import SettingsPage from "./pages/SettingsPage";
import Navigation from "./components/Navigation";

function AppWrapper() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const handleLogin = (userData) => {
        setUser(userData);
        if (userData.role === "ADMIN") {
            navigate("/dashboard"); // AdminDashboard
        } else if (userData.role === "DRIVER") {
            navigate("/dashboard"); // DriverDashboard
        }
    };

    const handleLogout = () => {
        setUser(null);
        navigate("/");
    };

    const handlePageChange = (pageId) => {
        switch (pageId) {
            case "admin-dashboard":
            case "driver-dashboard":
                navigate("/dashboard");
                break;
            case "fleet-map":
            case "map-view":
                navigate("/map");
                break;
            case "analytics":
                navigate("/analytics");
                break;
            case "alerts":
                navigate("/alerts");
                break;
            case "history":
                navigate("/history");
                break;
            case "settings":
                navigate("/settings");
                break;
            default:
                navigate("/dashboard");
        }
    };

    return (
        <>
            {!user ? (
                <Routes>
                    <Route path="/" element={<LoginPage onLogin={handleLogin} />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            ) : (
                <div className="main-layout">
                    <Navigation
                        user={user}
                        onLogout={handleLogout}
                        onPageChange={handlePageChange}
                        currentPage=""
                    />
                    <div className="page-content">
                        <Routes>
                            {user.role === "ADMIN" ? (
                                <>
                                    <Route path="/dashboard" element={<AdminDashboard />} />
                                    <Route path="/map" element={<MapView user={user} />} />
                                    <Route path="/analytics" element={<AnalyticsPage />} />
                                    <Route path="/alerts" element={<AlertsPage user={user} />} />
                                    <Route path="/history" element={<HistoryPage user={user} />} />
                                    <Route path="/settings" element={<SettingsPage />} />
                                    <Route path="*" element={<Navigate to="/dashboard" />} />
                                </>
                            ) : (
                                <>
                                    <Route path="/dashboard" element={<DriverDashboard user={user} />} />
                                    <Route path="/map" element={<MapView user={user} />} />
                                    <Route path="/alerts" element={<AlertsPage user={user} />} />
                                    <Route path="/history" element={<HistoryPage user={user} />} />
                                    <Route path="*" element={<Navigate to="/dashboard" />} />
                                </>
                            )}
                        </Routes>
                    </div>
                </div>
            )}
        </>
    );
}

export default function App() {
    return (
        <Router>
            <AppWrapper />
        </Router>
    );
}
