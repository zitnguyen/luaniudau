import React from "react";
import { User } from "lucide-react";
import { getRoleLabel } from "../../../constants/roleLabel";
import { useSystemSettings } from "../../../context/SystemSettingsContext";

const SidebarHeader = ({ user, onClose, className = "" }) => {
  const { settings } = useSystemSettings();

  const centerName = settings?.centerName || "Z CHESS";
  const displayName = user?.fullName || user?.username || getRoleLabel(user?.role) || "User";
  const userInitial = String(displayName).trim().charAt(0).toUpperCase();

  return (
    <div
      className={`h-16 flex items-center px-4 md:px-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50/60 ${className}`}
    >
      {settings?.logoUrl ? (
        <img
          src={settings.logoUrl}
          alt="Center logo"
          className="w-9 h-9 rounded-lg object-cover border border-gray-200 mr-3 transition-transform duration-200 hover:scale-105"
        />
      ) : (
        <div className="w-9 h-9 mr-3 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-base">
          ♟
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="font-bold text-gray-900 leading-tight text-base md:text-sm truncate">
          {centerName}
        </div>
        <div className="text-xs text-gray-500 font-medium truncate">{displayName}</div>
      </div>

      <div className="w-7 h-7 rounded-full bg-primary/10 text-primary hidden md:flex items-center justify-center mr-2">
        {userInitial || <User size={14} />}
      </div>

      <button
        onClick={onClose}
        className="ml-auto md:hidden p-1 text-gray-500 hover:bg-gray-100 rounded transition-colors"
      >
        ✕
      </button>
    </div>
  );
};

export default SidebarHeader;
