
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.6cfa3db2fcf94a16ac3eb93ef634192c',
  appName: 'closed-eye-cam',
  webDir: 'dist',
  server: {
    url: 'https://6cfa3db2-fcf9-4a16-ac3e-b93ef634192c.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: ['camera', 'microphone']
    }
  }
};

export default config;
