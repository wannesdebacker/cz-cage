import { StorageManager, DEFAULT_SETTINGS, Settings } from '../utils/storage';

/**
 * Popup UI Manager
 */
class PopupUI {
  // DOM Elements
  private replacementRateSlider: HTMLInputElement;
  private rateValueDisplay: HTMLElement;
  private saveButton: HTMLElement;
  private resetButton: HTMLElement;
  private statusDiv: HTMLElement;
  
  /**
   * Initialize the popup UI
   */
  constructor() {
    // Get DOM elements
    this.replacementRateSlider = document.getElementById('replacementRate') as HTMLInputElement;
    this.rateValueDisplay = document.getElementById('rateValue') as HTMLElement;
    this.saveButton = document.getElementById('saveButton') as HTMLElement;
    this.resetButton = document.getElementById('resetButton') as HTMLElement;
    this.statusDiv = document.getElementById('status') as HTMLElement;
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Load saved settings
    this.loadSettings();
  }
  
  /**
   * Set up event listeners for UI elements
   */
  private setupEventListeners(): void {
    // Update value display when slider changes
    this.replacementRateSlider.addEventListener('input', () => {
      this.updateRateDisplay();
    });
    
    // Save settings button
    this.saveButton.addEventListener('click', async () => {
      await this.saveSettings();
    });
    
    // Reset button
    this.resetButton.addEventListener('click', async () => {
      await this.resetSettings();
    });
  }
  
  /**
   * Load saved settings from storage
   */
  private async loadSettings(): Promise<void> {
    try {
      const settings = await StorageManager.getSettings();
      this.replacementRateSlider.value = settings.replacementRate.toString();
      this.updateRateDisplay();
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }
  
  /**
   * Save current settings to storage
   */
  private async saveSettings(): Promise<void> {
    try {
      const settings: Partial<Settings> = {
        replacementRate: parseInt(this.replacementRateSlider.value),
      };
      
      await StorageManager.saveSettings(settings);
      
      // Show success message
      this.showStatusMessage('Settings saved!', 'success');
      
      // Send message to content script
      await this.sendMessageToContentScript({
        action: 'updateSettings',
        settings
      });
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }
  
  /**
   * Reset settings to defaults
   */
  private async resetSettings(): Promise<void> {
    try {
      // Reset UI
      this.replacementRateSlider.value = DEFAULT_SETTINGS.replacementRate.toString();
      this.updateRateDisplay();
      
      // Save default settings
      await StorageManager.saveSettings(DEFAULT_SETTINGS);
      
      // Show success message
      this.showStatusMessage('Settings reset to defaults!', 'success');
      
      // Send message to content script
      await this.sendMessageToContentScript({
        action: 'updateSettings',
        settings: DEFAULT_SETTINGS
      });
    } catch (error) {
      console.error('Error resetting settings:', error);
    }
  }
  
  /**
   * Update the rate display based on slider value
   */
  private updateRateDisplay(): void {
    this.rateValueDisplay.textContent = `${this.replacementRateSlider.value}%`;
  }
  
  /**
   * Show a status message
   * @param message Message to display
   * @param type Type of message (e.g., 'success')
   */
  private showStatusMessage(message: string, type: string): void {
    this.statusDiv.textContent = message;
    this.statusDiv.className = `status ${type} visible`;
    
    // Clear message after 2 seconds
    setTimeout(() => {
      this.statusDiv.className = 'status';
    }, 2000);
  }
  
  /**
   * Send a message to the active tab's content script
   * @param message Message to send
   * @returns Promise with the response
   */
  private async sendMessageToContentScript(message: any): Promise<any> {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs[0]?.id) {
        return chrome.tabs.sendMessage(tabs[0].id, message);
      }
    } catch (error) {
      console.error('Error sending message to content script:', error);
    }
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupUI();
});