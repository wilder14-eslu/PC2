import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { FeatureCollection } from 'geojson';
import { z } from 'zod';
import { geoJsonSchema, rasterManifestSchema, tableSchema, type Raster } from '../../data/schemas';
import { FigurePanel } from '../figures/FigurePanel';
import { SegmentedControl } from '../ui/SegmentedControl';
import { Slider } from '../ui/Slider';
import { Toggle } from '../ui/Toggle';
import { Legend } from '../ui/Legend';
import { GeoMap, type MapData } from './GeoMap';

type Props = Record<string, unknown>;
type Data = { countries: FeatureCollection; pointsAll: FeatureCollection; points: FeatureCollection; contours: FeatureCollection; rasters: Raster[]; idw: Props[]; deaths: Props[] };
const numberFormat = (value: unknown, digits = 2) => typeof value === 'number' && Number.isFinite(value) ? new Intl.NumberFormat('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: digits }).formatToParts(value).map(part => part.type === 'group' ? '\u202f' : part.type === 'decimal' ? ',' : part.value).join('') : 'Sin datos';
const countryTranslations: Record<string, string> = { 'United Kingdom': 'Reino Unido', Spain: 'España', Netherlands: 'Países Bajos', Germany: 'Alemania', Portugal: 'Portugal', Belgium: 'Bélgica', France: 'Francia', Belarus: 'Bielorrusia', Switzerland: 'Suiza', Italy: 'Italia', Romania: 'Rumania', Turkey: 'Turquía', Ukraine: 'Ucrania', Ireland: 'Irlanda', Sweden: 'Suecia', Moldova: 'Moldavia', Armenia: 'Armenia', Poland: 'Polonia', 'Republic of Serbia': 'Serbia', Austria: 'Austria', Czechia: 'Chequia', Russia: 'Rusia', Norway: 'Noruega', Denmark: 'Dinamarca', Finland: 'Finlandia', Bulgaria: 'Bulgaria', 'North Macedonia': 'Macedonia del Norte', 'Bosnia and Herzegovina': 'Bosnia y Herzegovina', Greece: 'Grecia', Kosovo: 'Kosovo', Croatia: 'Croacia', Luxembourg: 'Luxemburgo', Hungary: 'Hungría', Albania: 'Albania', Slovakia: 'Eslovaquia', Montenegro: 'Montenegro', Estonia: 'Estonia', Lithuania: 'Lituania', Slovenia: 'Eslovenia', Georgia: 'Georgia', Latvia: 'Letonia', Cyprus: 'Chipre', Malta: 'Malta' };
const countryName = (props: Props) => { const name = String(props.ADMIN ?? props.location ?? props.Ubicacion ?? ''); return countryTranslations[name] ?? name; };
const fromBase = (file: string) => `${import.meta.env.BASE_URL}data/${file}`;
async function read<T>(file: string, schema: z.ZodType<T>): Promise<T> {
  const response = await fetch(fromBase(file));
  if (!response.ok) throw new Error(`No se pudo cargar ${file}`);
  return schema.parse(await response.json());
}
async function loadData(): Promise<Data> {
  const [countries, pointsAll, points, contours, rasters, idw, deaths] = await Promise.all([
    read('paises_resumen.geojson', geoJsonSchema), read('puntos_todos.geojson', geoJsonSchema),
    read('puntos_europa.geojson', geoJsonSchema), read('contornos.geojson', geoJsonSchema),
    read('rasters.json', rasterManifestSchema), read('f2_idw_validacion_cruzada.json', tableSchema),
    read('f3_ok_vs_uk_deaths.json', tableSchema),
  ]);
  return { countries: countries as unknown as FeatureCollection, pointsAll: pointsAll as unknown as FeatureCollection, points: points as unknown as FeatureCollection, contours: contours as unknown as FeatureCollection, rasters, idw, deaths };
}
let dataPromise: Promise<Data> | undefined;
function useMapData() {
  const [data, setData] = useState<Data>();
  const [error, setError] = useState(false);
  useEffect(() => { let alive = true; dataPromise ??= loadData(); dataPromise.then(value => { if (alive) setData(value); }).catch(() => { if (alive) setError(true); }); return () => { alive = false; }; }, []);
  return { data, error };
}
function LazyMap({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(() => new URLSearchParams(window.location.search).get('modo') === 'poster');
  useEffect(() => { if (!ref.current) return; const observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { setVisible(true); observer.disconnect(); } }, { rootMargin: '250px' }); observer.observe(ref.current); return () => observer.disconnect(); }, []);
  return <div ref={ref}>{visible ? children : <div className="map-module__placeholder">Mapa disponible al desplazarse a esta sección.</div>}</div>;
}
function Ready({ render }: { render: (data: Data) => ReactNode }) {
  const { data, error } = useMapData();
  if (error) return <p role="alert">No fue posible cargar los datos cartográficos.</p>;
  return data ? <>{render(data)}</> : <p className="map-module__placeholder">Cargando datos cartográficos…</p>;
}
function BasicTable({ rows, columns }: { rows: Props[]; columns: { key: string; label: string }[] }) {
  return <div className="map-module__table" role="region" aria-label="Tabla de datos del mapa" tabIndex={0}><table><thead><tr>{columns.map(column => <th scope="col" key={column.key}>{column.label}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td key={column.key}>{typeof row[column.key] === 'number' ? numberFormat(row[column.key], 3) : typeof row[column.key] === 'boolean' ? (row[column.key] ? 'Sí' : 'No') : String(row[column.key] ?? 'Sin datos')}</td>)}</tr>)}</tbody></table></div>;
}
function properties(collection: FeatureCollection): Props[] { return collection.features.map(feature => feature.properties ?? {}); }
function rasterFor(data: Data, id: string) { return data.rasters.find(item => item.id === id); }
function Scale({ raster }: { raster?: Raster }) {
  if (!raster) return null;
  const gradient = raster.palette === 'Purples' ? ' map-module__gradient--uncertainty' : raster.palette === 'Reds' ? ' map-module__gradient--deaths' : '';
  return <div className="map-module__legend"><span className={`map-module__gradient${gradient}`} aria-hidden="true" /><span>{numberFormat(raster.domain[0])} a {numberFormat(raster.domain[1])} {raster.unit}</span></div>;
}
function CountryCard({ value, lisa, onClose }: { value?: Props; lisa?: string; onClose: () => void }) {
  if (!value) return null;
  return <aside className="map-module__country" aria-label={`Ficha de ${countryName(value)}`}><button type="button" className="ui-button" onClick={onClose}>Cerrar ficha</button><h4>{countryName(value)}</h4><dl>{[
    ['Casos confirmados', numberFormat(value.Confirmed, 0)], ['Incidencia observada por 100 000 habitantes', numberFormat(value.casos_x100k_obs)],
    ['Predicción media OCK, escala logarítmica', numberFormat(value.z1_ock_medio)], ['Desviación estándar media', numberFormat(value.sd_ock_medio)],
    ['Camas por 1 000 habitantes', numberFormat(value.hospital_beds_per_thousand)], ['Población de 65 años o más (%)', numberFormat(value.aged_65_older)],
    ['Territorio de alta carga por casos (%)', numberFormat(value.pct_hotspot)], ['Territorio de alta incidencia (%)', numberFormat(value.pct_hot_inc)], ['Categoría LISA', lisa ?? 'Sin datos'],
  ].map(([label, text]) => <div key={label}><dt>{label}</dt><dd>{text}</dd></div>)}</dl></aside>;
}
function CountrySelect({ data, onSelect }: { data: Data; onSelect: (value: Props | undefined) => void }) {
  const rows = properties(data.countries).filter(row => typeof row.ADMIN === 'string').sort((a, b) => countryName(a).localeCompare(countryName(b)));
  return <label>Consultar país <select defaultValue="" onChange={event => onSelect(rows.find(row => row.ADMIN === event.target.value))}><option value="">Seleccione un país</option>{rows.map(row => <option key={String(row.ADMIN)} value={String(row.ADMIN)}>{countryName(row)}</option>)}</select></label>;
}
const pointColumns = [{ key: 'Ubicacion', label: 'Ubicación' }, { key: 'Confirmed', label: 'Casos confirmados' }, { key: 'Deaths', label: 'Defunciones' }, { key: 'soporte_ok', label: 'Incluida en el soporte' }];
const countryColumns = [{ key: 'ADMIN', label: 'País' }, { key: 'Confirmed', label: 'Casos confirmados' }, { key: 'casos_x100k_obs', label: 'Incidencia observada' }, { key: 'z1_ock_medio', label: 'Predicción OCK media' }, { key: 'sd_ock_medio', label: 'Desviación estándar media' }];

