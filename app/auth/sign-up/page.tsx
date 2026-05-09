'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field'
import { signup } from './actions'
import { Leaf, Loader2, Tractor, ShoppingCart } from 'lucide-react'

function SignUpForm() {
  const searchParams = useSearchParams()
  const defaultType = searchParams.get('type') === 'farmer' ? 'farmer' : 'buyer'
  
  const [userType, setUserType] = useState<'farmer' | 'buyer'>(defaultType)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setError(null)
    
    // Add user type to form data
    formData.set('userType', userType)
    
    const result = await signup(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
    // If no error, the server action will redirect
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <Link href="/" className="flex items-center justify-center gap-2 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">KhetSeGhar</span>
        </Link>
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>Join our community of farmers and buyers</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          {/* User Type Selection */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setUserType('farmer')}
              className={`p-4 rounded-lg border-2 transition-all ${
                userType === 'farmer'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Tractor className={`h-8 w-8 mx-auto mb-2 ${userType === 'farmer' ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className={`text-sm font-medium ${userType === 'farmer' ? 'text-foreground' : 'text-muted-foreground'}`}>
                I am a Farmer
              </p>
            </button>
            <button
              type="button"
              onClick={() => setUserType('buyer')}
              className={`p-4 rounded-lg border-2 transition-all ${
                userType === 'buyer'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <ShoppingCart className={`h-8 w-8 mx-auto mb-2 ${userType === 'buyer' ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className={`text-sm font-medium ${userType === 'buyer' ? 'text-foreground' : 'text-muted-foreground'}`}>
                I am a Buyer
              </p>
            </button>
          </div>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Your full name"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+91 98765 43210"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a strong password"
                required
                minLength={6}
              />
            </Field>
          </FieldGroup>

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary hover:underline font-medium">
            Log in
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <Suspense fallback={
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          </CardContent>
        </Card>
      }>
        <SignUpForm />
      </Suspense>
    </div>
  )
}
