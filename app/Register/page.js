"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    location: "",
  });

  const [detecting, setDetecting] = useState(false);

  // Auto-detect location
  useEffect(() => {
    const knownCities = ["Dhaka", "Chittagong", "Sylhet", "Rajshahi"];

    const detectLocation = async () => {
      if (!navigator.geolocation) return;
      setDetecting(true);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          try {
            const res = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
            );
            const data = await res.json();
            const city = data.city || data.locality || data.principalSubdivision;

            const matchedCity = knownCities.find(
              (c) => c.toLowerCase() === city?.toLowerCase()
            );

            if (matchedCity) {
              setFormData((prev) => ({
                ...prev,
                location: matchedCity.toLowerCase(),
              }));
            }
          } catch (err) {
            console.error("Location fetch error:", err);
          } finally {
            setDetecting(false);
          }
        },
        () => setDetecting(false)
      );
    };

    detectLocation();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleRegister = (e) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Sign Up</h2>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {["name", "email", "phone", "password"].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                {field}
              </label>
              <input
                type={field === "password" ? "password" : "text"}
                id={field}
                value={formData[field]}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          ))}

          {/* Location Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <select
              id="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select your city</option>
              <option value="dhaka">Dhaka</option>
              <option value="chittagong">Chittagong</option>
              <option value="sylhet">Sylhet</option>
              <option value="rajshahi">Rajshahi</option>
            </select>

            {detecting && (
              <p className="text-sm text-gray-500 mt-1">
                Detecting your location...
              </p>
            )}

            {!detecting && formData.location && (
              <p className="text-sm text-green-600 mt-1">
                📍 Auto-detected:{" "}
                {formData.location.charAt(0).toUpperCase() +
                  formData.location.slice(1)}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition duration-300"
          >
            Create Account
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