function PointsBody({ data }: { data: Data }) {
  const [excluded, setExcluded] = useState(true);
  const mapData = { countries: data.countries, points: data.pointsAll };
  return <FigurePanel number="2" title="Ubicaciones de reporte y soporte espacial" description="El tamaño de cada punto representa los casos confirmados; los puntos grises corresponden a sitios excluidos del soporte homogéneo." note="La selección por soporte se obtuvo del cuaderno de análisis. Fuente: puntos_todos.geojson." data={<BasicTable rows={properties(data.pointsAll)} columns={pointColumns} />}><div className="map-module__controls"><Toggle label="Mostrar excluidos por soporte" checked={excluded} onChange={setExcluded} /></div><GeoMap data={mapData} pointMode="support" showExcluded={excluded} label="Mapa de ubicaciones de reporte" /><Legend items={[{ label: 'Incluido en el soporte', color: '#1f3a68' }, { label: 'Excluido por soporte', color: '#9ca5b2' }]} /></FigurePanel>;
}
function KdeBody({ data }: { data: Data }) {
  const [band, setBand] = useState('h1'); const [kind, setKind] = useState('casos');
  const raster = rasterFor(data, `kde_${kind}_${band}`);
  return <FigurePanel number="5" title="Densidad kernel de sitios y casos" description="El ancho de banda modifica el grado de suavizado de la superficie de densidad." note="Cada superficie usa la escala indicada en su leyenda. Fuente: rasters.json y superficies KDE." data={<BasicTable rows={data.rasters.filter(item => item.id.startsWith('kde_'))} columns={[{ key: 'id', label: 'Superficie' }, { key: 'unit', label: 'Unidad' }, { key: 'palette', label: 'Paleta' }]} />}><div className="map-module__controls"><SegmentedControl label="Ancho de banda" value={band} onChange={setBand} options={[{ value: 'h05', label: 'h/2' }, { value: 'h1', label: 'h' }, { value: 'h2', label: '2h' }]} /><SegmentedControl label="Variable de densidad" value={kind} onChange={setKind} options={[{ value: 'sitios', label: 'Sitios' }, { value: 'casos', label: 'Casos' }]} /></div><GeoMap data={{ countries: data.countries }} raster={raster} label="Mapa de densidad kernel" /><Scale raster={raster} /></FigurePanel>;
}
function LisaBody({ data }: { data: Data }) {
  const [mode, setMode] = useState('lisa');
  return <FigurePanel number="7" title="Asociación espacial local y estadístico Gi*" description="Las categorías LISA y los valores Gi* describen la asociación espacial local de cada ubicación." note="La tabla conserva las etiquetas y los valores de significancia. Fuente: puntos_europa.geojson." data={<BasicTable rows={properties(data.points)} columns={[{ key: 'Ubicacion', label: 'Ubicación' }, { key: 'LISA', label: 'Categoría LISA' }, { key: 'Gi*_z', label: 'Gi* z' }, { key: 'Gi*_p', label: 'Gi* p' }]} />}><div className="map-module__controls"><SegmentedControl label="Indicador local" value={mode} onChange={setMode} options={[{ value: 'lisa', label: 'LISA' }, { value: 'gi', label: 'Gi*' }]} /></div><GeoMap data={{ countries: data.countries, points: data.points }} pointMode={mode === 'lisa' ? 'lisa' : 'gi'} label="Mapa de asociación espacial local" />{mode === 'lisa' ? <Legend items={[{ label: 'Alto-Alto', color: '#d7191c' }, { label: 'Bajo-Bajo', color: '#2c7bb6' }, { label: 'Alto-Bajo', color: '#fdae61' }, { label: 'Bajo-Alto', color: '#abd9e9' }, { label: 'No significativo', color: '#d9d9d9' }]} /> : <p className="map-module__legend">Gi*: azul indica valores negativos y rojo valores positivos. Los valores y categorías están disponibles en la tabla.</p>}</FigurePanel>;
}
function IdwBody({ data }: { data: Data }) {
  const [power, setPower] = useState(1.5); const id = `idw_p${String(power).replace('.', '_')}`; const raster = rasterFor(data, id);
  const values = data.idw.filter(row => typeof row.RMSE === 'number' && typeof row.p === 'number');
  const max = Math.max(...values.map(row => Number(row.RMSE)));
  return <FigurePanel number="8" title="Interpolación por inverso de la distancia" description="La potencia modifica el peso relativo de los puntos cercanos; la validación cruzada permite comparar las variantes." note="Solo se muestran superficies precalculadas. Fuente: rasters.json y f2_idw_validacion_cruzada.json." data={<BasicTable rows={data.idw} columns={[{ key: 'p', label: 'Potencia' }, { key: 'ME', label: 'ME' }, { key: 'MAE', label: 'MAE' }, { key: 'RMSE', label: 'RMSE' }]} />}><div className="map-module__controls"><Slider label="Potencia p" values={[1, 1.5, 2, 4, 6]} value={power} onChange={setPower} format={value => numberFormat(value, 1)} /></div><GeoMap data={{ countries: data.countries }} raster={raster} label="Mapa IDW según potencia" /><Scale raster={raster} /><p>RMSE de la potencia seleccionada: <strong>{numberFormat(data.idw.find(row => row.p === power)?.RMSE, 3)}</strong></p><div className="map-idw-bars" aria-label="Comparación del RMSE por potencia">{values.map(row => <div key={String(row.p)} className={row.p === power ? 'map-idw-bars__selected' : ''}><span>p = {numberFormat(row.p, 1)}</span><span className="map-idw-bars__track"><span style={{ width: `${Number(row.RMSE) / max * 100}%` }} /></span><span>{numberFormat(row.RMSE, 3)}</span></div>)}</div></FigurePanel>;
}
function DeathsBody({ data }: { data: Data }) {
  const [mode, setMode] = useState('prediction'); const raster = rasterFor(data, mode === 'prediction' ? 'ok_deaths' : 'ok_deaths_sd');
  return <FigurePanel number="10" title="Kriging ordinario de defunciones" description="La predicción de defunciones y su desviación estándar representan magnitudes distintas y usan escalas separadas." note="La variable predicha se expresa en escala logarítmica. Fuente: rasters.json y f3_ok_vs_uk_deaths.json." data={<BasicTable rows={data.deaths} columns={[{ key: 'Estimador', label: 'Estimador' }, { key: 'RMSE', label: 'RMSE' }, { key: 'RMSS', label: 'RMSS' }]} />}><div className="map-module__controls"><SegmentedControl label="Superficie de defunciones" value={mode} onChange={setMode} options={[{ value: 'prediction', label: 'Predicción' }, { value: 'sd', label: 'Desviación estándar' }]} /></div><GeoMap data={{ countries: data.countries }} raster={raster} label="Mapa de kriging de defunciones" /><Scale raster={raster} /></FigurePanel>;
}
function ComparisonBody({ data }: { data: Data }) {
  const [mode, setMode] = useState('prediction'); const [position, setPosition] = useState(50);
  const ok = rasterFor(data, mode === 'prediction' ? 'ok_conf' : 'ok_conf_sd'); const ock = rasterFor(data, mode === 'prediction' ? 'ock_conf' : 'ock_conf_sd');
  return <FigurePanel number="12" title="Comparación espacial de OK y OCK" description="En el muestreo isotópico las superficies de kriging y cokriging son prácticamente equivalentes." note="Ambas superficies de cada comparación comparten dominio y paleta. Fuente: rasters.json." data={<BasicTable rows={data.rasters.filter(item => ['ok_conf', 'ock_conf', 'ok_conf_sd', 'ock_conf_sd'].includes(item.id))} columns={[{ key: 'id', label: 'Superficie' }, { key: 'unit', label: 'Unidad' }, { key: 'palette', label: 'Paleta' }]} />}><div className="map-module__controls"><SegmentedControl label="Variable de comparación" value={mode} onChange={setMode} options={[{ value: 'prediction', label: 'Predicción' }, { value: 'sd', label: 'Desviación estándar' }]} /></div><div className="map-compare"><GeoMap data={{ countries: data.countries }} raster={ock} interactive={false} label="Superficie de cokriging" /><div className="map-compare__overlay" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}><GeoMap data={{ countries: data.countries }} raster={ok} interactive={false} label="Superficie de kriging" /></div></div><div className="map-compare__labels"><span>OK</span><span>OCK</span></div><label>Deslizar comparación <input className="map-compare__range" type="range" min="0" max="100" value={position} onChange={event => setPosition(Number(event.target.value))} /></label><Scale raster={ok} /></FigurePanel>;
}
function IntegratedBody({ data }: { data: Data }) {
  const [mode, setMode] = useState('cases'); const [country, setCountry] = useState<Props>();
  const raster = rasterFor(data, mode === 'cases' ? 'ock_conf' : mode === 'incidence' ? 'inc_ok' : 'ock_conf_sd');
  const contour = mode === 'cases' ? 'ock_p80' : mode === 'incidence' ? 'incidence_radius' : 'sd_p75';
  const radius = properties(data.contours).find(item => item.id === 'incidence_radius')?.radius_km;
  const lisa = properties(data.points).find(point => point.Ubicacion === country?.location)?.LISA;
  return <FigurePanel number="14" title="Carga, incidencia e incertidumbre territorial" description="Las superficies de carga e incidencia complementan la identificación de áreas con mayor incertidumbre." note="Los contornos señalan los umbrales y radios exportados del análisis. Las cifras por país son resúmenes territoriales. Fuente: paises_resumen.geojson, contornos.geojson y rasters.json." data={<BasicTable rows={properties(data.countries)} columns={countryColumns} />}><div className="map-module__controls"><SegmentedControl label="Capa territorial" value={mode} onChange={setMode} options={[{ value: 'cases', label: 'Casos OCK' }, { value: 'incidence', label: 'Incidencia' }, { value: 'uncertainty', label: 'Incertidumbre' }]} /><CountrySelect data={data} onSelect={setCountry} /></div><GeoMap data={{ countries: data.countries, contours: data.contours }} raster={raster} contour={contour} onCountry={setCountry} label="Mapa integrado por país" /><Scale raster={raster} />{mode === 'incidence' && <p className="map-module__legend">Líneas discontinuas: radio de dependencia de {numberFormat(radius, 0)} km alrededor de los países de alto riesgo.</p>}<CountryCard value={country} lisa={typeof lisa === 'string' ? lisa : undefined} onClose={() => setCountry(undefined)} /></FigurePanel>;
}

export const PointsMap = () => <LazyMap><Ready render={data => <PointsBody data={data} />} /></LazyMap>;
export const KdeMap = () => <LazyMap><Ready render={data => <KdeBody data={data} />} /></LazyMap>;
export const LisaMap = () => <LazyMap><Ready render={data => <LisaBody data={data} />} /></LazyMap>;
export const IdwMap = () => <LazyMap><Ready render={data => <IdwBody data={data} />} /></LazyMap>;
export const DeathsMap = () => <LazyMap><Ready render={data => <DeathsBody data={data} />} /></LazyMap>;
export const ComparisonMap = () => <LazyMap><Ready render={data => <ComparisonBody data={data} />} /></LazyMap>;
export const IntegratedMap = () => <LazyMap><Ready render={data => <IntegratedBody data={data} />} /></LazyMap>;
