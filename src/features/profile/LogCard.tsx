import { Card } from "../../shared/ui/Card";
import { Button } from "../../shared/ui/Button";
import { exportLocalLog } from "../../data/backup/logs";

export function LogCard() {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="text-sm text-zinc-400">Support-Log exportieren (nur lokal)</div>
        <Button variant="outline" onClick={() => void exportLocalLog()}>Log exportieren</Button>
      </div>
    </Card>
  );
}
