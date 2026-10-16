const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SOURCE_BASE = 'G:\\Mi unidad\\CLASES Y RESÚMENES DIPLOMADOS 2026\\RESÚMENES DE DIPLOMADOS';
const REPO_ROOT = path.resolve(__dirname, '..');
const MAPAS_DIR = path.join(REPO_ROOT, 'mapas');

const DIPLOMADOS = [
  { id: 1, slug: 'derecho-minero', prefix: '1.', name: 'DERECHO MINERO' },
  { id: 2, slug: 'especialista-en-comercio-internacional-gestion-aduanera-y-logistica', prefix: '2.', name: 'ESPECIALISTA EN COMERCIO INTERNACIONAL GESTIÓN ADUANERA Y LOGÍSTICA' },
  { id: 3, slug: 'geologia-minera', prefix: '3.', name: 'GEOLOGÍA MINERA' },
  { id: 4, slug: 'geometalurgia', prefix: '4.', name: 'GEOMETALURGIA' },
  { id: 5, slug: 'geomecanica-subterranea-y-superficial', prefix: '5.', name: 'GEOMECÁNICA SUBTERRÁNEA Y SUPERFICIAL' },
  { id: 6, slug: 'geotecnia-minera', prefix: '6.', name: 'GEOTECNIA MINERA' },
  { id: 7, slug: 'gerencia-de-sistemas-integrados-de-gestion-hseq', prefix: '7.', name: 'GERENCIA DE SISTEMAS INTEGRADOS DE GESTIÓN HSEQ' },
  { id: 8, slug: 'gerencia-estrategica-y-liderazgo-de-equipos-en-la-mineria', prefix: '8.', name: 'GERENCIA ESTRATÉGICA Y LIDERAZGO DE EQUIPOS EN LA MINERÍA' },
  { id: 9, slug: 'gestion-ambiental-para-el-sector-minero-e-industrial', prefix: '9.', name: 'GESTIÓN AMBIENTAL PARA EL SECTOR MINERO E INDUSTRIAL' },
  { id: 10, slug: 'gestion-de-control-operativo-en-procesos-mineros', prefix: '10.', name: 'GESTIÓN DE CONTROL OPERATIVO EN PROCESOS MINEROS' },
  { id: 11, slug: 'gestion-de-operaciones-industriales', prefix: '11.', name: 'GESTIÓN DE OPERACIONES INDUSTRIALES' },
  { id: 12, slug: 'gestion-estrategica-utilizando-big-data-y-analisis-predictivo', prefix: '12.', name: 'GESTIÓN ESTRATÉGICA PARA EMPRESAS' },
  { id: 13, slug: 'gestion-logistica-compras-inventarios-y-manejo-de-proveedores', prefix: '13.', name: 'GESTIÓN LOGÍSTICA: COMPRAS, INVENTARIOS Y MANEJO DE PROVEEDORES' },
  { id: 14, slug: 'gestion-logistica-y-almacenes-en-mineria', prefix: '14.', name: 'GESTIÓN LOGÍSTICA Y ALMACENES EN MINERÍA' },
  { id: 15, slug: 'gestion-logistica-y-proveedores-en-la-industria-y-mineria', prefix: '15.', name: 'GESTIÓN LOGÍSTICA Y PROVEEDORES EN INDUSTRIA Y MINERÍA' },
  { id: 16, slug: 'gestion-minera', prefix: '16.', name: 'GESTIÓN MINERA' },
  { id: 17, slug: 'legislacion-laboral-y-elaboracion-de-planillas', prefix: '17.', name: 'LEGISLACIÓN LABORAL Y ELABORACIÓN DE PLANILLAS' },
  { id: 18, slug: 'mineria-4-0-y-digitalizacion-minera', prefix: '18.', name: 'MINERÍA 4.0 Y DIGITALIZACIÓN MINERA' },
  { id: 19, slug: 'prevencion-de-la-conflictividad-riesgos-sociales-y-responsabilidad-social-minera', prefix: '19.', name: 'PREVENCIÓN DE LA CONFLICTIVIDAD, RIESGOS SOCIALES Y RESPONSABILIDAD' },
  { id: 20, slug: 'seguridad-industrial', prefix: '20.', name: 'SEGURIDAD INDUSTRIAL' },
  { id: 21, slug: 'seguridad-y-salud-ocupacional-en-la-industria-y-mineria', prefix: '21.', name: 'SEGURIDAD Y SALUD OCUPACIONAL EN LA INDUSTRIA Y MINERÍA' },
  { id: 22, slug: 'supply-chain-management-en-industria-y-mineria', prefix: '22.', name: 'SUPPLY CHAIN MANAGEMENT EN INDUSTRIA Y MINERÍA' }
];

