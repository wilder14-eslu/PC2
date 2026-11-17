import type { ReactNode } from 'react';
export function ReadingPanel({ children, title }: { children: ReactNode; title?: string }) { return <aside className="reading-panel">{title && <h3>{title}</h3>}{children}</aside>; }
export default ReadingPanel;
