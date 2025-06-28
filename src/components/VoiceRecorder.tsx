import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Square, Play, Pause, Volume2, RotateCcw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ 
  onTranscription, 
  placeholder = "Tap the microphone to start recording...",
  className = "",
  label = "Voice Input"
}) => {
  const { isDark } = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [transcription, setTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [volume, setVolume] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const volumeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const isStoppingIntentionallyRef = useRef<boolean>(false);
  
  // Maximum recording time in seconds (2 minutes = 120 seconds)
  const MAX_RECORDING_TIME = 120;

  useEffect(() => {
    // Check for speech recognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const fullTranscript = finalTranscript || interimTranscript;
        setTranscription(fullTranscript);
        onTranscription(fullTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        
        // Check if this is an intentional stop (aborted error when user stops recording)
        if (event.error === 'aborted' && isStoppingIntentionallyRef.current) {
          // This is expected behavior when stopping recording intentionally
          isStoppingIntentionallyRef.current = false;
          return;
        }
        
        // Only show error for unexpected errors
        if (event.error !== 'aborted') {
          setError(`Speech recognition error: ${event.error}`);
        }
        
        setIsRecording(false);
        setIsTranscribing(false);
        isStoppingIntentionallyRef.current = false;
      };

      recognitionRef.current.onend = () => {
        setIsTranscribing(false);
        isStoppingIntentionallyRef.current = false;
      };
    }

    return () => {
      if (recognitionRef.current) {
        isStoppingIntentionallyRef.current = true;
        recognitionRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (volumeIntervalRef.current) {
        clearInterval(volumeIntervalRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [onTranscription]);

  const startRecording = async () => {
    try {
      setError(null);
      isStoppingIntentionallyRef.current = false;
      audioChunksRef.current = []; // Clear previous audio chunks
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;

      // Set up audio context for volume monitoring
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      // Start volume monitoring
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      volumeIntervalRef.current = setInterval(() => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setVolume(Math.min(100, (average / 128) * 100));
        }
      }, 100);

      // Set up media recorder for audio playback
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
      };

      // Start recording with small timeslice to ensure continuous data collection
      mediaRecorderRef.current.start(1000); // Collect data every second

      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsTranscribing(true);
      }

      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          // Auto-stop recording when reaching max time
          if (prev >= MAX_RECORDING_TIME - 1) {
            stopRecording();
            return MAX_RECORDING_TIME;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    // Set flag to indicate intentional stop
    isStoppingIntentionallyRef.current = true;
    
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (volumeIntervalRef.current) {
      clearInterval(volumeIntervalRef.current);
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    setIsRecording(false);
    setIsTranscribing(false);
    setVolume(0);
  };

  const playAudio = () => {
    if (audioURL && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const clearRecording = () => {
    setAudioURL(null);
    setTranscription('');
    setRecordingTime(0);
    setError(null);
    onTranscription('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate recording progress percentage
  const recordingProgress = (recordingTime / MAX_RECORDING_TIME) * 100;

  return (
    <div className={`space-y-4 ${className}`}>
      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
        {label}
      </label>

      {/* Recording Controls */}
      <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        isRecording 
          ? isDark ? 'border-red-500 bg-red-900/20' : 'border-red-500 bg-red-50'
          : isDark ? 'border-gray-600 bg-gray-700/50' : 'border-gray-300 bg-gray-50'
      }`}>
        
        {/* Microphone Button */}
        <div className="flex flex-col items-center space-y-4">
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isTranscribing && !isRecording}
            className={`relative p-6 rounded-full transition-all duration-200 transform hover:scale-105 ${
              isRecording
                ? isDark ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'
                : isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}
          >
            {isRecording ? (
              <Square className="h-8 w-8" />
            ) : (
              <Mic className="h-8 w-8" />
            )}
            
            {/* Recording pulse animation */}
            {isRecording && (
              <div className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-75"></div>
            )}
          </button>

          {/* Status Text */}
          <div className="text-center">
            {isRecording ? (
              <div className="space-y-2">
                <p className={`text-lg font-semibold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                  🔴 Recording... {formatTime(recordingTime)}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Speak clearly into your microphone
                </p>
                
                {/* Recording progress bar */}
                <div className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden mt-2">
                  <div 
                    className="h-full bg-red-500 transition-all duration-100"
                    style={{ width: `${recordingProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTime(recordingTime)} / {formatTime(MAX_RECORDING_TIME)}
                </p>
                
                {/* Volume indicator */}
                <div className="flex items-center justify-center space-x-2 mt-2">
                  <Volume2 className="h-4 w-4" />
                  <div className="w-32 h-2 bg-gray-300 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all duration-100"
                      style={{ width: `${volume}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ) : isTranscribing ? (
              <p className={`text-lg font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                Processing speech...
              </p>
            ) : (
              <div className="space-y-2">
                <p className={`text-lg font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  🎤 Tap to Start Recording
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {placeholder}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Audio Playback Controls */}
      {audioURL && (
        <div className={`flex items-center justify-center space-x-4 p-4 rounded-lg ${
          isDark ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          <button
            type="button"
            onClick={playAudio}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isDark 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{isPlaying ? 'Pause' : 'Play'} Recording</span>
          </button>

          <button
            type="button"
            onClick={clearRecording}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              isDark 
                ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
          >
            <RotateCcw className="h-4 w-4" />
            <span>Clear</span>
          </button>

          <audio
            ref={audioRef}
            src={audioURL}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        </div>
      )}

      {/* Transcription Display */}
      {transcription && (
        <div className={`p-4 rounded-lg border ${
          isDark 
            ? 'bg-green-900/20 border-green-800 text-green-200' 
            : 'bg-green-50 border-green-200 text-green-800'
        }`}>
          <h4 className="font-semibold mb-2 flex items-center">
            <Mic className="h-4 w-4 mr-2" />
            Transcribed Text:
          </h4>
          <p className="text-sm leading-relaxed">{transcription}</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className={`p-4 rounded-lg border ${
          isDark 
            ? 'bg-red-900/20 border-red-800 text-red-200' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Browser Support Notice */}
      {!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window) && (
        <div className={`p-4 rounded-lg border ${
          isDark 
            ? 'bg-yellow-900/20 border-yellow-800 text-yellow-200' 
            : 'bg-yellow-50 border-yellow-200 text-yellow-800'
        }`}>
          <p className="text-sm">
            Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari for the best experience.
          </p>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;