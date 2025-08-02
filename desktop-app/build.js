const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building Roblox Lua Executor Desktop App...\n');

// Check if required dependencies are installed
try {
  require('electron');
  require('electron-builder');
} catch (error) {
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit', cwd: __dirname });
}

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Build for different platforms
const platforms = process.argv.slice(2);

if (platforms.length === 0) {
  console.log('📋 Available build options:');
  console.log('  npm run build:win   - Windows (x64 & x86)');
  console.log('  npm run build:mac   - macOS');
  console.log('  npm run build:linux - Linux AppImage');
  console.log('  npm run build       - All platforms');
  process.exit(0);
}

try {
  if (platforms.includes('win') || platforms.includes('all')) {
    console.log('🪟 Building for Windows...');
    execSync('npx electron-builder --win', { stdio: 'inherit', cwd: __dirname });
  }

  if (platforms.includes('mac') || platforms.includes('all')) {
    console.log('🍎 Building for macOS...');
    execSync('npx electron-builder --mac', { stdio: 'inherit', cwd: __dirname });
  }

  if (platforms.includes('linux') || platforms.includes('all')) {
    console.log('🐧 Building for Linux...');
    execSync('npx electron-builder --linux', { stdio: 'inherit', cwd: __dirname });
  }

  console.log('\n✅ Build completed successfully!');
  console.log('📁 Check the dist/ folder for your executables');

} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
}