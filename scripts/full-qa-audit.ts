import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function runQAAudit() {
  console.log('🌲 ========================================');
  console.log('🌿 TouchGrass Comprehensive Release QA Audit');
  console.log('🌲 ========================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assertTest(condition: boolean, name: string, detail?: string) {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${name}${detail ? ` - ${detail}` : ''}`);
    }
  }

  // 1. PWA Asset & Build Verification
  console.log('\n--- 1. PWA & Static Asset Verification ---');
  const distPath = path.join(rootDir, 'dist');
  assertTest(fs.existsSync(distPath), 'Dist build directory exists');

  const indexHtmlPath = path.join(distPath, 'index.html');
  assertTest(fs.existsSync(indexHtmlPath), 'dist/index.html exists');
  const indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
  assertTest(indexHtml.includes('manifest.webmanifest'), 'index.html links to manifest');
  assertTest(indexHtml.includes('theme-color') && indexHtml.includes('#FAF7F0'), 'index.html defines theme-color #FAF7F0');
  assertTest(indexHtml.includes('viewport-fit=cover'), 'index.html defines mobile viewport-fit=cover');

  const manifestPath = path.join(distPath, 'manifest.webmanifest');
  assertTest(fs.existsSync(manifestPath), 'dist/manifest.webmanifest exists');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  assertTest(manifest.name.includes('TouchGrass'), 'PWA manifest has name TouchGrass');
  assertTest(manifest.display === 'standalone', 'PWA display is standalone');
  assertTest(manifest.icons && manifest.icons.length >= 2, 'PWA has at least 2 icon sizes (192 & 512)');

  const icon192Path = path.join(distPath, 'icons', 'icon-192.png');
  const icon512Path = path.join(distPath, 'icons', 'icon-512.png');
  assertTest(fs.existsSync(icon192Path) && fs.statSync(icon192Path).size > 100, 'icon-192.png is valid file');
  assertTest(fs.existsSync(icon512Path) && fs.statSync(icon512Path).size > 100, 'icon-512.png is valid file');

  const swPath = path.join(distPath, 'sw.js');
  assertTest(fs.existsSync(swPath), 'Workbox service worker (sw.js) exists');

  // 2. Security & Secrets Check
  console.log('\n--- 2. Security & Credentials Audit ---');
  const gitignorePath = path.join(rootDir, '.gitignore');
  const gitignore = fs.readFileSync(gitignorePath, 'utf-8');
  assertTest(gitignore.includes('.env'), '.gitignore ignores .env files');

  const envExamplePath = path.join(rootDir, '.env.example');
  assertTest(fs.existsSync(envExamplePath), '.env.example exists');
  const envExample = fs.readFileSync(envExamplePath, 'utf-8');
  assertTest(!envExample.includes('AIzaSy') && !envExample.includes('sk-'), '.env.example does not contain real secret keys');

  // Check tracked git files
  const gitHeadPath = path.join(rootDir, '.git', 'logs', 'HEAD');
  if (fs.existsSync(gitHeadPath)) {
    const gitLogs = fs.readFileSync(gitHeadPath, 'utf-8');
    assertTest(!gitLogs.includes('AIzaSy'), 'Git commit logs do not contain API keys');
  }

  // 3. Backend Endpoints QA
  console.log('\n--- 3. Live Server Endpoints Audit ---');
  const baseUrl = 'http://localhost:3001';

  try {
    // Health
    const healthRes = await fetch(`${baseUrl}/api/health`);
    assertTest(healthRes.status === 200, 'GET /api/health returns 200 OK');
    const health = await healthRes.json();
    assertTest(health.status === 'ok' && (health.isMock === true || health.isMock === false), 'Health status is ok');

    // 10-Minute Adventure
    const tenMinRes = await fetch(`${baseUrl}/api/adventure/ten-minute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timeMinutes: 10, groupType: 'solo', vibe: 'sunshine' }),
    });
    assertTest(tenMinRes.status === 200, 'POST /api/adventure/ten-minute returns 200');
    const tenMin = await tenMinRes.json();
    assertTest(typeof tenMin.title === 'string' && tenMin.title.length > 0, '10-Min title is non-empty string');
    assertTest(Array.isArray(tenMin.quests) && tenMin.quests.length >= 3, '10-Min has 3+ structured quests');
    assertTest(typeof tenMin.phoneAwayInstruction === 'string', '10-Min has phone away instruction');

    // Explore Adventure
    const exploreRes = await fetch(`${baseUrl}/api/adventure/explore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timeMinutes: 30, groupType: 'friends' }),
    });
    assertTest(exploreRes.status === 200, 'POST /api/adventure/explore returns 200');
    const explore = await exploreRes.json();
    assertTest(Array.isArray(explore.destinations) && explore.destinations.length === 3, 'Explore has 3 destinations');
    assertTest(typeof explore.destinations[0].clue === 'string', 'Explore destination has sensory clue');
    assertTest(typeof explore.destinations[0].reasonWhyInteresting === 'string', 'Explore destination has reason why interesting');

    // Clue Generation
    const clueRes = await fetch(`${baseUrl}/api/adventure/clue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destinationName: 'Botanical Garden', destinationType: 'garden' }),
    });
    assertTest(clueRes.status === 200, 'POST /api/adventure/clue returns 200');
    const clueData = await clueRes.json();
    assertTest(typeof clueData.clue === 'string' && clueData.clue.length > 0, 'Clue is non-empty string');

    // Discovery Image Vision
    const tinyBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const discRes = await fetch(`${baseUrl}/api/discovery/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: tinyBase64, mimeType: 'image/png' }),
    });
    assertTest(discRes.status === 200, 'POST /api/discovery/analyze returns 200');
    const discData = await discRes.json();
    assertTest(typeof discData.identification === 'string', 'Discovery identification exists');
    assertTest(['likely', 'possible', 'uncertain'].includes(discData.certainty), 'Discovery certainty is likely/possible/uncertain');
    assertTest(typeof discData.interestingFact === 'string', 'Discovery interestingFact exists');
    assertTest(typeof discData.nextQuest === 'string', 'Discovery nextQuest exists');

    // Edge case: Payload too large rejected
    const hugePayload = 'A'.repeat(13 * 1024 * 1024);
    const oversizeRes = await fetch(`${baseUrl}/api/discovery/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: hugePayload, mimeType: 'image/jpeg' }),
    });
    assertTest(oversizeRes.status === 413, 'Oversized image upload rejected with 413 Payload Too Large');

  } catch (err) {
    console.error('Network test error:', err);
    assertTest(false, 'Live server connection failed', (err as Error).message);
  }

  // 4. Accessibility & Styling Checks
  console.log('\n--- 4. Accessibility & UI Token Verification ---');
  const indexCss = fs.readFileSync(path.join(rootDir, 'src', 'index.css'), 'utf-8');
  assertTest(indexCss.includes('prefers-reduced-motion'), 'index.css has prefers-reduced-motion media query');
  assertTest(indexCss.includes('--clay-bg: #FAF7F0'), 'index.css specifies clay warm background variable');
  assertTest(indexCss.includes('--clay-forest: #1A3826'), 'index.css specifies forest green variable');
  assertTest(indexCss.includes('Plus Jakarta Sans'), 'index.css imports Plus Jakarta Sans font');

  // Summary
  console.log('\n========================================');
  console.log(`🏁 QA RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log('========================================\n');

  if (passedTests === totalTests) {
    console.log('🎉 TouchGrass is 100% READY FOR SUBMISSION AND PRODUCTION DEPLOYMENT!\n');
    process.exit(0);
  } else {
    console.error('⚠️ Some tests failed. Please review the output above.\n');
    process.exit(1);
  }
}

runQAAudit();
