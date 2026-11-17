# Arquitectura de la página web interactiva (póster corporativo)
**Proyecto:** Difusión Global y Estimación Espacial del COVID-19: Análisis Geoestadístico en Europa con Kriging y Cokriging
**Grupo 6 · Estadística Espacial · UNMSM**
**Destino:** GitHub Pages · **Implementación:** Codex con agentes (ver `AGENTS.md`)
**Versión del documento:** 1.0 (16/11/2026)

> Este documento define **qué** se construye y **cómo** se ve y se organiza. No contiene código de implementación. Toda decisión no cubierta aquí debe seguir el principio rector: *un póster académico de nivel corporativo, sobrio, preciso y navegable, donde cada número visible es trazable a un archivo de resultados del notebook*.

---

## 1. Visión del producto

### 1.1 Qué es
Una página única (single page) que funciona como **póster académico interactivo**: el profesor y el jurado la recorren de arriba abajo como un póster (Resumen → Método → Fases 1 a 4 → Conclusiones → Referencias), pero cada figura estática del informe se convierte en un **módulo interactivo** (mapas con capas, gráficos con selectores, tablas filtrables).

### 1.2 Dos modos de uso
| Modo | Uso | Comportamiento |
|---|---|---|
| **Modo web** (por defecto) | Navegación en laptop, tablet o celular | Scroll vertical, navegación fija, módulos interactivos, carga diferida |
| **Modo póster** (`?modo=poster` o botón) | Sustentación oral proyectada y exportación a PDF A0 horizontal | Lienzo fijo 1189 × 841 mm, 4 columnas, sin interacción de scroll, imprimible con `Ctrl + P` |

### 1.3 Público y tono
- Público: docente, jurado, compañeros y reclutadores (portafolio).
- Tono: académico formal, en tercera persona impersonal, consistente con el informe APA 7. **No usar** los rótulos "Interpretación", "Decisión" ni "Respuesta"; los títulos son descriptivos. **No usar rayas largas (—)** en ningún texto.
- Idioma de la interfaz: español (Perú). Código en inglés, comentarios y documentación en español.

### 1.4 Criterios de éxito
1. Todo número en pantalla proviene de `web/public/data/*.json` (cero números escritos a mano en componentes).
2. Lighthouse ≥ 90 en Performance, Accessibility, Best Practices y SEO (escritorio).
3. Carga inicial ≤ 1,5 MB comprimido; mapas y gráficos se cargan al entrar al viewport.
4. Modo póster imprimible en una sola hoja A0 sin cortes.
5. Funciona sin servidor (estático) y sin claves de API.

---

## 2. Sistema de diseño (identidad corporativa)

### 2.1 Concepto visual
**"Informe técnico institucional"**: estética de consultora o banco central (fondos claros, mucho aire, tipografía editorial para títulos, sans geométrica para datos, acentos de color contenidos). El color se reserva para **datos**; la interfaz es casi monocromática. El escudo UNMSM aparece solo en la cabecera, sin repetirse.

### 2.2 Tokens de color
Definir como variables CSS en `:root` y exponerlos en Tailwind (`theme.extend.colors`).

| Token | Hex | Uso |
|---|---|---|
| `--brand-900` | `#0F2240` | Texto de títulos, barra de navegación, pie |
| `--brand-700` | `#1F3A68` | Color institucional principal, enlaces, botones primarios |
| `--brand-500` | `#3C5F96` | Hover, bordes activos |
| `--brand-100` | `#E6ECF5` | Fondos de tarjetas destacadas, chips |
| `--gold-500` | `#C9A227` | Acento institucional (líneas de sección, KPI destacado). Usar con moderación (≤ 5 % de la superficie) |
| `--ink-900` | `#1A1D23` | Texto principal |
| `--ink-600` | `#545B66` | Texto secundario, notas de tabla y figura |
| `--ink-300` | `#C4C9D1` | Bordes, separadores |
| `--paper` | `#FFFFFF` | Fondo de tarjetas |
| `--canvas` | `#F6F7F9` | Fondo de página |
| `--ok` | `#2E7D5B` | Indicadores favorables (p. ej., RMSS ≈ 1) |
| `--warn` | `#B26A00` | Advertencias metodológicas |
| `--risk` | `#B42318` | Riesgo alto, déficit |

