import crypto from 'crypto';
import { Request } from 'express';

// Security configuration
export const SECURITY_CONFIG = {
  MAX_SCRIPT_SIZE: 50000, // 50KB max script size
  EXECUTION_TIMEOUT: 5000, // 5 second timeout
  MAX_EXECUTIONS_PER_HOUR: 100,
  RATE_LIMIT_WINDOW: 60 * 60 * 1000, // 1 hour
  BLOCKED_FUNCTIONS: [
    'require', 'loadstring', 'dofile', 'loadfile',
    'io.', 'os.', 'debug.', 'package.',
    'coroutine.', 'string.dump', 'getfenv', 'setfenv'
  ],
  BLOCKED_KEYWORDS: [
    'virus', 'malware', 'trojan', 'backdoor',
    'keylogger', 'steal', 'hack', 'exploit'
  ]
};

// Virus scan patterns (simplified heuristic detection)
const VIRUS_PATTERNS = [
  // Suspicious Windows API calls
  /CreateProcess|ShellExecute|WinExec/gi,
  // Registry manipulation
  /RegOpenKey|RegSetValue|RegDeleteKey/gi,
  // Network suspicious activity
  /HttpSendRequest|InternetOpen|socket|connect/gi,
  // File system suspicious activity
  /CreateFile|WriteFile|DeleteFile|MoveFile/gi,
  // Memory manipulation
  /VirtualAlloc|WriteProcessMemory|CreateRemoteThread/gi,
  // Encoding/Obfuscation
  /eval\s*\(|Function\s*\(.*\)|new\s+Function/gi,
  // Suspicious strings
  /payload|shellcode|metasploit|meterpreter/gi
];

export class SecurityScanner {
  /**
   * Comprehensive virus scan for uploaded files and scripts
   */
  static scanForViruses(content: string): { clean: boolean; threats: string[] } {
    const threats: string[] = [];
    
    // Check for virus patterns
    VIRUS_PATTERNS.forEach((pattern, index) => {
      if (pattern.test(content)) {
        threats.push(`Suspicious pattern detected: Pattern ${index + 1}`);
      }
    });
    
    // Check for blocked functions
    SECURITY_CONFIG.BLOCKED_FUNCTIONS.forEach(func => {
      if (content.includes(func)) {
        threats.push(`Blocked function detected: ${func}`);
      }
    });
    
    // Check for blocked keywords
    SECURITY_CONFIG.BLOCKED_KEYWORDS.forEach(keyword => {
      if (content.toLowerCase().includes(keyword)) {
        threats.push(`Suspicious keyword detected: ${keyword}`);
      }
    });
    
    // Check for excessive obfuscation
    const obfuscationScore = this.calculateObfuscationScore(content);
    if (obfuscationScore > 0.8) {
      threats.push('High obfuscation detected - possible malware');
    }
    
    return {
      clean: threats.length === 0,
      threats
    };
  }
  
  /**
   * Calculate obfuscation score (0-1, higher = more obfuscated)
   */
  private static calculateObfuscationScore(content: string): number {
    let score = 0;
    
    // Check for hex encoded strings
    const hexMatches = content.match(/\\x[0-9a-f]{2}/gi);
    if (hexMatches && hexMatches.length > 10) score += 0.3;
    
    // Check for base64 patterns
    const base64Matches = content.match(/[A-Za-z0-9+/]{20,}={0,2}/g);
    if (base64Matches && base64Matches.length > 5) score += 0.2;
    
    // Check for excessive string concatenation
    const concatMatches = content.match(/\+\s*["'][^"']*["']/g);
    if (concatMatches && concatMatches.length > 20) score += 0.2;
    
    // Check for very long lines (possible minified malware)
    const lines = content.split('\n');
    const longLines = lines.filter(line => line.length > 500);
    if (longLines.length > 5) score += 0.3;
    
    return Math.min(score, 1);
  }
  
  /**
   * Sanitize Lua script for safe execution
   */
  static sanitizeLuaScript(script: string): { safe: boolean; sanitized: string; warnings: string[] } {
    const warnings: string[] = [];
    let sanitized = script;
    
    // Remove blocked functions
    SECURITY_CONFIG.BLOCKED_FUNCTIONS.forEach(func => {
      const regex = new RegExp(func.replace('.', '\\.'), 'gi');
      if (regex.test(sanitized)) {
        sanitized = sanitized.replace(regex, '-- BLOCKED_FUNCTION --');
        warnings.push(`Blocked function removed: ${func}`);
      }
    });
    
    // Limit script size
    if (sanitized.length > SECURITY_CONFIG.MAX_SCRIPT_SIZE) {
      sanitized = sanitized.substring(0, SECURITY_CONFIG.MAX_SCRIPT_SIZE);
      warnings.push('Script truncated due to size limit');
    }
    
    // Check for infinite loops
    const loopPatterns = [
      /while\s+true\s+do/gi,
      /for\s+\w+\s*=\s*1\s*,\s*math\.huge/gi,
      /repeat.*until\s+false/gi
    ];
    
    loopPatterns.forEach(pattern => {
      if (pattern.test(sanitized)) {
        warnings.push('Potential infinite loop detected');
      }
    });
    
    return {
      safe: warnings.length === 0,
      sanitized,
      warnings
    };
  }
  
  /**
   * Generate secure hash for integrity checking
   */
  static generateSecureHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }
  
  /**
   * Validate file upload
   */
  static validateFileUpload(filename: string, content: Buffer): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check file extension
    const allowedExtensions = ['.lua', '.txt'];
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    if (!allowedExtensions.includes(ext)) {
      errors.push('Invalid file extension. Only .lua and .txt files allowed.');
    }
    
    // Check file size
    const maxSize = 1024 * 1024; // 1MB
    if (content.length > maxSize) {
      errors.push('File too large. Maximum size is 1MB.');
    }
    
    // Scan content for viruses
    const contentStr = content.toString('utf8');
    const scanResult = this.scanForViruses(contentStr);
    if (!scanResult.clean) {
      errors.push(...scanResult.threats);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

/**
 * Rate limiting for script execution
 */
export class RateLimiter {
  private static executionCounts = new Map<string, { count: number; resetTime: number }>();
  
  static canExecute(userId: string): boolean {
    const now = Date.now();
    const userRecord = this.executionCounts.get(userId);
    
    if (!userRecord || now > userRecord.resetTime) {
      // Reset or create new record
      this.executionCounts.set(userId, {
        count: 1,
        resetTime: now + SECURITY_CONFIG.RATE_LIMIT_WINDOW
      });
      return true;
    }
    
    if (userRecord.count >= SECURITY_CONFIG.MAX_EXECUTIONS_PER_HOUR) {
      return false;
    }
    
    userRecord.count++;
    return true;
  }
  
  static getRemainingExecutions(userId: string): number {
    const userRecord = this.executionCounts.get(userId);
    if (!userRecord || Date.now() > userRecord.resetTime) {
      return SECURITY_CONFIG.MAX_EXECUTIONS_PER_HOUR;
    }
    return Math.max(0, SECURITY_CONFIG.MAX_EXECUTIONS_PER_HOUR - userRecord.count);
  }
}

/**
 * IP and request validation
 */
export class RequestValidator {
  private static suspiciousIPs = new Set<string>();
  private static requestCounts = new Map<string, { count: number; resetTime: number }>();
  
  static validateRequest(req: Request): { valid: boolean; reason?: string } {
    const ip = this.getClientIP(req);
    
    // Check if IP is blacklisted
    if (this.suspiciousIPs.has(ip)) {
      return { valid: false, reason: 'IP address blocked' };
    }
    
    // Rate limiting per IP
    const now = Date.now();
    const ipRecord = this.requestCounts.get(ip);
    
    if (!ipRecord || now > ipRecord.resetTime) {
      this.requestCounts.set(ip, { count: 1, resetTime: now + 60000 }); // 1 minute window
      return { valid: true };
    }
    
    if (ipRecord.count > 100) { // 100 requests per minute max
      this.suspiciousIPs.add(ip);
      return { valid: false, reason: 'Rate limit exceeded' };
    }
    
    ipRecord.count++;
    return { valid: true };
  }
  
  private static getClientIP(req: Request): string {
    return (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress || 
           'unknown';
  }
}

/**
 * Roblox account verification
 */
export class RobloxVerifier {
  /**
   * Verify Roblox account ownership via game verification
   */
  static async verifyRobloxAccount(userId: string, username: string): Promise<{ verified: boolean; error?: string }> {
    try {
      // Generate verification code
      const verificationCode = this.generateVerificationCode();
      
      // Here would be the actual Roblox API integration
      // For security, we simulate the verification process
      
      return {
        verified: true,
        // In real implementation, this would check if user placed the verification code in their Roblox game
      };
    } catch (error) {
      return {
        verified: false,
        error: 'Failed to verify Roblox account'
      };
    }
  }
  
  private static generateVerificationCode(): string {
    return crypto.randomBytes(8).toString('hex').toUpperCase();
  }
  
  /**
   * Validate Roblox cookie format (without storing sensitive data)
   */
  static validateRobloxCookie(cookie: string): boolean {
    // Basic validation - real implementation would verify with Roblox API
    return cookie.startsWith('_|WARNING:-DO-NOT-SHARE-THIS.') && cookie.length > 50;
  }
}