function runGit(command) {
  try {
    return execSync(command, { cwd: REPO_ROOT, stdio: 'pipe', encoding: 'utf-8' }).trim();
  } catch (error) {
    const stderr = error.stderr ? error.stderr.toString() : '';
    throw new Error(`Error ejecutando git (${command}): ${stderr || error.message}`);
  }
}

function findDriveFolder(prefix) {
  if (!fs.existsSync(SOURCE_BASE)) {
    throw new Error(`No se encuentra la unidad de Google Drive: "${SOURCE_BASE}". Verifica que Google Drive Desktop esté iniciado.`);
  }
  const items = fs.readdirSync(SOURCE_BASE);
  const match = items.find((name) => {
    if (name.startsWith('(NO)')) return false;
    return name.startsWith(prefix + ' ');
  });
  return match ? path.join(SOURCE_BASE, match) : null;
}

function parseClassInfo(filename) {
  const baseName = path.basename(filename, '.pdf');
  const matchNum = baseName.match(/CLASE\s+(\d+)/i);
  let numero = matchNum ? parseInt(matchNum[1], 10) : 999;
  
  if (baseName.toUpperCase().includes('ADICIONAL')) {
    if (matchNum) {
      numero = parseInt(matchNum[1], 10) + 0.5;
    } else {
      numero = 999;
    }
  }

  let titulo = baseName
    .replace(/^CLASE\s+\d+(_ADICIONAL)?_?\s*/i, '')
    .replace(/^CLASE\s+ADICIONAL_?\s*/i, '')
    .replace(/^CLASE\s+\d+\s*-\s*/i, '')
    .replace(/_+/g, ' ')
    .trim();

  return { numero, titulo: titulo || baseName };
}

function syncDiplomado(dip) {
  const driveFolderPath = findDriveFolder(dip.prefix);
  if (!driveFolderPath) {
    console.warn(`[WARN] No se encontró carpeta para ${dip.prefix} ${dip.name}`);
    return { copied: 0, total: 0, changed: false };
  }

  const mapaMentalDir = path.join(driveFolderPath, 'MAPA MENTAL');
  if (!fs.existsSync(mapaMentalDir)) {
    console.warn(`[WARN] No existe carpeta MAPA MENTAL en: ${driveFolderPath}`);
    return { copied: 0, total: 0, changed: false };
  }

  const targetDir = path.join(MAPAS_DIR, dip.slug);
  fs.mkdirSync(targetDir, { recursive: true });

  const files = fs.readdirSync(mapaMentalDir)
    .filter((f) => f.toLowerCase().endsWith('.pdf') && !f.startsWith('~$'));

  let copiedCount = 0;
  const clasesList = [];

  for (const file of files) {
    const srcFile = path.join(mapaMentalDir, file);
    const destFile = path.join(targetDir, file);

    const srcStat = fs.statSync(srcFile);
    let needCopy = true;

    if (fs.existsSync(destFile)) {
      const destStat = fs.statSync(destFile);
      if (srcStat.size === destStat.size && Math.abs(srcStat.mtimeMs - destStat.mtimeMs) < 2000) {
        needCopy = false;
      }
    }

    if (needCopy) {
      process.stdout.write(`       [Copiando] ${file}... `);
      fs.copyFileSync(srcFile, destFile);
      // Preservar timestamps para comparaciones futuras
      try {
        fs.utimesSync(destFile, srcStat.atime, srcStat.mtime);
      } catch (_) {}
      console.log('OK');
      copiedCount++;
    }

    const { numero, titulo } = parseClassInfo(file);
    clasesList.push({
      numero,
      titulo,
      archivo: file,
      ruta: `mapas/${dip.slug}/${encodeURIComponent(file)}`
    });
  }

  // Limpiar archivos huérfanos que ya no existan en Drive (por renombramiento o eliminación)
  const currentDestFiles = fs.readdirSync(targetDir).filter((f) => f.toLowerCase().endsWith('.pdf'));
  for (const destF of currentDestFiles) {
    if (!files.includes(destF)) {
      console.log(`       [Eliminando archivo viejo/renombrado] ${destF}`);
      fs.unlinkSync(path.join(targetDir, destF));
      copiedCount++;
    }
  }

  // Ordenar clases numéricamente
  clasesList.sort((a, b) => a.numero - b.numero);

  // Generar JSON del diplomado
  const jsonPath = path.join(MAPAS_DIR, `${dip.slug}.json`);
  const jsonData = {
    nombre_diplomado: dip.name,
    slug: dip.slug,
    total_clases: clasesList.length,
    mapas: clasesList
  };

  const newJsonContent = JSON.stringify(jsonData, null, 2);
  let jsonChanged = true;
  if (fs.existsSync(jsonPath)) {
    const oldContent = fs.readFileSync(jsonPath, 'utf-8');
    if (oldContent === newJsonContent) {
      jsonChanged = false;
    }
  }

  if (jsonChanged) {
    fs.writeFileSync(jsonPath, newJsonContent, 'utf-8');
  }

  return {
    copied: copiedCount,
    total: files.length,
    changed: copiedCount > 0 || jsonChanged
  };
}

