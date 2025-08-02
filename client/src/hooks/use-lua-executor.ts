import { useState, useCallback } from 'react';
import { LuaEngine, LuaExecutionResult } from '@/lib/lua-engine';

interface OutputLine {
  type: 'info' | 'output' | 'error' | 'warning';
  message: string;
  timestamp: string;
}

export function useLuaExecutor() {
  const [output, setOutput] = useState<OutputLine[]>([
    {
      type: 'info',
      message: 'Lua Script Executor initialized - Ready to run code',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(2048);
  const [luaEngine] = useState(() => new LuaEngine());

  const addOutputLine = useCallback((type: OutputLine['type'], message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setOutput(prev => [...prev, { type, message, timestamp }]);
  }, []);

  const runScript = useCallback(async (code: string) => {
    if (isRunning) return;

    setIsRunning(true);
    addOutputLine('info', 'Script execution started...');

    try {
      const result: LuaExecutionResult = await luaEngine.execute(code);
      
      // Add output lines
      result.output.forEach(line => {
        addOutputLine('output', line);
      });

      // Add error lines
      result.errors.forEach(error => {
        addOutputLine('error', error);
      });

      // Add completion message
      if (result.success) {
        addOutputLine('info', `Script execution completed successfully (${result.executionTime}ms)`);
      } else {
        addOutputLine('error', `Script execution failed (${result.executionTime}ms)`);
      }

      setExecutionTime(result.executionTime);
      setMemoryUsage(result.memoryUsage);
    } catch (error: any) {
      addOutputLine('error', `Execution error: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  }, [isRunning, luaEngine, addOutputLine]);

  const clearOutput = useCallback(() => {
    setOutput([
      {
        type: 'info',
        message: 'Console cleared',
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
    setExecutionTime(0);
    setMemoryUsage(2048);
  }, []);

  const addDirectCommand = useCallback(async (command: string) => {
    addOutputLine('info', `> ${command}`);
    
    try {
      const result = await luaEngine.execute(command);
      
      result.output.forEach(line => {
        addOutputLine('output', line);
      });

      result.errors.forEach(error => {
        addOutputLine('error', error);
      });

      setExecutionTime(result.executionTime);
      setMemoryUsage(prev => prev + result.memoryUsage);
    } catch (error: any) {
      addOutputLine('error', `Command error: ${error?.message || 'Unknown error'}`);
    }
  }, [luaEngine, addOutputLine]);

  // Listen for global run script events (for keyboard shortcuts)
  useState(() => {
    const handleRunScript = () => {
      // This would need to be connected to the current code state
      // For now, we'll leave it as a placeholder
    };

    window.addEventListener('runScript', handleRunScript);
    return () => window.removeEventListener('runScript', handleRunScript);
  });

  return {
    output,
    isRunning,
    executionTime,
    memoryUsage,
    runScript,
    clearOutput,
    addDirectCommand
  };
}
