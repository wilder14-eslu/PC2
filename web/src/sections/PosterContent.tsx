import { lazy, Suspense, useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react';
import { NavBar } from '../components/layout/NavBar';
import { Hero } from '../components/layout/Hero';
import { Section } from '../components/layout/Section';
import { Footer } from '../components/layout/Footer';
import { Formula } from '../components/figures/Formula';
import { ReadingPanel } from '../components/figures/ReadingPanel';
import { TablePanel } from '../components/figures/TablePanel';
import { recommendationsSchema, tableSchema } from '../data/schemas';
import { summary, conclusions, limitations } from '../content/textos.es';
import { references } from '../content/referencias';
import '../components/layout/layout.css';

const DistortionChart = lazy(() => import('../components/charts/ChartModules').then(m => ({ default: m.DistortionChart })));
const TimeSeriesChart = lazy(() => import('../components/charts/ChartModules').then(m => ({ default: m.TimeSeriesChart })));
const DistributionChart = lazy(() => import('../components/charts/ChartModules').then(m => ({ default: m.DistributionChart })));
const CsrChart = lazy(() => import('../components/charts/ChartModules').then(m => ({ default: m.CsrChart })));
const VariogramChart = lazy(() => import('../components/charts/ChartModules').then(m => ({ default: m.VariogramChart })));
const LmcChart = lazy(() => import('../components/charts/ChartModules').then(m => ({ default: m.LmcChart })));
const CrossValidationChart = lazy(() => import('../components/charts/ChartModules').then(m => ({ default: m.CrossValidationChart })));
const DeficitChart = lazy(() => import('../components/charts/ChartModules').then(m => ({ default: m.DeficitChart })));
const PointsMap = lazy(() => import('../components/maps/MapModules').then(m => ({ default: m.PointsMap })));
const KdeMap = lazy(() => import('../components/maps/MapModules').then(m => ({ default: m.KdeMap })));
const LisaMap = lazy(() => import('../components/maps/MapModules').then(m => ({ default: m.LisaMap })));
const IdwMap = lazy(() => import('../components/maps/MapModules').then(m => ({ default: m.IdwMap })));
const DeathsMap = lazy(() => import('../components/maps/MapModules').then(m => ({ default: m.DeathsMap })));
const ComparisonMap = lazy(() => import('../components/maps/MapModules').then(m => ({ default: m.ComparisonMap })));
const IntegratedMap = lazy(() => import('../components/maps/MapModules').then(m => ({ default: m.IntegratedMap })));

function Deferred({ component: Component }: { component: ComponentType }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(() => new URLSearchParams(window.location.search).get('modo') === 'poster');
  useEffect(() => {
    const node = ref.current;
    if (!node || visible) return;
    const observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { setVisible(true); observer.disconnect(); } }, { rootMargin: '400px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, [visible]);
  return <div className="deferred-module" ref={ref}>{visible && <Suspense fallback={<p>Cargando visualización…</p>}><Component /></Suspense>}</div>;
}

const fmt = (number: number, digits = 0) => new Intl.NumberFormat('es-PE', { minimumFractionDigits: digits, maximumFractionDigits: digits }).formatToParts(number).map(part => part.type === 'group' ? '\u202f' : part.type === 'decimal' ? ',' : part.value).join('');

function SupportTable() {
  const [rows, setRows] = useState<ReturnType<typeof tableSchema.parse>>([]);
  useEffect(() => { fetch(`${import.meta.env.BASE_URL}data/f1_comparacion_soporte.json`).then(response => { if (!response.ok) throw new Error(); return response.json(); }).then(data => setRows(tableSchema.parse(data))).catch(() => setRows([])); }, []);
  return <TablePanel number="1" title="Comparación del soporte espacial" note="La proporción pepita/meseta se estimó con mínimos cuadrados ponderados. Fuente: f1_comparacion_soporte.json.">
    <table><thead><tr><th scope="col">Soporte</th><th scope="col">Ubicaciones</th><th scope="col">Pepita / meseta</th></tr></thead><tbody>{rows.map(row => <tr key={String(row['Unnamed: 0'])}><th scope="row">{String(row['Unnamed: 0'])}</th><td>{typeof row.n === 'number' ? fmt(row.n) : 'Sin dato'}</td><td>{typeof row['Pepita / Sill (%)'] === 'number' ? `${fmt(row['Pepita / Sill (%)'], 1)} %` : 'Sin dato'}</td></tr>)}</tbody></table>
  </TablePanel>;
}

function Recommendations() {
  const [data, setData] = useState<ReturnType<typeof recommendationsSchema.parse> | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => { fetch(`${import.meta.env.BASE_URL}data/f4_recomendaciones.json`).then(response => { if (!response.ok) throw new Error(); return response.json(); }).then(value => setData(recommendationsSchema.parse(value))).catch(() => setError(true)); }, []);
  if (error) return <p role="alert">No se pudieron cargar las recomendaciones cuantificadas.</p>;
  if (!data) return <p>Cargando recomendaciones…</p>;
  return <div className="recommendation-grid">
    <article><span>R1 · Capacidad hospitalaria</span><strong>{fmt(data.r1.total_deficit)} camas</strong><p>Priorizar recursos en países con alta carga por casos o incidencia y dotación hospitalaria inferior a la mediana.</p></article>
    <article><span>R2 · Vigilancia</span><strong>{fmt(data.r2.critical_distance_km)} km</strong><p>Fortalecer la red de vigilancia en territorios de mayor incertidumbre, mediante reportes a escala subnacional.</p></article>
    <article><span>R3 · Coordinación territorial</span><strong>{fmt(data.r3.range_km)} km</strong><p>Coordinar medidas entre países de alta incidencia y territorios próximos dentro del alcance espacial estimado.</p></article>
  </div>;
}

function FigureRow({ children, title, description, formula, reverse = false }: { children: ReactNode; title: string; description: string; formula?: string; reverse?: boolean }) {
  return <div className={`figure-row ${reverse ? 'is-reversed' : ''}`}><div>{children}</div><ReadingPanel title={title}>{formula && <Formula expression={formula} />}<p>{description}</p></ReadingPanel></div>;
}

export function PosterContent() {
  return <><NavBar /><Hero /><main id="contenido">
    <Section id="resumen" eyebrow="Estudio geoestadístico" title="Resumen" intro="Una lectura espacial de la primera ola de COVID-19 en Europa.">
      <div className="overview-grid"><div><p className="lead">{summary}</p><p className="keywords"><strong>Palabras clave:</strong> geoestadística, semivariograma, Kriging Ordinario, Cokriging, corregionalización, procesos puntuales, COVID-19.</p></div><aside className="overview-aside"><span>Pregunta central</span><p>¿Cómo varía la distribución espacial de los casos y qué revela la incertidumbre sobre la vigilancia sanitaria?</p></aside></div>
    </Section>
    <Section id="metodo" eyebrow="Procedimiento" title="Datos y método" intro="Una secuencia reproducible, desde los datos de reporte hasta la validación de los estimadores.">
      <div className="method-grid"><ol className="method-flow">{['Datos y fuentes', 'Proyección métrica', 'Corte y transformación', 'Homogeneización del soporte', 'Modelación espacial', 'Validación cruzada'].map(step => <li key={step}><span aria-hidden="true" />{step}</li>)}</ol><div className="source-panel"><h3>Fuentes del análisis</h3><dl><div><dt>Data Spatial</dt><dd>Casos, defunciones, recuperados y coordenadas de los sitios de reporte.</dd></div><div><dt>Our World in Data</dt><dd>Indicadores de población, edad y capacidad hospitalaria.</dd></div><div><dt>Natural Earth</dt><dd>Fronteras nacionales y ventana espacial del análisis.</dd></div></dl><p>La estimación emplea una sección transversal de la primera ola y una proyección adecuada para el análisis paneuropeo.</p></div></div>
    </Section>
    <Section id="fase-1" eyebrow="Fase 1" title="Preparación y geoprocesamiento" intro="La proyección y la homogeneización del soporte permiten comparar ubicaciones sobre una base espacial consistente.">
      <FigureRow title="Distancias comparables" description="Las distancias angulares presentan una distorsión sistemática que varía con la latitud. La proyección reduce el error frente a la distancia geodésica." formula="d(s_i,s_j)"><Deferred component={DistortionChart} /></FigureRow>
      <FigureRow title="Sitios de reporte" description="Los sitios de la ventana de estudio se representan junto con la selección utilizada para homogeneizar el soporte espacial." reverse><Deferred component={PointsMap} /></FigureRow>
      <FigureRow title="Una sección transversal" description="La fecha de corte ofrece una realización coherente del campo espacial y evita combinar observaciones acumuladas de momentos distintos."><Deferred component={TimeSeriesChart} /></FigureRow>
      <FigureRow title="Transformación logarítmica" description="La transformación reduce la asimetría de los casos y modera la influencia de valores extremos sobre el semivariograma." formula="Z=\\ln(x+1)" reverse><Deferred component={DistributionChart} /></FigureRow>
      <SupportTable />
    </Section>
    <Section id="fase-2" eyebrow="Fase 2" title="Patrones espaciales e IDW" intro="Las intensidades y los contrastes espaciales describen la distribución de los sitios y sus atributos.">
      <FigureRow title="Densidad kernel" description="El ancho de banda controla el nivel de suavizado y permite explorar la concentración de sitios y casos."><Deferred component={KdeMap} /></FigureRow>
      <FigureRow title="Aleatoriedad espacial" description="Las funciones observadas se contrastan con envolventes de completa aleatoriedad espacial para examinar la estructura del patrón." reverse><Deferred component={CsrChart} /></FigureRow>
      <FigureRow title="Asociación local" description="Los indicadores locales identifican agrupamientos y valores espaciales atípicos. Las etiquetas complementan la representación cromática."><Deferred component={LisaMap} /></FigureRow>
      <FigureRow title="Inverso de la distancia" description="La potencia modifica el peso de los vecinos y, por tanto, la suavidad de la superficie interpolada." formula="\\hat Z(s_0)=\\frac{\\sum_i d_i^{-p}Z(s_i)}{\\sum_i d_i^{-p}}" reverse><Deferred component={IdwMap} /></FigureRow>
    </Section>
    <Section id="fase-3" eyebrow="Fase 3" title="Kriging y Cokriging" intro="La estructura de dependencia espacial permite estimar valores no observados y cuantificar su incertidumbre.">
      <FigureRow title="Dependencia espacial" description="El semivariograma empírico resume la variabilidad según la distancia; los modelos se comparan con criterios de ajuste y validación cruzada." formula="\\gamma(h)=\\tfrac12\\operatorname{Var}[Z(s+h)-Z(s)]"><Deferred component={VariogramChart} /></FigureRow>
      <FigureRow title="Defunciones y su incertidumbre" description="La superficie estimada de defunciones se acompaña de una desviación estándar que refleja la distribución espacial de los sitios." reverse><Deferred component={DeathsMap} /></FigureRow>
      <FigureRow title="Corregionalización" description="El modelo lineal de corregionalización representa conjuntamente las dependencias directa y cruzada entre casos y defunciones."><Deferred component={LmcChart} /></FigureRow>
      <FigureRow title="Estimadores comparados" description="En muestreo isotópico, Kriging y Cokriging producen superficies equivalentes bajo el modelo considerado." reverse><Deferred component={ComparisonMap} /></FigureRow>
      <FigureRow title="Validación cruzada" description="La comparación entre observaciones y predicciones permite evaluar precisión y calibración para cada estimador."><Deferred component={CrossValidationChart} /></FigureRow>
    </Section>
    <Section id="fase-4" eyebrow="Fase 4" title="Recomendaciones territoriales" intro="La carga estimada, la incidencia y la incertidumbre ofrecen perspectivas complementarias para orientar recursos y coordinación.">
      <FigureRow title="Lectura integrada" description="Las capas permiten contrastar zonas de alta carga, incidencia e incertidumbre espacial."><Deferred component={IntegratedMap} /></FigureRow>
      <Recommendations />
      <FigureRow title="Capacidad hospitalaria" description="El déficit se estima frente a la mediana de camas del área de estudio en países de alta carga por casos o incidencia." reverse><Deferred component={DeficitChart} /></FigureRow>
    </Section>
    <Section id="conclusiones" eyebrow="Síntesis" title="Conclusiones y limitaciones"><div className="conclusion-grid"><div>{conclusions.map(text => <p key={text}>{text}</p>)}</div><aside className="limitations"><h3>Alcance y limitaciones</h3><ol>{limitations.map(text => <li key={text}>{text}</li>)}</ol></aside></div></Section>
    <Section id="referencias" eyebrow="Fuentes" title="Referencias" intro="Referencias bibliográficas del informe y materiales para reproducir el análisis."><div className="download-row"><a className="ui-button" href={`${import.meta.env.BASE_URL}docs/main.pdf`} download>Descargar informe PDF</a><a className="ui-button" href={`${import.meta.env.BASE_URL}docs/PC2_Grupo6.ipynb`} download>Descargar notebook</a><a className="ui-button" href={`${import.meta.env.BASE_URL}docs/datos.zip`} download>Descargar datos</a><a className="ui-button" href={`${import.meta.env.BASE_URL}docs/figuras.zip`} download>Descargar figuras</a><a className="ui-button" href={`${import.meta.env.BASE_URL}data/kpis.json`} download>Descargar indicadores</a></div><div className="references">{references.map(reference => <p key={reference}>{reference.split(/(\*[^*]+\*)/).map((part, index) => part.startsWith('*') && part.endsWith('*') ? <em key={index}>{part.slice(1, -1)}</em> : part)}</p>)}</div></Section>
  </main><Footer /></>;
}

export default PosterContent;
