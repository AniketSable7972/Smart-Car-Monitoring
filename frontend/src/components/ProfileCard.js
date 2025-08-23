// ProfileCard.js
import React from "react";
import { LogOut } from "lucide-react";

const ProfileCard = ({ user, onLogout }) => {
  return (
    <div className="w-72 bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
      {/* Avatar */}
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center font-bold text-xl text-blue-700 dark:text-blue-300 shadow-md">
          {user.username?.charAt(0).toUpperCase()}
        </div>
        <h3 className="mt-3 text-lg font-semibold text-gray-800 dark:text-gray-200">
          {user.username}
        </h3>
        <span
          className={`mt-1 inline-block text-xs px-3 py-1 rounded-md font-medium ${user.role === "ADMIN"
              ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
              : "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
            }`}
        >
          {user.role}
        </span>
      </div>

      {/* Details */}
      <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
        <p>
          <span className="font-medium">Email:</span> {user.email}
        </p>
        <p>
          <span className="font-medium">Age:</span> {user.age}
        </p>
        <p>
          <span className="font-medium">Contact:</span> {user.contact}
        </p>
      </div>

      {/* Logout Button */}
      <button
        onClick={onLogout}
        className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
      >
        <LogOut size={18} />
        Logout
      </button>
    </div>
  );
};

export default ProfileCard;
