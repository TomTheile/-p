import { useRef, useEffect, useState } from "react";
import { Terminal, Download, Shield, Book } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ConsoleOutputProps {
  output: Array<{ type: 'info' | 'output' | 'error' | 'warning'; message: string; timestamp: string }>;
  isRunning: boolean;
  executionTime: number;
  memoryUsage: number;
  onDirectCommand: (command: string) => void;
}

export function ConsoleOutput({ 
  output, 
  isRunning, 
  executionTime, 
  memoryUsage, 
  onDirectCommand 
}: ConsoleOutputProps) {
  const outputRef = useRef<HTMLDivElement>(null);
  const [directCommand, setDirectCommand] = useState("");

  useEffect(() => {
    // Auto-scroll to bottom when new output is added
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const handleDirectCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (directCommand.trim()) {
      onDirectCommand(directCommand.trim());
      setDirectCommand("");
    }
  };

  const exportLog = () => {
    const logContent = output.map(item => `[${item.timestamp}] ${item.message}`).join('\n');
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lua-console-log.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-2/5 flex flex-col" style={{ background: 'var(--dark-900)' }}>
      {/* Console Header */}
      <div className="px-4 py-2 border-b flex items-center justify-between" 
           style={{ background: 'var(--dark-700)', borderColor: 'var(--dark-600)' }}>
        <div className="flex items-center space-x-3">
          <Terminal className="w-4 h-4 text-green-400" />
          <span className="font-medium">Output Console</span>
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-400 animate-pulse' : 'bg-slate-400'}`} />
            <span className={`text-xs ${isRunning ? 'text-green-400' : 'text-slate-400'}`}>
              {isRunning ? 'Running' : 'Ready'}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <span>Execution time: {executionTime}ms</span>
          <span>•</span>
          <span>Memory: {(memoryUsage / 1024).toFixed(1)}KB</span>
        </div>
      </div>
      
      {/* Console Content */}
      <div 
        ref={outputRef}
        className="flex-1 console-output p-4 font-mono text-sm overflow-y-auto custom-scrollbar"
        style={{ background: '#000000' }}
      >
        <div className="space-y-1">
          {output.map((item, index) => (
            <div key={index} className={getOutputLineStyle(item.type)}>
              {item.type === 'info' && (
                <div className="text-slate-400 text-xs">[{item.timestamp}] {item.message}</div>
              )}
              {item.type === 'output' && (
                <div className="text-white flex">
                  <span className="text-blue-400 mr-2">{'>'}</span>
                  <span>{item.message}</span>
                </div>
              )}
              {item.type === 'error' && (
                <div className="text-red-400 flex">
                  <span className="text-red-500 mr-2">!</span>
                  <span>{item.message}</span>
                </div>
              )}
              {item.type === 'warning' && (
                <div className="text-yellow-400 flex">
                  <span className="text-yellow-500 mr-2">⚠</span>
                  <span>{item.message}</span>
                </div>
              )}
            </div>
          ))}

          {/* Security Information */}
          <div className="mt-4 p-3 rounded border-l-4 border-yellow-500" style={{ background: 'var(--dark-800)' }}>
            <div className="text-yellow-400 text-xs font-semibold mb-1">
              <Shield className="w-3 h-3 mr-1 inline" />
              Security Information
            </div>
            <div className="text-slate-300 text-xs space-y-1">
              <div>• Blocked functions: io.*, os.*, debug.*, require</div>
              <div>• Execution timeout: 100ms limit</div>
              <div>• File system access: Disabled</div>
              <div>• Network access: Disabled</div>
            </div>
          </div>

          {/* API Reference */}
          <div className="mt-4 p-3 rounded border-l-4 border-blue-500" style={{ background: 'var(--dark-800)' }}>
            <div className="text-blue-400 text-xs font-semibold mb-1">
              <Book className="w-3 h-3 mr-1 inline" />
              Available APIs
            </div>
            <div className="text-slate-300 text-xs space-y-1">
              <div>• Instance.new(), Instance.find()</div>
              <div>• Vector3.new(), CFrame.new()</div>
              <div>• BrickColor.new(), Color3.new()</div>
              <div>• print(), warn(), wait()</div>
              <div>• Part, Humanoid, Model classes</div>
            </div>
          </div>
        </div>
        
        {/* Command Input */}
        <form onSubmit={handleDirectCommand} className="mt-4 flex items-center">
          <span className="text-green-400 mr-2">{'>'}</span>
          <Input
            type="text"
            value={directCommand}
            onChange={(e) => setDirectCommand(e.target.value)}
            placeholder="Enter Lua command..."
            className="flex-1 bg-transparent text-white border-none outline-none placeholder-slate-500 p-0"
          />
        </form>
      </div>
      
      {/* Console Footer */}
      <div className="px-4 py-2 border-t flex items-center justify-between text-xs text-slate-400" 
           style={{ background: 'var(--dark-700)', borderColor: 'var(--dark-600)' }}>
        <div className="flex items-center space-x-4">
          <span>Output lines: {output.length}</span>
          <span>Warnings: {output.filter(item => item.type === 'warning').length}</span>
          <span>Errors: {output.filter(item => item.type === 'error').length}</span>
        </div>
        <Button
          onClick={exportLog}
          variant="ghost"
          size="sm"
          className="text-blue-400 hover:text-blue-300 h-auto p-0"
        >
          <Download className="w-3 h-3 mr-1" />
          Export Log
        </Button>
      </div>
    </div>
  );
}

function getOutputLineStyle(type: string): string {
  switch (type) {
    case 'error':
      return 'text-red-400';
    case 'warning':
      return 'text-yellow-400';
    case 'info':
      return 'text-slate-400';
    default:
      return 'text-white';
  }
}
