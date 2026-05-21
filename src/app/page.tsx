import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { count: liveCount } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'live')

  let role: string | null = null
  if (user) {
    const { data } = await supabase.from('profiles').select('role, verified').eq('id', user.id).single()
    role = data?.role ?? null
  }

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="py-12 text-center">
        <div className="mb-4 text-5xl">⬡</div>
        <h1 className="text-4xl font-bold tracking-tight text-stone-900">
          Africa&apos;s mineral asset marketplace
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-stone-500">
          Buy and sell verified mining assets across Africa. Role-based access
          enforced at the Postgres level with Supabase RLS.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/listings"
            className="rounded-lg bg-amber-600 px-6 py-3 font-semibold text-white hover:bg-amber-700 transition-colors"
          >
            Browse listings
          </Link>
          {!user && (
            <Link
              href="/login"
              className="rounded-lg border border-stone-300 px-6 py-3 font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Live listings" value={liveCount ?? 0} unit="assets" />
        <StatCard label="Access control" value={3} unit="roles" />
        <StatCard label="RLS policies" value={10} unit="active" />
      </div>

      {/* Role status for logged in users */}
      {user && role && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="mb-3 font-semibold text-stone-900">Your access level</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <AccessCard
              role="buyer"
              active={role === 'buyer'}
              label="Browse listings"
              description="View and express interest in live listings"
            />
            <AccessCard
              role="seller"
              active={role === 'seller'}
              label="Submit listings"
              description="List mining assets for sale after verification"
            />
            <AccessCard
              role="operator"
              active={role === 'operator'}
              label="Manage platform"
              description="Publish, decline, and close deals"
            />
          </div>
        </div>
      )}

      {/* How it works */}
      <section>
        <h2 className="mb-6 text-xl font-bold text-stone-900">How RLS protects this app</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon="🔒"
            title="Public can only see live listings"
            description="Logged-out users query /listings and RLS filters out pending, declined, and closed rows automatically."
          />
          <FeatureCard
            icon="🚫"
            title="Self-promotion is blocked"
            description="The profiles policy WITH CHECK prevents any user from updating their own role or verified status."
          />
          <FeatureCard
            icon="✓"
            title="Verified sellers only"
            description="The listings INSERT policy checks role = 'seller' AND verified = true at the Postgres level."
          />
        </div>
      </section>
    </div>
  )
}

function StatCard({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-stone-900">{value}</p>
      <p className="text-xs text-stone-400">{unit}</p>
    </div>
  )
}

function AccessCard({ role, active, label, description }: {
  role: string; active: boolean; label: string; description: string
}) {
  const colors: Record<string, string> = {
    buyer:    'border-stone-200 bg-white',
    seller:   'border-amber-300 bg-amber-50',
    operator: 'border-blue-300 bg-blue-50',
  }
  return (
    <div className={`rounded-lg border p-4 ${active ? colors[role] : 'border-stone-100 bg-white opacity-50'}`}>
      <div className="mb-1 flex items-center gap-2">
        <span className="text-sm font-semibold capitalize text-stone-900">{role}</span>
        {active && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">your role</span>}
      </div>
      <p className="text-xs font-medium text-stone-700">{label}</p>
      <p className="mt-1 text-xs text-stone-500">{description}</p>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="mb-3 text-2xl">{icon}</div>
      <h3 className="mb-2 font-semibold text-stone-900">{title}</h3>
      <p className="text-sm text-stone-500">{description}</p>
    </div>
  )
}
