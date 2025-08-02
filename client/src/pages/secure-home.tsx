import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Play, Download, Shield, Zap, Code2, Terminal, User, LogOut, Save, Trash2, FileText, Games, AlertTriangle } from "lucide-react";
import { Link } from "wouter";

interface Script {
  id: number;
  name: string;
  content: string;
  isPublic: boolean;
  executions: number;
  createdAt: string;
  updatedAt: string;
}

interface Game {
  id: string;
  name: string;
  isActive: boolean;
}

export default function SecureHome() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  const [code, setCode] = useState(`-- Welcome to RobloxLua Pro - Secure Script Executor
-- Execute Roblox Lua scripts safely with comprehensive security scanning

-- Create a simple part with enhanced properties
local part = Instance.new("Part")
part.Name = "SecurePart_" .. tick()
part.Size = Vector3.new(4, 1, 2)
part.Position = Vector3.new(0, 10, 0)
part.BrickColor = BrickColor.new("Bright blue")
part.Material = Enum.Material.Neon
part.CanCollide = true
part.Anchored = true
part.Parent = game.Workspace

print("✅ Part created successfully with security validation!")

-- Enhanced player access with verification
local player = game.Players.LocalPlayer
if player then
    print("👋 Hello, " .. player.Name .. "!")
    print("🆔 User ID: " .. player.UserId)
    print("🎮 Account Age: " .. player.AccountAge .. " days")
end

-- Access Roblox services with error handling
local services = {
    TweenService = game:GetService("TweenService"),
    RunService = game:GetService("RunService"),
    ReplicatedStorage = game:GetService("ReplicatedStorage"),
    StarterPlayerScripts = game:GetService("StarterPlayer"):WaitForChild("StarterPlayerScripts")
}

for serviceName, service in pairs(services) do
    if service then
        print("✅ " .. serviceName .. " loaded successfully")
    else
        print("❌ Failed to load " .. serviceName)
    end
end

print("🚀 All systems ready! Script execution environment secure.")
print("🔒 Security scan passed - No threats detected.")`);

  const [output, setOutput] = useState<string[]>([]);
  const [scriptName, setScriptName] = useState("");
  const [selectedGame, setSelectedGame] = useState<string>("");

  // Fetch user scripts
  const { data: scriptsData } = useQuery({
    queryKey: ["/api/scripts"],
  });

  // Fetch user games
  const { data: gamesData } = useQuery({
    queryKey: ["/api/roblox/games"],
    retry: false,
  });

  // Fetch rate limits
  const { data: limitsData } = useQuery({
    queryKey: ["/api/limits"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Execute script mutation
  const executeMutation = useMutation({
    mutationFn: async (data: { script: string; gameId?: string }) => {
      return await apiRequest("POST", "/api/execute", data);
    },
    onSuccess: (data) => {
      if (data.success) {
        const newOutput = data.output ? data.output.split('\n') : ['✅ Script executed successfully'];
        setOutput(prev => [...prev, `> Execution ${new Date().toLocaleTimeString()}`, ...newOutput]);
        toast({
          title: "Script Executed",
          description: "Your script ran successfully!",
        });
      } else {
        setOutput(prev => [...prev, `❌ Execution failed: ${data.error}`]);
        toast({
          title: "Execution Failed",
          description: data.error,
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      setOutput(prev => [...prev, `❌ Error: ${error.message}`]);
      toast({
        title: "Execution Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Save script mutation
  const saveScriptMutation = useMutation({
    mutationFn: async (data: { name: string; content: string; isPublic: boolean }) => {
      return await apiRequest("POST", "/api/scripts", data);
    },
    onSuccess: () => {
      toast({
        title: "Script Saved",
        description: "Your script has been saved successfully!",
      });
      setScriptName("");
    },
    onError: (error: Error) => {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Security scan mutation
  const scanMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("POST", "/api/security/scan", { content });
    },
    onSuccess: (data) => {
      const threats = data.threats || [];
      const warnings = data.warnings || [];
      
      if (data.clean) {
        setOutput(prev => [...prev, "🔒 Security scan: CLEAN - No threats detected"]);
        toast({
          title: "Security Scan Complete",
          description: "No threats detected in your script.",
        });
      } else {
        setOutput(prev => [...prev, 
          "⚠️ Security scan: THREATS DETECTED",
          ...threats.map((threat: string) => `  ❌ ${threat}`),
          ...warnings.map((warning: string) => `  ⚠️  ${warning}`)
        ]);
        toast({
          title: "Security Threats Detected",
          description: `Found ${threats.length} threats and ${warnings.length} warnings`,
          variant: "destructive",
        });
      }
    },
  });

  const handleExecute = () => {
    if (!code.trim()) return;
    executeMutation.mutate({ script: code, gameId: selectedGame });
  };

  const handleSave = () => {
    if (!scriptName.trim() || !code.trim()) {
      toast({
        title: "Save Error",
        description: "Please provide both script name and content.",
        variant: "destructive",
      });
      return;
    }
    saveScriptMutation.mutate({ name: scriptName, content: code, isPublic: false });
  };

  const handleSecurityScan = () => {
    if (!code.trim()) return;
    scanMutation.mutate(code);
  };

  const loadScript = (script: Script) => {
    setCode(script.content);
    setOutput(prev => [...prev, `📂 Loaded script: ${script.name}`]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      
      const newValue = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newValue);
      
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  const scripts = scriptsData?.scripts || [];
  const games = gamesData?.games || [];
  const remainingExecutions = limitsData?.remainingExecutions || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-green-500" />
              <h1 className="text-2xl font-bold">RobloxLua Pro</h1>
              <Badge variant="secondary" className="bg-green-900/30 text-green-400 border-green-500/30">
                Secure Environment
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <User className="h-4 w-4 text-blue-400" />
                <span className="text-gray-300">{user?.username}</span>
                {user?.robloxUsername && (
                  <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400">
                    {user.robloxUsername}
                  </Badge>
                )}
              </div>
              <div className="text-sm">
                <span className="text-gray-400">Executions left: </span>
                <span className={`font-semibold ${remainingExecutions > 20 ? 'text-green-400' : remainingExecutions > 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {remainingExecutions}
                </span>
              </div>
              <Link href="/download">
                <Button variant="outline" size="sm" className="border-green-500 text-green-400 hover:bg-green-500/10">
                  <Download className="h-4 w-4 mr-2" />
                  Desktop App
                </Button>
              </Link>
              <Button 
                onClick={logout}
                variant="outline" 
                size="sm" 
                className="border-red-500 text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Code Editor */}
          <div className="lg:col-span-3">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Code2 className="h-5 w-5 text-blue-400" />
                    <CardTitle>Secure Lua Script Editor</CardTitle>
                  </div>
                  <div className="flex items-center space-x-2">
                    {games.length > 0 && (
                      <Select value={selectedGame} onValueChange={setSelectedGame}>
                        <SelectTrigger className="w-48 bg-gray-700 border-gray-600">
                          <SelectValue placeholder="Select Roblox Game" />
                        </SelectTrigger>
                        <SelectContent>
                          {games.map((game: Game) => (
                            <SelectItem key={game.id} value={game.id}>
                              <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${game.isActive ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                                <span>{game.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <Button 
                      onClick={handleSecurityScan}
                      disabled={scanMutation.isPending || !code.trim()}
                      variant="outline"
                      size="sm"
                      className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"
                    >
                      <Shield className="h-4 w-4 mr-1" />
                      Scan
                    </Button>
                  </div>
                </div>
                <CardDescription className="text-gray-400">
                  Write your Roblox Lua scripts here. All scripts are automatically scanned for security threats.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="w-full h-96 bg-gray-900 border border-gray-600 rounded-md p-4 font-mono text-sm text-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your secure Lua script here..."
                      spellCheck={false}
                    />
                    <div className="absolute top-2 right-2 text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                      Lines: {code.split('\n').length} | Chars: {code.length}
                    </div>
                  </div>
                  
                  {/* Save Script Section */}
                  <div className="flex items-center space-x-2 p-3 bg-gray-900 rounded-md border border-gray-600">
                    <input
                      type="text"
                      value={scriptName}
                      onChange={(e) => setScriptName(e.target.value)}
                      placeholder="Script name..."
                      className="flex-1 bg-transparent border-none text-gray-300 text-sm focus:outline-none"
                    />
                    <Button 
                      onClick={handleSave}
                      disabled={saveScriptMutation.isPending || !scriptName.trim() || !code.trim()}
                      size="sm"
                      variant="outline"
                      className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Zap className="h-4 w-4" />
                        <span>Tab for indent</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Shield className="h-4 w-4 text-green-400" />
                        <span>Auto security scan</span>
                      </div>
                    </div>
                    <Button 
                      onClick={handleExecute}
                      disabled={executeMutation.isPending || !code.trim() || remainingExecutions === 0}
                      className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    >
                      {executeMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Executing...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Execute Script
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Console Output */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Terminal className="h-5 w-5 text-green-400" />
                  <span>Console Output</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 border border-gray-600 rounded-md p-4 h-48 overflow-y-auto font-mono text-sm">
                  {output.length > 0 ? (
                    <div className="space-y-1">
                      {output.map((line, index) => (
                        <div 
                          key={index} 
                          className={`${
                            line.includes('✅') ? 'text-green-400' : 
                            line.includes('❌') || line.includes('Error') ? 'text-red-400' : 
                            line.includes('⚠️') || line.includes('Warning') ? 'text-yellow-400' :
                            line.startsWith('>') ? 'text-blue-400' :
                            line.includes('🔒') ? 'text-purple-400' :
                            'text-gray-300'
                          }`}
                        >
                          {line}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 italic">
                      Console output will appear here...
                    </div>
                  )}
                </div>
                {output.length > 0 && (
                  <Button 
                    onClick={() => setOutput([])}
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full border-gray-600 text-gray-400 hover:bg-gray-700"
                  >
                    Clear Console
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Saved Scripts & Quick Actions */}
            <Card className="bg-gray-800 border-gray-700">
              <Tabs defaultValue="scripts" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="scripts">My Scripts</TabsTrigger>
                  <TabsTrigger value="templates">Templates</TabsTrigger>
                </TabsList>
                
                <TabsContent value="scripts" className="space-y-3 mt-4">
                  {scripts.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {scripts.map((script: Script) => (
                        <div key={script.id} className="flex items-center justify-between p-2 bg-gray-700 rounded border border-gray-600">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-blue-400 flex-shrink-0" />
                              <span className="text-sm font-medium text-gray-300 truncate">{script.name}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {script.executions} runs • {new Date(script.updatedAt).toLocaleDateString()}
                            </div>
                          </div>
                          <Button
                            onClick={() => loadScript(script)}
                            size="sm"
                            variant="ghost"
                            className="flex-shrink-0 text-green-400 hover:bg-green-500/10"
                          >
                            Load
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No saved scripts yet
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="templates" className="space-y-3 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start border-gray-600 text-gray-300 hover:bg-gray-700"
                    onClick={() => setCode(`-- Hello World Security Test
print("🔒 Security scan: Starting Hello World test")
local player = game.Players.LocalPlayer
if player then
    print("👋 Hello, " .. player.Name .. "!")
    print("🆔 User ID: " .. player.UserId)
else
    print("⚠️ No player found")
end
print("✅ Hello World test completed successfully")`)}
                  >
                    Hello World + Security
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start border-gray-600 text-gray-300 hover:bg-gray-700"
                    onClick={() => setCode(`-- Advanced Part Creation with Security
-- This script demonstrates secure part creation with validation

print("🔒 Starting secure part creation...")

-- Validate workspace access
if not game.Workspace then
    print("❌ Workspace access denied")
    return
end

-- Create part with security checks
local part = Instance.new("Part")
if not part then
    print("❌ Failed to create part")
    return
end

-- Configure part properties
part.Name = "SecurePart_" .. tick()
part.Size = Vector3.new(4, 4, 4)
part.Position = Vector3.new(0, 10, 0)
part.BrickColor = BrickColor.new("Bright red")
part.Shape = Enum.PartType.Ball
part.Material = Enum.Material.ForceField
part.CanCollide = true
part.Anchored = true

-- Secure parenting
pcall(function()
    part.Parent = game.Workspace
    print("✅ Part created successfully: " .. part.Name)
end)

-- Add rotation animation with error handling
local TweenService = game:GetService("TweenService")
if TweenService then
    local info = TweenInfo.new(2, Enum.EasingStyle.Linear, Enum.EasingDirection.InOut, -1, false)
    local tween = TweenService:Create(part, info, {Rotation = Vector3.new(0, 360, 0)})
    tween:Play()
    print("✅ Animation applied successfully")
else
    print("⚠️ TweenService not available")
end

print("🚀 Secure part creation completed!")`)}
                  >
                    Secure Part Creation
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start border-gray-600 text-gray-300 hover:bg-gray-700"
                    onClick={() => setCode("")}
                  >
                    Clear Editor
                  </Button>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}