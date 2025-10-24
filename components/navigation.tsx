'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Radio, 
  Lightbulb, 
  Search, 
  Package, 
  Send,
  TrendingUp
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/signals', label: 'Signals Feed', icon: Radio },
  { href: '/dashboard/opportunities', label: 'Opportunities', icon: Lightbulb },
  { href: '/dashboard/research', label: 'Research', icon: Search },
  { href: '/dashboard/products', label: 'Products', icon: Package },
  { href: '/dashboard/outreach', label: 'Outreach', icon: Send },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <TrendingUp className="h-6 w-6 mr-2" />
        <h1 className="text-xl font-bold">Intel Dashboard</h1>
      </div>
      
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      
      <div className="border-t p-4 text-xs text-muted-foreground">
        <p>Pain-to-Profit System</p>
        <p className="mt-1">Data-Driven Discovery</p>
      </div>
    </div>
  )
}
