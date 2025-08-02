import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { SecurityScanner, RateLimiter, RequestValidator } from "./security";
import { RobloxExecutor } from "./roblox-integration";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { insertUserSchema, insertScriptSchema } from "@shared/schema";

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || "super-secure-roblox-executor-secret-2024";

// Auth middleware
interface AuthRequest extends Request {
  user?: any;
}

const authenticateToken = (req: AuthRequest, res: Response, next: Function) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Security middleware for all API routes
  app.use('/api', (req, res, next) => {
    const validation = RequestValidator.validateRequest(req);
    if (!validation.valid) {
      return res.status(429).json({ error: validation.reason });
    }
    next();
  });

  // Registration endpoint
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, robloxUserId, robloxUsername } = req.body;
      
      // Validate input
      const validationResult = insertUserSchema.safeParse({ username, password, robloxUserId, robloxUsername });
      if (!validationResult.success) {
        return res.status(400).json({ error: "Invalid input data" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ error: "Username already exists" });
      }

      // Check Roblox ID if provided
      if (robloxUserId) {
        const existingRobloxUser = await storage.getUserByRobloxId(robloxUserId);
        if (existingRobloxUser) {
          return res.status(409).json({ error: "Roblox account already linked to another user" });
        }
      }

      // Create user
      const user = await storage.createUser(validationResult.data);

      // Log security event
      await storage.logSecurityEvent({
        userId: user.id,
        action: 'USER_REGISTERED',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: "User registered successfully",
        token,
        user: {
          id: user.id,
          username: user.username,
          robloxUsername: user.robloxUsername,
          isVerified: user.isVerified,
          isPremium: user.isPremium,
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      // Get user
      const user = await storage.getUserByUsername(username);
      if (!user || !user.password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        // Log failed login attempt
        await storage.logSecurityEvent({
          userId: user.id,
          action: 'LOGIN_FAILED',
          details: { reason: 'invalid_password' },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
        });
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Update last login
      await storage.updateUser(user.id, { lastLogin: new Date() });

      // Log successful login
      await storage.logSecurityEvent({
        userId: user.id,
        action: 'LOGIN_SUCCESS',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, username: user.username },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          username: user.username,
          robloxUsername: user.robloxUsername,
          isVerified: user.isVerified,
          isPremium: user.isPremium,
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Execute Lua script
  app.post("/api/execute", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { script, gameId } = req.body;
      const userId = req.user.userId;

      if (!script) {
        return res.status(400).json({ error: "Script content required" });
      }

      // Security scan
      const scanResult = SecurityScanner.scanForViruses(script);
      if (!scanResult.clean) {
        await storage.logSecurityEvent({
          userId,
          action: 'MALICIOUS_SCRIPT_BLOCKED',
          details: { threats: scanResult.threats },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
        });
        
        return res.status(400).json({ 
          error: "Security threat detected",
          threats: scanResult.threats 
        });
      }

      // Execute script
      const result = await RobloxExecutor.executeScript({
        userId: userId.toString(),
        script,
        gameId,
      });

      // Log execution
      await storage.logExecution({
        userId,
        gameId,
        success: result.success,
        errorMessage: result.error,
      });

      res.json(result);
    } catch (error) {
      console.error("Script execution error:", error);
      res.status(500).json({ error: "Script execution failed" });
    }
  });

  // Save script
  app.post("/api/scripts", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { name, content, isPublic } = req.body;
      const userId = req.user.userId;

      // Validate input
      const validationResult = insertScriptSchema.safeParse({
        userId,
        name,
        content,
        isPublic: isPublic || false,
      });

      if (!validationResult.success) {
        return res.status(400).json({ error: "Invalid script data" });
      }

      // Security scan
      const scanResult = SecurityScanner.scanForViruses(content);
      if (!scanResult.clean) {
        return res.status(400).json({ 
          error: "Security threat detected in script",
          threats: scanResult.threats 
        });
      }

      const script = await storage.saveScript(validationResult.data);

      res.json({ message: "Script saved successfully", script });
    } catch (error) {
      console.error("Script save error:", error);
      res.status(500).json({ error: "Failed to save script" });
    }
  });

  // Get user scripts
  app.get("/api/scripts", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user.userId;
      const scripts = await storage.getUserScripts(userId);
      res.json({ scripts });
    } catch (error) {
      console.error("Get scripts error:", error);
      res.status(500).json({ error: "Failed to get scripts" });
    }
  });

  // Delete script
  app.delete("/api/scripts/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const scriptId = parseInt(req.params.id);
      const userId = req.user.userId;

      if (isNaN(scriptId)) {
        return res.status(400).json({ error: "Invalid script ID" });
      }

      const success = await storage.deleteScript(scriptId, userId);
      if (success) {
        res.json({ message: "Script deleted successfully" });
      } else {
        res.status(404).json({ error: "Script not found" });
      }
    } catch (error) {
      console.error("Delete script error:", error);
      res.status(500).json({ error: "Failed to delete script" });
    }
  });

  // Link Roblox account
  app.post("/api/roblox/link", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { robloxUserId, robloxUsername, robloxCookie } = req.body;
      const userId = req.user.userId;

      if (!robloxUserId || !robloxUsername) {
        return res.status(400).json({ error: "Roblox user ID and username required" });
      }

      // Check if Roblox account is already linked
      const existingRobloxUser = await storage.getUserByRobloxId(robloxUserId);
      if (existingRobloxUser && existingRobloxUser.id !== userId) {
        return res.status(409).json({ error: "Roblox account already linked to another user" });
      }

      // Update user with Roblox info
      await storage.updateUser(userId, {
        robloxUserId,
        robloxUsername,
        robloxCookie: robloxCookie || undefined,
      });

      // Log security event
      await storage.logSecurityEvent({
        userId,
        action: 'ROBLOX_ACCOUNT_LINKED',
        details: { robloxUserId, robloxUsername },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json({ message: "Roblox account linked successfully" });
    } catch (error) {
      console.error("Roblox link error:", error);
      res.status(500).json({ error: "Failed to link Roblox account" });
    }
  });

  // Get user games
  app.get("/api/roblox/games", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user.userId;
      const user = await storage.getUser(userId);
      
      if (!user?.robloxUserId) {
        return res.status(400).json({ error: "Roblox account not linked" });
      }

      const games = await RobloxExecutor.getUserGames(user.robloxUserId);
      res.json(games);
    } catch (error) {
      console.error("Get games error:", error);
      res.status(500).json({ error: "Failed to get games" });
    }
  });

  // Get user profile
  app.get("/api/profile", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user.userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        user: {
          id: user.id,
          username: user.username,
          robloxUserId: user.robloxUserId,
          robloxUsername: user.robloxUsername,
          isVerified: user.isVerified,
          isPremium: user.isPremium,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
        }
      });
    } catch (error) {
      console.error("Profile error:", error);
      res.status(500).json({ error: "Failed to get profile" });
    }
  });

  // Security check endpoint
  app.post("/api/security/scan", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({ error: "Content required for scanning" });
      }

      const scanResult = SecurityScanner.scanForViruses(content);
      const sanitizeResult = SecurityScanner.sanitizeLuaScript(content);

      res.json({
        clean: scanResult.clean,
        threats: scanResult.threats,
        warnings: sanitizeResult.warnings,
        sanitized: sanitizeResult.sanitized !== content,
      });
    } catch (error) {
      console.error("Security scan error:", error);
      res.status(500).json({ error: "Security scan failed" });
    }
  });

  // Rate limit status
  app.get("/api/limits", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const userId = req.user.userId;
      const remaining = RateLimiter.getRemainingExecutions(userId.toString());
      
      res.json({
        remainingExecutions: remaining,
        maxExecutionsPerHour: 100,
      });
    } catch (error) {
      console.error("Rate limit error:", error);
      res.status(500).json({ error: "Failed to get rate limits" });
    }
  });

  // Health check
  app.get("/api/health", async (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      version: "2.0.1",
      security: "enabled"
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
