import { useEffect, useRef } from "react";
import { FileText, Circle } from "lucide-react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  isRunning: boolean;
}

export function CodeEditor({ value, onChange, isRunning }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lines = value.split('\n');
  const lineNumbers = Array.from({ length: Math.max(lines.length, 20) }, (_, i) => i + 1);

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      // Trigger run script via custom event
      window.dispatchEvent(new CustomEvent('runScript'));
    }
    
    // Handle tab indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      
      // Set cursor position after the inserted spaces
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="flex-1 flex flex-col border-r" style={{ background: 'var(--dark-800)', borderColor: 'var(--dark-600)' }}>
      {/* Editor Header */}
      <div className="px-4 py-2 border-b flex items-center justify-between" 
           style={{ background: 'var(--dark-700)', borderColor: 'var(--dark-600)' }}>
        <div className="flex items-center space-x-3">
          <FileText className="w-4 h-4 text-blue-400" />
          <span className="font-medium">script.lua</span>
          <span className="text-xs text-slate-400">• Modified</span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <span>Lua 5.1</span>
          <span>•</span>
          <span>UTF-8</span>
        </div>
      </div>
      
      {/* Code Editor Area */}
      <div className="flex-1 relative">
        {/* Line Numbers */}
        <div className="absolute left-0 top-0 bottom-0 w-12 border-r flex flex-col text-xs text-slate-500 font-mono z-10" 
             style={{ background: 'var(--dark-700)', borderColor: 'var(--dark-600)' }}>
          {lineNumbers.map((num) => (
            <div key={num} className="px-2 py-1 text-right leading-6 min-h-[24px]">
              {num <= lines.length ? num : ''}
            </div>
          ))}
        </div>
        
        {/* Code Content */}
        <div className="ml-12 h-full relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full h-full bg-transparent text-slate-50 font-mono text-sm p-4 resize-none outline-none leading-6 custom-scrollbar"
            placeholder="-- Enter your Lua code here..."
            style={{ minHeight: '100%' }}
            spellCheck={false}
          />
        </div>
      </div>
      
      {/* Editor Footer */}
      <div className="px-4 py-2 border-t flex items-center justify-between text-xs text-slate-400" 
           style={{ background: 'var(--dark-700)', borderColor: 'var(--dark-600)' }}>
        <div className="flex items-center space-x-4">
          <span>Lines: {lines.length}</span>
          <span>Characters: {value.length}</span>
          <span>Selection: 0</span>
        </div>
        <div className="flex items-center space-x-2">
          <Circle className={`w-2 h-2 ${isRunning ? 'text-yellow-400' : 'text-green-400'} fill-current`} />
          <span>{isRunning ? 'Running' : 'Ready'}</span>
        </div>
      </div>
    </div>
  );
}
