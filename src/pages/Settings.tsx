import { Card, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export default function Settings() {
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold">Einstellungen</h1>
      <Card>
        <CardTitle>Darstellung</CardTitle>
        <div className="text-sm text-gc-subtle">System-Theme wird automatisch verwendet (Dark).</div>
      </Card>
      <Card>
        <CardTitle>Backup</CardTitle>
        <div className="toolbar">
          <button className="btn-outline">Daten exportieren (JSON)</button>
          <Button>Daten importieren</Button>
        </div>
      </Card>
    </div>
  )
}
