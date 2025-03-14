/**
 * Types for the extension settings
 */
export interface Settings {
    replacementRate: number;
  }
  
  /**
   * Default settings for the extension
   */
  export const DEFAULT_SETTINGS: Settings = {
    replacementRate: 1,
  };
  
  /**
   * Class to manage extension settings storage
   */
  export class StorageManager {
    /**
     * Get all settings from storage
     * @returns Promise with the settings
     */
    static async getSettings(): Promise<Settings> {
      return new Promise((resolve) => {
        chrome.storage.sync.get(DEFAULT_SETTINGS, (items) => {
          resolve(items as Settings);
        });
      });
    }
  
    /**
     * Save settings to storage
     * @param settings Settings to save
     * @returns Promise that resolves when settings are saved
     */
    static async saveSettings(settings: Partial<Settings>): Promise<void> {
      return new Promise((resolve) => {
        chrome.storage.sync.set(settings, () => {
          resolve();
        });
      });
    }
  }