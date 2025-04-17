import React, { useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const MapComponent = ({ markers, selectedMarkerId, onMarkerClick }) => {
  const mapRef = useRef();
  const markerRefs = useRef({});

  // Validate and filter markers with proper positions
  const validMarkers = markers.filter(
    (marker) =>
      Array.isArray(marker.position) &&
      marker.position.length === 2 &&
      !isNaN(marker.position[0]) &&
      !isNaN(marker.position[1]) &&
      Math.abs(marker.position[0]) <= 90 && // Valid latitude
      Math.abs(marker.position[1]) <= 180 // Valid longitude
  );

  useEffect(() => {
    if (mapRef.current && validMarkers.length > 0) {
      try {
        const bounds = L.latLngBounds(
          validMarkers.map((marker) => marker.position)
        );
        if (bounds.isValid()) {
          mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        } else {
          // Fallback to default view if bounds are invalid
          mapRef.current.setView([28.3096, 83.9056], 12);
        }
      } catch (error) {
        console.error("Error updating map bounds:", error);
        mapRef.current.setView([28.3096, 83.9056], 12);
      }
    }
  }, [validMarkers]);

  useEffect(() => {
    if (selectedMarkerId && markerRefs.current[selectedMarkerId]) {
      const marker = markerRefs.current[selectedMarkerId];
      try {
        const position = marker.getLatLng();
        if (position.lat && position.lng) {
          mapRef.current.setView(position, 12);
          marker.openPopup();
        }
      } catch (error) {
        console.error("Error focusing marker:", error);
      }
    }
  }, [selectedMarkerId]);

  return (
    <MapContainer
      ref={mapRef}
      center={[28.3096, 83.9056]} // Default center
      zoom={12}
      scrollWheelZoom={true}
      className="h-full w-full"
      whenReady={(map) => {
        // Initialize with valid bounds or default view
        if (validMarkers.length === 0) {
          map.target.setView([28.3096, 83.9056], 12);
        }
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Render valid markers */}
      {validMarkers.map((marker) => (
        <Marker
          key={marker._id}
          position={marker.position}
          eventHandlers={{
            click: () => onMarkerClick(marker._id, marker.position),
          }}
          ref={(el) => (markerRefs.current[marker._id] = el)}
        >
          <Popup className="custom-popup">
            <div className="popup-card relative flex flex-col items-center bg-white rounded-lg shadow-md p-4 max-w-xs">
              <button
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-lg focus:outline-none hover:bg-red-700 transition duration-300"
                onClick={() => markerRefs.current[marker._id].closePopup()}
              >
                &times;
              </button>
              <img
                src={marker.image}
                alt={marker.name}
                className="w-full h-32 object-cover mb-4 rounded-lg"
              />
              <h3 className="text-lg font-bold mb-2">{marker.name}</h3>
              <p className="text-sm text-gray-600 text-center">
                {marker.description}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;
