import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/plan', label: 'Plan', icon: '📝' },
  { to: '/workout', label: 'Workout', icon: '🏋️' },
  { to: '/history', label: 'Verlauf', icon: '📈' },
  { to: '/settings', label: 'Einstellungen', icon: '⚙️' },
]

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-72 px-4 pt-4 gap-3">
      <div className="glass rounded-2xl h-12 flex items-center px-4 font-semibold">GianniCorp Fitness</div>
      <div className="glass rounded-2xl p-2">
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              clsx(
                'relative flex items-center gap-3 px-3 py-2 rounded-xl transition-colors',
                isActive ? 'bg-gc-accent/20 text-white ring-1 ring-gc-accent/40' : 'hover:bg-white/10 text-gc-ink'
              )
            }
          >
            <span className="text-lg">{l.icon}</span>
            <span>{l.label}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  )
}
