import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Error boundary to suppress react-leaflet context warnings
class MapErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Log the error to see what it is
    console.warn('MapErrorBoundary caught an error:', error);
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error: error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error('Map Error Info:', errorInfo);
  }

  render() {
    console.log('MapErrorBoundary render - State:', this.state);
    
    // Check if the error is one of the known, suppressible react-leaflet warnings
    const isKnownWarning = 
      (this.state.error?.message?.includes('render2 is not a function')) || 
      (this.state.error?.message?.includes('A context consumer was rendered with multiple children')); // More specific check

    console.log('MapErrorBoundary render - isKnownWarning:', isKnownWarning);

    if (this.state.hasError && !isKnownWarning) {
      // Render fallback UI for actual, unknown errors
      console.log('MapErrorBoundary: Rendering fallback UI for unknown error.');
      return <div className="map-error">Error loading map. Check console for details.</div>;
    } 
    // If it's a known warning OR if there is no error, render children
    // We log the warning in getDerivedStateFromError/componentDidCatch but don't block rendering
    console.log('MapErrorBoundary: Rendering children (map).');
    return this.props.children;
  }
}

// Fix for default marker icons in react-leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Alternate implementation using Leaflet markers instead of heatmap.js
const HeatmapLayer = ({ photos }) => {
  const map = useMap();
  const markerClusterRef = useRef(null);
  
  useEffect(() => {
    if (!map || photos.length === 0) return;
    
    // Create custom photo markers with a gradient background
    const markers = photos
      .filter(photo => photo.exifData && photo.exifData.coordinates)
      .map(photo => {
        const latLng = L.latLng(
          photo.exifData.coordinates.lat,
          photo.exifData.coordinates.lng
        );
        
        // Create a transparent circle marker with a gradient fill
        const marker = L.circleMarker(latLng, {
          radius: 15,
          fillColor: '#ff5500',
          color: 'rgba(0,0,0,0.3)',
          weight: 1,
          opacity: 0.8,
          fillOpacity: 0.4
        });
        
        return marker;
      });
    
    // Clear existing markers if any
    if (markerClusterRef.current) {
      map.removeLayer(markerClusterRef.current);
    }
    
    // Add all markers to a feature group
    const markerGroup = L.featureGroup(markers);
    markerGroup.addTo(map);
    markerClusterRef.current = markerGroup;
    
    // Cleanup function
    return () => {
      if (markerClusterRef.current) {
        map.removeLayer(markerClusterRef.current);
        markerClusterRef.current = null;
      }
    };
  }, [map, photos]);
  
  return null;
};

// MapController for controlling map bounds
const MapController = ({ bounds }) => {
  const map = useMap();
  
  useEffect(() => {
    if (bounds && map) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, bounds]);
  
  return null;
};

const PhotoMap = ({ photos, showHeatmap = true }) => {
  const [heatmapEnabled, setHeatmapEnabled] = useState(showHeatmap);
  
  // Filter photos that have valid coordinates
  const photosWithLocation = photos.filter(
    photo => photo.exifData && 
    photo.exifData.coordinates && 
    typeof photo.exifData.coordinates.lat === 'number' && 
    typeof photo.exifData.coordinates.lng === 'number' && 
    !isNaN(photo.exifData.coordinates.lat) && 
    !isNaN(photo.exifData.coordinates.lng)
  );

  // Debug logging
  console.log('PhotoMap received photos:', photos);
  console.log('Photos with valid location:', photosWithLocation);

  // Calculate map center based on photos or default to a location
  const getMapCenter = () => {
    if (photosWithLocation.length === 0) {
      return [51.505, -0.09]; // Default: London
    }
    
    // Calculate the average of all coordinates
    const sumLat = photosWithLocation.reduce((sum, photo) => sum + photo.exifData.coordinates.lat, 0);
    const sumLng = photosWithLocation.reduce((sum, photo) => sum + photo.exifData.coordinates.lng, 0);
    
    return [
      sumLat / photosWithLocation.length,
      sumLng / photosWithLocation.length
    ];
  };

  // Get map bounds to fit all markers
  const getMapBounds = () => {
    if (photosWithLocation.length <= 1) return null;
    
    const bounds = L.latLngBounds(
      photosWithLocation.map(photo => [
        photo.exifData.coordinates.lat,
        photo.exifData.coordinates.lng
      ])
    );
    
    return bounds;
  };

  return (
    <div className="photo-map-container">
      <div className="map-header">
        <h2>Photo Map</h2>
        {photosWithLocation.length > 0 && (
          <div className="map-controls">
            <label className="heatmap-toggle">
              <input 
                type="checkbox" 
                checked={heatmapEnabled} 
                onChange={() => setHeatmapEnabled(!heatmapEnabled)}
              />
              Show Density Overlay
            </label>
          </div>
        )}
      </div>
      
      {photosWithLocation.length === 0 ? (
        <div className="no-photos-message">
          <p>No photos with location data available. Upload photos with GPS coordinates to see them on the map.</p>
        </div>
      ) : (
        <MapContainer 
          center={getMapCenter()} 
          zoom={13} 
          style={{ height: '500px', width: '100%' }}
        >
          <MapController bounds={getMapBounds()} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {heatmapEnabled && photosWithLocation.length > 0 && (
            <HeatmapLayer photos={photosWithLocation} />
          )}
          
          {photosWithLocation.map(photo => (
            <Marker 
              key={photo.id}
              position={[photo.exifData.coordinates.lat, photo.exifData.coordinates.lng]}
              icon={DefaultIcon}
            >
              <Popup>
                <div className="photo-popup">
                  <img 
                    src={URL.createObjectURL(photo.file)} 
                    alt={photo.name} 
                    className="popup-thumbnail"
                  />
                  <div className="popup-info">
                    <h3>{photo.name}</h3>
                    {photo.exifData.timestamp && (
                      <p>Date: {new Date(photo.exifData.timestamp).toLocaleDateString()}</p>
                    )}
                    <p>
                      Location: {photo.exifData.coordinates.lat.toFixed(6)}, 
                      {photo.exifData.coordinates.lng.toFixed(6)}
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
      
      {photosWithLocation.length > 0 && (
        <div className="map-legend">
          <p><strong>Photos on map:</strong> {photosWithLocation.length}</p>
          {heatmapEnabled && (
            <div className="heatmap-legend">
              <p><strong>Density Overlay:</strong> Highlights photo locations</p>
              <div className="heatmap-gradient">
                <span style={{ backgroundColor: '#ff5500', opacity: 0.4 }}></span>
              </div>
              <div className="heatmap-labels">
                <span>Photo Locations</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PhotoMap;
