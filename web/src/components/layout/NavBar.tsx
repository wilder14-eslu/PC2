import { useEffect, useState } from 'react';

const links = [
  ['resumen', 'Resumen'], ['metodo', 'Método'], ['fase-1', 'Fase 1'],
  ['fase-2', 'Fase 2'], ['fase-3', 'Fase 3'], ['fase-4', 'Fase 4'],
  ['conclusiones', 'Conclusiones'], ['referencias', 'Referencias'],
] as const;

export function NavBar() {
  const [active, setActive] = useState('');
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
    }, { rootMargin: '-20% 0px -70%', threshold: 0 });
    links.forEach(([id]) => { const node = document.getElementById(id); if (node) observer.observe(node); });
    return () => observer.disconnect();
  }, []);
  return <>
    <a className="skip-link" href="#contenido">Saltar al contenido</a>
    <header className="site-header"><div className="site-nav-wrap">
      <a className="site-brand" href="#inicio">UNMSM <span>·</span> Estadística Espacial</a>
      <button className="nav-toggle" type="button" aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)}>Secciones <span aria-hidden="true">{open ? '×' : '☰'}</span></button>
      <nav id="main-navigation" className={`site-nav ${open ? 'is-open' : ''}`} aria-label="Secciones del estudio">
        {links.map(([id, label]) => <a key={id} href={`#${id}`} aria-current={active === id ? 'location' : undefined} onClick={() => setOpen(false)}>{label}</a>)}
        <a className="nav-poster" href="?modo=poster">Modo póster</a>
      </nav>
    </div></header>
  </>;
}
