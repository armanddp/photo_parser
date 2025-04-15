import React, { useState, useEffect } from 'react';
import ExifProcessor from '../utils/ExifProcessor';

const ExifExtractor = ({ photo, onExifProcessed }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [exifData, setExifData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const extractExif = async () => {
      if (!photo || !photo.file) return;
      
      // Skip extraction if we already have exifData for this photo ID
      if (exifData && photo.id === exifData.photoId) {
        console.log('Skipping EXIF extraction - already processed this photo');
        return;
      }
      
      setIsProcessing(true);
      setError(null);
      
      try {
        // Extract EXIF data using the ExifProcessor utility
        const extractedData = await ExifProcessor.extractExif(photo.file);
        
        // Add the photo ID to the extracted data for future reference
        extractedData.photoId = photo.id;
        
        console.log('EXIF data extracted:', extractedData);
        console.log('Has coordinates:', extractedData && extractedData.coordinates);
        if (extractedData && extractedData.coordinates) {
          console.log('Coordinates:', extractedData.coordinates);
          console.log('Lat type:', typeof extractedData.coordinates.lat);
          console.log('Lng type:', typeof extractedData.coordinates.lng);
        }
        
        setExifData(extractedData);
        
        // Pass the extracted EXIF data to the parent component
        if (onExifProcessed) {
          const photoWithExif = {
            ...photo,
            exifData: extractedData
          };
          console.log('Sending photo with EXIF to parent:', photoWithExif);
          onExifProcessed(photoWithExif);
        }
      } catch (err) {
        console.error('Error in ExifExtractor:', err);
        setError('Failed to extract EXIF data: ' + err.message);
      } finally {
        setIsProcessing(false);
      }
    };
    
    extractExif();
    // Only re-run when photo ID changes, not the entire photo object
  }, [photo?.id, onExifProcessed]);

  if (isProcessing) {
    return <div className="exif-processing">Extracting EXIF data...</div>;
  }

  if (error) {
    return <div className="exif-error">{error}</div>;
  }

  if (!exifData) {
    return null;
  }

  return (
    <div className="exif-data p-4 border rounded-lg">
      <h3 className="text-xl font-semibold mb-4">EXIF Data</h3>
      
      {!exifData.hasExif && (
        <div className="no-exif-message bg-yellow-50 border border-yellow-200 p-3 rounded-md">
          <p className="text-yellow-800">{exifData.message || 'No EXIF data found in this image'}</p>
          <p className="text-sm text-yellow-600 mt-2">
            For photos with location data:
            <ul className="list-disc pl-5 mt-1">
              <li>Use the camera capture feature with location permission enabled</li>
              <li>Upload photos taken with GPS-enabled devices</li>
            </ul>
          </p>
        </div>
      )}
      
      {exifData.hasExif && (
        <div className="exif-details grid grid-cols-1 md:grid-cols-2 gap-4">
          {exifData.coordinates && (
            <div className="exif-item p-3 bg-blue-50 border border-blue-100 rounded-md">
              <strong className="block text-blue-800 mb-1">Location:</strong> 
              <span className="text-blue-700">{exifData.coordinates.lat.toFixed(6)}, {exifData.coordinates.lng.toFixed(6)}</span>
            </div>
          )}
          
          {exifData.timestamp && (
            <div className="exif-item p-3 bg-purple-50 border border-purple-100 rounded-md">
              <strong className="block text-purple-800 mb-1">Timestamp:</strong> 
              <span className="text-purple-700">{new Date(exifData.timestamp).toLocaleString()}</span>
            </div>
          )}
          
          {exifData.direction && (
            <div className="exif-item p-3 bg-green-50 border border-green-100 rounded-md">
              <strong className="block text-green-800 mb-1">Direction:</strong> 
              <span className="text-green-700">{exifData.direction}</span>
            </div>
          )}
          
          {(exifData.make || exifData.model) && (
            <div className="exif-item p-3 bg-amber-50 border border-amber-100 rounded-md">
              <strong className="block text-amber-800 mb-1">Camera:</strong> 
              <span className="text-amber-700">{[exifData.make, exifData.model].filter(Boolean).join(' ')}</span>
            </div>
          )}

          {(!exifData.coordinates) && (
            <div className="exif-item col-span-full p-3 bg-gray-50 border border-gray-200 rounded-md">
              <p className="text-gray-700">No location data available for this photo.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExifExtractor;