**Paletas de datos** (siempre accesibles para daltonismo):
| Uso | Escala | Notas |
|---|---|---|
| Superficies de casos, incidencia (secuencial) | `YlOrRd` (9 clases) | Mismo dominio en OK y OCK para comparación honesta |
| Incertidumbre σ (secuencial) | `Purples` (7 clases) | Nunca mezclar con la escala de casos |
| Fallecidos (secuencial) | `Reds` | |
| LISA (categórica) | Alto-Alto `#D7191C`, Bajo-Bajo `#2C7BB6`, Alto-Bajo `#FDAE61`, Bajo-Alto `#ABD9E9`, No signif. `#D9D9D9` | Igual que el notebook |
| Gi* (divergente) | `RdBu` invertida, dominio [−3, 3] | |
| Métodos de estimación | WLS `#E67E22`, MV `#1F3A68`, REML `#7A8CA8` | Línea: WLS continua, MV discontinua, REML punteada |
| Estimadores | IDW `#8E44AD`, OK `#2980B9`, OCK iso `#C0392B`, OCK co-loc `#27AE60` | Igual que la figura de validación cruzada |

### 2.3 Tipografía
| Rol | Familia | Peso | Tamaño (web) | Tamaño (póster A0) |
|---|---|---|---|---|
| Display (título del póster) | **Source Serif 4** | 600 | `clamp(2rem, 4vw, 3.25rem)` | 96 pt |
| H2 (fase) | Source Serif 4 | 600 | 1,75 rem | 54 pt |
| H3 (sección) | **Inter** | 600 | 1,25 rem | 36 pt |
| Cuerpo | Inter | 400 | 1 rem / 1,65 | 24 pt |
| Datos, ejes, tablas | **Inter** con `font-variant-numeric: tabular-nums` | 400/500 | 0,875 rem | 20 pt |
| Fórmulas | KaTeX (Latin Modern) | | 1,05 rem | 26 pt |
| Código/rutas | JetBrains Mono | 400 | 0,85 rem | — |

Fuentes autoalojadas (`@fontsource/*`), `font-display: swap`, subconjunto latino.
Números con **coma decimal** y espacio fino como separador de miles (`Intl.NumberFormat('es-PE')` con ajuste a coma decimal: `1,583`, `247 407`).

### 2.4 Espaciado, grilla y forma
- Escala de espaciado base 4 px: 4, 8, 12, 16, 24, 32, 48, 64, 96.
- Contenedor máximo 1280 px; grilla de 12 columnas, medianil 24 px.
- Radios: tarjetas 12 px, chips 999 px, botones 8 px. Sombra única: `0 1px 2px rgba(15,34,64,.06), 0 4px 16px rgba(15,34,64,.06)`.
- Línea de acento: cada H2 lleva una barra dorada de 48 × 3 px encima.
- Breakpoints: `sm 640`, `md 768`, `lg 1024`, `xl 1280`.

### 2.5 Iconografía e imagen
- Íconos: **Lucide** (trazo 1,5 px), solo funcionales (descarga, capas, info, expandir). Nada decorativo.
- Sin fotografías ni ilustraciones de stock. La única imagen institucional es el escudo UNMSM (`logo.webp`).
- Sin emojis en la interfaz.

### 2.6 Movimiento
- Duraciones: 150 ms (hover), 250 ms (cambio de capa), 400 ms (entrada de sección).
- Curva: `cubic-bezier(.2,.7,.2,1)`.
- Entrada de secciones: fade + traslación 8 px al entrar al viewport (una vez).
- Contadores animados en KPIs (0 → valor, 800 ms) solo la primera vez.
- Respetar `prefers-reduced-motion`: desactivar todo movimiento no esencial.

