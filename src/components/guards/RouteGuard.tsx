import React from "react";
export type RouteGuardProps = { children: React.ReactNode; viewerUserId?: string | null; authUserId?: string | null; importOrSyncBlocking?: boolean; isCoachViewer?: boolean; };
export const RouteGuard: React.FC<RouteGuardProps> = ({ children, viewerUserId, authUserId, importOrSyncBlocking, isCoachViewer }) => {
  if (importOrSyncBlocking) { return (<div className="p-6 space-y-3"><h2 className="text-lg font-semibold">Aktion vorübergehend blockiert</h2><p className="opacity-80 text-sm">Es läuft gerade ein Import/Synchronisierung. Bitte warte einen Moment und versuche es erneut.</p></div>); }
  if (viewerUserId && authUserId && viewerUserId !== authUserId) { return (<div className="p-6 space-y-3"><h2 className="text-lg font-semibold">Nur Ansicht</h2><p className="opacity-80 text-sm">Du siehst die Daten als Coach/Viewer. Schreibaktionen sind deaktiviert, um Konflikte zu vermeiden.</p></div>); }
  if (isCoachViewer) { return (<div className="p-6 space-y-3"><h2 className="text-lg font-semibold">Coach-Viewer</h2><p className="opacity-80 text-sm">Buttons zum Starten/Ändern sind in diesem Modus deaktiviert.</p></div>); }
  return <>{children}</>;
};
