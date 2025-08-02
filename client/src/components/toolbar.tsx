import { Button } from "@/components/ui/button";
import { Play, Fan, FileCode, Code, Shield } from "lucide-react";

interface ToolbarProps {
  onRunScript: () => void;
  onClearOutput: () => void;
  onLoadExample: () => void;
  isRunning: boolean;
}

export function Toolbar({ onRunScript, onClearOutput, onLoadExample, isRunning }: ToolbarProps) {
  return (
    <header className="px-4 py-3 flex items-center justify-between border-b" 
            style={{ background: 'var(--dark-800)', borderColor: 'var(--dark-600)' }}>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Code className="text-blue-400 h-5 w-5" />
          <h1 className="text-lg font-semibold">Lua Script Executor</h1>
          <span className="text-xs bg-blue-600 px-2 py-1 rounded-full">Roblox Sandbox</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <Button
          onClick={onRunScript}
          disabled={isRunning}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 font-medium transition-colors"
          size="sm"
        >
          {isRunning ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Running...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Run Script
            </>
          )}
        </Button>
        
        <Button
          onClick={onClearOutput}
          variant="secondary"
          className="bg-slate-600 hover:bg-slate-700 px-4 py-2 font-medium transition-colors"
          size="sm"
        >
          <Fan className="w-4 h-4 mr-2" />
          Clear Output
        </Button>
        
        <Button
          onClick={onLoadExample}
          variant="secondary"
          className="bg-blue-600 hover:bg-blue-700 px-3 py-2 font-medium transition-colors"
          size="sm"
        >
          <FileCode className="w-4 h-4" />
        </Button>
        
        <div className="flex items-center space-x-2 text-sm text-slate-400">
          <Shield className="w-4 h-4 text-green-400" />
          <span>Sandboxed</span>
        </div>
      </div>
    </header>
  );
}
