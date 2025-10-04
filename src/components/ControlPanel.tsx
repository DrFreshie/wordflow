import { useState } from 'react';
import { useRecording } from '@/contexts/RecordingContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Upload, Circle, Square, FileText, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const ControlPanel = () => {
  const { recording, isRecording, startRecording, stopRecording, currentText, clearRecording, loadRecording } = useRecording();
  const [mode, setMode] = useState<'write' | 'playback'>('write');

  const handleStartStop = () => {
    if (isRecording) {
      stopRecording();
      toast.success('Recording stopped');
    } else {
      startRecording();
      toast.success('Recording started');
    }
  };

  const handleDownloadRecording = () => {
    if (recording.length === 0) {
      toast.error('No recording to download');
      return;
    }

    const dataStr = JSON.stringify(recording, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `essay-recording-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Recording downloaded');
  };

  const handleDownloadText = () => {
    if (!currentText.trim()) {
      toast.error('No text to download');
      return;
    }

    const dataBlob = new Blob([currentText], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `essay-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Essay downloaded');
  };

  const handleUploadRecording = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target?.result as string);
            loadRecording(data);
            setMode('playback');
            toast.success('Recording loaded successfully');
          } catch (error) {
            toast.error('Invalid recording file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear the current recording and text?')) {
      clearRecording();
      toast.success('Recording cleared');
    }
  };

  return (
    <Card className="p-6 shadow-lg">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Controls</h2>
          <p className="text-muted-foreground text-sm">
            Manage your essay recording
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => setMode('write')}
            variant={mode === 'write' ? 'default' : 'outline'}
            className="flex-1"
          >
            Write
          </Button>
          <Button
            onClick={() => setMode('playback')}
            variant={mode === 'playback' ? 'default' : 'outline'}
            className="flex-1"
            disabled={recording.length === 0}
          >
            Playback
          </Button>
        </div>

        <div className="space-y-2">
          <Button
            onClick={handleStartStop}
            variant={isRecording ? 'destructive' : 'default'}
            className="w-full"
            disabled={mode !== 'write'}
          >
            {isRecording ? (
              <>
                <Square className="h-4 w-4 mr-2" />
                Stop Recording
              </>
            ) : (
              <>
                <Circle className="h-4 w-4 mr-2" />
                Start Recording
              </>
            )}
          </Button>

          <div className="pt-4 space-y-2 border-t">
            <h3 className="text-sm font-semibold text-foreground mb-2">Downloads</h3>
            <Button
              onClick={handleDownloadRecording}
              variant="outline"
              className="w-full"
              disabled={recording.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Recording (.json)
            </Button>
            <Button
              onClick={handleDownloadText}
              variant="outline"
              className="w-full"
              disabled={!currentText.trim()}
            >
              <FileText className="h-4 w-4 mr-2" />
              Download Essay (.txt)
            </Button>
          </div>

          <div className="pt-4 space-y-2 border-t">
            <h3 className="text-sm font-semibold text-foreground mb-2">Load Recording</h3>
            <Button
              onClick={handleUploadRecording}
              variant="outline"
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Recording
            </Button>
          </div>

          <div className="pt-4 border-t">
            <Button
              onClick={handleClear}
              variant="outline"
              className="w-full text-destructive hover:text-destructive"
              disabled={isRecording}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t space-y-1 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Status:</span>
            <span className="font-medium">{isRecording ? 'Recording' : 'Stopped'}</span>
          </div>
          <div className="flex justify-between">
            <span>Keystrokes:</span>
            <span className="font-medium">{recording.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Mode:</span>
            <span className="font-medium capitalize">{mode}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
