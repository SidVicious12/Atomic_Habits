#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔍 Starting bundle analysis...\n');

// Build with analysis
console.log('📦 Building production bundle with analysis...');
try {
  execSync('ANALYZE=true npm run build', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Check if build was successful
if (!fs.existsSync('dist')) {
  console.error('❌ Build directory not found');
  process.exit(1);
}

// Get build stats
console.log('\n📊 Bundle Analysis Results:');
console.log('='.repeat(50));

// Calculate total size
function getDirectorySize(dir) {
  let totalSize = 0;
  
  function calculateSize(dirPath) {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        calculateSize(itemPath);
      } else {
        totalSize += stats.size;
      }
    }
  }
  
  calculateSize(dir);
  return totalSize;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Analyze JavaScript files
const jsDir = path.join('dist', 'js');
if (fs.existsSync(jsDir)) {
  console.log('\n📝 JavaScript Chunks:');
  const jsFiles = fs.readdirSync(jsDir)
    .filter(file => file.endsWith('.js'))
    .map(file => {
      const filePath = path.join(jsDir, file);
      const stats = fs.statSync(filePath);
      return { name: file, size: stats.size };
    })
    .sort((a, b) => b.size - a.size);
  
  jsFiles.forEach(file => {
    console.log(`  ${file.name}: ${formatBytes(file.size)}`);
  });
}

// Analyze CSS files
const cssDir = path.join('dist', 'css');
if (fs.existsSync(cssDir)) {
  console.log('\n🎨 CSS Files:');
  const cssFiles = fs.readdirSync(cssDir)
    .filter(file => file.endsWith('.css'))
    .map(file => {
      const filePath = path.join(cssDir, file);
      const stats = fs.statSync(filePath);
      return { name: file, size: stats.size };
    })
    .sort((a, b) => b.size - a.size);
  
  cssFiles.forEach(file => {
    console.log(`  ${file.name}: ${formatBytes(file.size)}`);
  });
}

// Total bundle size
const totalSize = getDirectorySize('dist');
console.log('\n📏 Total Bundle Size:', formatBytes(totalSize));

// Performance recommendations
console.log('\n💡 Performance Recommendations:');
console.log('='.repeat(50));

if (totalSize > 5 * 1024 * 1024) { // 5MB
  console.log('⚠️  Bundle size is large (>5MB). Consider:');
  console.log('   - Lazy loading more components');
  console.log('   - Tree shaking unused code');
  console.log('   - Compressing images');
} else if (totalSize > 2 * 1024 * 1024) { // 2MB
  console.log('⚠️  Bundle size is moderate (>2MB). Consider:');
  console.log('   - Implementing code splitting');
  console.log('   - Lazy loading heavy components');
} else {
  console.log('✅ Bundle size looks good (<2MB)');
}

// Check for analysis file
const statsFile = path.join('dist', 'stats.html');
if (fs.existsSync(statsFile)) {
  console.log(`\n🌐 Detailed analysis available at: file://${path.resolve(statsFile)}`);
  console.log('   Open this file in your browser for interactive bundle analysis');
} else {
  console.log('\n❌ Detailed analysis file not generated');
}

console.log('\n✨ Bundle analysis complete!');