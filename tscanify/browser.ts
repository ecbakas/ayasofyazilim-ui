/*! tscanify browser entry point v1.0.0 | MIT License */

/**
 * This file is a specific entry point for browser environments.
 * It only exports the browser-compatible implementation and avoids importing
 * any Node.js-specific modules like 'canvas' or 'jsdom'.
 */

// Export the browser-specific implementation
export { TScanifyBrowser } from './tscanify-browser';

// Re-export types
export * from './types';

// Re-export opencv-ts for convenience
import cv from 'opencv-ts';
import type { Mat, MatVector, Size, Rect } from 'opencv-ts';
export { cv };
export type { Mat, MatVector, Size, Rect };

// Initialize OpenCV if needed (browser environment only)
if (typeof window !== 'undefined') {
  // Check if OpenCV is already available globally
  if (!(window as any).cv || !(window as any).cv.Mat) {
    try {
      // Make opencv-ts available globally
      (window as any).cv = cv;
    } catch (err) {}
  }
}

// Export the browser implementation as the default for convenience
import { TScanifyBrowser } from './tscanify-browser';
export default TScanifyBrowser;

// Helper function to create a new instance and ensure OpenCV is ready
export function createScanner(): TScanifyBrowser {
  const scanner = new TScanifyBrowser();

  // If in browser, ensure OpenCV is available
  if (typeof window !== 'undefined') {
    // Try to make cv from opencv-ts available globally if not already
    if (!(window as any).cv || !(window as any).cv.Mat) {
      if (cv && (cv as any).Mat) {
        (window as any).cv = cv;
      }
    }
  }

  return scanner;
}

// Helper function to check if OpenCV is loaded
export function isOpenCVReady(): boolean {
  if (typeof window !== 'undefined') {
    return !!(window as any).cv && !!(window as any).cv.Mat;
  }
  return !!cv && !!(cv as any).Mat;
}