### 2.7 Accesibilidad (WCAG 2.2 AA)
- Contraste mínimo 4,5:1 en texto; 3:1 en elementos gráficos.
- Todo mapa y gráfico tiene: título visible, descripción `aria-describedby` con la conclusión principal y una **tabla de datos alternativa** accesible (botón "Ver datos").
- Navegación completa por teclado; foco visible (`outline 2px --brand-500`, offset 2 px).
- Las categorías nunca se distinguen solo por color (añadir patrón, forma o etiqueta).

---

## 3. Arquitectura de información y wireframes

### 3.1 Mapa del sitio (una sola página, anclas)
```
#inicio        Cabecera institucional + KPIs
#resumen       Resumen y palabras clave
#metodo        Datos, fuentes y flujo metodológico
#fase-1        Preparación y geoprocesamiento
#fase-2        AEDE e IDW
#fase-3        Kriging y Cokriging
#fase-4        Recomendaciones territoriales
#conclusiones  Conclusiones y limitaciones
#referencias   Referencias APA 7 + descargas
```

### 3.2 Wireframe escritorio (≥ 1024 px)
```
┌──────────────────────────────────────────────────────────────────────────────┐
│ NAV FIJA  [escudo] Grupo 6 · Estadística Espacial   Resumen Método F1 F2 F3 F4 │
│           Conclusiones Referencias            [Modo póster] [PDF] [Notebook] │
├──────────────────────────────────────────────────────────────────────────────┤
│ HERO (fondo --brand-900, texto blanco)                                       │
│  [escudo]  UNMSM · Escuela Profesional de Estadística                        │
│  Difusión Global y Estimación Espacial del COVID-19:                         │
│  Análisis Geoestadístico en Europa con Kriging y Cokriging                   │
│  Integrantes (6, en línea)  ·  Docente  ·  17/11/2026                        │
├──────────────────────────────────────────────────────────────────────────────┤
│ FRANJA DE KPIs (6 tarjetas, fondo blanco, sobre el borde del hero)           │
│ [29,9 %→2,1 %] [n = 42] [a = 393 km] [RMSE 1,583] [−66 % OCK] [247 407 camas] │
├───────────────────────────────┬──────────────────────────────────────────────┤
│ RESUMEN (7 col)               │ FLUJO METODOLÓGICO (5 col)                    │
│ texto + palabras clave        │ diagrama de 6 pasos verticales                │
├───────────────────────────────┴──────────────────────────────────────────────┤
│ FASE N  ▬ (barra dorada)                                                     │
│ ┌───────────────────────────────────────┬─────────────────────────────────┐  │
│ │ MÓDULO INTERACTIVO (8 col)            │ PANEL DE LECTURA (4 col)        │  │
│ │ mapa / gráfico con controles arriba   │ fórmula clave (KaTeX)           │  │
│ │                                        │ 3 hallazgos con cifras          │  │
│ │                                        │ nota metodológica (gris)        │  │
│ └───────────────────────────────────────┴─────────────────────────────────┘  │
│ (los módulos alternan lado izquierdo/derecho entre secciones)                │
├──────────────────────────────────────────────────────────────────────────────┤
│ PIE: referencias APA · descargas · repositorio · licencia de datos           │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Wireframe móvil (< 768 px)
- Navegación colapsada en botón "Secciones" (hoja inferior).
- KPIs en carrusel horizontal con scroll-snap (2 visibles).
- Módulo interactivo a ancho completo; panel de lectura debajo.
- Controles de capa como **segmented control** horizontal con scroll.
- Mapas con altura 70 vh y gesto de dos dedos para paneo (evitar atrapar el scroll).

### 3.4 Wireframe modo póster (A0 horizontal, 4 columnas)
```
┌───────────────────────────────────────────────────────────────────────────┐
│ CABECERA: escudo · título · integrantes · docente · curso      (12 % alto) │
├──────────────────┬──────────────────┬──────────────────┬──────────────────┤
│ Resumen          │ Fase 2           │ Fase 3           │ Fase 4           │
│ Introducción     │ KDE (3 anchos)   │ Semivariograma   │ Mapa 3 capas     │
│ Método (flujo)   │ G F J L          │ OK vs OCK        │ R1 · R2 · R3     │
│ Fase 1           │ LISA / Gi*       │ Validación       │ Conclusiones     │
│ (distancias,     │ IDW              │ cruzada (tabla)  │ Referencias      │
│  transformación) │                  │                  │ (selección)      │
├──────────────────┴──────────────────┴──────────────────┴──────────────────┤
│ Franja de KPIs (6) · QR al sitio web y al repositorio            (8 % alto) │
└───────────────────────────────────────────────────────────────────────────┘
```
- En modo póster los módulos se renderizan en su **estado por defecto** y como imagen estática (sin controles).
- `@page { size: 1189mm 841mm; margin: 0 }`; todos los tamaños en `mm`/`pt`.
- Generar un QR (librería `qrcode`, SVG) con la URL pública.

---

## 4. Catálogo de componentes

### 4.1 Componentes de estructura
| Componente | Descripción | Estados/variantes |
|---|---|---|
| `NavBar` | Fija, fondo blanco con desenfoque al hacer scroll; resalta la sección activa (IntersectionObserver) | normal, scrolled, mobile-sheet |
| `Hero` | Fondo `--brand-900` con patrón sutil de grilla geográfica (líneas 1 px al 6 % de opacidad, SVG) | — |
| `KpiCard` | Valor grande (Source Serif 600), etiqueta, microexplicación, fuente (archivo JSON) en tooltip | neutral, destacado (borde dorado), riesgo |
| `Section` | H2 + barra dorada + intro de 2 líneas | alineación izquierda/derecha |
| `FigurePanel` | Contenedor estilo APA: **Figura N** (negrita), título en cursiva, módulo, *Nota.* debajo | expandible a pantalla completa |
| `TablePanel` | Igual, con **Tabla N** y *Nota.* | ordenable, resaltado de fila seleccionada |
| `ReadingPanel` | Fórmula (KaTeX) + hallazgos numerados + nota metodológica | — |
| `MethodFlow` | Diagrama vertical de 6 pasos: Datos → Proyección → Corte y transformación → Soporte → Modelación → Validación | paso activo según scroll |
| `Footer` | Referencias, descargas, créditos de datos | — |

### 4.2 Controles
| Control | Uso |
|---|---|
| `SegmentedControl` | Cambiar capa o variante (p. ej., `h/2 · h · 2h`) |
| `Toggle` | Mostrar/ocultar puntos, envolventes, contornos |
| `Slider` discreto | Potencia `p` de IDW (valores precalculados) |
| `Legend` | Escala continua o categórica, con unidades |
| `InfoTooltip` | Definición breve de un término (pepita, meseta, RMSS) |
| `DownloadButton` | PNG del módulo, CSV de datos |

### 4.3 Componentes de datos
| Componente | Tecnología | Detalle |
|---|---|---|
| `GeoMap` | **MapLibre GL JS** sin mapa base externo | Fondo `--canvas`; países (GeoJSON) en `#FFFFFF` con borde `--ink-300`; capas raster PNG georreferenciadas; puntos vectoriales; hover con tooltip; clic en país abre `CountryDrawer` |
| `ChartLine/Scatter/Bar` | **Observable Plot** (SVG) | Tema global (fuentes, ejes, grilla), exportable a PNG |
| `Formula` | **KaTeX** | Renderizado en compilación cuando sea posible |
| `CountryDrawer` | Panel lateral | Ficha del país: casos, incidencia, predicción OCK, σ, camas, % ≥ 65, pertenencia a hotspot, LISA |

