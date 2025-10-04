import { useState } from 'react';
import { RecordingProvider } from '@/contexts/RecordingContext';
import { WritingArea } from '@/components/WritingArea';
import { PlaybackViewer } from '@/components/PlaybackViewer';
import { ControlPanel } from '@/components/ControlPanel';
import { PenTool } from 'lucide-react';

const Index = () => {
  return (
    <RecordingProvider>
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <PenTool className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">WordFlow</h1>
                <p className="text-sm text-muted-foreground">Record and playback your writing process</p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ViewSwitcher />
            </div>
            <div>
              <ControlPanel />
            </div>
          </div>
        </main>
      </div>
    </RecordingProvider>
  );
};

const ViewSwitcher = () => {
  const [view, setView] = useState<'write' | 'playback'>('write');

  return (
    <>
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setView('write')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            view === 'write'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          Write Mode
        </button>
        <button
          onClick={() => setView('playback')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            view === 'playback'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          Playback Mode
        </button>
      </div>
      {view === 'write' ? <WritingArea /> : <PlaybackViewer />}
    </>
  );
};

export default Index;
