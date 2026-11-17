import { DesignPage } from './components/ui/DesignPage';
import PosterContent from './sections/PosterContent';
import { PosterLayout } from './components/layout/PosterLayout';

export default function App() {
  const path = window.location.pathname.replace(/\/$/, '');
  if (path.endsWith('/design')) return <DesignPage />;
  if (new URLSearchParams(window.location.search).get('modo') === 'poster') {
    const siteUrl = new URL(import.meta.env.BASE_URL, window.location.origin).href;
    return <PosterLayout siteUrl={siteUrl} repositoryUrl="https://github.com/wilder14-eslu/PC2" />;
  }
  return <PosterContent />;
}
