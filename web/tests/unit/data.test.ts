import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { kpisSchema, distancePairsSchema, distributionSchema, recommendationsSchema, rasterManifestSchema } from '../../src/data/schemas';

const data = (name: string): unknown => JSON.parse(readFileSync(resolve('public/data', name), 'utf8'));

describe('Contratos de los datos exportados', () => {
  it('valida indicadores y cifras del informe', () => {
    const kpis = kpisSchema.parse(data('kpis.json'));
    expect(kpis.locations_all).toBe(52);
    expect(kpis.locations_modeled).toBe(42);
    expect(kpis.ok_rmse).toBeCloseTo(1.5826, 4);
    expect(Math.round(kpis.hospital_bed_deficit)).toBe(247407);
    expect(kpis.spatial_range_km).toBeCloseTo(392.9713, 4);
  });
  it('conserva los pares y observaciones del estudio', () => {
    expect(distancePairsSchema.parse(data('f1_pares_distancias.json'))).toHaveLength(1326);
    expect(distributionSchema.parse(data('f1_distribucion.json'))).toHaveLength(52);
  });
  it('conserva recomendaciones y superficies georreferenciadas', () => {
    const rec = recommendationsSchema.parse(data('f4_recomendaciones.json'));
    expect(rec.r1.countries).toHaveLength(8);
    expect(Math.round(rec.r1.total_deficit)).toBe(247407);
    const rasters = rasterManifestSchema.parse(data('rasters.json'));
    expect(rasters.map(raster => raster.id)).toEqual(expect.arrayContaining(['ok_conf', 'ock_conf', 'inc_ok']));
  });
  it('emplea frecuencias precalculadas sin perder observaciones', () => {
    const histogram = data('f1_histograma.json') as Record<string, {count: number}[]>;
    expect(histogram.original.reduce((sum, bin) => sum + bin.count, 0)).toBe(52);
    expect(histogram.transformed.reduce((sum, bin) => sum + bin.count, 0)).toBe(52);
  });
});
