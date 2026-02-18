interface PauseMenuProps {
  onResume: () => void;
  onQuit: () => void;
}

export function PauseMenu({ onResume, onQuit }: PauseMenuProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#284B79] border-2 border-white/20 rounded-2xl p-8 space-y-4">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">Paused</h2>
        <button
          onClick={onResume}
          className="w-full px-6 py-3 bg-white/20 border border-white/20 rounded-lg text-white hover:bg-white/30"
        >
          Resume
        </button>
        <button
          onClick={onQuit}
          className="w-full px-6 py-3 bg-white/20 border border-white/20 rounded-lg text-white hover:bg-white/30"
        >
          Quit
        </button>
      </div>
    </div>
  );
}
