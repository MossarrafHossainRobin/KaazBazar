"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, Globe, Moon, DollarSign, Shield, Save } from "lucide-react";
import { updateUserSettings, getUserProfile } from "@/lib/firestoreService";

export default function SettingsPage() {
  const { currentUser, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    language: "bengali",
    currency: "BDT",
    theme: "light",
    notifications: {
      email: true,
      push: true,
      sms: false,
      orderUpdates: true,
      promotions: false
    }
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (currentUser) {
      fetchSettings();
    }
  }, [currentUser]);

  const fetchSettings = async () => {
    const result = await getUserProfile(currentUser.uid);
    if (result.success && result.data.settings) {
      // Merge with default settings to ensure all fields exist
      setSettings({
        language: result.data.settings.language || "bengali",
        currency: result.data.settings.currency || "BDT",
        theme: result.data.settings.theme || "light",
        notifications: {
          email: result.data.settings.notifications?.email ?? true,
          push: result.data.settings.notifications?.push ?? true,
          sms: result.data.settings.notifications?.sms ?? false,
          orderUpdates: result.data.settings.notifications?.orderUpdates ?? true,
          promotions: result.data.settings.notifications?.promotions ?? false
        }
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await updateUserSettings(currentUser.uid, settings);
    if (result.success) {
      alert("Settings saved successfully!");
    } else {
      alert("Failed to save settings");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) return null;

  // Ensure notifications object exists
  const notifications = settings.notifications || {
    email: true,
    push: true,
    sms: false,
    orderUpdates: true,
    promotions: false
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">Account Settings</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your preferences and notifications</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Language Settings */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-800">Language</h2>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={settings.language === "english"}
                    onChange={() => setSettings({...settings, language: "english"})}
                    className="w-4 h-4 text-green-600"
                  />
                  <span>English</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={settings.language === "bengali"}
                    onChange={() => setSettings({...settings, language: "bengali"})}
                    className="w-4 h-4 text-green-600"
                  />
                  <span>বাংলা</span>
                </label>
              </div>
            </div>

            {/* Currency Settings */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-800">Currency</h2>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={settings.currency === "BDT"}
                    onChange={() => setSettings({...settings, currency: "BDT"})}
                    className="w-4 h-4 text-green-600"
                  />
                  <span>BDT (৳)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={settings.currency === "USD"}
                    onChange={() => setSettings({...settings, currency: "USD"})}
                    className="w-4 h-4 text-green-600"
                  />
                  <span>USD ($)</span>
                </label>
              </div>
            </div>

            {/* Theme Settings */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Moon className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-800">Theme</h2>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={settings.theme === "light"}
                    onChange={() => setSettings({...settings, theme: "light"})}
                    className="w-4 h-4 text-green-600"
                  />
                  <span>Light</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={settings.theme === "dark"}
                    onChange={() => setSettings({...settings, theme: "dark"})}
                    className="w-4 h-4 text-green-600"
                  />
                  <span>Dark</span>
                </label>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Bell className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
              </div>
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span>Email Notifications</span>
                  <input
                    type="checkbox"
                    checked={notifications.email}
                    onChange={(e) => setSettings({
                      ...settings, 
                      notifications: {...notifications, email: e.target.checked}
                    })}
                    className="w-4 h-4 text-green-600 rounded"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span>Push Notifications</span>
                  <input
                    type="checkbox"
                    checked={notifications.push}
                    onChange={(e) => setSettings({
                      ...settings, 
                      notifications: {...notifications, push: e.target.checked}
                    })}
                    className="w-4 h-4 text-green-600 rounded"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span>SMS Notifications</span>
                  <input
                    type="checkbox"
                    checked={notifications.sms}
                    onChange={(e) => setSettings({
                      ...settings, 
                      notifications: {...notifications, sms: e.target.checked}
                    })}
                    className="w-4 h-4 text-green-600 rounded"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span>Order Updates</span>
                  <input
                    type="checkbox"
                    checked={notifications.orderUpdates}
                    onChange={(e) => setSettings({
                      ...settings, 
                      notifications: {...notifications, orderUpdates: e.target.checked}
                    })}
                    className="w-4 h-4 text-green-600 rounded"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span>Promotions & Offers</span>
                  <input
                    type="checkbox"
                    checked={notifications.promotions}
                    onChange={(e) => setSettings({
                      ...settings, 
                      notifications: {...notifications, promotions: e.target.checked}
                    })}
                    className="w-4 h-4 text-green-600 rounded"
                  />
                </label>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                {saving ? "Saving..." : <><Save className="w-4 h-4" /> Save Settings</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}