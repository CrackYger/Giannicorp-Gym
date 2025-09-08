import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'

const tabs = [
  { to: '/dashboard', label: 'Home', icon: '🏠' },
  { to: '/plan', label: 'Plan', icon: '📝' },
  { to: '/workout', label: 'Train', icon: '🏋️' },
  { to: '/history', label: 'Verlauf', icon: '📈' },
  { to: '/settings', label: 'Mehr', icon: '⚙️' },
]

export default function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30">
      <div className="absolute inset-0 h-16" style={{background:'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.35) 60%)'}} />
      <div className="glass border-t border-white/10 safe-b">
        <ul className="grid grid-cols-5">
          {tabs.map(t => (
            <li key={t.to}>
              <NavLink
                to={t.to}
                className={({ isActive }) =>
                  clsx('flex flex-col items-center py-3 text-[11px]', isActive ? 'text-gc-accent' : 'text-gc-ink')
                }
              >
                <span className="text-xl">{t.icon}</span>
                <span>{t.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
