import { useState, useRef } from 'react';
import { Button, Box } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
}

export default function AudioRecorder({ onRecordingComplete }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onRecordingComplete(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
      <Button
        variant="contained"
        color={isRecording ? "secondary" : "primary"}
        onClick={isRecording ? stopRecording : startRecording}
        startIcon={isRecording ? <StopIcon /> : <MicIcon />}
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </Button>
    </Box>
  );
}
