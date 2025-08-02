import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { CodeEditor } from "@/components/code-editor";
import { ConsoleOutput } from "@/components/console-output";
import { Toolbar } from "@/components/toolbar";
import { StatusBar } from "@/components/status-bar";
import { useLuaExecutor } from "@/hooks/use-lua-executor";

const defaultCode = `-- Create a new Part instance
local part = Instance.new("Part")
part.Name = "MyPart"
part.Size = Vector3.new(4, 1, 2)
part.Position = Vector3.new(0, 10, 0)
part.BrickColor = BrickColor.new("Bright blue")

-- Print part information
print("Created part:", part.Name)
print("Size:", part.Size)
print("Position:", part.Position)

-- Create a humanoid
local humanoid = Instance.new("Humanoid")
print("Humanoid created with health:", humanoid.Health)`;

export default function Home() {
  const [code, setCode] = useState(defaultCode);
  const {
    output,
    isRunning,
    executionTime,
    memoryUsage,
    runScript,
    clearOutput,
    addDirectCommand
  } = useLuaExecutor();

  const handleRunScript = () => {
    runScript(code);
  };

  const handleLoadExample = () => {
    setCode(defaultCode);
    clearOutput();
  };

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--dark-900)', color: '#f1f5f9' }}>
      <div className="bg-slate-800/30 border-b border-slate-700 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-300">
            Web Version - Für die vollständige Desktop App:
          </div>
          <Link href="/download">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Desktop App Herunterladen
            </Button>
          </Link>
        </div>
      </div>
      <Toolbar
        onRunScript={handleRunScript}
        onClearOutput={clearOutput}
        onLoadExample={handleLoadExample}
        isRunning={isRunning}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <CodeEditor
          value={code}
          onChange={setCode}
          isRunning={isRunning}
        />
        
        <ConsoleOutput
          output={output}
          isRunning={isRunning}
          executionTime={executionTime}
          memoryUsage={memoryUsage}
          onDirectCommand={addDirectCommand}
        />
      </div>
      
      <StatusBar
        isRunning={isRunning}
        executionTime={executionTime}
        memoryUsage={memoryUsage}
        linesCount={code.split('\n').length}
        charactersCount={code.length}
      />
    </div>
  );
}
