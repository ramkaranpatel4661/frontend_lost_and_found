import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const ImageDisplay = ({ 
  imageUrls = [], 
  title = 'Item', 
  className = '',
  showThumbnails = true,
  aspectRatio = 'aspect-w-16 aspect-h-12'
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Use environment variable for base URL
    const baseUrl = import.meta.env.VITE_BASE_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    
    // Ensure path always includes /uploads if it doesn't already
    let cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    
    // If path doesn't start with uploads, add it
    if (!cleanPath.startsWith('uploads/')) {
      cleanPath = `uploads/${cleanPath}`;
    }
    
    return `${baseUrl}/${cleanPath}`;
  };

  if (!imageUrls || imageUrls.length === 0) {
    return (
      <div className={`bg-gray-200 rounded-lg flex items-center justify-center ${aspectRatio} ${className}`}>
        <span className="text-gray-500">No image available</span>
      </div>
    );
  }

  const handleImageError = (index) => {
    console.warn(`Failed to load image at index ${index}:`, imageUrls[index]);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % imageUrls.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);
  };

  const currentImage = imageUrls[currentImageIndex];
  const imageUrl = getImageUrl(currentImage);

  return (
    <>
      <div className={`relative ${className}`}>
        {/* Main Image */}
        <div className={`${aspectRatio} bg-gray-100 rounded-lg overflow-hidden`}>
          <img
            src={imageUrl}
            alt={`${title} - Image ${currentImageIndex + 1}`}
            className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setShowFullscreen(true)}
            onError={() => handleImageError(currentImageIndex)}
          />
        </div>

        {/* Navigation Arrows (if multiple images) */}
        {imageUrls.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Image Counter */}
        {imageUrls.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            {currentImageIndex + 1} / {imageUrls.length}
          </div>
        )}

        {/* Thumbnails */}
        {showThumbnails && imageUrls.length > 1 && (
          <div className="flex gap-2 mt-2 overflow-x-auto">
            {imageUrls.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                  index === currentImageIndex
                    ? 'border-blue-500'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img
                  src={getImageUrl(image)}
                  alt={`${title} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(index)}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {showFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowFullscreen(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X size={24} />
            </button>
            
            <img
              src={imageUrl}
              alt={`${title} - Fullscreen`}
              className="max-w-full max-h-full object-contain"
              onError={() => handleImageError(currentImageIndex)}
            />
            
            {imageUrls.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ImageDisplay;