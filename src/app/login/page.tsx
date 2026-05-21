'use client'

import { useActionState, useState } from 'react'
import { signIn, signUp } from '@/actions/auth'

export default function LoginPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [signinState, signinAction, signinPending] = useActionState(signIn, {})
  const [signupState, signupAction, signupPending] = useActionState(signUp, {})

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-3 text-4xl">⬡</div>
          <h1 className="text-2xl font-bold text-stone-900">
            {mode === 'signin' ? 'Sign in to your account' : 'Create an account'}
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            {mode === 'signin'
              ? 'Access the marketplace dashboard'
              : 'Join the PanAfricanMines marketplace'}
          </p>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-8 shadow-sm">
          {/* Mode toggle */}
          <div className="mb-6 flex rounded-lg bg-stone-100 p-1">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                mode === 'signin'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              Sign in
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                mode === 'signup'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              Sign up
            </button>
          </div>

          {mode === 'signin' ? (
            <form action={signinAction} className="space-y-4">
              {signinState?.error && <ErrorBox message={signinState.error} />}
              <AuthFields />
              <button
                type="submit"
                disabled={signinPending}
                className="w-full rounded-lg bg-amber-600 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50 transition-colors"
              >
                {signinPending ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          ) : (
            <form action={signupAction} className="space-y-4">
              {signupState?.error && <ErrorBox message={signupState.error} />}
              <AuthFields />
              <button
                type="submit"
                disabled={signupPending}
                className="w-full rounded-lg bg-amber-600 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50 transition-colors"
              >
                {signupPending ? 'Creating account...' : 'Create account'}
              </button>
              <p className="text-center text-xs text-stone-500">
                New accounts start with the <strong>buyer</strong> role. Sellers are verified by an operator.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

function AuthFields() {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-stone-700">Email</label>
        <input
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-700">Password</label>
        <input
          type="password"
          name="password"
          required
          placeholder="••••••••"
          minLength={6}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>
    </>
  )
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  )
}