---

## 5. Contenido y módulos interactivos por sección

Cada módulo indica: **interacción**, **datos (contrato)** y **mensaje principal** que el texto del `ReadingPanel` debe sostener.

### 5.1 Inicio y KPIs
| KPI | Valor | Fuente |
|---|---|---|
| Error de distancia | 29,9 % → 2,1 % | `kpis.json` |
| Ubicaciones modeladas | n = 42 (de 52) | `kpis.json` |
| Alcance espacial | a = 393 km | `kpis.json` |
| Exactitud del Kriging | RMSE 1,583 · RMSS 1,02 | `kpis.json` |
| Ganancia del Cokriging co-localizado | −66 % RMSE | `kpis.json` |
| Déficit hospitalario | 247 407 camas | `kpis.json` |

### 5.2 Método
- `MethodFlow` + tabla de fuentes (Data Spatial desde GitHub, OWID, Natural Earth) + parámetros (fecha de corte, CRS, grilla, semilla).

### 5.3 Fase 1: Preparación y geoprocesamiento
| Módulo | Interacción | Datos |
|---|---|---|
| **M1.1 Distorsión de distancias** | Scatter de 1326 pares (geodésica vs calculada) con `SegmentedControl` **Grados / EPSG:3035**; color por latitud media; línea 1:1 | `f1_pares_distancias.json` |
| **M1.2 Mapa de puntos** | Mapa con los 52 sitios; tamaño ∝ casos; toggle "Mostrar excluidos por soporte" (10 microestados en gris) | `puntos_todos.geojson` |
| **M1.3 Serie temporal** | Líneas Confirmed/Deaths/Recovered (Región Europa) con marcador de corte 26/07/2020 | `f1_serie_europa.json` |
| **M1.4 Transformación** | Histograma con `SegmentedControl` **Original / ln(x+1)** + tabla de forma (asimetría, Shapiro-Wilk) | `f1_distribucion.json`, `f1_forma_distribucion.csv` |
| **M1.5 Soporte** | Tarjeta comparativa 52 vs 42 (pepita/meseta 61,7 % → 23,3 %) | `f1_comparacion_soporte.csv` |

