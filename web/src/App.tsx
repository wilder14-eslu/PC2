import { DesignPage } from './components/ui/DesignPage';
import PosterContent from './sections/PosterContent';

export default function App() {
  const path = window.location.pathname.replace(/\/$/, '');
  if (path.endsWith('/design')) return <DesignPage />;
  // El modo póster redirige al póster académico en PDF (A0) usado en la sustentación
  if (new URLSearchParams(window.location.search).get('modo') === 'poster') {
    window.location.replace(`${import.meta.env.BASE_URL}docs/Poster_PC2_Grupo6.pdf`);
    return null;
  }
  return <PosterContent />;
}
