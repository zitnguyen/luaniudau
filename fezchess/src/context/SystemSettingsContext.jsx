import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import settingsService from "../services/settingsService";

const defaultSettings = {
  logoUrl: "",
  centerName: "Z Chess",
  address: "",
  hotline: "",
  email: "",
  workingHours: "",
  bankName: "Techcombank",
  bankAccountNumber: "",
  bankAccountName: "",
  paymentQrUrl: "",
  paymentTransferPrefix: "KHOAHOC",
};

const SystemSettingsContext = createContext({
  settings: defaultSettings,
  loading: true,
  refreshSettings: async () => {},
  setSettingsOptimistic: () => {},
});

export const SystemSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  const refreshSettings = useCallback(async () => {
    try {
      const data = await settingsService.get();
      if (data) {
        setSettings((prev) => ({ ...prev, ...data }));
      }
    } catch (_error) {
      // Silent fallback to defaults for public surfaces.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  const setSettingsOptimistic = useCallback((next) => {
    setSettings((prev) => ({ ...prev, ...next }));
  }, []);

  const value = useMemo(
    () => ({ settings, loading, refreshSettings, setSettingsOptimistic }),
    [settings, loading, refreshSettings, setSettingsOptimistic],
  );

  return <SystemSettingsContext.Provider value={value}>{children}</SystemSettingsContext.Provider>;
};

export const useSystemSettings = () => useContext(SystemSettingsContext);
