import React from 'react';

// SVG Platzhalter für Trainer ohne Bild
export const TrainerPlaceholderIcon: React.FC<{ className?: string; size?: number }> = ({ 
  className = '', 
  size = 80 
}) => (
  <div 
    className={`bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center ${className}`}
    style={{ width: size, height: size }}
  >
    <svg 
      width={size * 0.6} 
      height={size * 0.6} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="text-primary-600"
    >
      <path 
        d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" 
        fill="currentColor"
      />
    </svg>
  </div>
);

// Komponente für Trainerbild mit Fallback
export const TrainerImage: React.FC<{
  imageUrl?: string;
  name: string;
  size?: number;
  className?: string;
  showPlaceholder?: boolean;
}> = ({ 
  imageUrl, 
  name, 
  size = 80, 
  className = '',
  showPlaceholder = true 
}) => {
  const [imageError, setImageError] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  // Reset error state when imageUrl changes
  React.useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
  }, [imageUrl]);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Show placeholder if no image URL, image failed to load, or we explicitly want to show placeholder
  const shouldShowPlaceholder = !imageUrl || imageError || !showPlaceholder;

  return (
    <div className={`relative ${className}`}>
      {shouldShowPlaceholder ? (
        <TrainerPlaceholderIcon 
          size={size}
          className="border-4 border-gray-200"
        />
      ) : (
        <>
          {/* Show placeholder while loading */}
          {!imageLoaded && (
            <TrainerPlaceholderIcon 
              size={size}
              className="border-4 border-gray-200 absolute inset-0"
            />
          )}
          <img
            src={imageUrl}
            alt={`${name} avatar`}
            className={`${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            } transition-opacity duration-200 rounded-full object-cover border-4 border-gray-200`}
            style={{ width: size, height: size }}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        </>
      )}
    </div>
  );
};

export default TrainerImage;