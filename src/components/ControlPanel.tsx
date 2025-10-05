import { useState } from 'react';
import { useRecording } from '@/contexts/RecordingContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const ControlPanel = () => {
  const { recording, isRecording, startRecording, stopRecording, currentText, clearRecording, loadRecording } = useRecording();
  const [mode, setMode] = useState<'write' | 'playback'>('write');

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
          <h2 className="text-2xl font-bold text-foreground mb-2">Upload</h2>
          <p className="text-muted-foreground text-sm">
            Upload student essay to review the writing process
          </p>
        </div>

        <div className="space-y-2">

          <div className="">
            <Button
              onClick={handleUploadRecording}
              variant="outline"
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Recording
            </Button>
          </div>

          <div className="">
            <Button
              onClick={handleClear}
              variant="outline"
              className="w-full text-destructive hover:text-destructive"
              disabled={isRecording}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
