
import CameraInterface from '@/components/CameraInterface';
import BackgroundRecordingService from '@/components/BackgroundRecordingService';
import { useState } from 'react';

const Index = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingState, setRecordingState] = useState({ isBackground: false, duration: 0 });

  return (
    <div className="min-h-screen bg-black">
      <CameraInterface />
      <BackgroundRecordingService 
        isRecording={isRecording}
        onRecordingStateChange={setRecordingState}
      />
    </div>
  );
};

export default Index;
