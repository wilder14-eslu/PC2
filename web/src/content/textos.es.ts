export const summary = 'Se modeló la distribución espacial de los casos confirmados y las defunciones por COVID-19 en la Región Europa de la Organización Mundial de la Salud. La preparación de los datos, la evaluación de patrones espaciales y la comparación de estimadores permitieron elaborar superficies de predicción e incertidumbre y sustentar recomendaciones de capacidad hospitalaria, vigilancia y coordinación territorial.';

export const conclusions = [
  'La proyección métrica, el corte temporal, la transformación logarítmica y la homogeneización del soporte fueron necesarios para construir una representación espacial coherente y reducir la influencia de la heterogeneidad entre ubicaciones.',
  'Los sitios de reporte no siguieron un patrón de completa aleatoriedad espacial. La dependencia de los casos confirmados se describió mediante un modelo gaussiano y el Kriging Ordinario superó al interpolador por inverso de la distancia en validación cruzada.',
  'Con muestreo isotópico, el Cokriging Ordinario coincidió con el Kriging Ordinario; cuando la variable secundaria estuvo disponible en el sitio de predicción, su error disminuyó, aunque la varianza requiere recalibración. Las superficies y su incertidumbre orientaron las recomendaciones territoriales.',
];

export const limitations = [
  'Las observaciones corresponden a centroides de países y no representan riesgo individual ni necesariamente subnacional; existe riesgo de falacia ecológica y de unidad de área modificable.',
  'Las diferencias entre países en capacidad diagnóstica, definición de caso y registro de defunciones contribuyen a la variabilidad observada.',
  'La escasez de pares a distancias cortas limita la precisión del semivariograma y exige fundamentar la selección en validación cruzada.',
  'La Federación de Rusia no aporta observaciones al estudio, lo que incrementa la incertidumbre en el este de la región.',
  'El análisis es transversal y no describe explícitamente la evolución temporal del proceso espacial.',
];
