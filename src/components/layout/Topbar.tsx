export default function Topbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-20 px-4 pt-[env(safe-area-inset-top)]">
      <div className="glass rounded-2xl h-12 flex items-center justify-between px-4">
        <div className="font-semibold">GianniCorp Fitness</div>
        <div className="flex items-center gap-2">
          <button className="btn-ghost text-sm">Feedback</button>
        </div>
      </div>
    </header>
  )
}
