import { StorageManager } from '../utils/storage';
import { ImageReplacer } from './image-replacer';

/**
 * Initialize the content script
 */
async function initialize(): Promise<void> {
  // Get settings from storage
  const settings = await StorageManager.getSettings();
  
  // Create image replacer
  const imageReplacer = new ImageReplacer(settings);
  
  // Start image replacement
  imageReplacer.start();
  
  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === 'updateSettings') {
      imageReplacer.updateSettings(message.settings);
      sendResponse({ success: true });
    }
    return true; // Keep the message channel open for async responses
  });
}

// Run initialization when the page is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}