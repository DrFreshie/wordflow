import { useState } from 'react';
import { RecordingProvider, useRecording } from '@/contexts/RecordingContext';
import { WritingArea } from '@/components/WritingArea';
import { PlaybackViewer } from '@/components/PlaybackViewer';
import { ControlPanel } from '@/components/ControlPanel';
import { PenTool } from 'lucide-react';

const Index = () => {
  const [view, setView] = useState<'write' | 'playback'>('write');
  return (
    <RecordingProvider>
      <div className="min-h-screen">
        <header className="">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-center gap-3">
              <div>
                <h1 className="text-6xl text-center">wordflow</h1>
                <p className="text-sm text-muted-foreground">Focused writing - better feedback</p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className={view === 'write' ? 'lg:col-span-3' : 'lg:col-span-2'}>
              <ViewSwitcher view={view} setView={setView} />
            </div>
            {view === 'playback' && (
              <div>
                <ControlPanel />
              </div>
            )}
          </div>
        </main>
      </div>
    </RecordingProvider>
  );
};

const ViewSwitcher = ({ view, setView }: { view: 'write' | 'playback'; setView: (v: 'write' | 'playback') => void; }) => {

  // Teacher PIN auth (stored for the session in localStorage)
  const TEACHER_PIN = (import.meta as any)?.env?.VITE_TEACHER_PIN || '2468';
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [authed, setAuthed] = useState<boolean>(() => {
    try { return localStorage.getItem('wf_teacher_ok') === '1'; } catch { return false; }
  });

  const { isRecording } = useRecording();

  function openTeacher(){
    if (authed) {
      setView('playback');
      return;
    }
    setPin('');
    setPinError('');
    setShowPin(true);
  }
  function cancelPin(){
    setShowPin(false);
    setPin('');
    setPinError('');
  }
  function submitPin(){
    if (pin.trim() === String(TEACHER_PIN)) {
      try { localStorage.setItem('wf_teacher_ok','1'); } catch {}
      setAuthed(true);
      setShowPin(false);
      setView('playback');
    } else {
      setPinError('Wrong PIN. Try again.');
    }
  }

  return (
    <>
      {/* Full-screen dimmer while writing & recording */}
      <div
        className={`fixed inset-0 z-30 pointer-events-none transition-all duration-500 ease-out will-change-[opacity,backdrop-filter] ${
          view === 'write' && isRecording
            ? 'bg-black/60 backdrop-blur-sm opacity-100'
            : 'bg-transparent backdrop-blur-0 opacity-0'
        }`}
      />

      {/* Main content above the dimmer */}
      <div className="relative z-40">
        {/* Main content switches between Write and Playback */}
        {view === 'write' ? <WritingArea /> : <PlaybackViewer />}

        {/* Floating mode switchers (bottom-right) */}
        {view === 'write' && !isRecording && (
          <button
            onClick={openTeacher}
            aria-label="Switch to Teacher (Playback) mode"
            className="fixed bottom-4 right-4 z-50 px-4 py-2 rounded-full font-medium shadow-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
            title="Teacher (PIN required)"
          >
            Teacher
          </button>
        )}

        {view === 'playback' && (
          <button
            onClick={() => setView('write')}
            aria-label="Switch to Student (Write) mode"
            className="fixed bottom-4 right-4 z-50 px-4 py-2 rounded-full font-medium shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            title="Student"
          >
            Student
          </button>
        )}

        {/* PIN Modal: 2468 */}
        {showPin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-sm rounded-xl bg-card text-card-foreground shadow-lg border border-border">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Teacher Access</h2>
                <p className="text-sm text-muted-foreground">Enter the teacher PIN to open Playback mode.</p>
              </div>
              <div className="p-4 space-y-3">
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => { setPin(e.target.value); setPinError(''); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') submitPin(); if (e.key === 'Escape') cancelPin(); }}
                  placeholder="PIN"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
                {pinError && <p className="text-sm text-destructive">{pinError}</p>}
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={cancelPin}
                    className="px-3 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitPin}
                    className="px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Unlock
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Index;
