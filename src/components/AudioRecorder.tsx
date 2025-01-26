import React, { useState, useRef } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    console.log('🎤 Starting audio recording...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('✅ Got audio stream:', {
        tracks: stream.getAudioTracks().length,
        settings: stream.getAudioTracks()[0].getSettings()
      });
      
      // Configure for optimal audio quality
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000 // 128kbps for good quality
      });

      console.log('✅ Created MediaRecorder:', {
        state: mediaRecorder.state,
        mimeType: mediaRecorder.mimeType,
        audioBitsPerSecond: mediaRecorder.audioBitsPerSecond
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log('📝 Received audio chunk:', {
            size: event.data.size,
            type: event.data.type
          });
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        console.log('✅ Recording completed:', {
          size: audioBlob.size,
          type: audioBlob.type,
          chunks: chunksRef.current.length,
          duration: chunksRef.current.reduce((acc, chunk) => acc + chunk.size, 0) / (128000 / 8), // Approximate duration in seconds
        });
        
        // Verify the blob is valid
        const url = URL.createObjectURL(audioBlob);
        const audio = new Audio(url);
        audio.onloadedmetadata = () => {
          console.log('✅ Audio metadata loaded:', {
            duration: audio.duration,
            readyState: audio.readyState
          });
          URL.revokeObjectURL(url);
        };

        onRecordingComplete(audioBlob);
        
        // Clean up the stream
        stream.getTracks().forEach(track => {
          track.stop();
          console.log('✅ Stopped audio track:', {
            kind: track.kind,
            label: track.label
          });
        });
      };

      // Start recording
      mediaRecorder.start();
      console.log('🎙️ Recording started');
      setIsRecording(true);

      // Automatically stop after 30 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          console.log('⏱️ Auto-stopping recording after 30 seconds');
          stopRecording();
        }
      }, 30000);

    } catch (error) {
      console.error('❌ Failed to start recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      gap: 1
    }}>
      <IconButton
        onClick={isRecording ? stopRecording : startRecording}
        sx={{
          width: 80,
          height: 80,
          bgcolor: isRecording ? 'error.main' : 'primary.main',
          '&:hover': {
            bgcolor: isRecording ? 'error.dark' : 'primary.dark',
          },
        }}
      >
        {isRecording ? <StopIcon fontSize="large" /> : <MicIcon fontSize="large" />}
      </IconButton>
      <Typography variant="body2" sx={{ color: 'white' }}>
        {isRecording ? 'Recording... (max 30s)' : 'Click to Record'}
      </Typography>
    </Box>
  );
};

export default AudioRecorder;
