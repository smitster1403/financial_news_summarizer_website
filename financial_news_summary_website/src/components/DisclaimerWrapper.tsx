'use client';

import { useState, useEffect } from 'react';
import DisclaimerModal from './DisclaimerModal'; 

export default function DisclaimerWrapper() {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  
  useEffect(() => {
    // Show disclaimer on every visit by setting showDisclaimer to true
    // Short delay to prevent immediate popup on page load
    const timer = setTimeout(() => {
      setShowDisclaimer(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleAcceptDisclaimer = () => {
    // Simply close the disclaimer without storing in localStorage
    setShowDisclaimer(false);
  };

  if (!showDisclaimer) return null;
  
  return (
    <DisclaimerModal 
      onAccept={handleAcceptDisclaimer} 
      authorName="the developer" // Replace with your name
    />
  );
}