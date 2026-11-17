import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { kpisSchema, tableSchema, type Kpis } from '../../data/schemas';
import { conclusions, summary } from '../../content/textos.es';
import { references } from '../../content/referencias';
import '../../styles/print-poster.css';

type PosterProps = { siteUrl?: string; repositoryUrl?: string };

const format = (value: number, digits = 0) => new Intl.NumberFormat('es-PE', {
  minimumFractionDigits: digits, maximumFractionDigits: digits,
}).formatToParts(value).map(part => part.type === 'group' ? '\u202f' : part.type === 'decimal' ? ',' : part.value).join('');

function Qr({ url, label }: { url: string; label: string }) {
  const qr = useMemo(() => QRCode.create(url, { errorCorrectionLevel: 'M' }).modules, [url]);
  return <figure className="poster-qr"><svg role="img" aria-label={`Código QR: ${label}`} viewBox={`-4 -4 ${qr.size + 8} ${qr.size + 8}`} shapeRendering="crispEdges"><rect x="-4" y="-4" width={qr.size + 8} height={qr.size + 8} fill="white" />{Array.from({ length: qr.size * qr.size }, (_, i) => qr.get(Math.floor(i / qr.size), i % qr.size) ? <rect key={i} x={i % qr.size} y={Math.floor(i / qr.size)} width="1" height="1" fill="#0f2240" /> : null)}</svg><figcaption>{label}</figcaption></figure>;
}

function Figure({ file, title, alt }: { file: string; title: string; alt: string }) {
  return <figure className="poster-figure"><figcaption>{title}</figcaption><img src={`${import.meta.env.BASE_URL}img/poster/${file}`} alt={alt} /></figure>;
}

