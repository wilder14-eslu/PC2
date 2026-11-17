import katex from 'katex';
export function Formula({ expression, display = false }: { expression: string; display?: boolean }) {
  const html = { __html: katex.renderToString(expression, { displayMode: display, throwOnError: false, trust: false }) };
  return display ? <div className="formula" dangerouslySetInnerHTML={html} /> : <span className="formula" dangerouslySetInnerHTML={html} />;
}
export default Formula;
