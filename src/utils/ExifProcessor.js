import exifr from 'exifr';

class ExifProcessor {
  /**
   * Extract EXIF data from a photo file
   * @param {File} file - The photo file to process
   * @returns {Promise<Object>} - The extracted EXIF data
   */
  static async extractExif(file) {
    try {
      // Parse full EXIF data
      const exifData = await exifr.parse(file, {
        // Include GPS data and other important tags
        gps: true,
        tiff: true,
        exif: true,
        ifd0: true,
        interop: true,
        translateValues: true,
        translateKeys: true,
        reviveValues: true,
      });

      // If no EXIF data found
      if (!exifData) {
        return {
          hasExif: false,
          message: 'No EXIF data found in this image',
          coordinates: null,
          timestamp: null,
          direction: null,
          make: null,
          model: null,
          allTags: {}
        };
      }

      // Extract GPS coordinates
      let coordinates = null;
      if (exifData.latitude !== undefined && exifData.longitude !== undefined) {
        coordinates = {
          lat: exifData.latitude,
          lng: exifData.longitude,
        };
      }

      // Extract creation timestamp
      let timestamp = null;
      if (exifData.DateTimeOriginal) {
        timestamp = exifData.DateTimeOriginal;
      } else if (exifData.DateTime) {
        timestamp = exifData.DateTime;
      } else if (exifData.CreateDate) {
        timestamp = exifData.CreateDate;
      }

      // Extract direction (GPSImgDirection or Orientation)
      let direction = null;
      if (exifData.GPSImgDirection !== undefined) {
        direction = exifData.GPSImgDirection;
      } else if (exifData.Orientation) {
        // Orientation is not the same as direction, but can be used as a fallback
        direction = `Orientation: ${exifData.Orientation}`;
      }

      // Extract camera make and model
      const make = exifData.Make || null;
      const model = exifData.Model || null;

      return {
        hasExif: true,
        coordinates,
        timestamp,
        direction,
        make,
        model,
        allTags: exifData // Include all tags for debugging or advanced features
      };
    } catch (error) {
      console.error('Error extracting EXIF data:', error);
      return {
        hasExif: false,
        error: error.message,
        message: 'Error extracting EXIF data',
        coordinates: null,
        timestamp: null,
        direction: null,
        make: null,
        model: null,
        allTags: {}
      };
    }
  }

  /**
   * Check if the image has valid GPS coordinates
   * @param {Object} exifData - The extracted EXIF data
   * @returns {Boolean} - Whether the image has valid coordinates
   */
  static hasValidCoordinates(exifData) {
    return (
      exifData &&
      exifData.coordinates &&
      typeof exifData.coordinates.lat === 'number' &&
      typeof exifData.coordinates.lng === 'number' &&
      !isNaN(exifData.coordinates.lat) &&
      !isNaN(exifData.coordinates.lng)
    );
  }
}

export default ExifProcessor;
