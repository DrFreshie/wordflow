import { useEffect, useRef, useState } from 'react';
import { useRecording } from '@/contexts/RecordingContext';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

export const WritingArea = () => {
  const { isRecording, addKeystroke, updateText, currentText } = useRecording();
  const [localText, setLocalText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastTextRef = useRef('');

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
    <Card className="p-6 shadow-lg">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-foreground mb-2">Write Your Essay</h2>
        <p className="text-muted-foreground text-sm">
          {isRecording ? 'Recording in progress...' : 'Start recording to begin writing'}
        </p>
      </div>
      <Textarea
        ref={textareaRef}
        value={localText}
        onChange={handleChange}
        onPaste={handlePaste}
        onCopy={handleCopy}
        onCut={handleCut}
        disabled={!isRecording}
        placeholder={isRecording ? "Start typing your essay here..." : "Click 'Start Recording' to begin"}
        className="min-h-[400px] text-base leading-relaxed resize-none font-serif"
        style={{ userSelect: isRecording ? 'text' : 'none' }}
      />
      <div className="mt-4 text-sm text-muted-foreground">
        Word count: {localText.trim().split(/\s+/).filter(Boolean).length} | Character count: {localText.length}
      </div>
    </Card>
  );
};
