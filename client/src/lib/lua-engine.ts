// Since we can't use actual Lua.vm.js in this environment, we'll create a mock interpreter
// that simulates Lua execution with Roblox-like APIs

import { createRobloxAPI } from './roblox-api';

export interface LuaExecutionResult {
  success: boolean;
  output: string[];
  errors: string[];
  executionTime: number;
  memoryUsage: number;
}

export class LuaEngine {
  private timeout: number = 100; // 100ms timeout
  private maxMemory: number = 50 * 1024 * 1024; // 50MB
  private robloxAPI: any;
  private outputBuffer: string[] = [];
  private errorBuffer: string[] = [];

  constructor() {
    this.robloxAPI = createRobloxAPI();
    this.setupPrintFunction();
  }

  private setupPrintFunction() {
    this.robloxAPI.print = (...args: any[]) => {
      const message = args.map(arg => this.formatValue(arg)).join(' ');
      this.outputBuffer.push(message);
    };

    this.robloxAPI.warn = (...args: any[]) => {
      const message = args.map(arg => this.formatValue(arg)).join(' ');
      this.errorBuffer.push(`Warning: ${message}`);
    };
  }

  private formatValue(value: any): string {
    if (value === null || value === undefined) {
      return 'nil';
    }
    if (typeof value === 'object') {
      if (value.constructor.name === 'Vector3') {
        return `${value.X}, ${value.Y}, ${value.Z}`;
      }
      if (value.constructor.name === 'Part' || value.constructor.name === 'Instance') {
        return value.Name || value.ClassName || 'Instance';
      }
      return JSON.stringify(value);
    }
    return String(value);
  }

  private simulateLuaExecution(code: string): void {
    // Clear buffers
    this.outputBuffer = [];
    this.errorBuffer = [];

    try {
      // Create a sandboxed environment
      const sandbox = {
        ...this.robloxAPI,
        // Add some basic Lua-like functions
        tonumber: (value: any) => Number(value) || 0,
        tostring: (value: any) => String(value),
        type: (value: any) => typeof value,
      };

      // Parse and execute Lua-like code
      this.parseLuaCode(code, sandbox);
    } catch (error: any) {
      this.errorBuffer.push(`Runtime error: ${error?.message || 'Unknown error'}`);
    }
  }

