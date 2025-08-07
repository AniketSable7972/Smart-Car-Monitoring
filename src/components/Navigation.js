import React from "react";
import {
    Car,
    LayoutDashboard,
    Map,
    History,
    AlertTriangle,
    BarChart3,
    Settings as SettingsIcon,
    LogOut,
} from "lucide-react";

const Navigation = ({ user, currentPage, onPageChange, onLogout }) => {
    const driverPages = [
        { id: "driver-dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "map-view", label: "Map View", icon: Map },
        { id: "history", label: "History", icon: History },
        { id: "alerts", label: "Alerts", icon: AlertTriangle },
    ];

    const adminPages = [
        { id: "admin-dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "fleet-map", label: "Fleet Map", icon: Map },
        { id: "analytics", label: "Analytics", icon: BarChart3 },
        { id: "alerts", label: "Alerts", icon: AlertTriangle },
        { id: "settings", label: "Settings", icon: SettingsIcon },
    ];

    const pages = user.role === "DRIVER" ? driverPages : adminPages;

    return (
        <nav className="fixed top-0 left-0 right-0 bg-white border-b shadow-sm z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Branding */}
                    <div className="flex items-center gap-2">
                        <Car className="text-blue-600" size={24} />
                        <span className="font-bold text-lg">Fleet Manager</span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-4">
                        {pages.map((page) => {
                            const Icon = page.icon;
                            return (
                                <button
                                    key={page.id}
                                    onClick={() => onPageChange(page.id)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${currentPage === page.id
                                        ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                                        : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
                                        }`}
                                >
                                    <Icon size={18} />
                                    {page.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* User Info & Logout */}
                    <div className="hidden md:flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm font-medium">Welcome, {user.username}</p>
                            <span
                                className={`inline-block text-xs px-2 py-1 rounded ${user.role === "ADMIN"
                                    ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                                    : "bg-[var(--secondary)] text-[var(--secondary-foreground)]"
                                    }`}
                            >
                                {user.role}
                            </span>

                        </div>
                        <button
                            onClick={onLogout}
                            className="flex items-center gap-1 text-red-500 hover:text-red-700"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden bg-white border-t px-2 py-2 overflow-x-auto flex gap-2">
                {pages.map((page) => {
                    const Icon = page.icon;
                    return (
                        <button
                            key={page.id}
                            onClick={() => onPageChange(page.id)}
                            className={`flex flex-col items-center px-3 py-2 text-xs ${currentPage === page.id
                                ? "text-blue-600 font-semibold"
                                : "text-gray-500"
                                }`}
                        >
                            <Icon size={20} />
                            {page.label}
                        </button>
                    );
                })}

                {/* Logout Icon Only */}
                <button
                    onClick={onLogout}
                    className="flex flex-col items-center px-3 py-2 text-xs text-red-500"
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navigation;
