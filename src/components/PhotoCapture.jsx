import React, { useRef, useState } from 'react';
import { ShimmerButton } from './magicui/shimmer-button';

const PhotoCapture = ({ onPhotoCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);

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

  const capturePhoto = () => {
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
    canvas.toBlob((blob) => {
      if (!blob) return;
      
      // Create a File object from the blob
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      // Pass the captured photo to the parent component
      if (onPhotoCapture) {
        onPhotoCapture(file);
      }
      
      // Stop the camera after capturing
      stopCamera();
    }, 'image/jpeg', 0.95);
  };

  return (
    <div className="photo-capture">
      <h2>Capture Photo</h2>
      
      {error && <div className="error-message">{error}</div>}
      
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
            Capture Photo
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
    </div>
  );
};

export default PhotoCapture;
