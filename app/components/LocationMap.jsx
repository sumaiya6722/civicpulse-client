"use client";

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { useEffect } from "react";

const DEFAULT_POSITION = [23.8103, 90.4125]; // Dhaka

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

function MapCenterUpdater({ center }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);

  return null;
}

const LocationMap = ({
  latitude,
  longitude,
  onLocationSelect,
}) => {
  const hasCoordinates =
    latitude !== "" &&
    longitude !== "" &&
    Number.isFinite(Number(latitude)) &&
    Number.isFinite(Number(longitude));

  const position = hasCoordinates
    ? [Number(latitude), Number(longitude)]
    : DEFAULT_POSITION;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-300">
      <MapContainer
        center={position}
        zoom={hasCoordinates ? 16 : 12}
        scrollWheelZoom={true}
        className="h-87.5 w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapCenterUpdater center={position} />

        <MapClickHandler onLocationSelect={onLocationSelect} />

        {hasCoordinates && (
          <CircleMarker
            center={position}
            radius={9}
            pathOptions={{
              color: "#ffffff",
              fillColor: "#2563eb",
              fillOpacity: 1,
              weight: 3,
            }}
          >
            <Popup>Selected issue location</Popup>
          </CircleMarker>
        )}
      </MapContainer>
    </div>
  );
};

export default LocationMap;