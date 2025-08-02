import { Circle, MemoryStick, Clock, Settings, HelpCircle } from "lucide-react";

interface StatusBarProps {
  isRunning: boolean;
  executionTime: number;
  memoryUsage: number;
  linesCount: number;
  charactersCount: number;
}

export function StatusBar({ 
  isRunning, 
  executionTime, 
  memoryUsage, 
  linesCount, 
  charactersCount 
}: StatusBarProps) {
  return (
    <footer className="px-4 py-2 border-t flex items-center justify-between text-xs text-slate-400" 
            style={{ background: 'var(--dark-800)', borderColor: 'var(--dark-600)' }}>
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <Circle className={`w-2 h-2 ${isRunning ? 'text-yellow-400' : 'text-green-400'} fill-current`} />
          <span>Lua Engine {isRunning ? 'Running' : 'Ready'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <MemoryStick className="w-3 h-3 text-blue-400" />
          <span>MemoryStick: {(memoryUsage / 1024).toFixed(1)}KB / 50MB</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-3 h-3 text-yellow-400" />
          <span>Last execution: {executionTime}ms</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>Lines: {linesCount}</span>
          <span>Characters: {charactersCount}</span>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <span>Roblox Sandbox v1.0</span>
        <button className="hover:text-slate-300">
          <Settings className="w-3 h-3" />
        </button>
        <button className="hover:text-slate-300">
          <HelpCircle className="w-3 h-3" />
        </button>
      </div>
    </footer>
  );
}
