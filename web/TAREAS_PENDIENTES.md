# Tareas y precisiones pendientes

- El repositorio confirmado es `https://github.com/wilder14-eslu/PC2`. La base de Vite es `/PC2/`; el QR del sitio emplea la dirección desde la que se abre la página y el QR del repositorio apunta a esa URL.
- La arquitectura solicita `latex/main.pdf`, pero el informe verificado se encuentra en `latex/INFORME.pdf`. Se copia a `public/docs/main.pdf` para la descarga.
- En la comparación de distancias, el valor de grados es un error mediano y el de EPSG:3035 es un error máximo absoluto. Deben identificarse como métricas diferentes.
- La selección de países de la recomendación de capacidad hospitalaria considera alta carga por casos o por incidencia. El texto del informe no explicita esta disyunción, aunque los resultados la requieren.
- El alcance de la incidencia para coordinación territorial es distinto de la distancia crítica de vigilancia indicada en el informe.
- Los mapas aún no ofrecen descarga individual como PNG ni información emergente al pasar el cursor sobre los puntos; la selección de país y las tablas de datos están disponibles.
- `valores_grilla.json` contiene una selección de nodos, pero no garantiza una grilla regular de 50 km; no debe presentarse como tal.
- El sistema visual usa las variables y los componentes CSS del proyecto; queda pendiente incorporar Tailwind CSS 4 como indica la arquitectura.
- La animación inicial de los indicadores y la exportación directa de gráficos a PNG quedan pendientes.
