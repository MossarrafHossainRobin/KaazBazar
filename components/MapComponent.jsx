"use client";

import React, { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// ========== FIX: Create custom SVG-based markers (no external assets needed) ==========

// User location marker (Red)
const userLocationIcon = L.divIcon({
  className: 'custom-user-marker',
  html: `
    <div style="position: relative; display: flex; align-items: center; justify-content: center;">
      <svg width="32" height="44" viewBox="0 0 32 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Pin shadow -->
        <ellipse cx="15" cy="41" rx="8" ry="2.5" fill="rgba(0,0,0,0.15)"/>
        <!-- Pin body -->
        <path d="M15.5 0C7.49 0 1 6.49 1 14.5C1 25.5 15.5 42 15.5 42C15.5 42 30 25.5 30 14.5C30 6.49 23.51 0 15.5 0Z" fill="#EF4444" stroke="#DC2626" stroke-width="1"/>
        <!-- Inner circle -->
        <circle cx="15.5" cy="14.5" r="6.5" fill="white"/>
        <!-- Pulse dot -->
        <circle cx="15.5" cy="14.5" r="3" fill="#EF4444"/>
      </svg>
    </div>
  `,
  iconSize: [32, 44],
  iconAnchor: [16, 44],
  popupAnchor: [0, -44],
  tooltipAnchor: [16, -22],
});

// Provider marker (Green)
const providerIcon = L.divIcon({
  className: 'custom-provider-marker',
  html: `
    <div style="position: relative; display: flex; align-items: center; justify-content: center;">
      <svg width="32" height="44" viewBox="0 0 32 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Pin shadow -->
        <ellipse cx="15" cy="41" rx="8" ry="2.5" fill="rgba(0,0,0,0.15)"/>
        <!-- Pin body -->
        <path d="M15.5 0C7.49 0 1 6.49 1 14.5C1 25.5 15.5 42 15.5 42C15.5 42 30 25.5 30 14.5C30 6.49 23.51 0 15.5 0Z" fill="#22C55E" stroke="#16A34A" stroke-width="1"/>
        <!-- Inner circle -->
        <circle cx="15.5" cy="14.5" r="6.5" fill="white"/>
        <!-- Check mark -->
        <path d="M12.5 15L14.5 17L18.5 13" stroke="#22C55E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
  `,
  iconSize: [32, 44],
  iconAnchor: [16, 44],
  popupAnchor: [0, -44],
  tooltipAnchor: [16, -22],
});

// Default location marker (Blue)
const defaultIcon = L.divIcon({
  className: 'custom-default-marker',
  html: `
    <div style="position: relative; display: flex; align-items: center; justify-content: center;">
      <svg width="32" height="44" viewBox="0 0 32 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Pin shadow -->
        <ellipse cx="15" cy="41" rx="8" ry="2.5" fill="rgba(0,0,0,0.15)"/>
        <!-- Pin body -->
        <path d="M15.5 0C7.49 0 1 6.49 1 14.5C1 25.5 15.5 42 15.5 42C15.5 42 30 25.5 30 14.5C30 6.49 23.51 0 15.5 0Z" fill="#3B82F6" stroke="#2563EB" stroke-width="1"/>
        <!-- Inner circle -->
        <circle cx="15.5" cy="14.5" r="6.5" fill="white"/>
        <!-- Star -->
        <text x="15.5" y="17.5" text-anchor="middle" font-size="10" fill="#3B82F6">★</text>
      </svg>
    </div>
  `,
  iconSize: [32, 44],
  iconAnchor: [16, 44],
  popupAnchor: [0, -44],
  tooltipAnchor: [16, -22],
});

// Fix default Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Generate random nearby coordinates for providers without location data
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
    if (!map) return;

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
        maxZoom: 15,
        animate: true,
        duration: 0.5
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

  // Enrich providers without coordinates with generated locations
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
        _generatedLocation: true
      };
    });
  }, [providers, position]);

  const hasProviderLocations = providersWithLocations.length > 0;

  return (
    <div className="relative h-96 w-full rounded-2xl shadow-xl overflow-hidden">
      {/* Legend */}
      <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-gray-200">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500 shadow-sm"></div>
            <span className="text-xs font-medium text-gray-700">Your Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500 shadow-sm"></div>
            <span className="text-xs font-medium text-gray-700">
              Providers ({providersWithLocations.length})
            </span>
          </div>
          {!hasUserLocation && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500 shadow-sm"></div>
              <span className="text-xs font-medium text-gray-700">Default (Dhaka)</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="absolute top-3 left-3 bg-amber-500 text-white px-4 py-2.5 rounded-xl z-10 text-sm shadow-lg flex items-center gap-2">
          <span>⚠️</span>
          {error}
        </div>
      )}

      {locationLoaded && (
        <>
          <MapContainer 
            center={position} 
            zoom={13} 
            className="h-full w-full"
            zoomControl={true}
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              crossOrigin=""
            />

            {/* Auto-fit bounds to show all markers */}
            <MapBounds 
              userLocation={hasUserLocation ? position : null} 
              providers={providersWithLocations} 
            />

            {/* User Location Marker (Red) */}
            {hasUserLocation && (
              <>
                <Marker position={position} icon={userLocationIcon}>
                  <Popup>
                    <div className="text-center min-w-[150px]">
                      <div className="font-semibold text-red-600 mb-1">📍 Your Location</div>
                      <div className="text-xs text-gray-600 mb-1">
                        {position[0].toFixed(4)}, {position[1].toFixed(4)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {providersWithLocations.length} provider(s) nearby
                      </div>
                    </div>
                  </Popup>
                </Marker>
                <Circle 
                  center={position} 
                  radius={500} 
                  pathOptions={{ 
                    color: "#EF4444", 
                    fillColor: "#EF4444", 
                    fillOpacity: 0.08,
                    weight: 1.5,
                    dashArray: "5, 5"
                  }} 
                />
              </>
            )}

            {/* Provider Markers (Green) */}
            {providersWithLocations.map((provider, index) => (
              <Marker 
                key={provider.id || `provider-${index}`}
                position={[provider.latitude, provider.longitude]}
                icon={providerIcon}
              >
                <Popup>
                  <div className="min-w-[200px] max-w-[280px]">
                    {/* Provider Header */}
                    <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
                      {provider.userPhoto ? (
                        <img 
                          src={provider.userPhoto} 
                          alt={provider.name}
                          className="w-11 h-11 rounded-full object-cover border-2 border-green-500 shadow-sm"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className={`w-11 h-11 bg-gradient-to-br from-green-100 to-green-200 rounded-full items-center justify-center border-2 border-green-500 shadow-sm ${
                          provider.userPhoto ? 'hidden' : 'flex'
                        }`}
                      >
                        <span className="text-base font-bold text-green-600">
                          {provider.name?.charAt(0) || "P"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-sm truncate">
                          {provider.name || "Provider"}
                        </div>
                        <div className="text-xs text-green-600 font-medium capitalize">
                          {provider.category || "Service"}
                        </div>
                      </div>
                    </div>

                    {/* Provider Details */}
                    <div className="space-y-1.5 text-xs text-gray-600">
                      {provider.city && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">📍</span>
                          <span>{provider.city}</span>
                        </div>
                      )}
                      {provider.hourlyRate && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">💰</span>
                          <span className="font-semibold text-green-600">৳{provider.hourlyRate}/hr</span>
                        </div>
                      )}
                      {provider.rating && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">⭐</span>
                          <span>{provider.rating} ({provider.reviewCount || 0} reviews)</span>
                        </div>
                      )}
                      {provider.distance !== undefined && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">📏</span>
                          <span className="font-semibold text-blue-600">
                            {provider.distance < 1 
                              ? `${(provider.distance * 1000).toFixed(0)}m away` 
                              : `${provider.distance.toFixed(1)}km away`}
                          </span>
                        </div>
                      )}
                      {provider._generatedLocation && (
                        <div className="flex items-center gap-2 text-amber-600">
                          <span>⚠️</span>
                          <span className="italic">Approximate location</span>
                        </div>
                      )}
                    </div>

                    {/* Status */}
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      {provider.isActive !== false ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                          Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                          Unavailable
                        </span>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Provider Radius Circles (limit to first 10 for performance) */}
            {providersWithLocations.slice(0, 10).map((provider, index) => (
              <Circle 
                key={`circle-${provider.id || index}`}
                center={[provider.latitude, provider.longitude]}
                radius={200}
                pathOptions={{ 
                  color: "#22C55E", 
                  fillColor: "#22C55E", 
                  fillOpacity: 0.04,
                  weight: 1
                }}
              />
            ))}
          </MapContainer>

          {/* Floating Location Card */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md text-black rounded-xl py-2.5 px-4 flex items-center space-x-3 shadow-lg border border-gray-200 animate-fade-in pointer-events-none">
            <div className={`w-3 h-3 rounded-full animate-pulse shadow-sm ${
              hasUserLocation ? 'bg-green-500' : 'bg-blue-500'
            }`}></div>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {hasUserLocation ? "Your Location" : "Default Location (Dhaka)"}
              </div>
              <div className="text-xs text-gray-500">
                {position[0].toFixed(4)}, {position[1].toFixed(4)}
              </div>
            </div>
          </div>

          {/* Provider Count Badge */}
          {hasProviderLocations && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-green-600 text-white rounded-full px-4 py-2 text-sm font-medium shadow-lg z-10 flex items-center gap-2">
              <span>📍</span>
              <span>{providersWithLocations.length} provider{providersWithLocations.length !== 1 ? 's' : ''} on map</span>
            </div>
          )}
        </>
      )}

      {!locationLoaded && (
        <div className="h-full w-full flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-500 text-sm">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
}