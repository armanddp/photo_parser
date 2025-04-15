# Photo Map Explorer - User Documentation

## Overview
Photo Map Explorer is a web application that allows you to capture or upload photos, extract EXIF data, display photos on a map, visualize photo density, and identify content in the images.

## Features
1. **Photo Intake**
   - Capture photos using your device camera
   - Upload photos from your device
   - Each photo gets a unique ID for tracking

2. **EXIF Data Extraction**
   - Extracts GPS coordinates, timestamp, and direction
   - Displays camera information and other metadata
   - Visual indicators for photos with valid location data

3. **Map Visualization**
   - Interactive map with photo markers at exact GPS coordinates
   - Photo density heatmap showing concentration areas
   - Toggle controls for heatmap visibility
   - Popup information with photo details and thumbnails

4. **Image Content Identification**
   - Object recognition using TensorFlow.js and MobileNet
   - Displays top 5 predictions with confidence levels
   - Content tags shown in the photo grid

## How to Use

### Running the Application
1. Navigate to the project directory: `cd photo-map-app`
2. Start the development server: `pnpm run dev`
3. Access the application at: http://localhost:5173

### Capturing Photos
1. Click the "Capture Photo" tab
2. Click "Start Camera" to activate your device camera
3. Click "Capture Photo" to take a picture
4. The photo will be processed automatically

### Uploading Photos
1. Click the "Upload Photo" tab
2. Drag and drop a photo or click "Select Photo"
3. The photo will be processed automatically

### Viewing EXIF Data
- EXIF data is automatically extracted and displayed below the photo
- Photos with valid GPS coordinates will show a location marker (📍)

### Exploring the Map
- Photos with GPS coordinates will appear on the map
- Click markers to view photo details
- Toggle the heatmap to see photo density
- The map automatically centers on your photos

### Identifying Content
- Image content is automatically identified using AI
- View the top predictions and their confidence levels
- Content tags appear in the photo grid

## Technical Details
- Built with React and Vite
- Uses exifr for EXIF data extraction
- Map visualization with Leaflet and react-leaflet
- Density visualization with heatmap.js
- Image recognition with TensorFlow.js and MobileNet

## Troubleshooting
- **Camera not working**: Ensure you've granted camera permissions in your browser
- **EXIF data not showing**: Not all photos contain EXIF data, especially those from social media
- **Map not showing photos**: Only photos with valid GPS coordinates will appear on the map
- **Content identification issues**: The AI model works best with clear, well-lit images

## Future Enhancements
- User accounts and photo collections
- Advanced filtering by date, location, and content
- Sharing capabilities
- Offline support
