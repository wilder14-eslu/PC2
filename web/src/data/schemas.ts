import { z } from 'zod';

/** Contratos de las salidas estáticas generadas por el cuaderno. */
export const kpisSchema = z.object({
  distance_error_original: z.number(),
  distance_error_projected: z.number(),
  locations_all: z.number().int(),
  locations_modeled: z.number().int(),
  spatial_range_km: z.number(),
  ok_rmse: z.number(),
  ok_rmss: z.number(),
  cokriging_reduction_percent: z.number(),
  hospital_bed_deficit: z.number(),
});

export const numericRecordSchema = z.record(z.string(), z.union([z.number(), z.string(), z.boolean(), z.null()]));
export const tableSchema = z.array(numericRecordSchema);
export const distancePairsSchema = z.array(z.object({
  d_geo: z.number(), d_deg: z.number(), d_proj: z.number(), lat_media: z.number(),
}));
export const distributionSchema = z.array(z.object({ original: z.number(), transformed: z.number() }));
/** Límites de clase y frecuencia precalculada en cada escala de la distribución. */
export const histogramSchema = z.object({
  original: z.array(z.object({ lower: z.number(), upper: z.number(), count: z.number().int().nonnegative() })),
  transformed: z.array(z.object({ lower: z.number(), upper: z.number(), count: z.number().int().nonnegative() })),
});
export const timeSeriesSchema = z.array(z.object({ Date: z.string(), Confirmed: z.number(), Deaths: z.number(), Recovered: z.number() }));
export const cvPointsSchema = z.array(z.object({
  location: z.string(), observed: z.number(), idw: z.number(), ok: z.number(), ock: z.number(), coloc: z.number(),
}));
export const rasterSchema = z.object({
  id: z.string(), file: z.string(), coordinates: z.array(z.tuple([z.number(), z.number()])).length(4),
  domain: z.tuple([z.number(), z.number()]), palette: z.string(), unit: z.string(), label: z.string(),
});
export const rasterManifestSchema = z.array(rasterSchema);
export const geoJsonSchema = z.object({
  type: z.literal('FeatureCollection'),
  features: z.array(z.object({
    type: z.literal('Feature'),
    properties: z.record(z.string(), z.unknown()).nullable(),
    geometry: z.object({ type: z.string(), coordinates: z.unknown() }).nullable(),
  }).passthrough()),
});
export const csrSchema = z.record(z.string(), z.array(z.object({
  radius: z.number(), observed: z.number().nullable(), minimum: z.number().nullable(),
  maximum: z.number().nullable(), mean: z.number().nullable(),
})));
const variogramPointSchema = z.object({ h: z.number(), g: z.number(), n: z.number() });
const curvePointSchema = z.object({ h: z.number(), g: z.number() });
export const variogramSchema = z.object({
  empirical: z.array(variogramPointSchema),
  curves: z.array(z.object({ method: z.string(), model: z.string(), points: z.array(curvePointSchema) })),
});
export const lmcSchema = z.array(z.object({ component: z.string(), empirical: z.array(variogramPointSchema), curve: z.array(curvePointSchema) }));
export const recommendationsSchema = z.object({
  r1: z.object({ countries: tableSchema, total_deficit: z.number(), median_beds: z.number() }),
  r2: z.object({ countries: tableSchema, uncertainty_threshold: z.number(), area_percent: z.number(), critical_distance_km: z.number() }),
  r3: z.object({ hotspots: z.array(z.string()), neighbors: z.array(z.string()), range_km: z.number() }),
});

export type Kpis = z.infer<typeof kpisSchema>;
export type Raster = z.infer<typeof rasterSchema>;
