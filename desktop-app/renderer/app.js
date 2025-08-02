// Roblox Lua Executor - Frontend JavaScript

let codeEditor;
let isExecuting = false;
let robloxConnected = false;

// Initialisierung
document.addEventListener('DOMContentLoaded', function() {
    initializeEditor();
    updateStats();
    simulateRobloxDetection();
});

// Code Editor initialisieren
function initializeEditor() {
    const textarea = document.getElementById('codeEditor');
    
    // Einfacher Editor mit Syntax-Highlighting
    textarea.addEventListener('input', function() {
        updateStats();
    });

    textarea.addEventListener('keydown', function(e) {
        // Tab-Unterstützung
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = this.selectionStart;
            const end = this.selectionEnd;
            this.value = this.value.substring(0, start) + '    ' + this.value.substring(end);
            this.selectionStart = this.selectionEnd = start + 4;
        }
        
        // Strg+Enter für Ausführung
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            executeScript();
        }
    });
}

// Script ausführen
async function executeScript() {
    if (isExecuting) return;
    
    const codeEditor = document.getElementById('codeEditor');
    const code = codeEditor.value.trim();
    
    if (!code) {
        addOutputLine('warning', 'Kein Code zum Ausführen vorhanden');
        return;
    }

    isExecuting = true;
    updateExecuteButton(true);
    
    addOutputLine('info', 'Script wird ausgeführt...');
    
    try {
        const startTime = Date.now();
        
        // Simuliere Lua-Ausführung
        if (window.electronAPI) {
            const result = await window.electronAPI.executeLua(code);
            const executionTime = Date.now() - startTime;
            
            if (result.success) {
                addOutputLine('success', result.output);
                addOutputLine('info', `Ausführung erfolgreich (${executionTime}ms)`);
            } else {
                addOutputLine('error', `Fehler: ${result.error}`);
            }
        } else {
            // Fallback für Web-Version
            const result = await simulateLuaExecution(code);
            const executionTime = Date.now() - startTime;
            
            result.output.forEach(line => {
                addOutputLine('success', line);
            });
            
            if (result.errors.length > 0) {
                result.errors.forEach(error => {
                    addOutputLine('error', error);
                });
            }
            
            addOutputLine('info', `Ausführung abgeschlossen (${executionTime}ms)`);
        }
        
        document.getElementById('execTime').textContent = `Letzter Lauf: ${Date.now() - startTime}ms`;
        
    } catch (error) {
        addOutputLine('error', `Ausführungsfehler: ${error.message}`);
    } finally {
        isExecuting = false;
        updateExecuteButton(false);
    }
}

// Simuliere Lua-Ausführung für Web-Version
async function simulateLuaExecution(code) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const output = [];
            const errors = [];
            
            // Simuliere verschiedene Roblox-APIs
            if (code.includes('Instance.new')) {
                output.push('> Instance erfolgreich erstellt');
            }
            
            if (code.includes('print(')) {
                const printMatches = code.match(/print\(['"]([^'"]+)['"]\)/g);
                if (printMatches) {
                    printMatches.forEach(match => {
                        const content = match.match(/print\(['"]([^'"]+)['"]\)/)[1];
                        output.push(`> ${content}`);
                    });
                }
            }
            
            if (code.includes('Vector3.new')) {
                output.push('> Vector3 Objekt erstellt');
            }
            
            if (code.includes('workspace')) {
                output.push('> Workspace-Zugriff erfolgreich');
            }
            
            // Simuliere mögliche Fehler
            if (code.includes('error()')) {
                errors.push('Lua Fehler: Erzwungener Fehler');
            }
            
            if (output.length === 0 && errors.length === 0) {
                output.push('> Script ohne Ausgabe ausgeführt');
            }
            
            resolve({ output, errors });
        }, Math.random() * 100 + 50);
    });
}

// Ausgabezeile hinzufügen
function addOutputLine(type, message) {
    const outputContent = document.getElementById('outputContent');
    const timestamp = new Date().toLocaleTimeString();
    
    const line = document.createElement('div');
    line.className = `output-line ${type} fade-in`;
    line.innerHTML = `
        <span class="timestamp">[${timestamp}]</span>
        <span class="message">${message}</span>
    `;
    
    outputContent.appendChild(line);
    outputContent.scrollTop = outputContent.scrollHeight;
}

