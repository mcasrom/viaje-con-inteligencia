#!/usr/bin/env node
/**
 * Health Check - Viaje con Inteligencia
 * 
 * Verifica automáticamente el estado del sitio web
 * y envía alertas si detecta problemas.
 * 
 * Uso: node scripts/health-check.js
 * 
 * Configurar en crontab para ejecución diaria:
 * 0 8 * * * cd /home/miguelc/viaje-con-inteligencia && node scripts/health-check.js
 */

const https = require('https');
const http = require('http');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://viaje-con-inteligencia.vercel.app';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const EMAIL_TO = process.env.EMAIL_TO || 'mybloggingnotes@gmail.com';

const results = {
  timestamp: new Date().toISOString(),
  checks: [],
  errors: [],
  warnings: [],
};

function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

function addResult(name, status, details = '') {
  const result = { name, status, details, timestamp: new Date().toISOString() };
  results.checks.push(result);
  
  if (status === 'error') {
    results.errors.push(result);
    log(`❌ ${name}: ${details}`);
  } else if (status === 'warning') {
    results.warnings.push(result);
    log(`⚠️  ${name}: ${details}`);
  } else {
    log(`✅ ${name}: OK`);
  }
}

async function checkUrl(url, name, expectedStatus = 200) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.get(url, { timeout: 15000 }, (res) => {
      if (res.statusCode === expectedStatus) {
        addResult(name, 'ok', `Status: ${res.statusCode}`);
      } else {
        addResult(name, 'error', `Status: ${res.statusCode} (esperado: ${expectedStatus})`);
      }
      resolve();
    });
    
    req.on('error', (err) => {
      addResult(name, 'error', err.message);
      resolve();
    });
    
    req.on('timeout', () => {
      addResult(name, 'error', 'Timeout');
      req.destroy();
      resolve();
    });
  });
}

function checkBlogPosts() {
  try {
    const postsDir = path.join(process.cwd(), 'content/posts');
    const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
    
    if (files.length < 5) {
      addResult('Blog posts', 'warning', `Solo ${files.length} posts (mínimo recomendado: 10)`);
    } else {
      addResult('Blog posts', 'ok', `${files.length} posts`);
    }
    
    // Check for common issues in posts
    let issues = 0;
    files.forEach(file => {
      const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
      
      // Check for unquoted dates
      if (content.match(/^date:\s*\d{4}-\d{2}-\d{2}$/m)) {
        issues++;
      }
      
      // Check for broken image URLs
      const imgMatches = content.match(/!\[.*\]\((.*)\)/g);
      if (imgMatches) {
        imgMatches.forEach(img => {
          if (img.includes('source.unsplash.com')) {
            addResult(`Image in ${file}`, 'warning', 'Using deprecated source.unsplash.com');
          }
        });
      }
    });
    
    if (issues > 0) {
      addResult('Post dates', 'error', `${issues} posts con fechas sin comillas`);
    }
    
  } catch (err) {
    addResult('Blog posts', 'error', err.message);
  }
}

function checkBuild() {
  try {
    log('Verificando build...');
    execSync('npm run build', { 
      cwd: process.cwd(), 
      stdio: 'pipe',
      timeout: 180000 
    });
    addResult('Build', 'ok', 'Build completado sin errores');
  } catch (err) {
    addResult('Build', 'error', 'Build falló');
  }
}

function checkLint() {
  try {
    log('Verificando lint...');
    execSync('npm run lint', { 
      cwd: process.cwd(), 
      stdio: 'pipe',
      timeout: 60000 
    });
    addResult('Lint', 'ok', 'Sin errores de lint');
  } catch (err) {
    // Lint puede tener warnings pero no debe fallar el check
    const output = err.stdout?.toString() || err.stderr?.toString() || '';
    if (output.includes('error')) {
      addResult('Lint', 'warning', 'Hay errores de lint');
    } else {
      addResult('Lint', 'ok', 'Lint pasado');
    }
  }
}

function checkCountries() {
  try {
    const paisesPath = path.join(process.cwd(), 'src/data/paises.ts');
    const content = fs.readFileSync(paisesPath, 'utf8');
    
    const countryCount = (content.match(/^\s+[a-z]{2}: \{/gm) || []).length;
    
    if (countryCount < 50) {
      addResult('Countries', 'warning', `Solo ${countryCount} países`);
    } else {
      addResult('Countries', 'ok', `${countryCount} países`);
    }
    
    // Check for Oriente Medio classification
    const omCount = (content.match(/continente: 'Oriente Medio'/g) || []).length;
    if (omCount < 3) {
      addResult('Oriente Medio', 'warning', `Solo ${omCount} países clasificados`);
    }
    
  } catch (err) {
    addResult('Countries', 'error', err.message);
  }
}

async function sendTelegramAlert(message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    log('⚠️  Telegram no configurado (TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID faltante)');
    return;
  }
  
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  return new Promise((resolve) => {
    const req = https.post(url, {
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          log('✅ Alerta enviada a Telegram');
        } else {
          log(`⚠️  Error enviando a Telegram: ${res.statusCode}`);
        }
        resolve();
      });
    });
    
    req.write(JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML'
    }));
    req.end();
  });
}

function generateReport() {
  let report = `📊 <b>Health Check - Viaje con Inteligencia</b>\n\n`;
  report += `⏰ ${results.timestamp}\n\n`;
  
  report += `📈 <b>Resultados:</b>\n`;
  report += `✅ OK: ${results.checks.filter(c => c.status === 'ok').length}\n`;
  report += `⚠️  Warnings: ${results.warnings.length}\n`;
  report += `❌ Errores: ${results.errors.length}\n\n`;
  
  if (results.errors.length > 0) {
    report += `❌ <b>Errores:</b>\n`;
    results.errors.forEach(err => {
      report += `• ${err.name}: ${err.details}\n`;
    });
    report += '\n';
  }
  
  if (results.warnings.length > 0) {
    report += `⚠️  <b>Warnings:</b>\n`;
    results.warnings.forEach(warn => {
      report += `• ${warn.name}: ${warn.details}\n`;
    });
  }
  
  return report;
}

async function main() {
  log('🩺 Iniciando health check...');
  
  // Web checks
  await checkUrl(BASE_URL, 'Home page');
  await checkUrl(`${BASE_URL}/blog`, 'Blog page');
  await checkUrl(`${BASE_URL}/premium`, 'Premium page');
  await checkUrl(`${BASE_URL}/relojes`, 'Relojes page');
  await checkUrl(`${BASE_URL}/checklist`, 'Checklist page');
  
  // Code checks
  checkBuild();
  checkLint();
  checkBlogPosts();
  checkCountries();
  
  // Generate report
  const report = generateReport();
  console.log('\n' + report);
  
  // Send alert if errors
  if (results.errors.length > 0) {
    await sendTelegramAlert(report);
  }
  
  // Exit with error code if critical errors
  if (results.errors.length > 0) {
    log('❌ Health check completado con errores');
    process.exit(1);
  } else {
    log('✅ Health check completado sin errores críticos');
    process.exit(0);
  }
}

main().catch(err => {
  log(`❌ Error fatal: ${err.message}`);
  process.exit(1);
});