function generateMasterIndex() {
  const indexList = [];
  for (const dip of DIPLOMADOS) {
    const jsonPath = path.join(MAPAS_DIR, `${dip.slug}.json`);
    let totalClases = 0;
    if (fs.existsSync(jsonPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        totalClases = data.total_clases || 0;
      } catch (_) {}
    }
    indexList.push({
      id: dip.id,
      slug: dip.slug,
      nombre: dip.name,
      total_clases: totalClases,
      json: `mapas/${dip.slug}.json`
    });
  }

  const masterPath = path.join(MAPAS_DIR, 'index.json');
  const masterContent = JSON.stringify({ diplomados: indexList }, null, 2);
  let changed = true;
  if (fs.existsSync(masterPath)) {
    if (fs.readFileSync(masterPath, 'utf-8') === masterContent) {
      changed = false;
    }
  }
  if (changed) {
    fs.writeFileSync(masterPath, masterContent, 'utf-8');
  }
  return changed;
}

function runBatchInitialSync() {
  console.log('===============================================================');
  console.log('   CARGA INICIAL POR LOTES (DIPLOMADO POR DIPLOMADO)           ');
  console.log('===============================================================\n');

  fs.mkdirSync(MAPAS_DIR, { recursive: true });

  for (let i = 0; i < DIPLOMADOS.length; i++) {
    const dip = DIPLOMADOS[i];
    console.log(`[${i + 1}/${DIPLOMADOS.length}] Sincronizando: ${dip.name}...`);

    const result = syncDiplomado(dip);
    generateMasterIndex();

    console.log(`       -> ${result.total} PDFs encontrados (${result.copied} copiados/actualizados).`);

    // Comprobar si hay cambios pendientes para git
    const status = runGit('git status --porcelain');
    if (status) {
      console.log(`       -> Creando commit para diplomado #${dip.id}...`);
      runGit(`git add mapas/${dip.slug}/ mapas/${dip.slug}.json mapas/index.json`);
      try {
        runGit(`git commit -m "feat(mapas): agregar mapas mentales de ${dip.name}"`);
        console.log(`       -> Intentando subir a GitHub...`);
        runGit('git push origin main');
        console.log(`       -> [OK] Subido correctamente a GitHub.`);
      } catch (err) {
        console.log(`       -> [AVISO] Commit local guardado. (El push a GitHub se completará cuando autorices la cuenta).`);
      }
    } else {
      console.log(`       -> [OK] Ya estaba al día en Git.`);
    }
    console.log('');
  }

  console.log('===============================================================');
  console.log('   CARGA INICIAL COMPLETADA EXITOSAMENTE                      ');
  console.log('===============================================================\n');
}

