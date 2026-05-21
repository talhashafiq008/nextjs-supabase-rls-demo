import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/actions/auth'
import './globals.css'

export const metadata: Metadata = {
  title: 'PanAfricanMines Demo',
  description: 'Next.js 15 + Supabase RLS demo',
}

const roleStyles: Record<string, string> = {
  buyer:    'bg-stone-100 text-stone-600',
  seller:   'bg-amber-100 text-amber-700',
  operator: 'bg-blue-100 text-blue-700',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let role: string | null = null
  if (user) {
    const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    role = data?.role ?? 'buyer'
  }

  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-50 text-stone-900 antialiased">
        <header className="border-b border-stone-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl text-amber-600">⬡</span>
              <span className="font-bold text-stone-900">PanAfricanMines</span>
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700">demo</span>
            </Link>

            <nav className="flex items-center gap-6">
              <Link href="/listings" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
                Browse
              </Link>
              <Link href="/sell" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
                Sell
              </Link>
              {role === 'operator' && (
                <Link href="/operator" className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                  Dashboard
                </Link>
              )}

              {user ? (
                <div className="flex items-center gap-3">
                  <Link href="/profile" className="flex items-center gap-2 text-sm">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${roleStyles[role ?? 'buyer']}`}>
                      {role}
                    </span>
                    <span className="hidden text-stone-500 sm:block">{user.email}</span>
                  </Link>
                  <form action={signOut}>
                    <button
                      type="submit"
                      className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50 transition-colors"
                    >
                      Sign out
                    </button>
                  </form>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 transition-colors"
                >
                  Sign in
                </Link>
              )}
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-6 py-10">
          {children}
        </main>

        <footer className="mt-20 border-t border-stone-200 py-8 text-center text-xs text-stone-400">
          RLS demo — Next.js 15 App Router + Supabase
        </footer>
      </body>
    </html>
  )
}
