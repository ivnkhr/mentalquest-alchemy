import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.mentalquest.alchemy',
  appName: 'MentalQuest Alchemy',
  webDir: 'dist/frontend/browser',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#3880ff',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: false,
      splashImmersive: false,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#3880ff',
    },
  },
};

export default config;
