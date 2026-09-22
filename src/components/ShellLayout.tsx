import Link from 'next/link'
import { Home, Book, BarChart2, ChefHat, User } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard', icon: Home, label: 'Inicio' },
  { href: '/log', icon: Book, label: 'Diario' },
  { href: '/progress', icon: BarChart2, label: 'Progreso' },
  { href: '/recipes', icon: ChefHat, label: 'Recetas' },
  { href: '/profile', icon: User, label: 'Perfil' },
]

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div style={{ flex: 1, paddingBottom: '80px', overflowY: 'auto' }}>
        {children}
      </div>

      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '480px',
        backgroundColor: 'var(--color-bg-card)',
        borderTop: '1px solid var(--color-border)',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '0.75rem 0',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
        zIndex: 50
      }}>
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.25rem',
            color: 'var(--color-text-muted)',
            textDecoration: 'none',
            fontSize: '0.75rem',
            fontWeight: 600
          }}>
            <Icon size={24} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}
