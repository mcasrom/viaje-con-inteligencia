// Smoke tests — run with: node --import tsx src/test-smoke.ts
const BASE = process.env.TEST_URL || 'http://localhost:3000';

async function check(label: string, path: string, checks: (body: any) => boolean) {
  try {
    const res = await fetch(`${BASE}${path}`, { signal: AbortSignal.timeout(15000) });
    const body = await res.json();
    const ok = checks(body);
    console.log(`${ok ? '✅' : '❌'} ${label} (${res.status})`);
    if (!ok) console.log('   response:', JSON.stringify(body).slice(0, 200));
  } catch (err: any) {
    console.log(`❌ ${label} — ${err.message}`);
  }
}

async function main() {
  console.log(`\n🧪 Smoke tests — ${BASE}\n`);

  await check('POIs turísticos ES', '/api/pois?country=es&type=tourist&limit=3', b => b.count > 0);
  await check('POIs disrupción ES', '/api/pois?country=es&type=disruption&limit=3', b => Array.isArray(b.pois));
  await check('POIs con perfil', '/api/pois?country=es&type=tourist&profile=mochilero', b => b.pois[0]?.relevance != null);
  await check('POIs tipo inválido 400', '/api/pois?country=es&type=invalid', b => true); // expect 400

  await check('Alternativas ES', '/api/alternatives?country=es', b => b.alternatives?.length > 0);
  await check('Alternativas sin country 400', '/api/alternatives', b => true); // expect 400

  await check('Oil price', '/api/oil-price', b => b.price > 0 && b.eurUsd > 0);

  await check('IST Barcelona', '/api/ist?city=barcelona', b => b.ist >= 0);

  await check('Routes ES→FR (fallback)', '/api/routes?origin=es&destination=fr', b =>
    b.routes?.length >= 3 && b.routes.every((r: any) => r.mode && r.durationMinutes > 0 && r.costEur > 0)
  );

  await check('Routes ES→FR (con fecha)', '/api/routes?origin=es&destination=fr&date=2026-06-15', b =>
    b.routes?.length >= 3 && b.routes.some((r: any) => r.source === 'serpapi')
  );

  await check('Routes sin params 400', '/api/routes', b => b.error != null); // expect 400

  console.log('\n🏁 Done\n');
}

main();