export function PosterLayout({ siteUrl, repositoryUrl }: PosterProps) {
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [validation, setValidation] = useState<ReturnType<typeof tableSchema.parse>>([]);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    const read = (name: string) => fetch(`${import.meta.env.BASE_URL}data/${name}`, { signal: controller.signal }).then(response => { if (!response.ok) throw new Error('Datos no disponibles'); return response.json(); });
    Promise.all([read('kpis.json'), read('f3_validacion_cruzada.json')]).then(([a, b]) => { setKpis(kpisSchema.parse(a)); setValidation(tableSchema.parse(b)); }).catch(error => { if (error.name !== 'AbortError') setFailed(true); });
    return () => controller.abort();
  }, []);
  const metrics = kpis ? [
    { value: `${format(kpis.distance_error_original, 1)} % / ${format(kpis.distance_error_projected, 1)} %`, label: 'Error mediano en grados / máximo proyectado' },
    { value: format(kpis.locations_modeled), label: `Ubicaciones modeladas de ${format(kpis.locations_all)}` },
    { value: `${format(kpis.spatial_range_km)} km`, label: 'Alcance espacial' },
    { value: format(kpis.ok_rmse, 3), label: `RMSE · RMSS ${format(kpis.ok_rmss, 2)}` },
    { value: `−${format(kpis.cokriging_reduction_percent)} %`, label: 'RMSE de Cokriging co-localizado' },
    { value: format(kpis.hospital_bed_deficit), label: 'Déficit de camas' },
  ] : [];
  return <div className="poster-stage"><div className="poster-actions"><a href={import.meta.env.BASE_URL}>Volver a la versión web</a><button type="button" onClick={() => window.print()}>Imprimir póster</button></div><main className="poster-sheet" aria-label="Póster académico imprimible">
    <header className="poster-header"><img src={`${import.meta.env.BASE_URL}img/logo.webp`} alt="Escudo de la Universidad Nacional Mayor de San Marcos" /><div><p>Universidad Nacional Mayor de San Marcos · Estadística Espacial</p><h1>Difusión global y estimación espacial del COVID-19</h1><p className="poster-subtitle">Análisis geoestadístico en Europa con Kriging y Cokriging</p><p>Gabriel Briceño Ypanaque · Wilder Espinoza Luna · Vicente Isase Camara · Oscar Montoya Juro · Gerson Pablo Machaca · Frank Polastre Mamani</p><p>Docente: Dr. Misael Erikson Maguiña Palma</p></div></header>
    <div className="poster-columns">
      <section><h2>Resumen y método</h2><p>{summary}</p><p>Datos y fuentes → Proyección → Corte y transformación → Soporte → Modelación → Validación</p><h2>Preparación espacial</h2><p>La proyección métrica reduce la distorsión de distancia y la transformación logarítmica atenúa la asimetría de los casos.</p><Figure file="f1_distancias_grados_vs_proyectadas.png" title="Distancia calculada frente a geodésica" alt="Comparación de distancias en grados y coordenadas proyectadas." /><Figure file="f1_transformacion_log.png" title="Transformación de los casos" alt="Distribuciones de casos originales y transformados." /></section>
      <section><h2>Patrones espaciales e IDW</h2><p>Las intensidades y los contrastes describen la distribución de los sitios y sus atributos.</p><Figure file="f2_kde_anchos_banda.png" title="Densidad kernel" alt="Superficies de densidad para distintos anchos de banda." /><Figure file="f2_csr_G_F_J_L.png" title="Contraste de aleatoriedad espacial" alt="Funciones espaciales observadas y envolventes simuladas." /><Figure file="f2_lisa_getis.png" title="Asociación local" alt="Indicadores locales LISA y Gi estrella." /><Figure file="f2_idw_potencias.png" title="Inverso de la distancia" alt="Superficies de interpolación para distintas potencias." /></section>
      <section><h2>Kriging y Cokriging</h2><p>El semivariograma caracteriza la dependencia espacial y la validación cruzada permite comparar precisión y calibración.</p><Figure file="f3_semivariograma_confirmed.png" title="Semivariograma de casos confirmados" alt="Semivariograma empírico y modelos ajustados." /><Figure file="f3_ok_vs_ock_confirmed.png" title="Kriging y Cokriging" alt="Comparación de predicciones e incertidumbre de Kriging y Cokriging." /><h3>Validación cruzada</h3><table><thead><tr><th scope="col">Estimador</th><th scope="col">RMSE</th><th scope="col">RMSS</th></tr></thead><tbody>{validation.map((row, index) => <tr key={index}><th scope="row">{String(row.Estimador)}</th><td>{typeof row.RMSE === 'number' ? format(row.RMSE, 3) : 'No disponible'}</td><td>{typeof row.RMSS === 'number' ? format(row.RMSS, 2) : 'No disponible'}</td></tr>)}</tbody></table></section>
      <section><h2>Recomendaciones territoriales</h2><Figure file="f4_hotspots_incertidumbre.png" title="Carga, incidencia e incertidumbre" alt="Mapas de casos, incidencia e incertidumbre espacial." /><h3>Capacidad hospitalaria</h3><p>Priorizar recursos en países con alta carga por casos o incidencia y dotación hospitalaria inferior a la mediana.</p><h3>Vigilancia y coordinación</h3><p>Fortalecer el reporte subnacional en zonas de incertidumbre y coordinar medidas entre territorios próximos.</p><h2>Conclusiones</h2>{conclusions.map(item => <p key={item}>{item}</p>)}<h3>Referencias seleccionadas</h3><div className="poster-references">{references.slice(0, 4).map(reference => <p key={reference}>{reference.replaceAll('*', '')}</p>)}</div></section>
    </div>
    <footer className="poster-footer">{failed && <p role="alert">No se pudieron cargar los indicadores del estudio.</p>}<div className="poster-metrics">{metrics.map(metric => <div key={metric.label}><strong>{metric.value}</strong><span>{metric.label}</span></div>)}</div><div className="poster-codes">{siteUrl && <Qr url={siteUrl} label="Página del estudio" />}{repositoryUrl && <Qr url={repositoryUrl} label="Repositorio" />}</div></footer>
  </main></div>;
}

export default PosterLayout;
