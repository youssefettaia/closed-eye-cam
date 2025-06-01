
import { useEffect } from 'react';

interface BackgroundRecordingServiceProps {
  isRecording: boolean;
  onRecordingStateChange: (state: { isBackground: boolean; duration: number }) => void;
}

const BackgroundRecordingService = ({ isRecording, onRecordingStateChange }: BackgroundRecordingServiceProps) => {
  useEffect(() => {
    if (!isRecording) return;

    let wakeLock: any = null;
    let startTime = Date.now();

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
          console.log('Wake lock acquired for continuous recording');
        }
      } catch (error) {
        console.error('Could not acquire wake lock:', error);
      }
    };

    const handleVisibilityChange = () => {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      
      if (document.hidden) {
        console.log('App backgrounded - maintaining recording');
        onRecordingStateChange({ isBackground: true, duration });
        
        // Show notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Camera App', {
            body: 'Recording continues in background',
            icon: '/favicon.ico',
            badge: '/favicon.ico'
          });
        }
      } else {
        console.log('App foregrounded - resuming normal recording');
        onRecordingStateChange({ isBackground: false, duration });
      }
    };

    const requestNotificationPermission = async () => {
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    };

    // Initialize background recording capabilities
    requestWakeLock();
    requestNotificationPermission();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLock) {
        wakeLock.release();
      }
    };
  }, [isRecording, onRecordingStateChange]);

  return null;
};

export default BackgroundRecordingService;
