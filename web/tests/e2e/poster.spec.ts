import { test, expect } from '@playwright/test';

test('indicadores, navegación y consola', async ({ page }) => {
  const errors: string[] = [];
  page.on('response', response => { if (response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`); });
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Difusión global y estimación espacial/ })).toBeVisible();
  await expect(page.getByText('1,583', { exact: true })).toBeVisible();
  await expect(page.getByText('247 407', { exact: true })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Secciones del estudio' })).toBeVisible();
  expect(errors).toEqual([]);
});

for (const width of [375, 768, 1440]) {
  test(`diseño y navegación en ${width} px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Difusión global y estimación espacial/ })).toBeVisible();
    const overflowing = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    expect(overflowing).toBe(false);
    if (width === 375) {
      const menu = page.getByRole('button', { name: /Secciones/ });
      await menu.click();
      await expect(menu).toHaveAttribute('aria-expanded', 'true');
      await page.getByRole('link', { name: 'Método', exact: true }).click();
      await expect(page).toHaveURL(/#metodo$/);
    }
  });
}

test('cada figura web expone datos y cambia su control principal', async ({ page }) => {
  test.setTimeout(180_000);
  const cases: Array<[number, string, string]> = [
    [0, 'Distancia calculada frente a distancia geodésica', 'EPSG:3035'],
    [2, 'Evolución acumulada en la Región Europa', 'Defunciones'],
    [3, 'Distribución de los casos confirmados', 'ln(x+1)'],
    [4, 'Densidad kernel de sitios y casos', 'Sitios'],
    [5, 'Funciones de distribución espacial y envolvente CSR', 'F'],
    [6, 'Asociación espacial local y estadístico Gi*', 'Gi*'],
    [8, 'Semivariograma empírico y modelos ajustados', 'WLS'],
    [9, 'Kriging ordinario de defunciones', 'Desviación estándar'],
    [11, 'Comparación espacial de OK y OCK', 'Desviación estándar'],
    [12, 'Validación cruzada por estimador', 'OK'],
    [13, 'Carga, incidencia e incertidumbre territorial', 'Incidencia'],
  ];
  await page.goto('/');
  for (const [index, title, control] of cases) {
    await page.locator('.deferred-module').nth(index).scrollIntoViewIfNeeded();
    const figure = page.locator('figure.figure-panel').filter({ has: page.getByText(title, { exact: true }) });
    await expect(figure).toBeVisible({ timeout: 30_000 });
    await expect(figure.getByText('Ver datos', { exact: true })).toBeVisible();
    const button = figure.getByRole('button', { name: control, exact: true });
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
  }
});

test('puntos, potencia IDW y figuras sin selector conservan sus datos', async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto('/');
  const modules = page.locator('.deferred-module');
  await modules.nth(1).scrollIntoViewIfNeeded();
  const points = page.locator('figure.figure-panel').filter({ hasText: 'Ubicaciones de reporte y soporte espacial' });
  const excluded = points.getByLabel('Mostrar excluidos por soporte');
  await expect(excluded).toBeChecked();
  await excluded.uncheck();
  await expect(excluded).not.toBeChecked();
  await expect(points.getByText('Ver datos')).toBeVisible();

  await modules.nth(7).scrollIntoViewIfNeeded();
  const idw = page.locator('figure.figure-panel').filter({ hasText: 'Interpolación por inverso de la distancia' });
  const slider = idw.getByLabel('Potencia p');
  await expect(slider).toBeVisible();
  const previous = await slider.inputValue();
  await slider.fill('2');
  expect(await slider.inputValue()).not.toBe(previous);
  await expect(idw.getByText('Ver datos')).toBeVisible();

  for (const [index, title] of [[10, 'Modelo lineal de corregionalización'], [14, 'Déficit hospitalario en países de alta carga']] as const) {
    await modules.nth(index).scrollIntoViewIfNeeded();
    const figure = page.locator('figure.figure-panel').filter({ hasText: title });
    await expect(figure.getByText('Ver datos')).toBeVisible();
    await figure.getByText('Ver datos').click();
    await expect(figure.locator('details table')).toBeVisible();
  }
});

test('el póster conserva cuatro columnas en una hoja A0', async ({ page }) => {
  await page.goto('/?modo=poster');
  await expect(page.locator('.poster-sheet')).toBeVisible();
  await expect(page.locator('.poster-columns > section')).toHaveCount(4);
  await expect(page.locator('.poster-metrics').getByText('1,583', { exact: true })).toBeVisible();
  await page.emulateMedia({ media: 'print' });
  const dimensions = await page.locator('.poster-sheet').evaluate(element => ({ width: element.scrollWidth, height: element.scrollHeight, clientHeight: element.clientHeight }));
  expect(dimensions.height).toBeLessThanOrEqual(dimensions.clientHeight + 2);
  const columns = await page.locator('.poster-columns > section').evaluateAll(elements => elements.map(element => ({ height: element.scrollHeight, clientHeight: element.clientHeight })));
  expect(columns.filter(column => column.height > column.clientHeight + 2)).toEqual([]);
  const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
  expect((pdf.toString('latin1').match(/\/Type\s*\/Page\b/g) ?? []).length).toBe(1);
});
