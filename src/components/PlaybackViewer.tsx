import { useState, useEffect, useRef, useCallback } from 'react';
import { useRecording, KeystrokeEvent } from '@/contexts/RecordingContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, FastForward } from 'lucide-react';

export const PlaybackViewer = () => {
  const { recording } = useRecording();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [speed, setSpeed] = useState(1);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const applyKeystroke = (text: string, event: KeystrokeEvent): string => {
    if (event.action === 'insert') {
      return text.slice(0, event.position) + event.content + text.slice(event.position);
    } else if (event.action === 'delete') {
      return text.slice(0, event.position) + text.slice(event.position + event.content.length);
    }
    return text;
  };

  const computeTextUpTo = useCallback((idx: number) => {
    let text = '';
    const limit = Math.min(Math.max(0, idx), recording.length);
    for (let i = 0; i < limit; i++) {
      text = applyKeystroke(text, recording[i]);
    }
    return text;
  }, [recording]);

  useEffect(() => {
    if (isPlaying && currentIndex < recording.length) {
      const currentEvent = recording[currentIndex];
      const nextEvent = recording[currentIndex + 1];
      
      const delay = nextEvent 
        ? Math.max((nextEvent.timestamp - currentEvent.timestamp) / speed, 10)
        : 500;

      timeoutRef.current = setTimeout(() => {
        // displayText is derived from currentIndex; see separate effect
        setCurrentIndex(prev => prev + 1);
      }, delay);
    } else if (currentIndex >= recording.length) {
      setIsPlaying(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isPlaying, currentIndex, recording, speed]);

  useEffect(() => {
    setDisplayText(computeTextUpTo(currentIndex));
  }, [currentIndex, computeTextUpTo]);

  const handlePlayPause = () => {
    if (currentIndex >= recording.length) {
      handleReset();
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
    setDisplayText('');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleSpeedChange = (value: number[]) => {
    setSpeed(value[0]);
  };

  const maxIndex = Math.max(0, recording.length);

  return (
    <Card className="p-6 shadow-lg">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-foreground mb-2">Playback</h2>
        <p className="text-muted-foreground text-sm">
          Review the writing process
        </p>
      </div>

      <div className="mb-4 space-y-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={handlePlayPause}
            variant="default"
            size="sm"
            disabled={recording.length === 0}
          >
            {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isPlaying ? 'Pause' : currentIndex >= recording.length ? 'Replay' : 'Play'}
          </Button>
          <Button onClick={handleReset} variant="outline" size="sm" disabled={recording.length === 0}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <FastForward className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground w-8">{speed}x</span>
            <Slider
              value={[speed]}
              onValueChange={handleSpeedChange}
              min={0.5}
              max={5}
              step={0.5}
              className="w-24"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Progress</span>
            <span>Event {currentIndex} of {recording.length}</span>
          </div>
          <Slider
            value={[currentIndex]}
            onValueChange={(val) => {
              const idx = Math.min(Math.max(0, val[0]), maxIndex);
              setIsPlaying(false);
              setCurrentIndex(idx);
            }}
            min={0}
            max={Math.max(1, maxIndex)}
            step={1}
            className="w-full"
          />
        </div>
      </div>

      <div className="min-h-[400px] p-4 border rounded-lg bg-muted/30 overflow-y-auto">
        <div className="whitespace-pre-wrap font-serif text-base leading-relaxed text-left">
          {displayText || (recording.length === 0 ? 'No recording available' : 'Click play to start playback')}
        </div>
      </div>
    </Card>
  );
};
