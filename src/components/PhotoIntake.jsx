import React, { useState } from 'react';
import PhotoCapture from './PhotoCapture.jsx';
import PhotoUpload from './PhotoUpload.jsx';
import { ShimmerButton } from './magicui/shimmer-button';

const PhotoIntake = ({ onPhotoProcessed }) => {
  const [activeTab, setActiveTab] = useState('capture');

  return (
    <div className="photo-intake p-4 border rounded-lg bg-card">
      <h2 className="text-xl font-semibold mb-4">Add Photos</h2>
      
      <div className="tabs flex space-x-2 mb-4 bg-muted p-1 rounded-lg">
        <button 
          className={`flex-1 rounded px-4 py-2 font-medium transition-colors ${
            activeTab === 'capture' 
              ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white' 
              : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
          }`}
          onClick={() => setActiveTab('capture')}
        >
          Capture
        </button>
        <button 
          className={`flex-1 rounded px-4 py-2 font-medium transition-colors ${
            activeTab === 'upload' 
              ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white' 
              : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
          }`}
          onClick={() => setActiveTab('upload')}
        >
          Upload
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'capture' ? (
          <PhotoCapture onPhotoCapture={onPhotoProcessed} />
        ) : (
          <PhotoUpload onPhotoUpload={onPhotoProcessed} />
        )}
      </div>
    </div>
  );
};

export default PhotoIntake;
