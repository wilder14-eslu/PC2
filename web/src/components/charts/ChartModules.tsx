import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import * as Plot from '@observablehq/plot';
import { z } from 'zod';
import { FigurePanel } from '../figures/FigurePanel';
import { SegmentedControl } from '../ui/SegmentedControl';
import { Toggle } from '../ui/Toggle';
import { distancePairsSchema, distributionSchema, timeSeriesSchema, csrSchema, variogramSchema, lmcSchema, cvPointsSchema, recommendationsSchema, tableSchema } from '../../data/schemas';

const num = (value: number, decimals = 2) => new Intl.NumberFormat('es-PE', { maximumFractionDigits: decimals, minimumFractionDigits: decimals }).formatToParts(value).map(part => part.type === 'group' ? '\u202f' : part.type === 'decimal' ? ',' : part.value).join('');
const display = (value: unknown) => typeof value === 'number' ? num(value) : value == null ? 'Sin datos' : String(value);
const colors = { blue: '#1f3a68', teal: '#2e7d5b', gold: '#b26a00', purple: '#8e44ad', red: '#b42318', gray: '#545b66' };
const histogramBinSchema = z.object({ lower: z.number(), upper: z.number(), count: z.number().int().nonnegative() });
const histogramSchema = z.object({ original: z.array(histogramBinSchema), transformed: z.array(histogramBinSchema) });

function useData<T>(filename: string, schema: z.ZodType<T>) {
  const [data, setData] = useState<T | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    setData(null); setFailed(false);
    fetch(`${import.meta.env.BASE_URL}data/${filename}`, { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error('Datos no disponibles'); return response.json(); })
      .then(value => setData(schema.parse(value)))
      .catch(error => { if (error.name !== 'AbortError') setFailed(true); });
    return () => controller.abort();
  }, [filename, schema]);
  return { data, failed };
}
function Status({ failed }: { failed: boolean }) { return <p role={failed ? 'alert' : 'status'}>{failed ? 'No fue posible cargar los datos de esta figura.' : 'Cargando datos de la figura…'}</p>; }

function PlotView({ options, label }: { options: Plot.PlotOptions; label: string }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!host.current) return;
    const element = host.current;
    const draw = () => {
      const graph = Plot.plot({ ...options, width: Math.max(300, element.clientWidth), style: { fontFamily: 'Inter, sans-serif', fontSize: '12px', background: 'transparent' } });
      graph.setAttribute('aria-hidden', 'true');
      element.replaceChildren(graph);
    };
    draw();
    const observer = new ResizeObserver(draw); observer.observe(element);
    return () => { observer.disconnect(); element.replaceChildren(); };
  }, [options]);
  return <div ref={host} role="img" aria-label={label} style={{ width: '100%', minHeight: '240px', overflowX: 'auto' }} />;
}
function DataTable({ headers, rows, caption }: { headers: string[]; rows: ReactNode[][]; caption: string }) {
  const id = useId();
  return <div className="table-scroll" role="region" aria-label={caption} tabIndex={0}><table aria-labelledby={id}><caption id={id}>{caption}</caption><thead><tr>{headers.map(header => <th key={header} scope="col">{header}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{row.map((value, column) => column === 0 ? <th key={column} scope="row">{value}</th> : <td key={column}>{value}</td>)}</tr>)}</tbody></table></div>;
}
const note = (source: string) => <>Elaboración propia a partir de <code>{source}</code>.</>;