### 5.4 Fase 2: AEDE e IDW
| Módulo | Interacción | Datos |
|---|---|---|
| **M2.1 KDE** | Mapa con `SegmentedControl` **h/2 · h · 2h** y **Sitios / Casos**; leyenda en casos/100 km² | 6 rasters `kde_{sitios|casos}_{h05|h1|h2}.png` + `rasters.json` |
| **M2.2 Funciones G, F, J, L** | Gráfico con selector de función; banda de envolvente; toggle "media CSR"; KPIs Clark-Evans y MAD | `f2_csr_curvas.json`, `f2_csr.csv` |
| **M2.3 LISA y Gi*** | Mapa de puntos con `SegmentedControl` **LISA / Gi\***; leyenda categórica o divergente | `puntos_europa.geojson` (enriquecido) |
| **M2.4 IDW** | `Slider` discreto p ∈ {1; 1,5; 2; 4; 6} que cambia el raster; gráfico pequeño RMSE vs p sincronizado | `idw_p{1,1_5,2,4,6}.png`, `f2_idw_validacion_cruzada.csv` |

### 5.5 Fase 3: Kriging y Cokriging
| Módulo | Interacción | Datos |
|---|---|---|
| **M3.1 Semivariograma** | Puntos empíricos (tamaño ∝ pares) + curvas de los 9 ajustes; filtros por **Método** (WLS/MV/REML) y **Modelo**; el seleccionado resaltado; tabla sincronizada (clic en fila resalta curva) | `f3_variograma.json`, `f3_variograma_confirmed_modelos.csv` |
| **M3.2 OK de fallecidos y KU** | Mapa **Predicción / σ** de ln(Deaths+1) + tabla OK vs UK | `ok_deaths.png`, `ok_deaths_sd.png`, `f3_ok_vs_uk_deaths.csv` |
| **M3.3 LMC** | Tres mini gráficos (γ11, γ12, γ22) con curva ajustada; chip "LMC admisible" | `f3_lmc.json`, `f3_lmc.csv` |
| **M3.4 OK vs OCK** | **Comparador deslizante** (*swipe*) entre OK y OCK sobre el mismo mapa; toggle **Predicción / σ**; mensaje de autokrigeabilidad | `ok_conf.png`, `ock_conf.png`, `ok_conf_sd.png`, `ock_conf_sd.png` |
| **M3.5 Validación cruzada** | Scatter observado vs predicho con selector de estimador; tabla RMSE/RMSS con barra de RMSS centrada en 1 | `f3_cv_puntos.json`, `f3_validacion_cruzada.csv` |

