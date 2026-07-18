import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PublicLayout } from '@/components/public/layout/main-layout'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { authService } from '@/services/auth.service'

const resetPasswordSearchSchema = z.object({
  token: z.string().optional(),
})

export const Route = createFileRoute('/reset-password')({
  validateSearch: (search) => resetPasswordSearchSchema.parse(search),
  component: ResetPasswordPage,
})

const resetPasswordSchema = z.object({
  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
  password_confirmation: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ["password_confirmation"],
})

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>

function ResetPasswordPage() {
  const { token } = Route.useSearch()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', password_confirmation: '' },
  })

  const onSubmit = async (data: ResetPasswordValues) => {
    if (!token) {
      setError('Invalid or missing reset token.')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      await authService.resetPassword({
        token,
        password: data.password,
        password_confirmation: data.password_confirmation,
      })
      setIsSuccess(true)
    } catch (err: any) {
      console.error('Reset password error:', err)
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!token && !isSuccess) {
    return (
      <PublicLayout>
        <div className="flex min-h-[calc(100vh-280px)] items-center justify-center bg-slate-50/50 p-4 py-12 relative overflow-hidden brand-rings">
          <Card className="w-full max-w-sm shadow-2xl border-t-4 border-t-destructive bg-white">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl font-bold tracking-tight text-center text-destructive">
                Invalid Request
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-slate-500">
                The password reset link is invalid or missing a token.
              </p>
              <Button asChild className="w-full font-semibold">
                <Link to="/forgot-password">Request new link</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <div className="flex min-h-[calc(100vh-280px)] items-center justify-center bg-slate-50/50 p-4 py-12 relative overflow-hidden brand-rings">
        <Card className="w-full max-w-sm shadow-2xl border-t-4 border-t-primary animate-in fade-in zoom-in duration-300 bg-white">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight text-center">
              {isSuccess ? 'Password Reset' : 'Set New Password'}
            </CardTitle>
            <CardDescription className="text-center mb-3">
              {isSuccess 
                ? "Your password has been successfully reset. You can now log in." 
                : "Please enter your new password below."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <div className="flex flex-col items-center space-y-6 py-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <Button asChild className="w-full font-semibold">
                  <Link to="/login">Go to Login</Link>
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
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                      className={`pr-10 ${errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    />
                    <Button
                      className="absolute right-0 top-0 h-9 w-9 text-muted-foreground hover:text-foreground"
                      size="icon"
                      type="button"
                      variant="ghost"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive font-medium">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password_confirmation">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="password_confirmation"
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...register('password_confirmation')}
                      className={`pr-10 ${errors.password_confirmation ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    />
                    <Button
                      className="absolute right-0 top-0 h-9 w-9 text-muted-foreground hover:text-foreground"
                      size="icon"
                      type="button"
                      variant="ghost"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.password_confirmation && (
                    <p className="text-xs text-destructive font-medium">{errors.password_confirmation.message}</p>
                  )}
                </div>

                <Button type="submit" disabled={isLoading} className="w-full font-semibold">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  )
}
