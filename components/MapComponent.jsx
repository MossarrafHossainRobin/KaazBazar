"use client";

import React, { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
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

// Custom red icon for user location
const userLocationIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom green icon for providers
const providerIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Create a custom blue icon for default location (when user location isn't available)
const defaultIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Generate random nearby coordinates for demo/filler purposes
function generateNearbyLocation(baseLat, baseLng, maxOffset = 0.05) {
  return [
    baseLat + (Math.random() - 0.5) * maxOffset * 2,
    baseLng + (Math.random() - 0.5) * maxOffset * 2,
  ];
}

// Component to auto-fit map bounds to show all markers
function MapBounds({ userLocation, providers }) {
  const map = useMap();

  useEffect(() => {
    if (!userLocation && (!providers || providers.length === 0)) return;

    const bounds = [];
    
    // Add user location to bounds
    if (userLocation && userLocation[0] && userLocation[1]) {
      bounds.push(userLocation);
    }

    // Add all provider locations to bounds
    if (providers && providers.length > 0) {
      providers.forEach(provider => {
        if (provider.latitude && provider.longitude) {
          bounds.push([provider.latitude, provider.longitude]);
        }
      });
    }

    // Fit map to show all markers
    if (bounds.length > 0) {
      map.fitBounds(bounds, { 
        padding: [50, 50],
        maxZoom: 15 
      });
    }
  }, [map, userLocation, providers]);

  return null;
}

export default function MapComponent({ 
  userLocation = null, 
  providers = [] 
}) {
  const [position, setPosition] = useState([23.8103, 90.4125]); // Dhaka default
  const [locationLoaded, setLocationLoaded] = useState(false);
  const [error, setError] = useState("");
  const [hasUserLocation, setHasUserLocation] = useState(false);

  useEffect(() => {
    // If userLocation is provided via props, use it
    if (userLocation && userLocation[0] && userLocation[1]) {
      setPosition(userLocation);
      setHasUserLocation(true);
      setLocationLoaded(true);
      return;
    }

    // Otherwise try to get browser geolocation
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = [pos.coords.latitude, pos.coords.longitude];
          setPosition(loc);
          setHasUserLocation(true);
          setLocationLoaded(true);
        },
        (err) => {
          console.error("Geolocation error:", err);
          setError("Unable to fetch your location. Showing default map.");
          setHasUserLocation(false);
          setLocationLoaded(true);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setError("Geolocation not supported in this browser.");
      setHasUserLocation(false);
      setLocationLoaded(true);
    }
  }, [userLocation]);

  // Enrich providers without coordinates with nearby random locations for demo
  const providersWithLocations = useMemo(() => {
    if (!providers || providers.length === 0) return [];
    
    return providers.map(provider => {
      // If provider already has coordinates, use them
      if (provider.latitude && provider.longitude) {
        return provider;
      }
      
      // Generate a random nearby location based on user position
      const [genLat, genLng] = generateNearbyLocation(position[0], position[1], 0.03);
      return {
        ...provider,
        latitude: genLat,
        longitude: genLng,
        _generatedLocation: true // Flag to show this is approximated
      };
    });
  }, [providers, position]);

  const hasProviderLocations = providersWithLocations.length > 0;

  return (
    <div className="relative h-96 w-full rounded-2xl shadow-xl overflow-hidden">
      {/* Legend */}
      <div className="absolute top-2 right-2 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-md text-xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-gray-700">Your Location</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-700">Providers ({providersWithLocations.length})</span>
        </div>
      </div>

      {error && (
        <div className="absolute top-2 left-2 bg-amber-500 text-white px-4 py-2 rounded-md z-10 text-sm shadow-lg">
          {error}
        </div>
      )}

      {locationLoaded && (
        <>
          <MapContainer center={position} zoom={13} className="h-full w-full">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* Auto-fit bounds to show all markers */}
            <MapBounds 
              userLocation={hasUserLocation ? position : null} 
              providers={providersWithLocations} 
            />

            {/* User Location Marker (Red) */}
            {hasUserLocation && (
              <Marker position={position} icon={userLocationIcon}>
                <Popup>
                  <div className="text-center">
                    <div className="font-semibold text-red-600 mb-1">📍 Your Location</div>
                    <div className="text-xs text-gray-600">
                      {position[0].toFixed(4)}, {position[1].toFixed(4)}
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* User Location Circle */}
            {hasUserLocation && (
              <Circle 
                center={position} 
                radius={500} 
                pathOptions={{ 
                  color: "red", 
                  fillColor: "#ff0000", 
                  fillOpacity: 0.1,
                  weight: 1,
                  dashArray: "5, 5"
                }} 
              />
            )}

            {/* Provider Markers (Green) */}
            {providersWithLocations.map((provider, index) => (
              <Marker 
                key={provider.id || `provider-${index}`}
                position={[provider.latitude, provider.longitude]}
                icon={providerIcon}
              >
                <Popup>
                  <div className="min-w-[180px]">
                    <div className="flex items-center gap-2 mb-2">
                      {provider.userPhoto ? (
                        <img 
                          src={provider.userPhoto} 
                          alt={provider.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-green-500"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center border-2 border-green-500">
                          <span className="text-sm font-bold text-green-600">
                            {provider.name?.charAt(0) || "P"}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">
                          {provider.name || "Provider"}
                        </div>
                        <div className="text-xs text-green-600 font-medium">
                          {provider.category || "Service"}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-gray-600">
                      {provider.city && (
                        <div className="flex items-center gap-1">
                          <span>📍</span>
                          <span>{provider.city}</span>
                        </div>
                      )}
                      {provider.hourlyRate && (
                        <div className="flex items-center gap-1">
                          <span>💰</span>
                          <span className="font-semibold text-green-600">৳{provider.hourlyRate}/hr</span>
                        </div>
                      )}
                      {provider.rating && (
                        <div className="flex items-center gap-1">
                          <span>⭐</span>
                          <span>{provider.rating} ({provider.reviewCount || 0} reviews)</span>
                        </div>
                      )}
                      {provider.distance !== undefined && (
                        <div className="flex items-center gap-1">
                          <span>📏</span>
                          <span className="font-semibold text-blue-600">
                            {provider.distance < 1 
                              ? `${(provider.distance * 1000).toFixed(0)}m away` 
                              : `${provider.distance.toFixed(1)}km away`}
                          </span>
                        </div>
                      )}
                      {provider._generatedLocation && (
                        <div className="text-amber-600 italic text-[10px] mt-1">
                          ⚠️ Approximate location
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Provider Radius Circles */}
            {providersWithLocations.slice(0, 10).map((provider, index) => (
              <Circle 
                key={`circle-${provider.id || index}`}
                center={[provider.latitude, provider.longitude]}
                radius={200}
                pathOptions={{ 
                  color: "green", 
                  fillColor: "#22c55e", 
                  fillOpacity: 0.05,
                  weight: 1
                }}
              />
            ))}
          </MapContainer>

          {/* Floating Location Card */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md text-black rounded-xl p-3 px-4 flex items-center space-x-3 shadow-lg animate-fade-in">
            <div className={`w-4 h-4 rounded-full animate-pulse ${
              hasUserLocation ? 'bg-green-400' : 'bg-blue-400'
            }`}></div>
            <div>
              <div className="text-sm font-semibold">
                {hasUserLocation ? "Your Location" : "Default Location (Dhaka)"}
              </div>
              <div className="text-xs">
                {position[0].toFixed(4)}, {position[1].toFixed(4)}
                {!hasUserLocation && " • Enable location for better results"}
              </div>
            </div>
          </div>

          {/* Provider Count Badge */}
          {hasProviderLocations && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-green-600 text-white rounded-full px-4 py-1.5 text-sm font-medium shadow-lg flex items-center gap-2">
              <span>📍</span>
              <span>{providersWithLocations.length} provider{providersWithLocations.length !== 1 ? 's' : ''} on map</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}