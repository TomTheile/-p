import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, UserPlus, LogIn, Eye, EyeOff } from "lucide-react";

export default function AuthPage() {
  const { login, register, isLoginLoading, isRegisterLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  
  // Login form state
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    robloxUserId: "",
    robloxUsername: "",
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginData.username && loginData.password) {
      login(loginData);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    if (registerData.username && registerData.password) {
      register({
        username: registerData.username,
        password: registerData.password,
        robloxUserId: registerData.robloxUserId || undefined,
        robloxUsername: registerData.robloxUsername || undefined,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Shield className="h-8 w-8 text-green-500" />
            <h1 className="text-3xl font-bold text-white">RobloxLua Pro</h1>
          </div>
          <p className="text-gray-400">Secure Lua Script Executor für Roblox</p>
        </div>

        {/* Security Badge */}
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center space-x-2">
            <Shield className="h-4 w-4 text-green-500" />
            <span className="text-green-400 text-sm font-medium">100% Virus-Free & Secure</span>
          </div>
          <p className="text-green-300 text-xs mt-1">Comprehensive anti-malware protection enabled</p>
        </div>

        {/* Auth Tabs */}
        <Card className="bg-gray-800 border-gray-700">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-700">
              <TabsTrigger value="login" className="data-[state=active]:bg-gray-600">
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-gray-600">
                <UserPlus className="h-4 w-4 mr-2" />
                Register
              </TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <CardHeader>
                <CardTitle className="text-white">Login to Your Account</CardTitle>
                <CardDescription className="text-gray-400">
                  Access your secure Lua executor environment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username" className="text-gray-300">Username</Label>
                    <Input
                      id="login-username"
                      type="text"
                      value={loginData.username}
                      onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Enter your username"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-gray-300">Password</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        value={loginData.password}
                        onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                        className="bg-gray-700 border-gray-600 text-white pr-10"
                        placeholder="Enter your password"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isLoginLoading}
                  >
                    {isLoginLoading ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register">
              <CardHeader>
                <CardTitle className="text-white">Create New Account</CardTitle>
                <CardDescription className="text-gray-400">
                  Join our secure platform for Roblox script execution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-username" className="text-gray-300">Username</Label>
                    <Input
                      id="register-username"
                      type="text"
                      value={registerData.username}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, username: e.target.value }))}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Choose a username"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-gray-300">Password</Label>
                    <div className="relative">
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        value={registerData.password}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                        className="bg-gray-700 border-gray-600 text-white pr-10"
                        placeholder="Create a strong password"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-gray-300">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                  
                  {/* Optional Roblox Account Linking */}
                  <div className="border-t border-gray-600 pt-4 space-y-4">
                    <div className="text-sm text-gray-400">
                      <strong>Optional:</strong> Link your Roblox account for advanced features
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="roblox-userid" className="text-gray-300">Roblox User ID</Label>
                      <Input
                        id="roblox-userid"
                        type="text"
                        value={registerData.robloxUserId}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, robloxUserId: e.target.value }))}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Your Roblox User ID (optional)"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="roblox-username" className="text-gray-300">Roblox Username</Label>
                      <Input
                        id="roblox-username"
                        type="text"
                        value={registerData.robloxUsername}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, robloxUsername: e.target.value }))}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Your Roblox username (optional)"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isRegisterLoading}
                  >
                    {isRegisterLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Security Features */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-3">Security Features</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-300">Real-time malware scanning</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-300">Secure password hashing</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-300">Rate limiting protection</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-300">Secure Roblox integration</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}