### 5.6 Fase 4: Recomendaciones
| Módulo | Interacción | Datos |
|---|---|---|
| **M4.1 Mapa integrado** | Capas **Casos OCK + contorno P80 / Incidencia + radios a = 461 km / σ + contorno P75**; clic en país abre `CountryDrawer` | `ock_conf.png`, `inc_ok.png`, `ock_conf_sd.png`, `contornos.geojson`, `paises_resumen.geojson` |
| **M4.2 Tarjetas R1, R2, R3** | Tres tarjetas con cifra principal; al pasar el cursor se resaltan en el mapa los países implicados | `f4_recomendaciones.json` |
| **M4.3 Déficit de camas** | Barras horizontales por país (8), ordenadas; total destacado | `f4_resumen_por_pais.csv` |

### 5.7 Conclusiones, limitaciones y referencias
- Conclusiones en 3 párrafos (del informe), limitaciones en lista numerada.
- Referencias APA 7 con sangría francesa (CSS `padding-left: 1.27em; text-indent: -1.27em`).
- Descargas: informe PDF, notebook `.ipynb`, datos (`data/`), figuras.

---

## 6. Arquitectura técnica

### 6.1 Stack
| Capa | Elección | Motivo |
|---|---|---|
| Build | **Vite 6 + TypeScript (strict)** | Estático, rápido, `base` configurable para Pages |
| UI | **React 19** + componentes propios | Composición clara para varios agentes |
| Estilos | **Tailwind CSS 4** con tokens de §2 + CSS variables | Consistencia del sistema de diseño |
| Mapas | **MapLibre GL JS** (sin tiles externos) | Libre, sin API key, capas raster/vector |
| Gráficos | **Observable Plot** (+ `d3-scale-chromatic`) | Ligero, estadístico, SVG |
| Fórmulas | **KaTeX** | Rápido y sin dependencias de red |
| Validación de datos | **zod** | Contratos tipados de los JSON |
| Pruebas | **Vitest** (unidad) + **Playwright** (e2e y capturas) | QA automatizada |
| Calidad | ESLint + Prettier + `lighthouse-ci` | Presupuestos de rendimiento |

### 6.2 Flujo de datos
```
Notebook PC2_Grupo6.ipynb
   │  (celda final "Exportación web", agregada por el agente de datos)
   ▼
web/public/data/          JSON + GeoJSON + PNG georreferenciados + rasters.json
   │  (fetch en tiempo de ejecución, validado con zod)
   ▼
src/data/loaders.ts  →  hooks (useDataset)  →  componentes
```
**Regla:** la web **nunca** recalcula estadísticas; solo lee y formatea.

### 6.3 Exportación web (responsabilidad del agente de datos)
Se agrega **al final del notebook** una celda "Exportación para la web" que, con las variables ya existentes en memoria, escribe en `web/public/data/`:

