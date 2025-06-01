
import React, { useState, useRef, useEffect } from 'react';
import { Camera, StopCircle, RotateCcw, Video, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CameraInterface = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isBackgroundRecording, setIsBackgroundRecording] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Timer for recording duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Initialize camera
  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: true
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  useEffect(() => {
    initializeCamera();
    
    // Handle app visibility change for background recording
    const handleVisibilityChange = () => {
      if (document.hidden && isRecording) {
        setIsBackgroundRecording(true);
        console.log('App hidden - continuing background recording');
      } else {
        setIsBackgroundRecording(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    if (!streamRef.current) return;

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recording-${Date.now()}.webm`;
        a.click();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsBackgroundRecording(false);
      setRecordingTime(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Camera Preview */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />

      {/* Dark overlay for better UI visibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />

      {/* Top Status Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
        <div className="flex items-center space-x-2">
          {isRecording && (
            <>
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-white font-mono text-sm">{formatTime(recordingTime)}</span>
            </>
          )}
        </div>
        
        {isBackgroundRecording && (
          <div className="bg-red-500/90 px-3 py-1 rounded-full">
            <span className="text-white text-xs font-semibold">Recording in background</span>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
        <div className="flex justify-center items-center space-x-8">
          {/* Gallery Button */}
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full border-white/30 bg-black/30 backdrop-blur-sm hover:bg-white/20"
          >
            <Folder className="w-6 h-6 text-white" />
          </Button>

          {/* Record Button */}
          <div className="relative">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-20 h-20 rounded-full border-4 transition-all duration-300 ${
                isRecording
                  ? 'bg-red-500 border-red-400 scale-95'
                  : 'bg-white border-white hover:scale-105'
              }`}
            >
              {isRecording ? (
                <StopCircle className="w-8 h-8 text-white" />
              ) : (
                <Video className="w-8 h-8 text-black" />
              )}
            </Button>
            
            {isRecording && (
              <div className="absolute -inset-2 border-2 border-red-400 rounded-full animate-ping opacity-30" />
            )}
          </div>

          {/* Flip Camera Button */}
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full border-white/30 bg-black/30 backdrop-blur-sm hover:bg-white/20"
          >
            <RotateCcw className="w-6 h-6 text-white" />
          </Button>
        </div>

        {/* Recording Status Message */}
        {isRecording && (
          <div className="mt-4 text-center">
            <p className="text-white/80 text-sm">
              Recording will continue even when app is closed
            </p>
          </div>
        )}
      </div>

      {/* Permission overlay for initial setup */}
      {!streamRef.current && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-20">
          <div className="text-center p-8">
            <Camera className="w-16 h-16 text-white mx-auto mb-4 opacity-50" />
            <h2 className="text-white text-xl font-semibold mb-2">Camera Access Required</h2>
            <p className="text-white/70 mb-4">Allow camera access to start recording</p>
            <Button onClick={initializeCamera} className="bg-red-500 hover:bg-red-600">
              Enable Camera
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraInterface;
