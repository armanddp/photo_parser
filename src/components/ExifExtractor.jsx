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
    <div className="exif-data">
      <h3>EXIF Data</h3>
      
      {!exifData.hasExif && (
        <p className="no-exif-message">{exifData.message || 'No EXIF data found'}</p>
      )}
      
      {exifData.hasExif && (
        <div className="exif-details">
          {exifData.coordinates && (
            <div className="exif-item">
              <strong>Location:</strong> 
              <span>{exifData.coordinates.lat.toFixed(6)}, {exifData.coordinates.lng.toFixed(6)}</span>
            </div>
          )}
          
          {exifData.timestamp && (
            <div className="exif-item">
              <strong>Timestamp:</strong> 
              <span>{new Date(exifData.timestamp).toLocaleString()}</span>
            </div>
          )}
          
          {exifData.direction && (
            <div className="exif-item">
              <strong>Direction:</strong> 
              <span>{exifData.direction}</span>
            </div>
          )}
          
          {(exifData.make || exifData.model) && (
            <div className="exif-item">
              <strong>Camera:</strong> 
              <span>{[exifData.make, exifData.model].filter(Boolean).join(' ')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExifExtractor;