| Archivo | Contenido | Variables del notebook |
|---|---|---|
| `kpis.json` | Los 6 KPIs de §5.1 | tablas `resumen_dist`, `cv_tabla`, `par_z1`, `r1` |
| `f1_pares_distancias.json` | `[{d_geo, d_deg, d_proj, lat_media}]` (1326) | `d_geo_km`, `d_grados_km`, `d_proj_km`, `lat_media` |
| `f1_serie_europa.json` | Serie diaria de la región | `serie` |
| `f1_distribucion.json` | Valores Confirmed y ln(x+1) (n = 52) | `Z1_all` |
| `puntos_todos.geojson` | 52 sitios con indicador `soporte_ok` | `eu` antes del filtro (guardar copia) |
| `puntos_europa.geojson` | 42 sitios + LISA, Gi*_z, Gi*_p, LOO OK/OCK/co-loc | `eu`, `cv` |
| `f2_csr_curvas.json` | `radios`, observadas y min/max/media de G, F, J (r ≤ 550), L | `G_obs`, `F_obs`, `J_obs`, `L_obs`, `*_sim` |
| `f3_variograma.json` | Empírico (`h1`, `g1`, `n1`) + curvas de los 9 ajustes en 200 puntos | `ajustes_z1`, `estructura` |
| `f3_lmc.json` | Empíricos directos y cruzado + curvas LMC | `empiricos`, `gamma_lmc` |
| `f3_cv_puntos.json` | Observado y predicho por estimador (n = 42) | `z1`, `cv`, `loo_idw(p_opt)` |
| `f4_recomendaciones.json` | R1, R2 y R3 con cifras y lista de países | `r1`, `r2`, `hot_inc`, `vecinos_hot`, `A_INC`, `dist_critica` |
| `paises_resumen.geojson` | Polígonos simplificados (tolerancia 2 km) + `resumen_pais` | `paises`, `resumen_pais` |
| `contornos.geojson` | Isolíneas P80 (OCK) y P75 (σ) en EPSG:4326 | `UMBRAL_HOT`, `UMBRAL_SD` |
| `rasters/*.png` + `rasters.json` | Superficies coloreadas con fondo transparente, reproyectadas a EPSG:3857, con 4 esquinas en lon/lat, dominio, paleta y unidades | `nodos`, `MASK`, `gx`, `gy` y superficies |

**Especificación de rasters:** grilla en EPSG:3035 (km × 1000 → m) → GeoTIFF → reproyección a EPSG:3857 con `rasterio.warp` (remuestreo bilineal) → PNG RGBA de máximo 1600 px de ancho con la paleta del §2.2 → `rasters.json` con `{id, file, coordinates:[[lon,lat]×4], domain:[min,max], palette, unit, label}`. Superficies: `idw_p{1,1_5,2,4,6}`, `kde_{sitios,casos}_{h05,h1,h2}`, `ok_conf`, `ock_conf`, `ok_conf_sd`, `ock_conf_sd`, `ok_deaths`, `ok_deaths_sd`, `inc_ok`. Además, `valores_grilla.json` con una grilla submuestreada (50 km) en lon/lat para mostrar valores en tooltip.

**Presupuesto de datos:** total ≤ 6 MB; cada PNG ≤ 250 KB; GeoJSON simplificado ≤ 400 KB.

### 6.4 Estructura del repositorio
```
/ (raíz del repo)
├── AGENTS.md                      ← instrucciones para Codex
├── ARQUITECTURA_WEB.md            ← este documento
├── PC2_Grupo6.ipynb               ← análisis (fuente de verdad)
├── data/  figuras/  resultados/  latex/
├── web/
│   ├── index.html
│   ├── vite.config.ts             ← base: '/<nombre-repo>/'
│   ├── public/
│   │   ├── data/                  ← salida de la celda de exportación
│   │   ├── docs/                  ← main.pdf, PC2_Grupo6.ipynb (copias para descarga)
│   │   └── img/logo.webp
│   └── src/
│       ├── main.tsx  App.tsx
│       ├── styles/tokens.css  globals.css  print-poster.css
│       ├── data/schemas.ts  loaders.ts  format.ts      ← zod + formato es-PE
│       ├── components/
│       │   ├── layout/   NavBar Hero Section Footer PosterLayout
│       │   ├── ui/       KpiCard SegmentedControl Toggle Slider Legend InfoTooltip DownloadButton
│       │   ├── figures/  FigurePanel TablePanel ReadingPanel Formula
│       │   ├── maps/     GeoMap RasterLayer PointLayer SwipeCompare CountryDrawer
│       │   └── charts/   plotTheme.ts VariogramChart CsrChart CvScatter DistortionScatter HistogramToggle DeficitBars
│       ├── sections/     Resumen Metodo Fase1 Fase2 Fase3 Fase4 Conclusiones Referencias
│       └── content/      textos.es.ts  referencias.ts   ← textos del informe, sin números fijos
└── .github/workflows/deploy.yml   ← build de web/ y publicación en Pages
```

