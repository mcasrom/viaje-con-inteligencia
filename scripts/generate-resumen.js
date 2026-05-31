#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

function cmd(c) {
  try { return execSync(c, { encoding: 'utf8', timeout: 10000 }).trim(); }
  catch { return ''; }
}

function parseGoAccess() {
  const html = fs.readFileSync('/var/www/html/trafico.html', 'latin1');
  const startMatch = html.indexOf('var json_data={');
  if (startMatch === -1) return null;

  const start = startMatch + 'var json_data='.length;
  const end = html.indexOf('</script>', start);
  if (end === -1) return null;

  const jsonStr = html.substring(start, end).replace(/;$/, '').trim();
  try {
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

function getPM2Status() {
  try {
    const json = cmd('pm2 jlist');
    const list = JSON.parse(json);
    const viaje = list.find(p => p.name === 'viajeinteligencia');
    if (!viaje) return { status: 'unknown', restarts: 0, memory: 0, cpu: 0 };
    return {
      status: viaje.pm2_env.status,
      restarts: viaje.pm2_env.restart_time,
      memory: viaje.monit.memory,
      cpu: viaje.monit.cpu,
    };
  } catch {
    return { status: 'error', restarts: 0, memory: 0, cpu: 0 };
  }
}

function getServerInfo() {
  const free = cmd("free -m | awk 'NR==2{printf \"%s/%s MB (%.0f%%)\", $3, $2, $3/$2*100}'");
  const disk = cmd("df -h / | awk 'NR==2{printf \"%s/%s (%s)\", $3, $2, $5}'");
  const uptime = cmd("uptime -p");
  return { free, disk, uptime };
}

function fmt(n) {
  if (!n) return '0';
  return Number(n).toLocaleString('es-ES');
}

function generateHTML(data, pm2, server) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  const g = data?.general || {};
  const visitors = data?.visitors?.data || [];
  const statusCodes = data?.status_codes?.data || [];
  const browsers = data?.browsers?.data || [];
  const os = data?.os?.data || [];
  const referrers = data?.referring_sites?.data || [];
  const notFound = data?.not_found?.data || [];

  const totalRequests = g.total_requests || 0;
  const uniqueVisitors = g.unique_visitors || 0;
  const bandwidth = g.bandwidth || 0;
  const avgDaily = visitors.length > 0 ? Math.round(totalRequests / visitors.length) : 0;

  // Browsers breakdown
  const topBrowsers = browsers.slice(0, 5).map(b => ({
    name: b.data, hits: b.hits,
    pct: totalRequests > 0 ? Math.round(b.hits / totalRequests * 100) : 0
  }));

  // OS breakdown
  const topOS = os.slice(0, 5).map(o => ({
    name: o.data, hits: o.hits,
    pct: totalRequests > 0 ? Math.round(o.hits / totalRequests * 100) : 0
  }));

  // Referrers
  const topReferrers = referrers.slice(0, 5).map(r => ({
    name: r.data, hits: r.hits
  }));

  // Status codes
  let ok200 = 0, redirects = 0, notFound404 = 0, errors500 = 0;
  for (const s of statusCodes) {
    const code = s.data || '';
    const count = s.hits || 0;
    if (code.startsWith('2')) ok200 += count;
    else if (code.startsWith('3')) redirects += count;
    else if (code.startsWith('4')) notFound404 += count;
    else if (code.startsWith('5')) errors500 += count;
  }

  // Bandwidth
  const bwMB = (Number(bandwidth) / (1024 * 1024)).toFixed(1);

  // PM2
  const pm2Status = pm2.status === 'online' ? 'Operativo' : pm2.status === 'stopped' ? 'Detenido' : 'Error';
  const pm2Class = pm2.status === 'online' ? 'online' : 'offline';
  const availText = pm2.restarts === 0 ? '100%' : pm2.restarts < 5 ? 'Alta' : 'Media';
  const availClass = pm2.restarts === 0 ? 'green' : pm2.restarts < 5 ? 'amber' : 'red';

  // Not found top
  const top404 = notFound.slice(0, 5).map(n => n.data);

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Resumen — Viaje con Inteligencia</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; }
  .container { max-width: 900px; margin: 0 auto; padding: 24px 16px; }
  h1 { font-size: 1.5rem; color: #f59e0b; margin-bottom: 4px; }
  .subtitle { color: #64748b; font-size: 0.85rem; margin-bottom: 24px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 24px; }
  .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 16px; }
  .card-label { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
  .card-value { font-size: 1.5rem; font-weight: 700; color: #f8fafc; }
  .green { color: #22c55e; } .amber { color: #f59e0b; } .red { color: #ef4444; } .blue { color: #3b82f6; }
  .section { margin-bottom: 24px; }
  .section-title { font-size: 1rem; font-weight: 600; color: #cbd5e1; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #334155; }
  .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 999px; font-size: 0.8rem; font-weight: 600; }
  .online { background: #22c55e20; color: #22c55e; border: 1px solid #22c55e40; }
  .offline { background: #ef444420; color: #ef4444; border: 1px solid #ef444440; }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
  .bar-row { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
  .bar-label { width: 100px; font-size: 0.8rem; color: #94a3b8; flex-shrink: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .bar-track { flex: 1; height: 8px; background: #334155; border-radius: 4px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 4px; }
  .bar-value { width: 40px; text-align: right; font-size: 0.8rem; font-weight: 600; flex-shrink: 0; }
  .footer { text-align: center; padding: 24px 0; color: #475569; font-size: 0.75rem; }
  .footer a { color: #3b82f6; text-decoration: none; }
  .footer a:hover { text-decoration: underline; }
  .link-card { background: linear-gradient(135deg, #1e3a5f, #1e293b); border: 1px solid #3b82f640; }
  .link-card a { color: #3b82f6; text-decoration: none; font-weight: 600; }
  .link-card a:hover { text-decoration: underline; }
  .list-item { padding: 4px 0; font-size: 0.85rem; color: #cbd5e1; border-bottom: 1px solid #1e293b; }
  .list-item:last-child { border-bottom: none; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  @media (max-width: 600px) { .two-col { grid-template-columns: 1fr; } }
</style>
</head>
<body>
<div class="container">
  <h1>📊 Resumen de Tráfico</h1>
  <p class="subtitle">Viaje con Inteligencia — ${dateStr} a las ${timeStr}</p>

  <div class="section">
    <div class="section-title">Estado del Servicio</div>
    <div class="grid">
      <div class="card">
        <div class="card-label">Estado</div>
        <div><span class="status-badge ${pm2Class}"><span class="dot"></span>${pm2Status}</span></div>
      </div>
      <div class="card">
        <div class="card-label">Disponibilidad</div>
        <div class="card-value ${availClass}">${availText}</div>
      </div>
      <div class="card">
        <div class="card-label">RAM</div>
        <div class="card-value blue">${server.free}</div>
      </div>
      <div class="card">
        <div class="card-label">Disco</div>
        <div class="card-value amber">${server.disk}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Tráfico</div>
    <div class="grid">
      <div class="card">
        <div class="card-label">Visitas Totales</div>
        <div class="card-value">${fmt(totalRequests)}</div>
      </div>
      <div class="card">
        <div class="card-label">Visitantes Únicos</div>
        <div class="card-value blue">${fmt(uniqueVisitors)}</div>
      </div>
      <div class="card">
        <div class="card-label">Media Diaria</div>
        <div class="card-value">${fmt(avgDaily)}</div>
      </div>
      <div class="card">
        <div class="card-label">Ancho de Banda</div>
        <div class="card-value">${bwMB} MB</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Códigos de Respuesta</div>
    <div class="card" style="padding: 20px;">
      <div class="bar-row">
        <span class="bar-label">✅ 200 OK</span>
        <div class="bar-track"><div class="bar-fill" style="width:${totalRequests > 0 ? Math.round(ok200/totalRequests*100) : 0}%;background:#22c55e;"></div></div>
        <span class="bar-value green">${fmt(ok200)}</span>
      </div>
      <div class="bar-row">
        <span class="bar-label">↩️ Redirects</span>
        <div class="bar-track"><div class="bar-fill" style="width:${totalRequests > 0 ? Math.round(redirects/totalRequests*100) : 0}%;background:#3b82f6;"></div></div>
        <span class="bar-value blue">${fmt(redirects)}</span>
      </div>
      <div class="bar-row">
        <span class="bar-label">❌ 404</span>
        <div class="bar-track"><div class="bar-fill" style="width:${totalRequests > 0 ? Math.round(notFound404/totalRequests*100) : 0}%;background:#f59e0b;"></div></div>
        <span class="bar-value amber">${fmt(notFound404)}</span>
      </div>
      <div class="bar-row">
        <span class="bar-label">🔥 5xx</span>
        <div class="bar-track"><div class="bar-fill" style="width:${totalRequests > 0 ? Math.round(errors500/totalRequests*100) : 0}%;background:#ef4444;"></div></div>
        <span class="bar-value red">${fmt(errors500)}</span>
      </div>
    </div>
  </div>

  <div class="two-col">
    <div class="section">
      <div class="section-title">Navegadores</div>
      <div class="card" style="padding: 16px;">
        ${topBrowsers.map(b => `
        <div class="bar-row">
          <span class="bar-label">${b.name}</span>
          <div class="bar-track"><div class="bar-fill" style="width:${b.pct}%;background:#8b5cf6;"></div></div>
          <span class="bar-value" style="color:#8b5cf6;">${b.pct}%</span>
        </div>`).join('')}
      </div>
    </div>
    <div class="section">
      <div class="section-title">Sistemas Operativos</div>
      <div class="card" style="padding: 16px;">
        ${topOS.map(o => `
        <div class="bar-row">
          <span class="bar-label">${o.name}</span>
          <div class="bar-track"><div class="bar-fill" style="width:${o.pct}%;background:#06b6d4;"></div></div>
          <span class="bar-value" style="color:#06b6d4;">${o.pct}%</span>
        </div>`).join('')}
      </div>
    </div>
  </div>

  ${topReferrers.length > 0 ? `
  <div class="section">
    <div class="section-title">Referencias</div>
    <div class="card" style="padding: 16px;">
      ${topReferrers.map(r => `<div class="list-item">${r.name} — ${fmt(r.hits)} visitas</div>`).join('')}
    </div>
  </div>` : ''}

  ${top404.length > 0 ? `
  <div class="section">
    <div class="section-title">Páginas 404 Más Frecuentes</div>
    <div class="card" style="padding: 16px;">
      ${top404.map(n => `<div class="list-item" style="font-family:monospace;font-size:0.8rem;">${n}</div>`).join('')}
    </div>
  </div>` : ''}

  <div class="section">
    <div class="section-title">Enlaces</div>
    <div class="grid">
      <div class="card link-card">
        <div class="card-label">Dashboard Completo</div>
        <div style="margin-top:8px;"><a href="/trafico.html">📈 Ver GoAccess Dashboard →</a></div>
      </div>
      <div class="card link-card">
        <div class="card-label">Web Principal</div>
        <div style="margin-top:8px;"><a href="https://www.viajeinteligencia.com" target="_blank">🌐 viajeinteligencia.com →</a></div>
      </div>
    </div>
  </div>

  <div class="footer">
    Generado automáticamente · <a href="/trafico.html">Ver dashboard completo</a> · ${dateStr} ${timeStr}
  </div>
</div>
</body>
</html>`;
}

try {
  const data = parseGoAccess();
  const pm2 = getPM2Status();
  const server = getServerInfo();
  const html = generateHTML(data, pm2, server);

  fs.writeFileSync('/var/www/html/resumen.html', html);
  console.log('✅ resumen.html generated');
  console.log(`   Requests: ${data?.general?.total_requests || 'N/A'}`);
  console.log(`   Unique: ${data?.general?.unique_visitors || 'N/A'}`);
  console.log(`   PM2: ${pm2.status}`);
} catch (e) {
  console.error('❌', e.message);
  process.exit(1);
}
