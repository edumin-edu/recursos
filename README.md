# Materiales Diplomados - EDUMIN

Repositorio centralizado de recursos didácticos para los 22 diplomados (Audios, Vídeos, Resúmenes Interactivos y Mapas Mentales en PDF).

---

## 🗺️ Módulo de Mapas Mentales (`/mapas`)

Los mapas mentales se sincronizan automáticamente desde Google Drive (`G:\Mi unidad\CLASES Y RESÚMENES DIPLOMADOS 2026\RESÚMENES DE DIPLOMADOS`) hacia este repositorio de GitHub para que puedan ser renderizados directamente con **PDF.js** sin restricciones de CORS ni límites de sesión.

### Estructura de Carpetas

```text
mapas/
├── index.html                  # Visor interactivo web de mapas mentales
├── diplomados.json             # Catálogo general con los 22 diplomados
├── derecho-minero/             # Carpeta con los PDFs del diplomado
│   ├── CLASE 01_...pdf
│   └── ...
├── derecho-minero.json         # Catálogo del diplomado con número de clase y rutas
├── geologia-minera/
├── geologia-minera.json
└── ...
```

---

## ⚡ Flujo de Sincronización Automática (Drive ➔ GitHub)

### 1. Sincronización manual en 1 clic
Haz doble clic en:
* **`sincronizar_mapas.bat`** (o ejecuta `npm run sync:mapas`).

Compara los archivos de Google Drive con los de GitHub:
- Copia **únicamente** los PDFs nuevos o modificados (no vuelve a copiar los que ya existen).
- Regenera los catálogos `.json` de clases.
- Hace `git add`, `commit` y `git push` automáticamente a GitHub.

### 2. Modo Observador en Tiempo Real (Watcher)
Haz doble clic en:
* **`observar_mapas.bat`** (o ejecuta `npm run watch:mapas`).

Vigila la carpeta de Google Drive en segundo plano. En cuanto guardas o reemplazas un PDF en la carpeta `MAPA MENTAL` de cualquier diplomado, espera 5 segundos y lo sincroniza y sube a GitHub automáticamente.

---

## 💻 Cómo consumir los Mapas Mentales con PDF.js

Cada diplomado cuenta con un archivo JSON con los datos estructurados:

```javascript
// 1. Cargar las clases del diplomado
const response = await fetch('./mapas/derecho-minero.json');
const data = await response.json();

console.log(data.nombre_diplomado); // "DERECHO MINERO"
console.log(data.total_clases);     // 19

// 2. data.mapas contiene la lista ordenada:
// [
//   {
//     "numero": 1,
//     "titulo": "REGULACIÓN AMBIENTAL Y GESTIÓN DEL CATASTRO MINERO - 1RA PARTE",
//     "archivo": "CLASE 01_...pdf",
//     "ruta": "mapas/derecho-minero/CLASE%2001_...pdf"
//   },
//   ...
// ]

// 3. Renderizar en PDF.js:
const loadingTask = pdfjsLib.getDocument(data.mapas[0].ruta);
const pdf = await loadingTask.promise;
const page = await pdf.getPage(1);
// Renderizar en tu canvas...
```
