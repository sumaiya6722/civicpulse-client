
"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";

// Custom marker icon
const markerIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 22px;
      height: 22px;
      background: #2563eb;
      border: 4px solid white;
      border-radius: 50%;
      box-shadow: 0 1px 6px rgba(0,0,0,0.4);
    "></div>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

// Update the map center when coordinates change
function MapController({ position }) {
  const map = useMap();

  useEffect(() => {
    map.setView(position, 15);
  }, [map, position]);

  return null;
}

// Handle clicks anywhere on the map
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(event) {
      onLocationSelect({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    },
  });

  return null;
}

export default function LocationPicker({
  latitude,
  longitude,
  onLocationSelect,
}) {
  const hasCoordinates =
    latitude !== "" &&
    longitude !== "" &&
    Number.isFinite(Number(latitude)) &&
    Number.isFinite(Number(longitude));

  const position = hasCoordinates
    ? [Number(latitude), Number(longitude)]
    : [23.8103, 90.4126]; // Default center: Dhaka

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600">
        Click on the map or drag the marker to select the issue location.
      </p>

      <div className="h-87.5 w-full overflow-hidden rounded-lg border">
        <MapContainer
          center={position}
          zoom={hasCoordinates ? 15 : 12}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapController position={position} />

          <MapClickHandler onLocationSelect={onLocationSelect} />

          {hasCoordinates && (
            <Marker
              position={position}
              icon={markerIcon}
              draggable={true}
              eventHandlers={{
                dragend(event) {
                  const newPosition = event.target.getLatLng();

                  onLocationSelect({
                    latitude: newPosition.lat,
                    longitude: newPosition.lng,
                  });
                },
              }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
