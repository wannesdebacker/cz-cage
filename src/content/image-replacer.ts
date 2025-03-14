import { Settings } from '../utils/storage';

// This will be populated by the import.meta.glob function during build
// Using the modern syntax with query: '?url' instead of the deprecated as: 'url'
const imageModules = import.meta.glob('/public/images/*.{jpg,jpeg,png,gif}', { eager: true, query: '?url', import: 'default' });

/**
 * Class that handles image replacement functionality
 */
export class ImageReplacer {
  // Array to store all image paths
  private readonly colleagueImages: string[];

  // Set to track replaced images
  private replacedImages: Set<HTMLImageElement> = new Set();
  
  // Saved settings
  private settings: Settings;
  
  // Mutation observer to watch for DOM changes
  private observer: MutationObserver;

  /**
   * Initialize the image replacer
   * @param settings Current extension settings
   */
  constructor(settings: Settings) {
    this.settings = settings;
    this.observer = new MutationObserver(this.handleMutations.bind(this));
    
    // Extract image paths from the loaded modules
    this.colleagueImages = Object.keys(imageModules).map(path => {
      // Convert full path to relative path for chrome.runtime.getURL
      // Example: '/public/images/test1.jpg' -> 'images/test1.jpg'
      return path.replace('/public/', '');
    });
    
    console.log('Loaded images:', this.colleagueImages);
  }

  /**
   * Start the image replacement process
   */
  public start(): void {
    // Check if we have any images to use
    if (this.colleagueImages.length === 0) {
      console.error('No images found in the images folder');
      return;
    }
    
    // Replace images initially
    this.replaceImages();
    
    // Start observing DOM changes
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Stop the image replacement process
   */
  public stop(): void {
    this.observer.disconnect();
  }

  /**
   * Update settings and re-apply image replacements
   * @param settings New settings to apply
   */
  public updateSettings(settings: Settings): void {
    this.settings = settings;
    this.resetImages();
    this.replaceImages();
  }

  /**
   * Reset all previously replaced images to their original sources
   */
  private resetImages(): void {
    document.querySelectorAll<HTMLImageElement>('[data-czcage-replaced="true"]').forEach((img) => {
      const originalSrc = img.getAttribute('data-czcage-original');
      const originalSrcset = img.getAttribute('data-czcage-original-srcset');
      
      if (originalSrc) {
        img.src = originalSrc;
      }
      
      if (originalSrcset) {
        img.srcset = originalSrcset;
      } else {
        img.removeAttribute('srcset');
      }
      
      img.removeAttribute('data-czcage-replaced');
      img.removeAttribute('data-czcage-original');
      img.removeAttribute('data-czcage-original-srcset');
    });
    
    this.replacedImages.clear();
  }

  /**
   * Check if an image should be excluded from replacement
   * @param img The image element to check
   * @param src The image source URL
   * @returns Boolean indicating if the image should be excluded
   */
  private shouldExcludeImage(img: HTMLImageElement, src: string): boolean {
    // Skip SVGs
    if (src.toLowerCase().endsWith('.svg') || src.includes('.svg?')) {
      return true;
    }
    
    // Skip images with "logo" in the URL or alt text or class name
    const altText = img.alt?.toLowerCase() || '';
    const className = img.className?.toLowerCase() || '';
    const srcLower = src.toLowerCase();
    
    if (
      srcLower.includes('logo') || 
      altText.includes('logo') || 
      className.includes('logo')
    ) {
      return true;
    }
    
    return false;
  }

  /**
   * Replace images on the page based on current settings
   */
  private replaceImages(): void {
    // Get all non-replaced images
    const images = document.querySelectorAll<HTMLImageElement>('img:not([data-czcage-replaced])');
    
    // Calculate how many images to replace based on the rate
    const replaceCount = Math.ceil(images.length * (this.settings.replacementRate / 100));
    
    // Convert NodeList to Array and shuffle it
    const shuffledImages = Array.from(images).sort(() => 0.5 - Math.random());
    
    // Replace only the calculated number of images
    for (let i = 0; i < replaceCount && i < shuffledImages.length; i++) {
      this.replaceImage(shuffledImages[i]);
    }
  }

  /**
   * Replace a single image with a colleague image
   * @param img The image element to replace
   */
  private replaceImage(img: HTMLImageElement): void {
    // Skip already replaced images or tiny images
    if (
      this.replacedImages.has(img) || 
      (img.width < 50 && img.height < 50) || 
      img.src.startsWith('chrome-extension://')
    ) {
      return;
    }
    
    try {
      // Store original source and srcset
      const originalSrc = img.src;
      
      // Skip SVGs and logos
      if (this.shouldExcludeImage(img, originalSrc)) {
        return;
      }
      
      const originalSrcset = img.srcset;
      
      // Mark as replaced
      img.setAttribute('data-czcage-replaced', 'true');
      img.setAttribute('data-czcage-original', originalSrc);
      
      if (originalSrcset) {
        img.setAttribute('data-czcage-original-srcset', originalSrcset);
      }
      
      // Clear srcset to prevent it from overriding our replacement
      img.removeAttribute('srcset');
      
      // Replace with random colleague image using chrome.runtime.getURL
      const imagePath = this.getRandomImage();
      const fullImageUrl = chrome.runtime.getURL(imagePath);
      img.src = fullImageUrl;
      
      // Log successful replacement for debugging
      console.log('Image replaced:', originalSrc, '→', fullImageUrl);
      
      // Add to set of replaced images
      this.replacedImages.add(img);
      
    } catch (error) {
      console.error('Error replacing image:', error);
    }
  }

  /**
   * Get a random colleague image path
   * @returns Random image path
   */
  private getRandomImage(): string {
    if (this.colleagueImages.length === 0) {
      console.error('No images available for replacement');
      return '';
    }
    return this.colleagueImages[Math.floor(Math.random() * this.colleagueImages.length)];
  }

  /**
   * Handle DOM mutations to replace new images
   * @param mutations List of mutations that occurred
   */
  private handleMutations(mutations: MutationRecord[]): void {
    let hasNewImages = false;
    
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'IMG' && !((node as HTMLElement).hasAttribute?.('data-czcage-replaced'))) {
            hasNewImages = true;
          } else if ((node as HTMLElement).querySelectorAll) {
            const images = (node as HTMLElement).querySelectorAll('img:not([data-czcage-replaced])');
            if (images.length > 0) {
              hasNewImages = true;
            }
          }
        });
      }
    });
    
    if (hasNewImages) {
      this.replaceImages();
    }
  }
}