export function DistortionChart() {
  const { data, failed } = useData('f1_pares_distancias.json', distancePairsSchema);
  const [metric, setMetric] = useState<'d_deg' | 'd_proj'>('d_deg');
  if (!data) return <Status failed={failed} />;
  const options: Plot.PlotOptions = { height: 320, marginLeft: 65, x: { label: 'Distancia geodésica (km)', grid: true }, y: { label: 'Distancia calculada (km)', grid: true }, color: { scheme: 'viridis', legend: true, label: 'Latitud media (°)' }, marks: [Plot.ruleX([0]), Plot.ruleY([0]), Plot.lineY([...data].sort((a,b) => a.d_geo-b.d_geo), { x: 'd_geo', y: 'd_geo', stroke: colors.gray, strokeDasharray: '4,4' }), Plot.dot(data, { x: 'd_geo', y: metric, fill: 'lat_media', r: 2.5, opacity: 0.7, title: d => `Geodésica: ${num(d.d_geo)} km\nCalculada: ${num(d[metric])} km\nLatitud: ${num(d.lat_media)}°` })] };
  return <FigurePanel number={1} title="Distancia calculada frente a distancia geodésica" description="La distancia en grados presenta mayor distorsión; la proyección aproxima la distancia geodésica." note={note('f1_pares_distancias.json')} data={<DataTable caption="Pares de distancias" headers={['Geodésica (km)', 'Grados (km)', 'EPSG:3035 (km)', 'Latitud media (°)']} rows={data.map(d => [num(d.d_geo), num(d.d_deg), num(d.d_proj), num(d.lat_media)])} />}><SegmentedControl label="Sistema de distancia" value={metric} onChange={setMetric} options={[{value:'d_deg',label:'Grados'}, {value:'d_proj',label:'EPSG:3035'}]} /><PlotView options={options} label="Diagrama de dispersión de distancias por latitud media" /></FigurePanel>;
}
export function TimeSeriesChart() {
  const { data, failed } = useData('f1_serie_europa.json', timeSeriesSchema);
  const [series, setSeries] = useState<'Confirmed'|'Deaths'|'Recovered'>('Confirmed');
  if (!data) return <Status failed={failed} />;
  const options: Plot.PlotOptions = { height: 300, marginLeft: 75, x: { label: 'Fecha', ticks: 4 }, y: { label: 'Acumulado', grid: true, tickFormat: (d: number) => num(d, 0) }, marks: [Plot.lineY(data, { x: d => new Date(`${d.Date}T00:00:00Z`), y: series, stroke: colors.blue, strokeWidth: 2.5 }), Plot.dot([data[data.length - 1]], { x: d => new Date(`${d.Date}T00:00:00Z`), y: series, fill: colors.red, r: 4 })] };
  return <FigurePanel number={3} title="Evolución acumulada en la Región Europa" description="La serie muestra la evolución acumulada hasta la fecha de corte del estudio." note={note('f1_serie_europa.json')} data={<DataTable caption="Serie acumulada" headers={['Fecha', 'Casos', 'Defunciones', 'Recuperados']} rows={data.map(d => [d.Date, num(d.Confirmed,0), num(d.Deaths,0), num(d.Recovered,0)])} />}><SegmentedControl label="Variable de la serie" value={series} onChange={setSeries} options={[{value:'Confirmed',label:'Casos'}, {value:'Deaths',label:'Defunciones'}, {value:'Recovered',label:'Recuperados'}]} /><PlotView options={options} label="Serie temporal de la variable seleccionada" /></FigurePanel>;
}
export function DistributionChart() {
  const { data, failed } = useData('f1_distribucion.json', distributionSchema);
  const histogram = useData('f1_histograma.json', histogramSchema);
  const [scale, setScale] = useState<'original'|'transformed'>('original');
  if (!data || !histogram.data) return <Status failed={failed || histogram.failed} />;
  const bins = histogram.data[scale];
  const decimals = scale === 'original' ? 0 : 2;
  const options: Plot.PlotOptions = { height: 280, x: { label: scale === 'original' ? 'Casos confirmados' : 'ln(casos + 1)', grid: true, tickFormat: (d: number) => num(d, decimals) }, y: { label: 'Ubicaciones', grid: true, tickFormat: (d: number) => num(d, 0) }, marks: [Plot.rectY(bins, { x1: 'lower', x2: 'upper', y: 'count', fill: colors.blue, inset: 1, title: d => `${num(d.lower, decimals)} a ${num(d.upper, decimals)}: ${num(d.count, 0)} ubicaciones` }), Plot.ruleY([0])] };
  return <FigurePanel number={4} title="Distribución de los casos confirmados" description="La transformación logarítmica reduce la asimetría de la distribución." note={note('f1_histograma.json y f1_distribucion.json')} data={<><DataTable caption="Frecuencias del histograma" headers={['Límite inferior', 'Límite superior', 'Ubicaciones']} rows={bins.map(bin => [num(bin.lower, decimals), num(bin.upper, decimals), num(bin.count, 0)])} /><DataTable caption="Valores por ubicación" headers={['Casos', 'ln(casos + 1)']} rows={data.map(d => [num(d.original,0), num(d.transformed,3)])} /></>}><SegmentedControl label="Escala" value={scale} onChange={setScale} options={[{value:'original',label:'Original'}, {value:'transformed',label:'ln(x+1)'}]} /><PlotView options={options} label="Histograma de casos en la escala seleccionada" /></FigurePanel>;
}
export function CsrChart() {
  const { data, failed } = useData('f2_csr_curvas.json', csrSchema);
  const [kind, setKind] = useState('G'); const [mean, setMean] = useState(true); const [envelope, setEnvelope] = useState(true);
  if (!data) return <Status failed={failed} />;
  const values = data[kind] ?? [];
  const options: Plot.PlotOptions = { height: 300, x: { label: 'Distancia (km)', grid: true }, y: { label: `Función ${kind}`, grid: true }, marks: [envelope ? Plot.areaY(values, { x: 'radius', y1: 'minimum', y2: 'maximum', fill: colors.blue, fillOpacity: 0.14 }) : null, mean ? Plot.lineY(values, { x: 'radius', y: 'mean', stroke: colors.gray, strokeDasharray: '5,4' }) : null, Plot.lineY(values, { x: 'radius', y: 'observed', stroke: colors.blue, strokeWidth: 2.5 })] };
  return <FigurePanel number={6} title="Funciones de distribución espacial y envolvente CSR" description="Las funciones observadas se comparan con la envolvente de completa aleatoriedad espacial." note={note('f2_csr_curvas.json')} data={<DataTable caption={`Función ${kind}`} headers={['Distancia (km)', 'Observada', 'Mínimo', 'Máximo', 'Media CSR']} rows={values.map(d => [num(d.radius,0),display(d.observed),display(d.minimum),display(d.maximum),display(d.mean)])} />}><SegmentedControl label="Función espacial" value={kind} onChange={setKind} options={['G','F','J','L'].map(value => ({value,label:value}))} /><Toggle label="Mostrar envolvente" checked={envelope} onChange={setEnvelope}/><Toggle label="Mostrar media CSR" checked={mean} onChange={setMean}/><PlotView options={options} label={`Curva ${kind} y referencia CSR`} /></FigurePanel>;
}
export function VariogramChart() {
  const { data, failed } = useData('f3_variograma.json', variogramSchema);
  const models = useData('f3_variograma_confirmed_modelos.json', tableSchema);
  const [method, setMethod] = useState('MV'); const [model, setModel] = useState('Gaussiano');
  if (!data || !models.data) return <Status failed={failed || models.failed} />;
  const modelNames = [...new Set(data.curves.map(d => d.model))];
  const options: Plot.PlotOptions = { height: 330, x: {label:'Distancia (km)',grid:true}, y: {label:'Semivarianza',grid:true}, marks: [...data.curves.map(curve => Plot.lineY(curve.points, { x:'h', y:'g', stroke: curve.method === 'WLS' ? colors.gold : curve.method === 'MV' ? colors.blue : colors.gray, strokeDasharray: curve.method === 'WLS' ? undefined : curve.method === 'MV' ? '6,3' : '2,3', opacity: curve.method === method && curve.model === model ? 1 : 0.18, strokeWidth: curve.method === method && curve.model === model ? 3 : 1 })), Plot.dot(data.empirical, {x:'h',y:'g',r:'n',fill:colors.blue,title:d => `Pares: ${num(d.n,0)}\nDistancia: ${num(d.h)} km\nSemivarianza: ${num(d.g)}`})] };
  return <FigurePanel number={9} title="Semivariograma empírico y modelos ajustados" description="El ajuste seleccionado por validación cruzada es gaussiano por máxima verosimilitud." note={note('f3_variograma.json y f3_variograma_confirmed_modelos.json')} data={<DataTable caption="Semivariograma empírico" headers={['Distancia (km)','Semivarianza','Pares']} rows={data.empirical.map(d => [num(d.h),num(d.g),num(d.n,0)])}/>}>
    <SegmentedControl label="Método de ajuste" value={method} onChange={setMethod} options={['WLS','MV','REML'].map(value=>({value,label:value}))}/>
    <SegmentedControl label="Modelo" value={model} onChange={setModel} options={modelNames.map(value=>({value,label:value}))}/>
    <PlotView options={options} label="Semivariograma empírico y nueve curvas ajustadas" />
    <div className="table-scroll" role="region" aria-label="Modelos ajustados" tabIndex={0}><table><caption>Modelos ajustados. Seleccione una fila para destacar la curva.</caption><thead><tr><th scope="col">Método y modelo</th><th scope="col">Alcance (km)</th><th scope="col">RMSE</th><th scope="col">RMSS</th></tr></thead><tbody>{models.data.map((row,index) => { const methodKey = Object.keys(row).find(k => k.startsWith('M') && k.endsWith('todo')) ?? ''; const methodValue = String(row[methodKey]); const modelValue = String(row.Modelo); return <tr key={index}><th scope="row"><button type="button" aria-pressed={method===methodValue && model===modelValue} onClick={() => {setMethod(methodValue);setModel(modelValue);}}>{methodValue} · {modelValue}</button></th><td>{display(row['Alcance a (km)'])}</td><td>{display(row['RMSE LOO'])}</td><td>{display(row['RMSS LOO'])}</td></tr>; })}</tbody></table></div>
  </FigurePanel>;
}
export function LmcChart() {
  const { data, failed } = useData('f3_lmc.json', lmcSchema);
  if (!data) return <Status failed={failed} />;
  return <FigurePanel number={11} title="Modelo lineal de corregionalización" description="Las curvas directas y cruzada comparten una estructura espacial admisible." note={note('f3_lmc.json')} data={<DataTable caption="Semivariogramas empíricos del modelo" headers={['Componente','Distancia (km)','Semivarianza','Pares']} rows={data.flatMap(d => d.empirical.map(p => [`γ${d.component}`,num(p.h),num(p.g),num(p.n,0)]))} />}><p>Modelo lineal de corregionalización admisible</p><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%, 230px),1fr))',gap:'1rem'}}>{data.map(d => <div key={d.component}><h4>γ{d.component}</h4><PlotView label={`Semivariograma ${d.component}`} options={{height:220,x:{label:'Distancia (km)'},y:{label:'Semivarianza'},marks:[Plot.lineY(d.curve,{x:'h',y:'g',stroke:colors.blue,strokeWidth:2}),Plot.dot(d.empirical,{x:'h',y:'g',fill:colors.gold,r:3})]}}/></div>)}</div></FigurePanel>;
}
export function CrossValidationChart() {
  const { data, failed } = useData('f3_cv_puntos.json', cvPointsSchema); const metrics = useData('f3_validacion_cruzada.json', tableSchema);
  const [estimator, setEstimator] = useState<'idw'|'ok'|'ock'|'coloc'>('ok');
  if (!data || !metrics.data) return <Status failed={failed || metrics.failed} />;
  const options: Plot.PlotOptions = { height: 300, x:{label:'Observado: ln(casos + 1)',grid:true}, y:{label:'Predicho',grid:true}, marks:[Plot.lineY([...data].sort((a,b)=>a.observed-b.observed),{x:'observed',y:'observed',stroke:colors.gray,strokeDasharray:'4,4'}),Plot.dot(data,{x:'observed',y:estimator,fill:colors.blue,r:4,title:d=>`${d.location}\nObservado: ${num(d.observed)}\nPredicho: ${num(d[estimator])}`})] };
  return <FigurePanel number={13} title="Validación cruzada por estimador" description="El cokriging co-localizado reduce el error, aunque su varianza requiere recalibración." note={note('f3_cv_puntos.json y f3_validacion_cruzada.json')} data={<DataTable caption="Predicciones de validación cruzada" headers={['Ubicación','Observado','IDW','OK','OCK isotópico','OCK co-localizado']} rows={data.map(d=>[d.location,num(d.observed,3),num(d.idw,3),num(d.ok,3),num(d.ock,3),num(d.coloc,3)])}/>}><SegmentedControl label="Estimador" value={estimator} onChange={setEstimator} options={[{value:'idw',label:'IDW'},{value:'ok',label:'OK'},{value:'ock',label:'OCK isotópico'},{value:'coloc',label:'OCK co-localizado'}]}/><PlotView options={options} label="Valores observados y predichos"/><DataTable caption="Métricas de validación cruzada" headers={['Estimador','RMSE','RMSS']} rows={metrics.data.map(row=>[display(row.Estimador),display(row.RMSE),display(row.RMSS)])}/></FigurePanel>;
}
const countries: Record<string,string> = { 'United Kingdom':'Reino Unido', Spain:'España', Netherlands:'Países Bajos', Portugal:'Portugal', Ireland:'Irlanda', Armenia:'Armenia', 'North Macedonia':'Macedonia del Norte', Montenegro:'Montenegro' };
export function DeficitChart() {
  const { data, failed } = useData('f4_recomendaciones.json', recommendationsSchema);
  if (!data) return <Status failed={failed} />;
  const rows = data.r1.countries.map(d => ({country: countries[String(d.ADMIN)] ?? String(d.ADMIN), value: Number(d.deficit_camas)})).sort((a,b)=>b.value-a.value);
  const options: Plot.PlotOptions = { height: 350, marginLeft: 125, x:{label:'Déficit de camas',grid:true,tickFormat:(d:number)=>num(d,0)}, y:{label:null,domain:rows.map(d=>d.country)}, marks:[Plot.barX(rows,{x:'value',y:'country',fill:colors.red}),Plot.text(rows,{x:'value',y:'country',text:d=>num(d.value,0),dx:4,textAnchor:'start',fill:colors.blue})] };
  return <FigurePanel number={15} title="Déficit hospitalario en países de alta carga" description="El déficit se concentra principalmente en Reino Unido y España." note={note('f4_recomendaciones.json')} data={<DataTable caption="Déficit de camas por país" headers={['País','Déficit de camas']} rows={rows.map(d=>[d.country,num(d.value,0)])}/>}><p><strong>Total: {num(data.r1.total_deficit,0)} camas</strong></p><PlotView options={options} label="Déficit hospitalario por país" /></FigurePanel>;
}
