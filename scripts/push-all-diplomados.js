const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const REPO_ROOT = path.resolve(__dirname, '..');

const DIPLOMADOS = [
  { id: 2, slug: 'especialista-en-comercio-internacional-gestion-aduanera-y-logistica', name: 'ESPECIALISTA EN COMERCIO INTERNACIONAL GESTIÓN ADUANERA Y LOGÍSTICA' },
  { id: 3, slug: 'geologia-minera', name: 'GEOLOGÍA MINERA' },
  { id: 4, slug: 'geometalurgia', name: 'GEOMETALURGIA' },
  { id: 5, slug: 'geomecanica-subterranea-y-superficial', name: 'GEOMECÁNICA SUBTERRÁNEA Y SUPERFICIAL' },
  { id: 6, slug: 'geotecnia-minera', name: 'GEOTECNIA MINERA' },
  { id: 7, slug: 'gerencia-de-sistemas-integrados-de-gestion-hseq', name: 'GERENCIA DE SISTEMAS INTEGRADOS DE GESTIÓN HSEQ' },
  { id: 8, slug: 'gerencia-estrategica-y-liderazgo-de-equipos-en-la-mineria', name: 'GERENCIA ESTRATÉGICA Y LIDERAZGO DE EQUIPOS EN LA MINERÍA' },
  { id: 9, slug: 'gestion-ambiental-para-el-sector-minero-e-industrial', name: 'GESTIÓN AMBIENTAL PARA EL SECTOR MINERO E INDUSTRIAL' },
  { id: 10, slug: 'gestion-de-control-operativo-en-procesos-mineros', name: 'GESTIÓN DE CONTROL OPERATIVO EN PROCESOS MINEROS' },
  { id: 11, slug: 'gestion-de-operaciones-industriales', name: 'GESTIÓN DE OPERACIONES INDUSTRIALES' },
  { id: 12, slug: 'gestion-estrategica-utilizando-big-data-y-analisis-predictivo', name: 'GESTIÓN ESTRATÉGICA PARA EMPRESAS' },
  { id: 13, slug: 'gestion-logistica-compras-inventarios-y-manejo-de-proveedores', name: 'GESTIÓN LOGÍSTICA: COMPRAS, INVENTARIOS Y MANEJO DE PROVEEDORES' },
  { id: 14, slug: 'gestion-logistica-y-almacenes-en-mineria', name: 'GESTIÓN LOGÍSTICA Y ALMACENES EN MINERÍA' },
  { id: 15, slug: 'gestion-logistica-y-proveedores-en-la-industria-y-mineria', name: 'GESTIÓN LOGÍSTICA Y PROVEEDORES EN INDUSTRIA Y MINERÍA' },
  { id: 16, slug: 'gestion-minera', name: 'GESTIÓN MINERA' },
  { id: 17, slug: 'legislacion-laboral-y-elaboracion-de-planillas', name: 'LEGISLACIÓN LABORAL Y ELABORACIÓN DE PLANILLAS' },
  { id: 18, slug: 'mineria-4-0-y-digitalizacion-minera', name: 'MINERÍA 4.0 Y DIGITALIZACIÓN MINERA' },
  { id: 19, slug: 'prevencion-de-la-conflictividad-riesgos-sociales-y-responsabilidad-social-minera', name: 'PREVENCIÓN DE LA CONFLICTIVIDAD, RIESGOS SOCIALES Y RESPONSABILIDAD' },
  { id: 20, slug: 'seguridad-industrial', name: 'SEGURIDAD INDUSTRIAL' },
  { id: 21, slug: 'seguridad-y-salud-ocupacional-en-la-industria-y-mineria', name: 'SEGURIDAD Y SALUD OCUPACIONAL EN LA INDUSTRIA Y MINERÍA' },
  { id: 22, slug: 'supply-chain-management-en-industria-y-mineria', name: 'SUPPLY CHAIN MANAGEMENT EN INDUSTRIA Y MINERÍA' }
];

function run(cmd) {
  return execSync(cmd, { cwd: REPO_ROOT, stdio: 'pipe', encoding: 'utf-8' }).trim();
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

console.log('===============================================================');
console.log('   SUBIENDO DIPLOMADOS A GITHUB (LOTE POR LOTE)               ');
console.log('===============================================================\n');

// Primero, si hay commits locales pendientes de subir, subirlos
try {
  const pending = run('git log origin/main..HEAD --oneline');
  if (pending) {
    console.log('Detectados commits locales pendientes de subir:\n' + pending);
    console.log('Subiendo commits pendientes a GitHub...');
    run('git push origin main');
    console.log('[OK] Commits pendientes subidos con éxito.\n');
  }
} catch (e) {
  console.warn('Aviso comprobando commits pendientes:', e.message);
}

for (let i = 0; i < DIPLOMADOS.length; i++) {
  const dip = DIPLOMADOS[i];
  console.log(`[${i + 1}/${DIPLOMADOS.length}] Preparando diplomado #${dip.id}: ${dip.name}...`);

  const folderPath = `mapas/${dip.slug}/`;
  const jsonPath = `mapas/${dip.slug}.json`;

  run(`git add "${folderPath}" "${jsonPath}"`);
  
  const staged = run('git diff --cached --name-only');
  if (staged) {
    run(`git commit -m "feat(mapas): agregar mapas mentales de ${dip.name}"`);
    console.log(`       -> Subiendo a GitHub...`);
    let pushed = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        run('git push origin main');
        pushed = true;
        console.log(`       -> [OK] Subido con éxito.\n`);
        break;
      } catch (err) {
        console.warn(`       -> [Intento ${attempt}] Error al subir: ${err.message}. Reintentando en 3s...`);
        sleep(3000);
      }
    }
    if (!pushed) {
      console.error(`       -> [FALLÓ] No se pudo subir el diplomado #${dip.id}.`);
    }
  } else {
    console.log(`       -> [OMITIDO] Ya estaba subido o al día.\n`);
  }
}

// Subir el índice maestro, README y scripts restantes
console.log('Finalizando: subiendo catálogo maestro mapas/index.json, README y scripts...');
run('git add mapas/index.json scripts/ README.md');
const finalStaged = run('git diff --cached --name-only');
if (finalStaged) {
  run('git commit -m "feat(mapas): catalogo maestro index.json y documentacion"');
  run('git push origin main');
  console.log('[OK] Catálogo maestro y documentación subidos con éxito.\n');
}

console.log('===============================================================');
console.log('   ¡TODOS LOS 22 DIPLOMADOS HAN SIDO SUBIDOS A GITHUB!        ');
console.log('===============================================================');
