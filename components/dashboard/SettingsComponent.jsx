"use client";
import { useState, useEffect } from "react";
import { Bell, Globe, Moon, DollarSign, Shield, Save, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { updateUserSettings, getUserProfile } from "@/lib/firestoreService";

export default function SettingsComponent() {
  const { currentUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [settings, setSettings] = useState({
    language: "bengali",
    currency: "BDT",
    theme: "light",
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    promotions: false
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (currentUser) {
      fetchSettings();
    }
  }, [currentUser]);

  const fetchSettings = async () => {
    const result = await getUserProfile(currentUser.uid);
    if (result.success && result.data.settings) {
      setSettings({
        language: result.data.settings.language || "bengali",
        currency: result.data.settings.currency || "BDT",
        theme: result.data.settings.theme || "light",
        emailNotifications: result.data.settings.emailNotifications ?? true,
        pushNotifications: result.data.settings.pushNotifications ?? true,
        smsNotifications: result.data.settings.smsNotifications ?? false,
        orderUpdates: result.data.settings.orderUpdates ?? true,
        promotions: result.data.settings.promotions ?? false
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

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
    alert("Password changed successfully! (Demo)");
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  return (
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
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                className="w-4 h-4 text-green-600 rounded"
              />
            </label>
            <label className="flex items-center justify-between">
              <span>Push Notifications</span>
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={(e) => setSettings({...settings, pushNotifications: e.target.checked})}
                className="w-4 h-4 text-green-600 rounded"
              />
            </label>
            <label className="flex items-center justify-between">
              <span>SMS Notifications</span>
              <input
                type="checkbox"
                checked={settings.smsNotifications}
                onChange={(e) => setSettings({...settings, smsNotifications: e.target.checked})}
                className="w-4 h-4 text-green-600 rounded"
              />
            </label>
            <label className="flex items-center justify-between">
              <span>Order Updates</span>
              <input
                type="checkbox"
                checked={settings.orderUpdates}
                onChange={(e) => setSettings({...settings, orderUpdates: e.target.checked})}
                className="w-4 h-4 text-green-600 rounded"
              />
            </label>
            <label className="flex items-center justify-between">
              <span>Promotions & Offers</span>
              <input
                type="checkbox"
                checked={settings.promotions}
                onChange={(e) => setSettings({...settings, promotions: e.target.checked})}
                className="w-4 h-4 text-green-600 rounded"
              />
            </label>
          </div>
        </div>

        {/* Password Change */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">Change Password</h2>
          </div>
          <div className="space-y-3">
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Current Password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-2.5"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="New Password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-2.5"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
            <input
              type="password"
              placeholder="Confirm New Password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
            <button
              onClick={handlePasswordChange}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
            >
              Update Password
            </button>
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
  );
}