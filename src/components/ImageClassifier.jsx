import React, { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import { AnimatedList } from './magicui/animated-list';

const ImageClassifier = ({ photo, onClassificationComplete }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [model, setModel] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [error, setError] = useState(null);
  const imageRef = useRef(null);

  // Load the MobileNet model
  useEffect(() => {
    const loadModel = async () => {
      try {
        setIsLoading(true);
        // Load the MobileNet model
        const loadedModel = await mobilenet.load();
        setModel(loadedModel);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load MobileNet model:', err);
        setError('Failed to load image recognition model. Please try again later.');
        setIsLoading(false);
      }
    };

    loadModel();
  }, []);

  // Reset predictions when photo changes
  useEffect(() => {
    if (photo) {
      // Clear previous predictions when photo changes
      setPredictions(null);
      console.log('Photo changed, resetting predictions', photo.id);
    }
  }, [photo?.id]);

  // Classify the image when the model and image are ready
  useEffect(() => {
    // Skip if we don't have what we need
    if (!model || !photo || !photo.file) return;
    
    // Skip if we already have predictions for this specific photo
    if (predictions && photo.contentTags && photo.contentTags.length > 0) {
      console.log('Already classified this photo', photo.id);
      return;
    }
    
    console.log('Preparing to classify photo', photo.id);
    
    const classifyImage = async () => {
      if (!imageRef.current || !imageRef.current.complete) return;

      try {
        console.log('Classifying image with ID:', photo.id);
        // Classify the image
        const results = await model.classify(imageRef.current, 5); // Get top 5 predictions
        console.log('Classification results:', results);
        setPredictions(results);
        
        // Pass the classification results to the parent component
        if (onClassificationComplete) {
          onClassificationComplete(photo, results);
        }
      } catch (err) {
        console.error('Error classifying image:', err);
        setError('Error identifying objects in the image.');
      }
    };
    
    // For already loaded images
    if (imageRef.current && imageRef.current.complete) {
      classifyImage();
    }
    // Otherwise the onLoad handler will take care of it
  }, [model, photo?.id, predictions, onClassificationComplete]);

  // Create an object URL for the image
  const imageUrl = photo && photo.file ? URL.createObjectURL(photo.file) : null;

  const renderPredictionItem = (prediction, index) => (
    <div className="prediction-item mb-3 p-3 bg-black/5 rounded-md border">
      <div className="prediction-label font-medium mb-1">
        {prediction.className}
      </div>
      <div className="prediction-bar-container bg-gray-200 rounded-full h-4 overflow-hidden">
        <div 
          className="prediction-bar h-full bg-gradient-to-r from-indigo-500 to-purple-500" 
          style={{ width: `${prediction.probability * 100}%` }}
        ></div>
      </div>
      <span className="prediction-probability text-sm text-muted-foreground mt-1 inline-block">
        {(prediction.probability * 100).toFixed(1)}%
      </span>
    </div>
  );

  return (
    <div className="image-classifier p-4 border rounded-lg">
      <h3 className="text-xl font-semibold mb-4">Image Content</h3>
      
      {error && (
        <div className="classifier-error p-3 bg-red-100 text-red-800 rounded-md mb-4">{error}</div>
      )}
      
      {isLoading && !error && (
        <div className="classifier-loading p-3 bg-blue-100 text-blue-800 rounded-md mb-4">
          Loading image recognition model...
        </div>
      )}
      
      {/* Hidden image for classification */}
      {imageUrl && (
        <img 
          ref={imageRef}
          key={photo.id} /* Add key to force re-render when photo changes */
          src={imageUrl}
          alt="Classification source"
          style={{ display: 'none' }}
          crossOrigin="anonymous"
          onLoad={() => {
            if (model && !predictions && !error) {
              console.log('Image loaded, classifying photo:', photo.id);
              // Trigger classification when image loads
              model.classify(imageRef.current, 5).then(results => {
                console.log('onLoad classification results:', results);
                setPredictions(results);
                if (onClassificationComplete) {
                  onClassificationComplete(photo, results);
                }
              }).catch(err => {
                console.error('Error classifying image:', err);
                setError('Error identifying objects in the image.');
              });
            }
          }}
        />
      )}
      
      {predictions && (
        <div className="classifier-results">
          <AnimatedList 
            items={predictions} 
            renderItem={renderPredictionItem}
            className="mt-4"
          />
        </div>
      )}
    </div>
  );
};

export default ImageClassifier;
