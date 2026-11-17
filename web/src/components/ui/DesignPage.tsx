import { useState } from 'react';
import { FigurePanel } from '../figures/FigurePanel';
import { KpiCard } from './KpiCard';
import { SegmentedControl } from './SegmentedControl';
import { Toggle } from './Toggle';
import { InfoTooltip } from './InfoTooltip';

export function DesignPage() {
  const [layer, setLayer] = useState('sitios');
  const [visible, setVisible] = useState(true);
  return <main className="design-page"><p>Sistema de diseño · Grupo 6</p><h1>Componentes de la página</h1><p>Muestra interna de los elementos visuales y sus estados interactivos.</p>
    <div className="design-grid"><KpiCard value="Dato" label="Indicador" detail="Descripción breve" source="Archivo de datos del proyecto" variant="highlight" />
      <section className="reading-panel"><h2>Controles</h2><SegmentedControl label="Capa de ejemplo" value={layer} onChange={setLayer} options={[{ value: 'sitios', label: 'Sitios' }, { value: 'casos', label: 'Casos' }]} /><Toggle label="Mostrar puntos" checked={visible} onChange={setVisible} /><InfoTooltip>Información complementaria del indicador.</InfoTooltip></section>
      <FigurePanel number="de muestra" title="Módulo de ejemplo" note="Muestra del sistema de diseño." expandable={false} data={<p>Datos de ejemplo.</p>}><p>El área visual contiene el mapa o gráfico correspondiente.</p></FigurePanel></div>
  </main>;
}
export default DesignPage;
