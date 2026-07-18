import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PublicLayout } from '@/components/public/layout/main-layout'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Loader2, MailCheck } from 'lucide-react'
import { authService } from '@/services/auth.service'

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordPage,
})

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
})

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (data: ForgotPasswordValues) => {
    setIsLoading(true)
    setError(null)
    try {
      await authService.forgotPassword(data)
      setIsSuccess(true)
    } catch (err: any) {
      console.error('Forgot password error:', err)
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PublicLayout>
      <div className="flex min-h-[calc(100vh-280px)] items-center justify-center bg-slate-50/50 p-4 py-12 relative overflow-hidden brand-rings">
        <Card className="w-full max-w-sm shadow-2xl border-t-4 border-t-primary animate-in fade-in zoom-in duration-300 bg-white">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight text-center">
              {isSuccess ? 'Check your email' : 'Reset Password'}
            </CardTitle>
            <CardDescription className="text-center mb-3">
              {isSuccess 
                ? "If an account exists with that email, we've sent you a password reset link." 
                : "Enter your email address and we'll send you a link to reset your password."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <div className="flex flex-col items-center space-y-6 py-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <MailCheck className="h-8 w-8" />
                </div>
                <Button asChild className="w-full font-semibold">
                  <Link to="/login">Return to login</Link>
                </Button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                {error && (
                  <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive font-medium border border-destructive/20 text-center animate-in slide-in-from-top-2">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    {...register('email')}
                    className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive font-medium">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <Button type="submit" disabled={isLoading} className="w-full font-semibold">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
                <div className="mt-4 text-center text-sm text-slate-500 pt-2">
                  Remember your password?{' '}
                  <Link to="/login" className="font-semibold text-primary hover:underline">
                    Back to login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  )
}
