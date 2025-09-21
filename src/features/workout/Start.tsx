import { Card } from "../../shared/ui/Card";
import { Button } from "../../shared/ui/Button";

export default function Start() {
  return (
    <div className="mx-auto max-w-screen-sm p-4 space-y-3">
      <h1 className="text-xl font-semibold">Start</h1>
      <Card>
        <div className="grid grid-cols-1 gap-2">
          <Button>Neues Workout</Button>
          <Button variant="outline">Aus Vorlage starten</Button>
          <Button variant="ghost">Letztes fortsetzen</Button>
        </div>
      </Card>
    </div>
  );
}
