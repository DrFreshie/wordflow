import React, { createContext, useContext, useState, useCallback } from 'react';

export interface KeystrokeEvent {
  timestamp: number;
  action: 'insert' | 'delete' | 'deleteWord';
  position: number;
  content: string;
}

interface RecordingContextType {
  recording: KeystrokeEvent[];
  isRecording: boolean;
  currentText: string;
  startRecording: () => void;
  stopRecording: () => void;
  addKeystroke: (event: KeystrokeEvent) => void;
  updateText: (text: string) => void;
  clearRecording: () => void;
  loadRecording: (recording: KeystrokeEvent[]) => void;
}

const RecordingContext = createContext<RecordingContextType | undefined>(undefined);

export const RecordingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recording, setRecording] = useState<KeystrokeEvent[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [currentText, setCurrentText] = useState('');

  // Start (or resume) recording. Do NOT clear text here so pause/resume keeps prior content.
  const startRecording = useCallback(() => {
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
  }, []);

  const addKeystroke = useCallback((event: KeystrokeEvent) => {
    setRecording(prev => [...prev, event]);
  }, []);

  const updateText = useCallback((text: string) => {
    setCurrentText(text);
  }, []);

  // Explicitly reset everything (used for "New" sessions)
  const clearRecording = useCallback(() => {
    setRecording([]);
    setCurrentText('');
    setIsRecording(false);
  }, []);

  const loadRecording = useCallback((newRecording: KeystrokeEvent[]) => {
    setRecording(newRecording);
  }, []);

  return (
    <RecordingContext.Provider
      value={{
        recording,
        isRecording,
        currentText,
        startRecording,
        stopRecording,
        addKeystroke,
        updateText,
        clearRecording,
        loadRecording,
      }}
    >
      {children}
    </RecordingContext.Provider>
  );
};

export const useRecording = () => {
  const context = useContext(RecordingContext);
  if (context === undefined) {
    throw new Error('useRecording must be used within a RecordingProvider');
  }
  return context;
};