// Ausgabe leeren
function clearOutput() {
    const outputContent = document.getElementById('outputContent');
    outputContent.innerHTML = '';
    addOutputLine('info', 'Ausgabe geleert');
}

// Ausführen-Button aktualisieren
function updateExecuteButton(executing) {
    const btn = document.getElementById('executeBtn');
    if (executing) {
        btn.innerHTML = '⏳ Läuft...';
        btn.disabled = true;
    } else {
        btn.innerHTML = '▶️ Ausführen';
        btn.disabled = false;
    }
}

// Statistiken aktualisieren
function updateStats() {
    const codeEditor = document.getElementById('codeEditor');
    const lines = codeEditor.value.split('\n').length;
    const chars = codeEditor.value.length;
    
    document.getElementById('lineCount').textContent = `Zeilen: ${lines}`;
    document.getElementById('charCount').textContent = `Zeichen: ${chars}`;
}

// Script Templates
function insertTemplate(type) {
    const codeEditor = document.getElementById('codeEditor');
    let template = '';
    
    switch (type) {
        case 'part':
            template = `-- Part erstellen
local part = Instance.new("Part")
part.Name = "MeinPart"
part.Size = Vector3.new(4, 1, 2)
part.Position = Vector3.new(0, 10, 0)
part.BrickColor = BrickColor.new("Bright blue")
part.Material = Enum.Material.Plastic
part.Parent = workspace

print("Part erstellt:", part.Name)`;
            break;
            
        case 'gui':
            template = `-- GUI erstellen
local screenGui = Instance.new("ScreenGui")
local frame = Instance.new("Frame")
local textLabel = Instance.new("TextLabel")

-- GUI Eigenschaften
screenGui.Name = "MeineGUI"
screenGui.Parent = game.Players.LocalPlayer:WaitForChild("PlayerGui")

-- Frame Eigenschaften
frame.Name = "HauptFrame"
frame.Size = UDim2.new(0, 300, 0, 200)
frame.Position = UDim2.new(0.5, -150, 0.5, -100)
frame.BackgroundColor3 = Color3.new(0, 0, 0)
frame.BorderSizePixel = 2
frame.Parent = screenGui

-- TextLabel Eigenschaften
textLabel.Name = "TitelLabel"
textLabel.Size = UDim2.new(1, 0, 0, 50)
textLabel.Position = UDim2.new(0, 0, 0, 0)
textLabel.BackgroundTransparency = 1
textLabel.Text = "Meine GUI"
textLabel.TextColor3 = Color3.new(1, 1, 1)
textLabel.TextScaled = true
textLabel.Parent = frame

print("GUI erstellt")`;
            break;
            
        case 'script':
            template = `-- Roblox Script Template
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TweenService = game:GetService("TweenService")

local player = Players.LocalPlayer
local character = player.Character or player.CharacterAdded:Wait()
local humanoid = character:WaitForChild("Humanoid")

-- Ihr Code hier
print("Script gestartet für Spieler:", player.Name)

-- Beispiel: Sprungkraft ändern
humanoid.JumpPower = 100
print("Sprungkraft auf 100 gesetzt")`;
            break;
    }
    
    codeEditor.value = template;
    updateStats();
    addOutputLine('info', `Template "${type}" eingefügt`);
}

// Roblox-Verbindung simulieren
async function attachToRoblox() {
    const attachBtn = document.getElementById('attachBtn');
    const statusIndicator = document.getElementById('robloxStatus');
    const connectionStatus = document.getElementById('robloxConnection');
    
    if (robloxConnected) {
        // Trennen
        robloxConnected = false;
        attachBtn.innerHTML = '🔗 An Roblox Anhängen';
        statusIndicator.innerHTML = '<span class="status-dot offline"></span><span>Nicht Verbunden</span>';
        connectionStatus.textContent = '🔴 Roblox: Getrennt';
        addOutputLine('warning', 'Roblox-Verbindung getrennt');
    } else {
        // Verbinden
        attachBtn.innerHTML = '⏳ Verbinde...';
        addOutputLine('info', 'Suche nach Roblox-Prozess...');
        
        // Simuliere Verbindungsvorgang
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        robloxConnected = true;
        attachBtn.innerHTML = '🔌 Trennen';
        statusIndicator.innerHTML = '<span class="status-dot online"></span><span>Verbunden</span>';
        connectionStatus.textContent = '🟢 Roblox: Verbunden';
        addOutputLine('success', 'Erfolgreich mit Roblox verbunden!');
        addOutputLine('info', 'Anti-Detection aktiviert');
    }
}

