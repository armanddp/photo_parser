import React, { useRef, useState, useEffect } from 'react';
import { ShimmerButton } from './magicui/shimmer-button';
import exifr from 'exifr';
import piexif from 'piexifjs';

const PhotoCapture = ({ onPhotoCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Get user's location when component mounts
  useEffect(() => {
    if ('geolocation' in navigator) {
      setIsGettingLocation(true);
      
      const locationWatcher = navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            timestamp: position.timestamp
          });
          setIsGettingLocation(false);
          setError(null);
        },
        (err) => {
          console.error('Geolocation error:', err);
          setIsGettingLocation(false);
          setError('Could not access location. Photos will not include GPS data.');
        },
        { 
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
      
      // Clean up location watcher when component unmounts
      return () => {
        navigator.geolocation.clearWatch(locationWatcher);
      };
    } else {
      setError('Geolocation is not supported in your browser. Photos will not include GPS data.');
    }
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        setError(null);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please ensure you have granted camera permissions.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  // Function to add EXIF data to a JPEG image
  const addExifToJpeg = async (blob) => {
    if (!location) {
      console.log('No location data available for EXIF');
      return blob;
    }

    try {
      // Convert blob to base64
      const reader = new FileReader();
      
      const base64 = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      
      // Create EXIF data with GPS info
      const zeroth = {};
      const exif = {};
      const gps = {};
      
      // Add GPS data
      // Convert decimal coordinates to DMS (degrees, minutes, seconds)
      const latDec = location.lat;
      const lngDec = location.lng;
      
      // Convert latitude from decimal to DMS
      const latAbs = Math.abs(latDec);
      const latDeg = Math.floor(latAbs);
      const latMin = Math.floor((latAbs - latDeg) * 60);
      const latSec = Math.round(((latAbs - latDeg) * 60 - latMin) * 60 * 100);
      const latRef = latDec >= 0 ? 'N' : 'S';
      
      // Convert longitude from decimal to DMS
      const lngAbs = Math.abs(lngDec);
      const lngDeg = Math.floor(lngAbs);
      const lngMin = Math.floor((lngAbs - lngDeg) * 60);
      const lngSec = Math.round(((lngAbs - lngDeg) * 60 - lngMin) * 60 * 100);
      const lngRef = lngDec >= 0 ? 'E' : 'W';
      
      // Set GPS data
      gps[piexif.GPSIFD.GPSLatitudeRef] = latRef;
      gps[piexif.GPSIFD.GPSLatitude] = [[latDeg, 1], [latMin, 1], [latSec, 100]];
      gps[piexif.GPSIFD.GPSLongitudeRef] = lngRef;
      gps[piexif.GPSIFD.GPSLongitude] = [[lngDeg, 1], [lngMin, 1], [lngSec, 100]];
      
      // Add timestamp
      const now = new Date();
      zeroth[piexif.ImageIFD.DateTime] = now.toISOString().replace(/[-:]/g, ':').replace('T', ' ').split('.')[0];
      exif[piexif.ExifIFD.DateTimeOriginal] = now.toISOString().replace(/[-:]/g, ':').replace('T', ' ').split('.')[0];
      
      // Add device info
      zeroth[piexif.ImageIFD.Make] = 'PhotoMapApp';
      zeroth[piexif.ImageIFD.Model] = navigator.userAgent;
      
      // Create EXIF object
      const exifObj = { "0th": zeroth, "Exif": exif, "GPS": gps };
      const exifStr = piexif.dump(exifObj);
      
      // Insert EXIF into JPEG
      const newImageData = piexif.insert(exifStr, base64);
      
      // Convert back to blob
      const binary = atob(newImageData.split(',')[1]);
      const array = [];
      for (let i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
      }
      
      return new Blob([new Uint8Array(array)], { type: 'image/jpeg' });
    } catch (err) {
      console.error('Error adding EXIF data:', err);
      return blob; // Return original blob if there was an error
    }
  };

  const capturePhoto = async () => {
    if (!isStreaming) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) return;
    
    const context = canvas.getContext('2d');
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to blob and create a file
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      
      try {
        // Add EXIF data with GPS info
        const blobWithExif = await addExifToJpeg(blob);
        
        // Create a File object from the blob
        const file = new File([blobWithExif], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
        
        // Pass the captured photo to the parent component
        if (onPhotoCapture) {
          onPhotoCapture(file);
        }
        
        // Stop the camera after capturing
        stopCamera();
      } catch (err) {
        console.error('Error processing captured photo:', err);
        setError('Error processing photo: ' + err.message);
      }
    }, 'image/jpeg', 0.95);
  };

  return (
    <div className="photo-capture">
      <h2 className="text-xl font-semibold mb-2">Capture Photo</h2>
      
      {/* Location status indicator */}
      <div className="flex items-center mb-3">
        <div className={`w-3 h-3 rounded-full mr-2 ${
          location ? 'bg-green-500' : isGettingLocation ? 'bg-yellow-500' : 'bg-red-500'
        }`}></div>
        <span className="text-sm">
          {location 
            ? `GPS active (${location.lat.toFixed(6)}, ${location.lng.toFixed(6)})` 
            : isGettingLocation 
              ? 'Obtaining GPS location...' 
              : 'GPS inactive'
          }
        </span>
      </div>
      
      {error && (
        <div className="error-message p-3 mb-3 bg-red-100 text-red-800 rounded-md text-sm">{error}</div>
      )}
      
      <div className="camera-container relative rounded-lg overflow-hidden bg-black/10 border">
        <video 
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full aspect-video object-cover"
          style={{ display: isStreaming ? 'block' : 'none' }}
          onCanPlay={() => setIsStreaming(true)}
        />
        
        <canvas 
          ref={canvasRef} 
          style={{ display: 'none' }}
        />
        
        {!isStreaming && (
          <div className="flex items-center justify-center h-[220px]">
            <p className="text-muted-foreground">Camera inactive</p>
          </div>
        )}
      </div>
      
      <div className="camera-controls flex gap-3 mt-4">
        {!isStreaming ? (
          <button 
            onClick={startCamera}
            className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-medium px-4 py-2 rounded shadow hover:shadow-lg transition-all"
          >
            Start Camera
          </button>
        ) : (
          <button 
            onClick={capturePhoto}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium px-4 py-2 rounded shadow hover:shadow-lg transition-all"
          >
            Capture Photo {location ? 'with GPS' : ''}
          </button>
        )}
        
        {isStreaming && (
          <button 
            onClick={stopCamera} 
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium px-4 py-2 rounded shadow hover:shadow-lg transition-all"
          >
            Cancel
          </button>
        )}
      </div>
      
      {/* Explanation of EXIF/GPS features */}
      <div className="mt-4 text-sm text-muted-foreground">
        <p>
          {location 
            ? '✓ Photos will include GPS location and timestamp in EXIF data'
            : '✗ Photos will not include GPS data - enable location permission for this feature'
          }
        </p>
      </div>
    </div>
  );
};

export default PhotoCapture;
