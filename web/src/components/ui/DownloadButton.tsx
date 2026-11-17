import type { ReactNode } from 'react';
export function DownloadButton({ href, children, filename }: { href: string; children: ReactNode; filename?: string }) { return <a className="ui-button" href={href} download={filename ?? true}>{children}</a>; }
export default DownloadButton;
