// Navigation.js
import React, { useState, useEffect, useRef } from "react";
import {
    Car,
    LayoutDashboard,
    Map,
    History,
    AlertTriangle,
    BarChart3,
    Settings as SettingsIcon,
    LogOut,
    Bell,
} from "lucide-react";
import ProfileCard from "./ProfileCard";

const Navigation = ({ user, currentPage, onPageChange, onLogout }) => {
    const [showProfile, setShowProfile] = useState(false);
    const profileRef = useRef();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfile(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const driverPages = [
        { id: "driver-dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "map-view", label: "Map View", icon: Map },
        { id: "history", label: "History", icon: History },
        { id: "alerts", label: "Alerts", icon: AlertTriangle },
    ];

    const adminPages = [
        { id: "admin-dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "map-view", label: "Map View", icon: Map },
        { id: "analytics", label: "Analytics", icon: BarChart3 },
        { id: "alerts", label: "Alerts", icon: AlertTriangle },
        { id: "settings", label: "Settings", icon: SettingsIcon },
    ];

    const pages = user.role === "DRIVER" ? driverPages : adminPages;

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b shadow-md z-50 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Branding */}
                        <div className="flex items-center gap-2">
                            <Car className="text-blue-600 dark:text-blue-400" size={26} />
                            <span className="font-bold text-xl tracking-tight text-gray-800 dark:text-gray-200">
                                Fleet Manager
                            </span>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-4">
                            {pages.map((page) => {
                                const Icon = page.icon;
                                const isActive = currentPage === page.id;
                                return (
                                    <button
                                        key={page.id}
                                        onClick={() => onPageChange(page.id)}
                                        className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300
                      ${isActive
                                                ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-gray-800 shadow-sm"
                                                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-500"
                                            }`}
                                    >
                                        <Icon size={18} />
                                        {page.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* User Info + Profile */}
                        <div className="hidden md:flex items-center gap-4 relative" ref={profileRef}>
                            <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300 hover:text-blue-500 cursor-pointer transition-colors" />

                            {/* Avatar + Name */}
                            <div
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() => setShowProfile(!showProfile)}
                            >
                                <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center font-bold text-blue-700 dark:text-blue-300 shadow">
                                    {user.username?.charAt(0).toUpperCase()}
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                        {user.username}
                                    </p>
                                    <span
                                        className={`inline-block text-xs px-2 py-0.5 rounded-md font-medium ${user.role === "ADMIN"
                                            ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                                            : "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                                            }`}
                                    >
                                        {user.role}
                                    </span>
                                </div>
                            </div>

                            {/* Profile Popup */}
                            {showProfile && (
                                <div className="absolute top-14 right-0 animate-fadeIn">
                                    <ProfileCard user={user} onLogout={onLogout} />
                                </div>
                            )}

                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t shadow-lg flex justify-around py-2">
                    {pages.map((page) => {
                        const Icon = page.icon;
                        const isActive = currentPage === page.id;
                        return (
                            <button
                                key={page.id}
                                onClick={() => onPageChange(page.id)}
                                className={`flex flex-col items-center text-xs transition-all duration-200 
                  ${isActive
                                        ? "text-blue-600 dark:text-blue-400"
                                        : "text-gray-500 dark:text-gray-300 hover:text-blue-500"
                                    }`}
                            >
                                <Icon size={22} />
                                {page.label}
                            </button>
                        );
                    })}

                    <button
                        onClick={onLogout}
                        className="flex flex-col items-center text-xs text-red-500 hover:text-red-600"
                    >
                        <LogOut size={22} />
                        Logout
                    </button>
                </div>
            </nav>
        </>
    );
};

export default Navigation;
