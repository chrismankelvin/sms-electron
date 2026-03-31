// src/components/Screensaver/Screensaver.jsx
import React, { useEffect, useState } from 'react';
import '../styles/screensaver.css';


const Screensaver = ({ isActive, onResume, logoutTimeRemaining }) => {
  const [countdown, setCountdown] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  
  // Use only reliable online images for testing
  const images = [
    'https://picsum.photos/id/1/1920/1080',   // Mountain landscape
    'https://picsum.photos/id/15/1920/1080',  // Forest path
    'https://picsum.photos/id/26/1920/1080',  // Waterfall
    'https://picsum.photos/id/29/1920/1080',  // Coastal view
    'https://picsum.photos/id/39/1920/1080',  // City skyline
  ];

  // Rotate images every 10 seconds
  useEffect(() => {
    if (!isActive) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 10000);
    
    return () => clearInterval(interval);
  }, [isActive, images.length]);

  // Update countdown display
  useEffect(() => {
    if (!isActive || !logoutTimeRemaining) return;
    
    let interval = null;
    
    const updateCountdown = () => {
      try {
        const remaining = logoutTimeRemaining();
        if (remaining <= 0) {
          if (interval) {
            clearInterval(interval);
          }
        }
        setCountdown(Math.max(0, Math.ceil(remaining / 1000)));
      } catch (error) {
        console.error('Error updating countdown:', error);
      }
    };
    
    updateCountdown();
    interval = setInterval(updateCountdown, 1000);
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, logoutTimeRemaining]);

  const handleImageError = (index) => {
    console.log(`Image ${index} failed to load`);
    setImageErrors(prev => ({ ...prev, [index]: true }));
    
    // Try next image
    if (index === currentImageIndex) {
      const nextIndex = (currentImageIndex + 1) % images.length;
      setCurrentImageIndex(nextIndex);
    }
  };

  if (!isActive) return null;

  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const totalSeconds = 60; // 60 seconds total timeout
  const currentSeconds = countdown !== null ? countdown : totalSeconds;
  const percentage = (currentSeconds / totalSeconds) * 100;

  // Get current image, skip errored ones
  const currentImage = images[currentImageIndex];
  const hasError = imageErrors[currentImageIndex];

  return (
    <div 
      className="screensaver-overlay"
      onClick={onResume}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="screensaver-background">
        {currentImage && !hasError ? (
          <img 
            src={currentImage} 
            alt="Screensaver"
            className="screensaver-image"
            onError={() => handleImageError(currentImageIndex)}
          />
        ) : (
          // Fallback gradient background if image fails
          <div className="screensaver-fallback">
            <div className="screensaver-gradient" />
          </div>
        )}
        <div className="screensaver-gradient" />
      </div>
       {countdown !== null && countdown <= 60 && countdown > 0 && (  
      <div className="screensaver-content">
        <div className="screensaver-message">
         <h1>
      {countdown !== null && countdown <= 60
        ? "Session Expiring Soon"
        : "Session Inactive"}
    </h1>

    <p>Your session will expire due to inactivity</p>
    <p className="screensaver-instruction">Click anywhere to continue</p>

 
            <div className="screensaver-countdown">
              <div className="countdown-timer">
                <span>Auto-logout in </span>
                <strong>{formatTime(countdown)}</strong>
              </div>
              <div className="countdown-bar">
                <div 
                  className="countdown-bar-fill"
                  style={{ 
                    width: `${percentage}%`,
                    transition: 'width 1s linear'
                  }}
                />
              </div>
            </div>
       
        </div>
        
        {isHovering && (
          <div className="screensaver-tooltip">
            Click anywhere to resume your session
          </div>
        )}
      </div>
   )}

    </div>
  );
};

export default Screensaver;