// Roblox-Erkennung simulieren
function simulateRobloxDetection() {
    setTimeout(() => {
        addOutputLine('info', 'Roblox-Prozess erkannt');
        addOutputLine('info', 'Bereit für Injection');
    }, 3000);
}

// Direkteingabe verarbeiten
function handleDirectInput(event) {
    if (event.key === 'Enter') {
        const input = event.target;
        const command = input.value.trim();
        
        if (command) {
            addOutputLine('info', `> ${command}`);
            
            // Simuliere Befehlsausführung
            setTimeout(() => {
                if (command.includes('print')) {
                    const match = command.match(/print\(['"]([^'"]+)['"]\)/);
                    if (match) {
                        addOutputLine('success', match[1]);
                    }
                } else {
                    addOutputLine('success', 'Befehl ausgeführt');
                }
            }, 100);
            
            input.value = '';
        }
    }
}

// Ausgabe exportieren
function exportOutput() {
    const outputContent = document.getElementById('outputContent');
    const lines = outputContent.querySelectorAll('.output-line');
    let exportText = '';
    
    lines.forEach(line => {
        const timestamp = line.querySelector('.timestamp').textContent;
        const message = line.querySelector('.message').textContent;
        exportText += `${timestamp} ${message}\n`;
    });
    
    // Datei herunterladen
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roblox-executor-log-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    addOutputLine('info', 'Ausgabe exportiert');
}

// Window-Kontrolle (nur in Electron)
function minimizeApp() {
    if (window.electronAPI) {
        window.electronAPI.minimizeWindow();
    }
}

function maximizeApp() {
    if (window.electronAPI) {
        window.electronAPI.maximizeWindow();
    }
}

function closeApp() {
    if (window.electronAPI) {
        window.electronAPI.closeWindow();
    } else {
        window.close();
    }
}

// Datei-Operationen
async function newScript() {
    const codeEditor = document.getElementById('codeEditor');
    if (codeEditor.value.trim()) {
        if (confirm('Aktueller Code wird überschrieben. Fortfahren?')) {
            codeEditor.value = '';
            updateStats();
            addOutputLine('info', 'Neues Script erstellt');
        }
    }
}

async function loadScript() {
    if (window.electronAPI) {
        const result = await window.electronAPI.loadScript();
        if (result.success) {
            document.getElementById('codeEditor').value = result.content;
            updateStats();
            addOutputLine('success', `Script geladen: ${result.path}`);
        }
    } else {
        // Web-Fallback
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.lua,.txt';
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('codeEditor').value = e.target.result;
                    updateStats();
                    addOutputLine('success', `Script geladen: ${file.name}`);
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }
}

async function saveScript() {
    const codeEditor = document.getElementById('codeEditor');
    const content = codeEditor.value;
    
    if (!content.trim()) {
        addOutputLine('warning', 'Kein Code zum Speichern vorhanden');
        return;
    }
    
    if (window.electronAPI) {
        const result = await window.electronAPI.saveScript(content);
        if (result.success) {
            addOutputLine('success', `Script gespeichert: ${result.path}`);
        }
    } else {
        // Web-Fallback
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'script.lua';
        a.click();
        URL.revokeObjectURL(url);
        addOutputLine('success', 'Script heruntergeladen');
    }
}

// Ausführung stoppen
function stopExecution() {
    if (isExecuting) {
        isExecuting = false;
        updateExecuteButton(false);
        addOutputLine('warning', 'Ausführung gestoppt');
    }
}