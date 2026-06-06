import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/hooks/use-auth'
import { authService, OnboardingData } from '@/services/auth.service'
import { discoveryCourseService, CourseCategory } from '@/services/discovery/course.service'
import { Loader2, ArrowRight, Check } from 'lucide-react'
import { toast } from 'sonner'

const LEARNING_GOALS = [
  { value: 'grow_career', label: 'Grow in my career' },
  { value: 'switch_careers', label: 'Switch careers' },
  { value: 'start_business', label: 'Start a business' },
  { value: 'personal_dev', label: 'Personal development' },
  { value: 'earn_cert', label: 'Earn a certificate' },
  { value: 'explore', label: 'Explore a topic' },
]

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Complete beginner' },
  { value: 'basic', label: 'Know the basics' },
  { value: 'intermediate', label: 'Built projects' },
  { value: 'advanced', label: 'Professional' },
]

export function WelcomeStepModal() {
  const { onboardingRequired, setOnboardingRequired } = useAuthStore()
  const [step, setStep] = useState(1)
  const [goal, setGoal] = useState<string>('')
  const [level, setLevel] = useState<string>('')
  const [interests, setInterests] = useState<string[]>([])
  
  const [categories, setCategories] = useState<CourseCategory[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (onboardingRequired && step === 3 && categories.length === 0) {
      const fetchCategories = async () => {
        setIsLoadingCategories(true)
        try {
          const data = await discoveryCourseService.getCategories()
          setCategories(data)
        } catch (error) {
          console.error('Failed to load categories', error)
        } finally {
          setIsLoadingCategories(false)
        }
      }
      fetchCategories()
    }
  }, [step, onboardingRequired, categories.length])

  if (!onboardingRequired) return null

  const handleSkip = async () => {
    setIsSubmitting(true)
    try {
      await authService.saveOnboarding({ skipped: true })
      setOnboardingRequired(false)
    } catch (error) {
      console.error(error)
      toast.error('Failed to skip onboarding.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFinish = async () => {
    setIsSubmitting(true)
    try {
      const data: OnboardingData = {
        learning_goal: goal,
        experience_level: level,
        interests,
        skipped: false,
      }
      await authService.saveOnboarding(data)
      setOnboardingRequired(false)
      toast.success('Welcome! Your profile is ready.')
    } catch (error) {
      console.error(error)
      toast.error('Failed to save your preferences.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleInterest = (id: string) => {
    if (interests.includes(id)) {
      setInterests(interests.filter((i) => i !== id))
    } else {
      if (interests.length >= 5) {
        toast.error('You can select up to 5 topics.')
        return
      }
      setInterests([...interests, id])
    }
  }

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden hide-close-button">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === step ? 'w-8 bg-primary' : 'w-2 bg-slate-200'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={handleSkip}
              className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
              disabled={isSubmitting}
            >
              Skip for now
            </button>
          </div>

          <div className="min-h-[300px]">
            {step === 1 && (
              <div className="animate-in slide-in-from-right-4 fade-in duration-300">
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-2xl font-bold">What is your primary goal?</DialogTitle>
                  <DialogDescription>Let us know why you are here to personalize your experience.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {LEARNING_GOALS.map((g) => (
                    <button
                      key={g.value}
                      onClick={() => setGoal(g.value)}
                      className={`p-4 rounded-xl border-2 text-left font-semibold transition-all ${
                        goal === g.value
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border bg-card hover:border-primary/30 hover:bg-slate-50'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in slide-in-from-right-4 fade-in duration-300">
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-2xl font-bold">What is your experience level?</DialogTitle>
                  <DialogDescription>Help us recommend the right difficulty for your courses.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {EXPERIENCE_LEVELS.map((l) => (
                    <button
                      key={l.value}
                      onClick={() => setLevel(l.value)}
                      className={`p-4 rounded-xl border-2 text-left font-semibold transition-all ${
                        level === l.value
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border bg-card hover:border-primary/30 hover:bg-slate-50'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-in slide-in-from-right-4 fade-in duration-300">
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-2xl font-bold">What topics interest you?</DialogTitle>
                  <DialogDescription>Select up to 5 topics you want to learn about.</DialogDescription>
                </DialogHeader>
                
                {isLoadingCategories ? (
                  <div className="flex justify-center items-center h-48">
                    <Loader2 className="size-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => toggleInterest(c.id)}
                        className={`px-4 py-2 rounded-full border text-sm font-semibold transition-all flex items-center gap-2 ${
                          interests.includes(c.id)
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-card hover:border-primary/30 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {interests.includes(c.id) && <Check className="size-3" />}
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-border flex justify-between">
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={step === 1 || isSubmitting}
            >
              Back
            </Button>
            
            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={(step === 1 && !goal) || (step === 2 && !level)}
                className="font-semibold gap-2"
              >
                Next <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                disabled={interests.length === 0 || isSubmitting}
                className="font-semibold gap-2"
              >
                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : 'Finish'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}