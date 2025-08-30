'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, User, Mail, Lock, ArrowLeft, Check, Users } from 'lucide-react'

import { Button } from '@/app/(frontend)/components/ui/button'
import { Input } from '@/app/(frontend)/components/ui/input'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/app/(frontend)/components/ui/input-otp'

import { useAuth } from '@/app/(frontend)/context/AuthProvider'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/(frontend)/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/app/(frontend)/components/ui/form'
import { Alert, AlertDescription } from '@/app/(frontend)/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/(frontend)/components/ui/select'

interface SignupFormData {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  gender: string
  language: string
}

type Step = 'signup' | 'otp-verification' | 'success'

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState<Step>('signup')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [otp, setOtp] = useState('')
  const [pendingUserData, setPendingUserData] = useState<SignupFormData | null>(null)

  const { user, loading } = useAuth()
  const router = useRouter()

  const form = useForm<SignupFormData>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      gender: '',
      language: '',
    },
  })

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard')
    }
  }, [user, loading, router])

  // Full-page loader while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-2 border-maxfit-neon-green border-t-transparent animate-spin" />
          <div className="text-sm text-gray-400">Checking authentication...</div>
        </div>
      </div>
    )
  }

  // Redirect loader
  if (user) {
    return (
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-2 border-maxfit-neon-green border-t-transparent animate-spin" />
          <div className="text-sm text-gray-400">Redirecting to dashboard...</div>
        </div>
      </div>
    )
  }

  const handleSignup = async (data: SignupFormData) => {
    setIsLoading(true)
    setError(null)

    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      // Send OTP
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      })
      console.log(response)

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to send verification code')
        setIsLoading(false)
        return
      }

      // Store user data and move to OTP step
      setPendingUserData(data)
      setCurrentStep('otp-verification')
    } catch (err) {
      console.error('Signup error:', err)
      setError('An error occurred during signup')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter the complete 6-digit code')
      return
    }

    if (!pendingUserData) {
      setError('Session expired. Please try again.')
      setCurrentStep('signup')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: pendingUserData.email,
          otp,
          userData: {
            firstName: pendingUserData.firstName,
            lastName: pendingUserData.lastName,
            gender: pendingUserData.gender, // Make sure this is included
            password: pendingUserData.password,
          },
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Invalid verification code')
        setIsLoading(false)
        return
      }

      // Store token and redirect
      localStorage.setItem('payload-token', result.token)
      setCurrentStep('success')

      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 2000)
    } catch (err) {
      console.error('OTP verification error:', err)
      setError('An error occurred during verification')
    } finally {
      setIsLoading(false)
    }
  }

  const resendOTP = async () => {
    if (!pendingUserData) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingUserData.email }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to resend verification code')
      } else {
        setError(null)
        // Show success message briefly
        setTimeout(() => setError(null), 3000)
      }
    } catch (err) {
      setError('An error occurred while resending code')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="glass-card hover-lift border-0">
          {/* Signup Step */}
          {currentStep === 'signup' && (
            <>
              <CardHeader className="text-center space-y-4">
                <CardTitle className="text-3xl font-bold text-glow">Join MAXFITAI</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Create your account and start your fitness journey
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Form {...form}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        rules={{ required: 'First name is required' }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                  {...field}
                                  placeholder="John"
                                  className="pl-10 bg-background/50 border-border focus:border-[hsl(var(--color-maxfit-neon-green))] transition-colors"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lastName"
                        rules={{ required: 'Last name is required' }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                  {...field}
                                  placeholder="Doe"
                                  className="pl-10 bg-background/50 border-border focus:border-[hsl(var(--color-maxfit-neon-green))] transition-colors"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      rules={{
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                              <Input
                                {...field}
                                type="email"
                                placeholder="john@example.com"
                                className="pl-10 bg-background/50 border-border focus:border-[hsl(var(--color-maxfit-neon-green))] transition-colors"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      rules={{ required: 'Gender is required' }}
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Gender</FormLabel>
                          <FormControl>
                            <div className="grid grid-cols-2 gap-3">
                              <label
                                className={`flex items-center gap-2 px-4 py-2 rounded-md border cursor-pointer transition-all ${
                                  field.value === 'male'
                                    ? 'bg-maxfit-neon-green/20 border-maxfit-neon-green shadow-[0_0_10px_rgba(0,255,170,0.3)] font-medium'
                                    : 'bg-background/50 border-border hover:border-maxfit-neon-green/50'
                                }`}
                              >
                                <input
                                  type="radio"
                                  value="male"
                                  checked={field.value === 'male'}
                                  onChange={() => field.onChange('male')}
                                  className="sr-only"
                                />
                                <Users className="h-4 w-4" />
                                <span>Male</span>
                                {field.value === 'male' && (
                                  <Check className="h-4 w-4 ml-1 text-maxfit-neon-green" />
                                )}
                              </label>

                              <label
                                className={`flex items-center gap-2 px-4 py-2 rounded-md border cursor-pointer transition-all ${
                                  field.value === 'female'
                                    ? 'bg-maxfit-neon-green/20 border-maxfit-neon-green shadow-[0_0_10px_rgba(0,255,170,0.3)] font-medium'
                                    : 'bg-background/50 border-border hover:border-maxfit-neon-green/50'
                                }`}
                              >
                                <input
                                  type="radio"
                                  value="female"
                                  checked={field.value === 'female'}
                                  onChange={() => field.onChange('female')}
                                  className="sr-only"
                                />
                                <Users className="h-4 w-4" />
                                <span>Female</span>
                                {field.value === 'female' && (
                                  <Check className="h-4 w-4 ml-1 text-maxfit-neon-green" />
                                )}
                              </label>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Preferred Language */}
                    <FormField
                      control={form.control}
                      name="language"
                      rules={{ required: 'Preferred language is required' }}
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Preferred Language</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange} // ✅ hook it correctly
                            >
                              <SelectTrigger className="bg-background/50 border border-border rounded-md">
                                <SelectValue placeholder="Select your language" />
                              </SelectTrigger>
                              <SelectContent
                                className="border rounded-lg"
                                style={{
                                  background:
                                    'linear-gradient(to right, #00080A, #26402D, #26220E)',
                                }}
                              >
                                {['English', 'Arabic', 'Spanish', 'French'].map((lang) => (
                                  <SelectItem key={lang} value={lang}>
                                    {lang}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      rules={{
                        required: 'Password is required',
                        minLength: {
                          value: 8,
                          message: 'Password must be at least 8 characters',
                        },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                              <Input
                                {...field}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                className="pl-10 pr-10 bg-background/50 border-border focus:border-[hsl(var(--color-maxfit-neon-green))] transition-colors"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      rules={{ required: 'Please confirm your password' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                              <Input
                                {...field}
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Confirm your password"
                                className="pl-10 pr-10 bg-background/50 border-border focus:border-[hsl(var(--color-maxfit-neon-green))] transition-colors"
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="button"
                      onClick={form.handleSubmit(handleSignup)}
                      disabled={isLoading}
                      className="btn-neon w-full h-12 text-base font-semibold"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending Verification...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </div>
                </Form>

                <div className="text-center">
                  <Link href="/login">
                    <Button variant="ghost" className="btn-outline-neon">
                      Already have an account? Sign In
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </>
          )}

          {/* OTP Verification Step */}
          {currentStep === 'otp-verification' && (
            <>
              <CardHeader className="text-center space-y-4">
                <button
                  onClick={() => setCurrentStep('signup')}
                  className="absolute left-6 top-6 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <CardTitle className="text-2xl font-bold text-glow">Verify Your Email</CardTitle>
                <CardDescription className="text-muted-foreground">
                  We sent a 6-digit code to <br />
                  <span className="text-maxfit-neon-green font-medium">
                    {pendingUserData?.email}
                  </span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={(value) => setOtp(value)}
                      disabled={isLoading}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  <Button
                    onClick={handleVerifyOTP}
                    disabled={isLoading || otp.length !== 6}
                    className="btn-neon w-full h-12 text-base font-semibold"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify Code'
                    )}
                  </Button>

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Did not receive the code?</p>
                    <Button
                      variant="ghost"
                      onClick={resendOTP}
                      disabled={isLoading}
                      className="text-maxfit-neon-green hover:text-maxfit-neon-green/80"
                    >
                      Resend Code
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* Success Step */}
          {currentStep === 'success' && (
            <CardContent className="py-16 text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-maxfit-neon-green/20 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-maxfit-neon-green" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Account Verified!</h3>
                <p className="text-muted-foreground">Redirecting you to your dashboard...</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
