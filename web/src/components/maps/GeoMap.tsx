import { useEffect, useRef } from 'react';
import type { Raster } from '../../data/schemas';
import type { FeatureCollection } from 'geojson';
import 'maplibre-gl/dist/maplibre-gl.css';
import './maps.css';

export interface MapData {
  countries: FeatureCollection;
  points?: FeatureCollection;
  contours?: FeatureCollection;
}

interface GeoMapProps {
  data: MapData;
  raster?: Raster;
  pointMode?: 'support' | 'lisa' | 'gi';
  showExcluded?: boolean;
  contour?: string;
  onCountry?: (properties: Record<string, unknown>) => void;
  interactive?: boolean;
  label: string;
}

export function GeoMap({ data, raster, pointMode, showExcluded = true, contour, onCountry, interactive = true, label }: GeoMapProps) {
  const container = useRef<HTMLDivElement>(null);
  const countryHandler = useRef(onCountry);
  countryHandler.current = onCountry;

  useEffect(() => {
    let alive = true;
    let map: import('maplibre-gl').Map | undefined;
    void import('maplibre-gl').then(({ default: maplibre }) => {
      if (!alive || !container.current) return;
      map = new maplibre.Map({
        container: container.current,
        style: { version: 8, sources: {}, layers: [{ id: 'background', type: 'background', paint: { 'background-color': '#f6f7f9' } }] },
        center: [17, 53], zoom: 2.65, minZoom: 1.5, maxZoom: 8,
        attributionControl: false, interactive, cooperativeGestures: true,
      });
      map.on('load', () => {
        if (!map) return;
        map.addSource('countries', { type: 'geojson', data: data.countries });
        map.addLayer({ id: 'country-fill', type: 'fill', source: 'countries', paint: { 'fill-color': '#ffffff' } });
        if (raster) {
          map.addSource('surface', { type: 'image', url: `${import.meta.env.BASE_URL}data/${raster.file}`, coordinates: raster.coordinates as [[number, number], [number, number], [number, number], [number, number]] });
          map.addLayer({ id: 'surface', source: 'surface', type: 'raster', paint: { 'raster-opacity': 0.84 } });
        }
        map.addLayer({ id: 'country-border', type: 'line', source: 'countries', paint: { 'line-color': '#9ca5b2', 'line-width': 0.7 } });
        if (contour && data.contours) {
          map.addSource('contours', { type: 'geojson', data: data.contours });
          map.addLayer({ id: 'contours', type: 'line', source: 'contours', filter: ['==', ['get', 'id'], contour], paint: { 'line-color': '#0f2240', 'line-width': 2, 'line-dasharray': [2, 1] } });
        }
        if (data.points && pointMode) {
          map.addSource('points', { type: 'geojson', data: data.points });
          const color: import('maplibre-gl').ExpressionSpecification = pointMode === 'lisa'
            ? ['match', ['get', 'LISA'], 'Alto-Alto', '#d7191c', 'Bajo-Bajo', '#2c7bb6', 'Alto-Bajo', '#fdae61', 'Bajo-Alto', '#abd9e9', '#d9d9d9']
            : pointMode === 'gi'
              ? ['interpolate', ['linear'], ['coalesce', ['get', 'Gi*_z'], 0], -3, '#2166ac', 0, '#f7f7f7', 3, '#b2182b']
              : ['case', ['==', ['get', 'soporte_ok'], false], '#9ca5b2', '#1f3a68'];
          map.addLayer({ id: 'points', type: 'circle', source: 'points', ...(pointMode === 'support' && !showExcluded ? { filter: ['==', ['get', 'soporte_ok'], true] as import('maplibre-gl').FilterSpecification } : {}), paint: { 'circle-color': color, 'circle-radius': pointMode === 'support' ? ['interpolate', ['linear'], ['sqrt', ['max', 0, ['coalesce', ['get', 'Confirmed'], 0]]], 0, 3, 550, 12] : 6, 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 1.2, 'circle-opacity': 0.9 } });
          map.on('mouseenter', 'points', () => { if (map) map.getCanvas().style.cursor = 'pointer'; });
          map.on('mouseleave', 'points', () => { if (map) map.getCanvas().style.cursor = ''; });
          map.on('click', 'points', event => {
            const props = event.features?.[0]?.properties;
            if (map && props) new maplibre.Popup().setLngLat(event.lngLat).setText(String(props.Ubicacion ?? '')).addTo(map);
          });
        }
        map.on('click', 'country-fill', event => {
          const properties = event.features?.[0]?.properties;
          if (properties) countryHandler.current?.(properties);
        });
      });
      if (interactive) map.addControl(new maplibre.NavigationControl({ showCompass: false }), 'top-right');
    }).catch(() => { if (container.current) container.current.textContent = 'No fue posible cargar el mapa. Consulte la tabla de datos.'; });
    return () => { alive = false; map?.remove(); };
  }, [data.countries, data.points, data.contours, raster, pointMode, showExcluded, contour, interactive]);

  return <div ref={container} className="geo-map" role="region" aria-label={label} />;
}
