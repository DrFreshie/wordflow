import { useEffect, useRef, useState } from 'react';
import { useRecording } from '@/contexts/RecordingContext';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Circle, Square, Pause, Play, RotateCcw, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';

export const WritingArea = () => {
  const { isRecording, startRecording, stopRecording, addKeystroke, updateText, currentText, recording, clearRecording } = useRecording();
  const [localText, setLocalText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastTextRef = useRef('');
  const [paused, setPaused] = useState(false);

  const handleStartStop = () => {
    if (isRecording) {
      stopRecording();
      setPaused(false);
      toast.success('Recording stopped');
    } else {
      startRecording();
      setPaused(false);
      toast.success('Recording started');
    }
  };

  const handlePause = () => {
    if (!isRecording) return;
    stopRecording();
    setPaused(true);
    toast.message('Paused', { description: 'Recording is paused. Click Resume to continue.' });
  };

  const handleResume = () => {
    if (isRecording) return;
    startRecording();
    setPaused(false);
    toast.success('Resumed recording');
  };

  const handleRestart = () => {
    const ok = window.confirm('Start over? This clears the current text and the recorded keystrokes.');
    if (!ok) return;
    if (isRecording) {
      stopRecording();
    }
    setPaused(false);
    setLocalText('');
    lastTextRef.current = '';
    updateText('');
    try { clearRecording?.(); } catch {}
    toast.success('Session reset');
  };

  useEffect(() => {
    if (isRecording && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isRecording]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isRecording) return;

    const newText = e.target.value;
    const cursorPosition = e.target.selectionStart;
    const oldText = lastTextRef.current;

    if (newText.length > oldText.length) {
      // Text was inserted
      const insertedText = newText.slice(cursorPosition - (newText.length - oldText.length), cursorPosition);
      addKeystroke({
        timestamp: Date.now(),
        action: 'insert',
        position: cursorPosition - insertedText.length,
        content: insertedText,
      });
    } else if (newText.length < oldText.length) {
      // Text was deleted
      const deletedCount = oldText.length - newText.length;
      addKeystroke({
        timestamp: Date.now(),
        action: 'delete',
        position: cursorPosition,
        content: oldText.slice(cursorPosition, cursorPosition + deletedCount),
      });
    }

    lastTextRef.current = newText;
    setLocalText(newText);
    updateText(newText);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
  };

  const handleCopy = (e: React.ClipboardEvent) => {
    e.preventDefault();
  };

  const handleCut = (e: React.ClipboardEvent) => {
    e.preventDefault();
  };

  return (
    <Card
      className={`p-6 shadow-lg transform transition-transform duration-500 ease-out will-change-transform ${
        isRecording ? '-translate-y-28' : 'translate-y-0'
      }`}
    >
      <div className="mb-4 flex justify-between items-start">
        <div className="flex flex-col items-start text-left">
          <h2 className="text-2xl font-bold text-foreground mb-2">{isRecording ? '' : 'Writing space'}</h2>
          <p className="text-muted-foreground text-sm">
            {isRecording ? '' : paused ? 'Paused — click Resume to continue' : 'Start recording to begin writing'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isRecording ? (
            <>
              <Button onClick={handlePause} variant="secondary" className="ml-4">
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
              <Button onClick={handleStartStop} variant="destructive">
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            </>
          ) : (
            <>
                            {localText.trim().length > 0 && (
                <Button onClick={handleRestart} variant="destructive" className="ml-4">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restart
                </Button>
              )}
              {paused ? (
                <Button onClick={handleResume} variant="default">
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </Button>
              ) : (
                <Button onClick={handleStartStop} variant="default">
                  <Circle className="h-4 w-4 mr-2" />
                  Record
                </Button>
              )}
            </>
          )}
        </div>
      </div>
      <Textarea
        ref={textareaRef}
        value={localText}
        onChange={handleChange}
        onPaste={handlePaste}
        onCopy={handleCopy}
        onCut={handleCut}
        disabled={!isRecording}
        placeholder={isRecording ? "Start typing your essay here..." : "Click 'Record' to begin"}
        className="min-h-[400px] text-base leading-relaxed resize-none font-serif"
        style={{ userSelect: isRecording ? 'text' : 'none' }}
      />
      <div className="mt-4 text-sm text-muted-foreground">
        Word count: {localText.trim().split(/\s+/).filter(Boolean).length} | Character count: {localText.length}
      </div>
      {!isRecording && (
        <div className="mt-4 flex justify-end gap-2">
          <Button
            onClick={async () => {
              if (!localText.trim()) {
                toast.error('No text to download');
                return;
              }

              const content = localText.trim();

              // Build paragraphs: split on blank lines; keep single line breaks within a paragraph
              const paragraphs = content.split(/\n{2,}/).map((para) => {
                const lines = para.split(/\n/);
                const runs: TextRun[] = [];
                lines.forEach((line, idx) => {
                  if (idx > 0) runs.push(new TextRun({ break: 1 }));
                  runs.push(new TextRun({ text: line }));
                });
                return new Paragraph({
                  children: runs,
                  spacing: { after: 240 }, // 12pt after
                });
              });

              const doc = new Document({
                styles: {
                  paragraphStyles: [
                    {
                      id: 'Normal',
                      name: 'Normal',
                      basedOn: 'Normal',
                      next: 'Normal',
                      run: { font: 'Aptos (Body)', size: 24 }, // 24 half-points = 12pt
                    },
                  ],
                },
                sections: [
                  {
                    properties: {},
                    children: paragraphs,
                  },
                ],
              });

              try {
                const blob = await Packer.toBlob(doc);
                saveAs(blob, `essay-${Date.now()}.docx`);
                toast.success('Word (.docx) file downloaded');
              } catch (err) {
                console.error(err);
                toast.error('Failed to generate .docx');
              }
            }}
            variant="outline"
            disabled={!localText.trim()}
          >
            <FileText className="h-4 w-4 mr-2" />
            Download Essay
          </Button>

          <Button
            onClick={() => {
              if (!recording || recording.length === 0) {
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
            }}
            variant="outline"
            disabled={!recording || recording.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Recording
          </Button>
        </div>
      )}
    </Card>
  );
};