### 6.5 Despliegue
- GitHub Actions: `actions/checkout` → `setup-node` 22 → `npm ci && npm run build` en `web/` → `actions/upload-pages-artifact` (`web/dist`) → `actions/deploy-pages`.
- En la configuración del repositorio: *Pages → Source: GitHub Actions*.
- El usuario hace los commits y el push desde VS Code; los agentes **no** hacen commit ni push.

---

## 7. Plan de trabajo por agentes (Codex)

| # | Agente | Entregables | Depende de | Archivos de su propiedad |
|---|---|---|---|---|
| A1 | **Datos** | Celda de exportación en el notebook, `web/public/data/*`, `schemas.ts` | — | celda final del notebook, `web/public/data/`, `src/data/schemas.ts` |
| A2 | **Sistema de diseño** | Tokens, tipografías, `ui/*`, `FigurePanel`, `TablePanel`, página `/design` interna de muestra | — | `styles/`, `components/ui/`, `components/figures/` |
| A3 | **Layout y contenido** | `NavBar`, `Hero`, `Section`, secciones con textos del informe (APA, formal), referencias | A2 | `components/layout/`, `sections/`, `content/` |
| A4 | **Mapas** | `GeoMap`, capas raster/vector, `SwipeCompare`, `CountryDrawer`, M1.2, M2.1, M2.3, M2.4, M3.2, M3.4, M4.1 | A1, A2 | `components/maps/` |
| A5 | **Gráficos** | `plotTheme`, M1.1, M1.3, M1.4, M2.2, M3.1, M3.3, M3.5, M4.3 | A1, A2 | `components/charts/` |
| A6 | **Modo póster** | `PosterLayout`, `print-poster.css`, QR, verificación A0 | A3, A4, A5 | `PosterLayout.tsx`, `print-poster.css` |
| A7 | **QA y despliegue** | Pruebas Vitest/Playwright, Lighthouse CI, auditoría de accesibilidad, workflow de Pages | todos | `tests/`, `.github/workflows/` |

**Orden de ejecución:** A1 y A2 en paralelo → A3, A4 y A5 en paralelo → A6 → A7.
**Regla de integración:** ningún agente edita archivos de otro; los cambios cruzados se piden como tarea al agente propietario.

### 7.1 Definición de terminado (por módulo)
1. Lee datos solo de `public/data` y valida con zod.
2. Tiene título "Figura N"/"Tabla N", *Nota.* con fuente y tabla alternativa accesible.
3. Funciona en 375 px, 768 px y 1440 px, y en modo póster.
4. Respeta tokens y paletas del §2 (sin colores sueltos).
5. Tiene prueba e2e que verifica que renderiza y que el control principal cambia el estado.
6. Las cifras mostradas coinciden con las del informe PDF (verificación cruzada con `resultados/*.csv`).

---

## 8. Presupuestos y calidad
| Métrica | Objetivo |
|---|---|
| JS inicial (gzip) | ≤ 250 KB (MapLibre y Plot en carga diferida) |
| LCP (escritorio, 4G rápido) | ≤ 2,0 s |
| CLS | ≤ 0,05 (reservar alto de módulos) |
| Lighthouse (4 categorías) | ≥ 90 |
| Errores de consola | 0 |
| Contraste | AA en todos los textos |

---

## 9. Contenido: reglas editoriales
- Textos tomados del informe `latex/main.tex` y adaptados a párrafos de máximo 90 palabras.
- Sin rótulos "Interpretación", "Decisión" ni "Respuesta"; sin rayas largas (—).
- Números con coma decimal; unidades con espacio fino (`393 km`, `29,9 %`).
- Cada figura y tabla numerada en orden de aparición, estilo APA 7 (número en negrita, título en cursiva arriba, *Nota.* debajo).
- Citas en formato autor-año: (Cressie, 1993); referencias completas al pie.
- Cabecera: curso, docente, integrantes del Grupo 6 y escudo UNMSM. En la web los integrantes se listan **sin porcentajes de participación** (los porcentajes solo van en la carátula del informe).