  private parseLuaCode(code: string, sandbox: any): void {
    const lines = code.split('\n');
    const variables: { [key: string]: any } = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines and comments
      if (!line || line.startsWith('--')) continue;

      try {
        this.executeLine(line, sandbox, variables);
      } catch (error: any) {
        this.errorBuffer.push(`Line ${i + 1}: ${error?.message || 'Unknown error'}`);
      }
    }
  }

  private executeLine(line: string, sandbox: any, variables: any): void {
    // Handle local variable declarations
    if (line.startsWith('local ')) {
      const match = line.match(/local\s+(\w+)\s*=\s*(.+)/);
      if (match) {
        const [, varName, expression] = match;
        const value = this.evaluateExpression(expression, sandbox, variables);
        variables[varName] = value;
        return;
      }
    }

    // Handle assignments
    const assignMatch = line.match(/(\w+(?:\.\w+)*)\s*=\s*(.+)/);
    if (assignMatch) {
      const [, target, expression] = assignMatch;
      const value = this.evaluateExpression(expression, sandbox, variables);
      
      if (target.includes('.')) {
        const parts = target.split('.');
        let obj = variables[parts[0]];
        for (let i = 1; i < parts.length - 1; i++) {
          obj = obj[parts[i]];
        }
        obj[parts[parts.length - 1]] = value;
      } else {
        variables[target] = value;
      }
      return;
    }

    // Handle function calls
    const funcMatch = line.match(/(\w+(?:\.\w+)*)\s*\((.*)\)/);
    if (funcMatch) {
      const [, funcName, argsStr] = funcMatch;
      const args = this.parseArguments(argsStr, sandbox, variables);
      
      // Find and call the function
      const func = this.resolveFunction(funcName, sandbox, variables);
      if (func && typeof func === 'function') {
        func(...args);
      } else {
        throw new Error(`Function '${funcName}' is not defined`);
      }
    }
  }

  private evaluateExpression(expression: string, sandbox: any, variables: any): any {
    expression = expression.trim();

    // Handle string literals
    if (expression.startsWith('"') && expression.endsWith('"')) {
      return expression.slice(1, -1);
    }

    // Handle numbers
    if (/^\d+(\.\d+)?$/.test(expression)) {
      return Number(expression);
    }

    // Handle function calls
    const funcMatch = expression.match(/(\w+(?:\.\w+)*)\s*\((.*)\)/);
    if (funcMatch) {
      const [, funcName, argsStr] = funcMatch;
      const args = this.parseArguments(argsStr, sandbox, variables);
      const func = this.resolveFunction(funcName, sandbox, variables);
      
      if (func && typeof func === 'function') {
        return func(...args);
      }
    }

    // Handle property access
    if (expression.includes('.')) {
      const parts = expression.split('.');
      let obj = variables[parts[0]] || sandbox[parts[0]];
      for (let i = 1; i < parts.length; i++) {
        obj = obj[parts[i]];
      }
      return obj;
    }

    // Handle variables
    return variables[expression] || sandbox[expression];
  }

  private parseArguments(argsStr: string, sandbox: any, variables: any): any[] {
    if (!argsStr.trim()) return [];
    
    const args: any[] = [];
    const argParts = this.splitArguments(argsStr);
    
    for (const arg of argParts) {
      args.push(this.evaluateExpression(arg, sandbox, variables));
    }
    
    return args;
  }

  private splitArguments(argsStr: string): string[] {
    const args: string[] = [];
    let current = '';
    let parenCount = 0;
    let inString = false;
    
    for (let i = 0; i < argsStr.length; i++) {
      const char = argsStr[i];
      
      if (char === '"' && (i === 0 || argsStr[i - 1] !== '\\')) {
        inString = !inString;
      }
      
      if (!inString) {
        if (char === '(') parenCount++;
        if (char === ')') parenCount--;
        
        if (char === ',' && parenCount === 0) {
          args.push(current.trim());
          current = '';
          continue;
        }
      }
      
      current += char;
    }
    
    if (current.trim()) {
      args.push(current.trim());
    }
    
    return args;
  }

  private resolveFunction(funcName: string, sandbox: any, variables: any): any {
    if (funcName.includes('.')) {
      const parts = funcName.split('.');
      let obj = variables[parts[0]] || sandbox[parts[0]];
      for (let i = 1; i < parts.length; i++) {
        obj = obj[parts[i]];
      }
      return obj;
    }
    
    return variables[funcName] || sandbox[funcName];
  }

  execute(code: string): Promise<LuaExecutionResult> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      // Set timeout
      const timeoutId = setTimeout(() => {
        resolve({
          success: false,
          output: this.outputBuffer,
          errors: [...this.errorBuffer, 'Execution timeout (100ms exceeded)'],
          executionTime: this.timeout,
          memoryUsage: 1024 // Mock memory usage
        });
      }, this.timeout);

      try {
        this.simulateLuaExecution(code);
        
        clearTimeout(timeoutId);
        const executionTime = Date.now() - startTime;
        
        resolve({
          success: this.errorBuffer.length === 0,
          output: this.outputBuffer,
          errors: this.errorBuffer,
          executionTime,
          memoryUsage: Math.random() * 10000 + 1024 // Mock memory usage
        });
      } catch (error: any) {
        clearTimeout(timeoutId);
        resolve({
          success: false,
          output: this.outputBuffer,
          errors: [...this.errorBuffer, `Fatal error: ${error?.message || 'Unknown error'}`],
          executionTime: Date.now() - startTime,
          memoryUsage: 1024
        });
      }
    });
  }
}
