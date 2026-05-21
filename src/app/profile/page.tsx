import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SelfPromoteTest } from '@/components/self-promote-test'

const roleStyles: Record<string, string> = {
  buyer:    'bg-stone-100 text-stone-700 border-stone-200',
  seller:   'bg-amber-100 text-amber-700 border-amber-200',
  operator: 'bg-blue-100 text-blue-700 border-blue-200',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, verified, created_at')
    .eq('id', user.id)
    .single()

  const role = profile?.role ?? 'buyer'

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-stone-900">Your Profile</h1>

      {/* User info card */}
      <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-stone-500">Signed in as</p>
            <p className="font-semibold text-stone-900">{user.email}</p>
          </div>
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${roleStyles[role]}`}>
            {role}
          </span>
        </div>

        <div className="space-y-2 border-t border-stone-100 pt-4 text-sm text-stone-600">
          <div className="flex justify-between">
            <span>Verified seller</span>
            <span className={profile?.verified ? 'text-emerald-600 font-medium' : 'text-stone-400'}>
              {profile?.verified ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Member since</span>
            <span>{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}</span>
          </div>
        </div>
      </div>

      {/* Role explanation */}
      <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 font-semibold text-stone-900">Role permissions</h2>
        <div className="space-y-2 text-sm text-stone-600">
          <RoleRow role="buyer"    active={role === 'buyer'}    label="Browse live listings, submit interest" />
          <RoleRow role="seller"   active={role === 'seller'}   label="Submit listings (requires verification)" />
          <RoleRow role="operator" active={role === 'operator'} label="Publish, decline, close deals" />
        </div>
        {role === 'buyer' && (
          <p className="mt-4 rounded-lg bg-stone-50 p-3 text-xs text-stone-500">
            To become a seller, contact an operator to get your account verified.
            Run this SQL in Supabase: <code className="text-amber-700">update profiles set role = &apos;seller&apos;, verified = true where id = &apos;{user.id}&apos;</code>
          </p>
        )}
      </div>

      {/* Scenario 4: Self-promotion test */}
      <SelfPromoteTest userId={user.id} />
    </div>
  )
}

function RoleRow({ role, active, label }: { role: string; active: boolean; label: string }) {
  return (
    <div className={`flex items-start gap-3 rounded-lg p-2 ${active ? 'bg-amber-50' : ''}`}>
      <span className={`mt-0.5 text-sm ${active ? 'text-amber-600' : 'text-stone-300'}`}>
        {active ? '●' : '○'}
      </span>
      <div>
        <span className={`font-medium capitalize ${active ? 'text-stone-900' : 'text-stone-400'}`}>
          {role}
        </span>
        <span className={`ml-2 ${active ? 'text-stone-600' : 'text-stone-400'}`}>— {label}</span>
      </div>
    </div>
  )
}
