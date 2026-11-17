# AGENTS.md: instrucciones para Codex

## Objetivo
Construir la página web interactiva (póster corporativo) del proyecto PC2 de Estadística Espacial, publicada en GitHub Pages. La especificación completa está en **`ARQUITECTURA_WEB.md`**; léela antes de cualquier tarea y síguela como fuente de verdad.

## Reglas generales
1. **No hacer `git commit` ni `git push`.** El usuario (wilder14-eslu) hace los commits y el push desde VS Code para figurar como único contribuidor. Deja los cambios en el árbol de trabajo y entrega un resumen de archivos modificados.
2. A1 puede instalar en el entorno `.venv` las dependencias que necesite la exportación (`rasterio`, `scikit-image` para contornos).
3. **No modificar** `latex/`, `data/`, `figuras/` ni `resultados/`. El notebook `PC2_Grupo6.ipynb` solo puede recibir **una celda nueva al final** ("Exportación para la web"), que debe escribir el agente A1. No alterar las celdas existentes.
4. La web **no recalcula estadísticas**: todo número proviene de `web/public/data/` (generado por el notebook) o de `resultados/*.csv`.
5. Idioma: interfaz y documentación en **español (Perú)**; código, nombres de archivos de código y variables en **inglés**; comentarios en **español**.
6. Estilo de texto: académico formal (APA 7). Prohibido usar los rótulos "Interpretación", "Decisión" o "Respuesta". Prohibido el carácter raya larga (—).
7. Números con coma decimal y separador de miles con espacio fino (`1,583`; `247 407`).
8. Sin claves de API, sin servicios de terceros en tiempo de ejecución, sin tiles de mapas externos.
9. Cada agente edita solo los archivos de su propiedad (tabla del §7 de la arquitectura). Las necesidades cruzadas se registran en `web/TAREAS_PENDIENTES.md`.

## Agentes y orden
| Orden | Agente | Alcance |
|---|---|---|
| 1 | A1 Datos | Celda de exportación del notebook → `web/public/data/` + `src/data/schemas.ts` |
| 1 | A2 Sistema de diseño | Tokens, tipografías, componentes `ui/` y `figures/`, página interna `/design` |
| 2 | A3 Layout y contenido | Navegación, hero, secciones, textos, referencias |
| 2 | A4 Mapas | MapLibre, rasters, comparador OK/OCK, ficha de país |
| 2 | A5 Gráficos | Observable Plot: distorsión, CSR, semivariograma, LMC, validación cruzada, déficit |
| 3 | A6 Modo póster | Diseño A0 horizontal imprimible, QR |
| 4 | A7 QA y despliegue | Vitest, Playwright, Lighthouse CI, accesibilidad, workflow de GitHub Pages |

## Comandos
```bash
# Datos (desde la raíz; requiere el entorno .venv del usuario)
jupyter nbconvert --to notebook --execute --inplace PC2_Grupo6.ipynb

# Web
cd web
npm ci
npm run dev        # desarrollo
npm run build      # producción (web/dist)
npm run test       # Vitest
npm run e2e        # Playwright
```

## Definición de terminado
Ver §7.1 de `ARQUITECTURA_WEB.md`. Además: `npm run build` sin errores ni advertencias de tipos, cero errores de consola y cifras idénticas a las del informe PDF.
