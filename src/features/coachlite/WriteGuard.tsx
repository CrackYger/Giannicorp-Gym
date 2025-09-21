import React from 'react';
import { useViewer } from './viewerStore';

interface Props { children: React.ReactNode; }

export const WriteGuard: React.FC<Props> = ({ children }) => {
  const { viewerUserId } = useViewer();
  const [my, setMy] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    import('./viewerStore').then(async mod => {
      const uid = await mod.getAuthUserId();
      if (mounted) setMy(uid);
    });
    return () => { mounted = false; };
  }, []);

  const blocked = my && viewerUserId && my !== viewerUserId;
  return (
    <div className="relative">
      {children}
      {blocked && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-xl">
          <div className="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-xl px-4 py-3 text-center max-w-sm">
            <p className="font-medium">Viewer-Modus aktiv</p>
            <p className="text-sm text-gray-500 mt-1">Schreibaktionen sind deaktiviert, da du die Daten eines Clients ansiehst.</p>
          </div>
        </div>
      )}
    </div>
  );
};
