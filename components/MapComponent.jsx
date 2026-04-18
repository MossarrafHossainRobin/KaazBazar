"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default Leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function MapComponent() {
  const [position, setPosition] = useState([23.8103, 90.4125]); // Dhaka default
  const [locationLoaded, setLocationLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
          setLocationLoaded(true);
        },
        (err) => {
          console.error("Geolocation error:", err);
          setError("Unable to fetch your location. Showing default map.");
          setLocationLoaded(true);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setError("Geolocation not supported in this browser.");
      setLocationLoaded(true);
    }
  }, []);

  return (
    <div className="relative h-96 w-full rounded-2xl shadow-xl overflow-hidden">
      {error && (
        <div className="absolute top-2 left-2 bg-red-500 text-white px-4 py-2 rounded-md z-10">
          {error}
        </div>
      )}

      {locationLoaded && (
        <>
          <MapContainer center={position} zoom={13} className="h-full w-full">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <Marker position={position}>
              <Popup>You are here</Popup>
            </Marker>
            <Circle center={position} radius={200} pathOptions={{ color: "cyan" }} />
          </MapContainer>

          {/* Floating Location Card */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md text-black rounded-xl p-3 px-6 flex items-center space-x-3 shadow-lg animate-fade-in">
            <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
            <div>
              <div className="text-sm font-semibold">Your Location</div>
              <div className="text-xs">{position[0].toFixed(4)}, {position[1].toFixed(4)}</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
