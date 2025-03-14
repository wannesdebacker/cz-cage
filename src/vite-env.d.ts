/// <reference types="vite/client" />

interface ImportMetaGlob {
    [key: string]: any;
  }
  
  interface ImportMeta {
    glob(
      pattern: string, 
      options?: { 
        eager?: boolean;
        as?: string;
      }
    ): ImportMetaGlob;
  }