import { useEffect, useState } from 'react';
import { kpisSchema, type Kpis } from '../../data/schemas';
import { KpiCard } from '../ui/KpiCard';

const format = (number: number, digits = 0) => new Intl.NumberFormat('es-PE', { minimumFractionDigits: digits, maximumFractionDigits: digits }).formatToParts(number).map(part => part.type === 'group' ? '\u202f' : part.type === 'decimal' ? ',' : part.value).join('');

export function Hero() {
  const [data, setData] = useState<Kpis | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${import.meta.env.BASE_URL}data/kpis.json`, { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error('Datos no disponibles'); return response.json(); })
      .then(value => setData(kpisSchema.parse(value)))
      .catch(reason => { if (reason.name !== 'AbortError') setError(true); });
    return () => controller.abort();
  }, []);
  return <>
    <section className="hero" id="inicio"><div className="hero-inner">
      <div className="hero-institution"><img src={`${import.meta.env.BASE_URL}img/logo.webp`} width="54" height="54" alt="Escudo de la Universidad Nacional Mayor de San Marcos" /><div><strong>Universidad Nacional Mayor de San Marcos</strong><span>Facultad de Ciencias Matemáticas · Escuela Profesional de Estadística</span></div></div>
      <p className="eyebrow">Estadística espacial · Grupo 6</p>
      <h1>Difusión global y estimación espacial del COVID-19</h1>
      <p className="hero-subtitle">Análisis geoestadístico en Europa con Kriging y Cokriging</p>
      <div className="hero-meta"><p><strong>Integrantes</strong><br />Gabriel Briceño Ypanaque · Wilder Espinoza Luna · Vicente Isase Camara · Oscar Montoya Juro · Gerson Pablo Machaca · Frank Polastre Mamani</p><p><strong>Docente</strong><br />Dr. Misael Erikson Maguiña Palma<br />17 de noviembre de 2026</p></div>
      <div className="hero-actions"><a className="hero-action" href="#resumen">Explorar el estudio <span aria-hidden="true">↓</span></a><a className="hero-action secondary" href={`${import.meta.env.BASE_URL}docs/main.pdf`} download>Descargar informe</a></div>
    </div></section>
    <div className="kpi-strip wrap" aria-label="Indicadores principales del estudio">
      {error && <p role="alert">No se pudieron cargar los indicadores del estudio.</p>}
      {data && <>
        <KpiCard value={`${format(data.distance_error_original, 1)} % / ${format(data.distance_error_projected, 1)} %`} label="Error de distancia" detail="Mediana en grados / máximo proyectado" source="kpis.json · errores de distancia" variant="highlight" />
        <KpiCard value={format(data.locations_modeled)} label="Ubicaciones modeladas" detail={`de ${format(data.locations_all)} sitios de reporte`} source="kpis.json · soporte espacial" />
        <KpiCard value={`${format(data.spatial_range_km)} km`} label="Alcance espacial" detail="Modelo gaussiano de casos" source="kpis.json · semivariograma" />
        <KpiCard value={format(data.ok_rmse, 3)} label="RMSE del Kriging" detail={`RMSS ${format(data.ok_rmss, 2)}`} source="kpis.json · validación cruzada" />
        <KpiCard value={`−${format(data.cokriging_reduction_percent)} %`} label="RMSE con Cokriging" detail="Variable secundaria co-localizada" source="kpis.json · validación cruzada" />
        <KpiCard value={format(data.hospital_bed_deficit)} label="Déficit de camas" detail="Países de alta carga" source="kpis.json · recomendaciones territoriales" variant="risk" />
      </>}
    </div>
  </>;
}
