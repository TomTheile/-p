import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Shield, 
  Zap, 
  Code, 
  Monitor, 
  Smartphone, 
  CheckCircle, 
  Star,
  Github,
  Users,
  Activity
} from "lucide-react";

export default function DownloadPage() {
  const [selectedOS, setSelectedOS] = useState<'windows' | 'mac' | 'linux'>('windows');
  const [downloadCount, setDownloadCount] = useState(45672);

  const handleDownload = (os: string, version: string) => {
    setDownloadCount(prev => prev + 1);
    // Simuliere Download
    const filename = `roblox-executor-${version}-${os}.exe`;
    const element = document.createElement('a');
    element.href = '#'; // Hier würde die echte Download-URL stehen
    element.download = filename;
    element.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Roblox Lua Executor</span>
            <Badge variant="secondary" className="bg-green-600 text-white">v2.0.1</Badge>
          </div>
          <nav className="flex items-center space-x-6">
            <a href="#features" className="text-slate-300 hover:text-white transition-colors">Features</a>
            <a href="#download" className="text-slate-300 hover:text-white transition-colors">Download</a>
            <a href="#support" className="text-slate-300 hover:text-white transition-colors">Support</a>
            <Button variant="outline" size="sm">
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-600/20 border border-blue-500/30 rounded-full px-4 py-2 text-blue-300 text-sm mb-6">
            <Zap className="w-4 h-4" />
            <span>Neueste Version verfügbar</span>
          </div>
          
          <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
            Der modernste
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {" "}Roblox Executor
            </span>
          </h1>
          
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Professioneller Lua Script Executor mit modernster Anti-Detection Technologie, 
            intuitiver Benutzeroberfläche und vollständiger Roblox API Unterstützung.
          </p>
          
          <div className="flex items-center justify-center space-x-8 mb-12">
            <div className="flex items-center space-x-2 text-slate-300">
              <Users className="w-5 h-5 text-green-400" />
              <span>50K+ Aktive Benutzer</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <Activity className="w-5 h-5 text-blue-400" />
              <span>{downloadCount.toLocaleString()} Downloads</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <Star className="w-5 h-5 text-yellow-400" />
              <span>4.9/5 Bewertung</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-3 text-lg"
              onClick={() => handleDownload('windows', '2.0.1')}
            >
              <Download className="w-5 h-5 mr-2" />
              Jetzt Herunterladen
            </Button>
            <Button variant="outline" size="lg" className="border-slate-600 text-slate-300 hover:text-white px-8 py-3 text-lg">
              <Monitor className="w-5 h-5 mr-2" />
              Web Version Testen
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-slate-800/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Warum unseren Executor wählen?</h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              Entwickelt mit modernsten Technologien für maximale Leistung und Sicherheit
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-colors">
              <CardHeader>
                <Shield className="w-10 h-10 text-green-400 mb-4" />
                <CardTitle className="text-white">Anti-Detection System</CardTitle>
                <CardDescription className="text-slate-300">
                  Fortschrittliche Tarnung verhindert Erkennung durch Roblox Sicherheitssysteme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Bytecode Obfuscation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Memory Protection</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Signature Randomization</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-colors">
              <CardHeader>
                <Code className="w-10 h-10 text-blue-400 mb-4" />
                <CardTitle className="text-white">Vollständige Lua API</CardTitle>
                <CardDescription className="text-slate-300">
                  Komplette Roblox API Unterstützung mit erweiterten Funktionen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Instance Manipulation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Event Handling</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Custom Functions</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-colors">
              <CardHeader>
                <Zap className="w-10 h-10 text-yellow-400 mb-4" />
                <CardTitle className="text-white">High Performance</CardTitle>
                <CardDescription className="text-slate-300">
                  Optimiert für schnelle Ausführung und minimalen Ressourcenverbrauch
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>JIT Compilation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Memory Optimization</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Multi-Threading</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Download für alle Plattformen</h2>
            <p className="text-slate-300 text-lg">
              Verfügbar für Windows, macOS und Linux
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* OS Selector */}
            <div className="flex justify-center mb-8">
              <div className="bg-slate-800 rounded-lg p-1 flex space-x-1">
                <button
                  onClick={() => setSelectedOS('windows')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                    selectedOS === 'windows' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  <span>Windows</span>
                </button>
                <button
                  onClick={() => setSelectedOS('mac')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                    selectedOS === 'mac' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>macOS</span>
                </button>
                <button
                  onClick={() => setSelectedOS('linux')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                    selectedOS === 'linux' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Code className="w-4 h-4" />
                  <span>Linux</span>
                </button>
              </div>
            </div>

            {/* Download Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Standard Edition</CardTitle>
                    <Badge variant="secondary">Kostenlos</Badge>
                  </div>
                  <CardDescription className="text-slate-300">
                    Alle grundlegenden Features für den täglichen Gebrauch
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-slate-400 mb-6">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Lua Script Ausführung</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Basic Anti-Detection</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Script Manager</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Community Support</span>
                    </li>
                  </ul>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleDownload(selectedOS, '2.0.1-standard')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Herunterladen (42 MB)
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 border-blue-500/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Professional Edition</CardTitle>
                    <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500">Premium</Badge>
                  </div>
                  <CardDescription className="text-slate-300">
                    Erweiterte Features für professionelle Anwender
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-slate-400 mb-6">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Alle Standard Features</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Advanced Anti-Detection</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Custom Lua Functions</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Priority Support</span>
                    </li>
                  </ul>
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                    onClick={() => handleDownload(selectedOS, '2.0.1-pro')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Herunterladen (58 MB)
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* System Requirements */}
            <div className="mt-12 bg-slate-800/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Systemanforderungen</h3>
              <div className="grid md:grid-cols-3 gap-6 text-sm">
                <div>
                  <h4 className="font-medium text-blue-400 mb-2">Windows</h4>
                  <ul className="space-y-1 text-slate-400">
                    <li>Windows 10/11 (64-bit)</li>
                    <li>4 GB RAM</li>
                    <li>500 MB freier Speicher</li>
                    <li>.NET Framework 4.8+</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-blue-400 mb-2">macOS</h4>
                  <ul className="space-y-1 text-slate-400">
                    <li>macOS 11.0+ (Big Sur)</li>
                    <li>4 GB RAM</li>
                    <li>500 MB freier Speicher</li>
                    <li>Intel/Apple Silicon</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-blue-400 mb-2">Linux</h4>
                  <ul className="space-y-1 text-slate-400">
                    <li>Ubuntu 20.04+ / Fedora 34+</li>
                    <li>4 GB RAM</li>
                    <li>500 MB freier Speicher</li>
                    <li>glibc 2.31+</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Notice */}
      <section className="py-12 px-6 bg-yellow-900/20 border-y border-yellow-600/30">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Shield className="w-6 h-6 text-yellow-400" />
            <h3 className="text-xl font-semibold text-white">Wichtiger Sicherheitshinweis</h3>
          </div>
          <p className="text-slate-300 max-w-3xl mx-auto">
            Diese Software dient ausschließlich zu Bildungszwecken und zum Testen eigener Spiele. 
            Die Nutzung in fremden Spielen kann gegen die Nutzungsbedingungen verstoßen. 
            Nutzen Sie die Software verantwortungsvoll und auf eigenes Risiko.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-slate-900/80">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Code className="w-6 h-6 text-blue-400" />
                <span className="font-bold text-white">Roblox Executor</span>
              </div>
              <p className="text-slate-400 text-sm">
                Der modernste Lua Script Executor für Roblox mit professionellen Features.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Produkt</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Downloads</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Dokumentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Kontakt</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Datenschutz</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Nutzungsbedingungen</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Impressum</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Lizenz</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-8 pt-8 text-center">
            <p className="text-slate-400 text-sm">
              © 2024 Roblox Executor Team. Alle Rechte vorbehalten. 
              Nicht verbunden mit Roblox Corporation.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}