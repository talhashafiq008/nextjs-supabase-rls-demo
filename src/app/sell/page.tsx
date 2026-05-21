import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SellForm } from './sell-form'

export default async function SellPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, verified')
    .eq('id', user.id)
    .single()

  const role = profile?.role ?? 'buyer'
  const verified = profile?.verified ?? false

  // Scenario 2: logged in but not a verified seller — show blocked state
  if (role !== 'seller' || !verified) {
    return (
      <div className="max-w-xl space-y-6">
        <h1 className="text-2xl font-bold text-stone-900">Submit a Listing</h1>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xl">🚫</span>
            <h2 className="font-semibold text-red-800">Access blocked by RLS</h2>
          </div>
          <p className="text-sm text-red-700">
            Your current role is{' '}
            <code className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-semibold">{role}</code>.
            Only <strong>verified sellers</strong> can submit listings. This check runs at two layers:
          </p>
          <ul className="mt-3 space-y-1 text-sm text-red-700">
            <li className="flex gap-2">
              <span>1.</span>
              <span>Server Action: role check before the DB insert even runs</span>
            </li>
            <li className="flex gap-2">
              <span>2.</span>
              <span>RLS policy: <code className="rounded bg-red-100 px-1 py-0.5 text-xs">listings: verified seller insert</code> — enforced at Postgres level</span>
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <h2 className="mb-2 font-semibold text-stone-900">How to get seller access</h2>
          <p className="mb-3 text-sm text-stone-500">An operator runs this SQL in Supabase:</p>
          <pre className="overflow-x-auto rounded-lg bg-stone-900 px-4 py-3 text-xs text-emerald-400">
{`update profiles
set role = 'seller', verified = true
where id = '${user.id}';`}
          </pre>
          <p className="mt-3 text-xs text-stone-400">
            After the operator runs this, refresh the page — you will have access.
          </p>
        </div>

        <Link href="/profile" className="inline-block text-sm text-amber-600 hover:underline">
          View your profile and test self-promotion defence
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Submit a Listing</h1>
        <p className="mt-1 text-sm text-stone-500">
          Listing will be reviewed by an operator before going live.
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        <span>✓</span>
        <span>Verified seller — you have access to submit listings</span>
      </div>

      <SellForm />
    </div>
  )
}
