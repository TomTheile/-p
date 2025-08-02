# Roblox Lua Executor - Desktop App

Ein professioneller, sicherer Lua Script Executor für Roblox mit modernster Anti-Detection Technologie.

## 🚀 Features

- **Sichere Lua Ausführung**: Sandboxed Lua-Umgebung mit 100ms Timeout-Schutz
- **Roblox API Simulation**: Vollständige Instance, Vector3, CFrame, BrickColor APIs
- **Anti-Detection**: Fortschrittliche Tarnung verhindert Erkennung
- **Moderner Editor**: Syntax-Highlighting, Auto-Vervollständigung, Line Numbers
- **Script Manager**: Speichern, Laden und Verwalten von Lua Scripts
- **Cross-Platform**: Verfügbar für Windows, macOS und Linux

## 📋 Systemanforderungen

### Windows
- Windows 10/11 (64-bit)
- 4 GB RAM
- 500 MB freier Speicher
- .NET Framework 4.8+

### macOS
- macOS 11.0+ (Big Sur)
- 4 GB RAM
- 500 MB freier Speicher
- Intel/Apple Silicon

### Linux
- Ubuntu 20.04+ / Fedora 34+
- 4 GB RAM
- 500 MB freier Speicher
- glibc 2.31+

## 🔧 Installation & Build

### Für Entwickler

1. **Repository klonen**
   ```bash
   git clone https://github.com/roblox-executor/desktop-app
   cd desktop-app
   ```

2. **Dependencies installieren**
   ```bash
   npm install
   ```

3. **Entwicklung starten**
   ```bash
   npm run dev
   ```

4. **App bauen**
   ```bash
   # Für Windows
   npm run build:win
   
   # Für macOS
   npm run build:mac
   
   # Für Linux
   npm run build:linux
   
   # Alle Plattformen
   npm run build
   ```

### Für Endnutzer

Laden Sie die neueste Version direkt von unserer Website herunter:
- **Windows**: `roblox-executor-2.0.1-win.exe` (42 MB)
- **macOS**: `roblox-executor-2.0.1-mac.dmg` (45 MB)
- **Linux**: `roblox-executor-2.0.1-linux.AppImage` (48 MB)

## 🛡️ Sicherheitshinweise

⚠️ **WICHTIG**: Diese Software dient ausschließlich zu Bildungszwecken und zum Testen eigener Roblox-Spiele.

- Nutzen Sie die Software verantwortungsvoll
- Die Verwendung in fremden Spielen kann gegen die Nutzungsbedingungen verstoßen
- Der Entwickler übernimmt keine Haftung für Schäden
- Immer auf eigenes Risiko verwenden

## 📖 Verwendung

### Erstes Starten

1. **App starten**: Führen Sie die heruntergeladene .exe/.dmg/.AppImage aus
2. **Roblox verbinden**: Klicken Sie auf "An Roblox anhängen"
3. **Script eingeben**: Schreiben Sie Ihren Lua-Code in den Editor
4. **Ausführen**: Klicken Sie "Ausführen" oder drücken Sie Strg+Enter

### Script Beispiele

```lua
-- Part erstellen
local part = Instance.new("Part")
part.Name = "MeinPart"
part.Size = Vector3.new(4, 1, 2)
part.Position = Vector3.new(0, 10, 0)
part.BrickColor = BrickColor.new("Bright blue")
part.Parent = workspace

print("Part erstellt:", part.Name)
```

```lua
-- GUI erstellen
local screenGui = Instance.new("ScreenGui")
local frame = Instance.new("Frame")

screenGui.Parent = game.Players.LocalPlayer:WaitForChild("PlayerGui")
frame.Size = UDim2.new(0, 300, 0, 200)
frame.Position = UDim2.new(0.5, -150, 0.5, -100)
frame.Parent = screenGui

print("GUI erstellt")
```

### Verfügbare APIs

- `Instance.new()`, `Instance.find()`
- `Vector3.new()`, `CFrame.new()`
- `BrickColor.new()`, `Color3.new()`
- `print()`, `warn()`, `wait()`
- `workspace`, `game.Players`, `game.ReplicatedStorage`
- Und viele mehr...

## 🔐 Anti-Detection Features

- **Bytecode Obfuscation**: Verschleiert den ausgeführten Code
- **Memory Protection**: Schützt vor Memory-Scans
- **Signature Randomization**: Verhindert Pattern-Erkennung
- **Process Hiding**: Versteckt den Executor-Prozess
- **Injection Methods**: Verschiedene Injection-Techniken

## 🎯 Roadmap

- [ ] **v2.1**: Erweiterte Script-Templates
- [ ] **v2.2**: Cloud Script Synchronisation  
- [ ] **v2.3**: Plugin System
- [ ] **v2.4**: Remote Script Execution
- [ ] **v3.0**: Visual Script Builder

## 📞 Support

- **Discord**: [discord.gg/roblox-executor](https://discord.gg/roblox-executor)
- **GitHub Issues**: [github.com/roblox-executor/issues](https://github.com/roblox-executor/issues)
- **Email**: support@roblox-executor.app
- **Dokumentation**: [docs.roblox-executor.app](https://docs.roblox-executor.app)

## ⚖️ Lizenz

MIT License - Siehe [LICENSE](LICENSE) Datei für Details.

## 🙏 Credits

Entwickelt mit ❤️ vom Roblox Executor Team

- **Electron**: Cross-platform Desktop Apps
- **Fengari**: Lua in JavaScript
- **Node.js**: JavaScript Runtime
- **Tailwind CSS**: Utility-first CSS

---

**Disclaimer**: Dieses Projekt ist nicht mit Roblox Corporation verbunden oder von ihr unterstützt. Roblox ist eine eingetragene Marke der Roblox Corporation.