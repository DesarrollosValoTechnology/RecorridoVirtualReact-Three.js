import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.supraterra.tour',
  appName: 'SupraterraVT',
  webDir: 'dist',
  
  // 👇 Este es el salvavidas que evita que el WebView bloquee tus archivos JS
  server: {
    androidScheme: 'https' 
  }
};

export default config;