function runQuickSync() {
  console.log('===============================================================');
  console.log('   SINCRONIZACIÓN DE MAPAS MENTALES (DRIVE -> GITHUB)          ');
  console.log('===============================================================\n');

  fs.mkdirSync(MAPAS_DIR, { recursive: true });

  let totalCopied = 0;
  let totalFiles = 0;
  let hasAnyChange = false;

  for (const dip of DIPLOMADOS) {
    const res = syncDiplomado(dip);
    totalCopied += res.copied;
    totalFiles += res.total;
    if (res.changed) hasAnyChange = true;
  }

  const masterChanged = generateMasterIndex();
  if (masterChanged) hasAnyChange = true;

  console.log(`-> Total de PDFs en Drive: ${totalFiles}`);
  console.log(`-> Archivos copiados/actualizados: ${totalCopied}`);

  const status = runGit('git status --porcelain');
  if (status) {
    console.log('\n-> Cambios detectados en Git. Subiendo a GitHub...');
    runGit('git add mapas/');
    const timestamp = new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' });
    try {
      runGit(`git commit -m "sync(mapas): actualizar mapas mentales [${timestamp}]"`);
      runGit('git push origin main');
      console.log('-> [OK] Sincronización con GitHub completada con éxito.');
    } catch (err) {
      console.warn(`-> [AVISO GIT] Los archivos se copiaron e indexaron, pero git push no pudo completarse:`);
      console.warn(`   ${err.message}`);
    }
  } else {
    console.log('-> [OK] Todo está al día. No hay cambios pendientes por subir.');
  }
}

function runWatcher() {
  console.log('===============================================================');
  console.log('   MODO OBSERVADOR (WATCHER) ACTIVO                            ');
  console.log(`   Vigilando: "${SOURCE_BASE}"`);
  console.log('   Cualquier PDF nuevo o modificado se subirá a GitHub en segundos.');
  console.log('   (Presiona Ctrl + C para detener)');
  console.log('===============================================================\n');

  let debounceTimer = null;

  try {
    fs.watch(SOURCE_BASE, { recursive: true }, (eventType, filename) => {
      if (!filename || !filename.toLowerCase().endsWith('.pdf') || !filename.includes('MAPA MENTAL')) {
        return;
      }
      console.log(`\n[EVENTO] Detectado cambio en: ${filename}`);
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        console.log('-> Ejecutando sincronización automática...');
        try {
          runQuickSync();
        } catch (e) {
          console.error('[ERROR]', e.message);
        }
      }, 5000);
    });
  } catch (err) {
    console.error('Error iniciando watcher:', err.message);
  }
}

function runCopyAll() {
  console.log('===============================================================');
  console.log('   COPIANDO Y ESTRUCTURANDO TODOS LOS DIPLOMADOS               ');
  console.log('===============================================================\n');

  fs.mkdirSync(MAPAS_DIR, { recursive: true });

  let totalArchivos = 0;
  let totalCopiados = 0;

  for (let i = 0; i < DIPLOMADOS.length; i++) {
    const dip = DIPLOMADOS[i];
    console.log(`[${i + 1}/${DIPLOMADOS.length}] Procesando: ${dip.name}...`);
    const res = syncDiplomado(dip);
    totalArchivos += res.total;
    totalCopiados += res.copied;
    console.log(`       -> ${res.total} PDFs listos (${res.copied} copiados en esta pasada).`);
    console.log(`       -> Catálogo generado: mapas/${dip.slug}.json\n`);
  }

  generateMasterIndex();
  console.log('===============================================================');
  console.log(`   PROCESO LOCAL COMPLETADO AL 100%                           `);
  console.log(`   Total de PDFs listos: ${totalArchivos}                     `);
  console.log(`   Nuevos copiados: ${totalCopiados}                          `);
  console.log(`   Catálogo maestro: mapas/index.json                         `);
  console.log('===============================================================\n');
}

const arg = process.argv[2];
if (arg === '--initial' || arg === '--batch') {
  runBatchInitialSync();
} else if (arg === '--watch') {
  runWatcher();
} else if (arg === '--local' || arg === '--copy') {
  runCopyAll();
} else {
  runQuickSync();
}
