#!/usr/bin/env node

/**
 * AI Analysis Debug Script
 * This script helps diagnose and fix issues with the AI analysis feature
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🔍 AI Analysis Debug Tool\n');

// Check if .env files exist
function checkEnvFiles() {
    console.log('📁 Checking environment files...');
    
    const frontendEnv = path.join(__dirname, '.env');
    const backendEnv = path.join(__dirname, 'backend', '.env');
    
    let issues = [];
    
    if (!fs.existsSync(frontendEnv)) {
        issues.push('❌ Frontend .env file missing');
    } else {
        console.log('✅ Frontend .env file exists');
        
        // Check if REACT_APP_BACKEND_URL is set
        const content = fs.readFileSync(frontendEnv, 'utf8');
        if (!content.includes('REACT_APP_BACKEND_URL')) {
            issues.push('❌ REACT_APP_BACKEND_URL not configured in frontend .env');
        } else {
            console.log('✅ REACT_APP_BACKEND_URL configured');
        }
    }
    
    if (!fs.existsSync(backendEnv)) {
        issues.push('❌ Backend .env file missing');
    } else {
        console.log('✅ Backend .env file exists');
        
        // Check if GEMINI_API_KEY is set
        const content = fs.readFileSync(backendEnv, 'utf8');
        if (content.includes('your_api_key_here')) {
            issues.push('⚠️  GEMINI_API_KEY needs to be configured in backend/.env');
        } else if (!content.includes('GEMINI_API_KEY')) {
            issues.push('❌ GEMINI_API_KEY not found in backend .env');
        } else {
            console.log('✅ GEMINI_API_KEY appears to be configured');
        }
    }
    
    return issues;
}

// Check if backend server is running
async function checkBackendServer() {
    console.log('\n🖥️  Checking backend server...');
    
    try {
        const response = await fetch('http://localhost:3001/api/health');
        if (response.ok) {
            console.log('✅ Backend server is running');
            return [];
        } else {
            return ['❌ Backend server responded with error'];
        }
    } catch (error) {
        return ['❌ Backend server is not running or not accessible'];
    }
}

// Check Node.js and npm versions
function checkNodeVersion() {
    console.log('\n🔧 Checking Node.js environment...');
    
    const nodeVersion = process.version;
    const npmVersion = require('child_process').execSync('npm --version', { encoding: 'utf8' }).trim();
    
    console.log(`✅ Node.js version: ${nodeVersion}`);
    console.log(`✅ npm version: ${npmVersion}`);
    
    // Check if versions meet requirements
    const nodeVersionNum = parseInt(nodeVersion.slice(1).split('.')[0]);
    if (nodeVersionNum < 18) {
        return ['⚠️  Node.js version should be 18 or higher'];
    }
    
    return [];
}

// Test API connectivity
async function testGeminiAPI() {
    console.log('\n🤖 Testing Gemini API connectivity...');
    
    const backendEnv = path.join(__dirname, 'backend', '.env');
    if (!fs.existsSync(backendEnv)) {
        return ['❌ Backend .env file not found'];
    }
    
    const content = fs.readFileSync(backendEnv, 'utf8');
    const apiKeyMatch = content.match(/GEMINI_API_KEY=(.+)/);
    
    if (!apiKeyMatch || apiKeyMatch[1] === 'your_api_key_here') {
        return ['⚠️  Gemini API key not configured'];
    }
    
    try {
        const response = await fetch('http://localhost:3001/api/gemini', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: 'Test connection - respond with "API working"'
            })
        });
        
        if (response.ok) {
            console.log('✅ Gemini API connection successful');
            return [];
        } else {
            const error = await response.json();
            return [`❌ Gemini API error: ${error.error || 'Unknown error'}`];
        }
    } catch (error) {
        return [`❌ Failed to test Gemini API: ${error.message}`];
    }
}

// Main diagnostic function
async function runDiagnostics() {
    console.log('Starting comprehensive AI analysis diagnostics...\n');
    
    let allIssues = [];
    
    // Check environment files
    allIssues.push(...checkEnvFiles());
    
    // Check Node.js version
    allIssues.push(...checkNodeVersion());
    
    // Check backend server
    allIssues.push(...await checkBackendServer());
    
    // Test API if backend is running
    if (!allIssues.some(issue => issue.includes('Backend server is not running'))) {
        allIssues.push(...await testGeminiAPI());
    }
    
    // Report results
    console.log('\n📊 Diagnostic Results:');
    console.log('='.repeat(50));
    
    if (allIssues.length === 0) {
        console.log('🎉 All checks passed! AI analysis should be working.');
    } else {
        console.log('❌ Issues found:');
        allIssues.forEach(issue => console.log(`   ${issue}`));
        
        console.log('\n🔧 Recommended fixes:');
        
        if (allIssues.some(issue => issue.includes('Backend server is not running'))) {
            console.log('   1. Start the backend server:');
            console.log('      cd backend && npm start');
        }
        
        if (allIssues.some(issue => issue.includes('GEMINI_API_KEY'))) {
            console.log('   2. Configure Gemini API key:');
            console.log('      - Get API key from: https://makersuite.google.com/app/apikey');
            console.log('      - Add to backend/.env: GEMINI_API_KEY=your_actual_api_key');
        }
        
        if (allIssues.some(issue => issue.includes('.env file missing'))) {
            console.log('   3. Create missing .env files from examples:');
            console.log('      cp .env.example .env');
            console.log('      cp backend/.env.example backend/.env');
        }
    }
    
    console.log('\n📚 For detailed setup instructions, see SETUP_GUIDE.md');
}

// Run diagnostics
runDiagnostics().catch(console.error);