import React, { useState } from 'react';
import { ShimmerButton } from './magicui/shimmer-button';

const PhotoUpload = ({ onPhotoUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.match('image.*')) {
      setSelectedFile(file);
      if (onPhotoUpload) {
        onPhotoUpload(file);
      }
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      const file = event.dataTransfer.files[0];
      if (file.type.match('image.*')) {
        setSelectedFile(file);
        if (onPhotoUpload) {
          onPhotoUpload(file);
        }
      }
    }
  };

  return (
    <div className="photo-upload">
      <h2>Upload Photo</h2>
      
      <div 
        className={`upload-area relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-center mb-4">
          <p className="text-muted-foreground mb-2">Drag & drop a photo here or click to select</p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            id="file-upload"
            style={{ display: 'none' }}
          />
          <label htmlFor="file-upload">
            <ShimmerButton 
              as="div" 
              className="cursor-pointer inline-block"
              onClick={() => document.getElementById('file-upload').click()}
            >
              Select Photo
            </ShimmerButton>
          </label>
        </div>
        
        {selectedFile && (
          <div className="selected-file mt-4 p-2 bg-muted rounded text-center">
            <p className="text-sm font-medium">Selected: {selectedFile.name}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoUpload;
