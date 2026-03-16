# 🩻 Protocolos TAC · HUCS

Aplicación web progresiva (PWA) para consultar los protocolos de TC del **Hospital Universitario Costa del Sol** — orientada a técnicos especialistas en radiodiagnóstico.

Funciona en **Android, iOS y PC** — puede instalarse como app desde el navegador.

---

## 🚀 Despliegue en Netlify (recomendado)

### Opción A — Arrastrar carpeta (más rápido)
1. Ir a [app.netlify.com](https://app.netlify.com)
2. Arrastrar toda la carpeta `tac-hucs/` al área de "drag and drop"
3. Netlify genera una URL pública en segundos

### Opción B — Conectar con GitHub
1. Subir esta carpeta a un repositorio GitHub (público o privado)
2. En Netlify → "Add new site" → "Import an existing project" → seleccionar el repo
3. Build command: *(dejar vacío)*
4. Publish directory: `.` (raíz del repo)
5. Deploy

### Opción C — Netlify CLI
```bash
npm install -g netlify-cli
cd tac-hucs
netlify deploy --prod
```

---

## 📱 Instalar como app en el móvil

**Android (Chrome/Edge):**
- Abrir la URL en Chrome
- Menú (⋮) → "Instalar app" o "Añadir a pantalla de inicio"

**iOS (Safari):**
- Abrir en Safari
- Botón compartir → "Añadir a pantalla de inicio"

---

## 🏗️ Estructura del proyecto

```
tac-hucs/
├── index.html          ← HTML principal
├── manifest.json       ← Configuración PWA
├── sw.js               ← Service Worker (offline)
├── css/
│   └── styles.css      ← Estilos completos
├── js/
│   ├── protocols.js    ← Base de datos de protocolos
│   └── app.js          ← Lógica de la aplicación
└── assets/
    ├── icon-192.png    ← Icono PWA (añadir manualmente)
    └── icon-512.png    ← Icono PWA grande (añadir manualmente)
```

---

## ✏️ Actualizar / añadir protocolos

Todos los protocolos están en `js/protocols.js` en el array `PROTOCOLS`.

Para añadir un protocolo nuevo, copiar la estructura:

```javascript
{
  id: "P35",               // ID único
  code: "P.35",            // Código oficial
  name: "NOMBRE CORTO",    // Nombre en tarjeta
  fullName: "Nombre completo del procedimiento",
  zona: "torax",           // craneo | torax | abdomen | columna | extremidades | corporal
  contraste: true,         // true | false
  tags: ["keyword1", "keyword2"],
  posicion: "supino",      // supino | prono | variable
  entrada: "pies",         // cabeza | pies
  steps: [
    { fase: "Posición", icono: "position", texto: "Descripción..." },
    { fase: "Contraste", icono: "contrast", texto: "..." },
    // ...
  ],
  contraste_detalle: {
    volumen: "100 cc yodo + 20 cc suero",
    velocidad: "3 cc/sg",
    delay: "BT hígado",
    bt: true,
    roi: "Aorta nivel hígado",
    umbral: "140 HU"   // opcional
  },
  reconstrucciones: "Axial 5×5 mediastino...",
  notas: "Notas o advertencias importantes"
}
```

### Iconos disponibles para pasos:
`position` · `center` · `topo` · `cut` · `scan` · `contrast` · `roi` · `recon` · `send` · `info`

---

## 📋 Añadir protocolos GE

Cuando estés listo para añadir los protocolos del TC GE:
1. Duplicar la sección de protocolos en `js/protocols.js`
2. Añadir una propiedad `equipo: "ge"` a cada protocolo GE
3. Filtrar en `app.js` según el equipo activo

---

## 🔄 Control de versiones

Actualizar el número de versión en:
- `index.html` → `<div class="header-version">v1.x · Philips</div>`
- `sw.js` → `const CACHE_NAME = 'tac-hucs-v1.x';` (cambiar para forzar recarga)

---

## 📞 Mantenimiento

Para cualquier corrección o nueva versión:
1. Editar los archivos correspondientes
2. Si se modifican datos de protocolos: actualizar `sw.js` con nueva versión de caché
3. Hacer push a GitHub → Netlify redespliega automáticamente

---

*Hospital Universitario Costa del Sol · Servicio de Radiodiagnóstico · Uso interno*
