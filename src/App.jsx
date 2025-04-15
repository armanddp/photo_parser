import React, { useState } from 'react';
import './App.css';
import PhotoIntake from './components/PhotoIntake.jsx';
import ExifExtractor from './components/ExifExtractor.jsx';
import PhotoMap from './components/PhotoMap.jsx';
import ImageClassifier from './components/ImageClassifier.jsx';
import './components/PhotoIntake.css';
import './components/PhotoMap.css';
import './components/ImageClassifier.css';
import { cn } from "@/lib/utils";
import { LensFlare } from "./components/magicui/lens-flare";

function App() {
  const [photos, setPhotos] = useState([]);
  const [processedPhotos, setProcessedPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const handlePhotoProcessed = (file) => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const photoData = { id, file, dataUrl, name: file.name, contentTags: [] };
      setPhotos(prevPhotos => [...prevPhotos, photoData]);
      setSelectedPhoto(photoData);
    };
    reader.readAsDataURL(file);
  };

  const handleExifProcessed = (photoWithExif) => {
    const originalPhoto = photos.find(p => p.id === photoWithExif.id);
    if (!originalPhoto) return;
    const completePhoto = { ...originalPhoto, exifData: photoWithExif.exifData };
    setProcessedPhotos(prevProcessed => {
      const exists = prevProcessed.some(p => p.id === completePhoto.id);
      return exists ? prevProcessed.map(p => p.id === completePhoto.id ? completePhoto : p) : [...prevProcessed, completePhoto];
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
          Photo Map Explorer
        </h1>
        <p className="text-muted-foreground">
          Capture or upload photos, see EXIF data, map locations, and identify content.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 flex flex-col gap-8">
          <PhotoIntake onPhotoProcessed={handlePhotoProcessed} />
          
          <div className="photo-grid-container">
            <h2 className="text-xl font-semibold mb-4">Uploaded Photos</h2>
            {photos.length === 0 ? (
              <p className="text-muted-foreground italic">No photos uploaded yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className={cn(
                      "relative group overflow-hidden rounded-lg border cursor-pointer aspect-square",
                      selectedPhoto && selectedPhoto.id === photo.id ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                    )}
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <img 
                      src={photo.dataUrl} 
                      alt={`Uploaded photo ${photo.name}`}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <LensFlare className="absolute inset-0" /> 
                    
                    {photo.contentTags && photo.contentTags.length > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/50 backdrop-blur-sm">
                        <span className="text-xs text-white truncate">{photo.contentTags[0].className}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-8">
          {selectedPhoto ? (
            <>
              <ExifExtractor 
                photo={selectedPhoto} 
                onExifProcessed={handleExifProcessed}
              />
              <ImageClassifier 
                photo={selectedPhoto}
                onClassificationComplete={(p, tags) => {
                  const updatedPhoto = { ...p, contentTags: tags };
                  setPhotos(prevPhotos => prevPhotos.map(ph => ph.id === p.id ? updatedPhoto : ph));
                  setSelectedPhoto(updatedPhoto);
                }}
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-64 border rounded-lg bg-muted">
              <p className="text-muted-foreground">Select a photo to see details.</p>
            </div>
          )}
          
          <PhotoMap photos={processedPhotos} />
        </div>
      </div>
    </div>
  );
}

export default App;
