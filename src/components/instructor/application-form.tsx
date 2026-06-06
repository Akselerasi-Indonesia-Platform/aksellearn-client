import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ApplyPayload } from '@/types/instructor-application'
import { instructorApplicationService } from '@/services/instructor-application.service'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { useAuthStore } from '@/hooks/use-auth'
import { Badge } from '@/components/ui/badge'

const urlSchema = z.string().optional().or(z.literal('')).refine(val => {
  if (!val) return true
  try {
    new URL(val.startsWith('http') ? val : `https://${val}`)
    return true
  } catch {
    return false
  }
}, 'Please enter a valid URL')

const formSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  headline: z.string().min(5, 'Headline must be at least 5 characters').max(255),
  bio: z.string().min(100, 'Bio must be at least 100 characters').max(2000),
  expertise: z.array(z.string()).min(1, 'Please add at least 1 area of expertise').max(10, 'Maximum 10 expertise tags allowed'),
  teaching_exp: z.enum(['none', '<1 year', '1-3 years', '3+ years'], {
    message: 'Please select your teaching experience',
  }),
  sample_topic: z.string().min(5, 'Topic must be at least 5 characters').max(255),
  linkedin_url: urlSchema,
  portfolio_url: urlSchema,
})

const SUGGESTED_EXPERTISE = [
  'Web Development', 'React', 'Python', 'Data Science', 
  'Digital Marketing', 'UI/UX Design', 'Business Strategy',
  'Photography', 'Leadership', 'Mobile App Dev'
]

interface ApplicationFormProps {
  onSuccess: () => void
}

export function ApplicationForm({ onSuccess }: ApplicationFormProps) {
  const { user } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [tagInput, setTagInput] = React.useState('')

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: user?.name || '',
      headline: '',
      bio: '',
      expertise: [],
      teaching_exp: undefined,
      sample_topic: '',
      linkedin_url: '',
      portfolio_url: '',
    },
  })

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => {
    if ('key' in e && e.key !== 'Enter' && e.key !== ',') return
    e.preventDefault()
    
    const value = tagInput.trim().replace(/,$/, '')
    if (!value) return

    const currentTags = form.getValues('expertise')
    if (currentTags.length >= 10) {
      toast.error('Maximum 10 expertise tags allowed')
      return
    }

    if (!currentTags.includes(value)) {
      form.setValue('expertise', [...currentTags, value], { shouldValidate: true })
    }
    setTagInput('')
  }

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues('expertise')
    form.setValue(
      'expertise',
      currentTags.filter((tag) => tag !== tagToRemove),
      { shouldValidate: true }
    )
  }

  const handleAddSuggestedTag = (tag: string) => {
    const currentTags = form.getValues('expertise')
    if (currentTags.length >= 10) {
      toast.error('Maximum 10 expertise tags allowed')
      return
    }
    if (!currentTags.includes(tag)) {
      form.setValue('expertise', [...currentTags, tag], { shouldValidate: true })
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true)

      // Transform URLs before submitting
      const payload = { ...values }
      if (payload.linkedin_url && !payload.linkedin_url.startsWith('http')) {
        payload.linkedin_url = `https://${payload.linkedin_url}`
      }
      if (payload.portfolio_url && !payload.portfolio_url.startsWith('http')) {
        payload.portfolio_url = `https://${payload.portfolio_url}`
      }

      await instructorApplicationService.apply(payload as ApplyPayload)
      toast.success('Application submitted successfully!')
      onSuccess()
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit application')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
        
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="headline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Professional Headline</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Senior Engineer at Google" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Short Bio</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Tell us about yourself, your background, and why you want to teach..." 
                  className="min-h-[120px] resize-y"
                  {...field} 
                />
              </FormControl>
              <FormDescription className="flex justify-between">
                <span>Minimum 100 characters.</span>
                <span className={field.value.length < 100 ? 'text-amber-600' : 'text-green-600'}>
                  {field.value.length}/2000
                </span>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expertise"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Areas of Expertise</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <div className="min-h-[50px] border rounded-lg p-3 bg-white focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {field.value.map((tag) => (
                        <Badge key={tag} variant="default" className="px-3 py-1.5 text-sm flex items-center gap-1.5 shadow-sm">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:bg-primary-foreground/20 rounded-full p-0.5 ml-1 transition-colors"
                            aria-label={`Remove ${tag}`}
                          >
                            <X size={14} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <Input
                      placeholder={field.value.length === 0 ? "Type a skill and press Enter or Comma..." : "Add another skill..."}
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      onBlur={handleAddTag}
                      className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-1 py-0 h-auto placeholder:text-gray-400 text-base"
                    />
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Type a skill and press Enter or comma to add it. e.g., React, UI Design, Marketing.
                  </p>

                  {/* Suggested Tags */}
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Suggested Expertise</p>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTED_EXPERTISE.map((tag) => {
                        const isSelected = field.value.includes(tag)
                        return (
                          <Badge 
                            key={tag} 
                            variant="outline" 
                            className={`cursor-pointer transition-all hover:border-primary px-3 py-1 ${isSelected ? 'opacity-50 pointer-events-none' : 'hover:bg-primary/5'}`}
                            onClick={() => handleAddSuggestedTag(tag)}
                          >
                            + {tag}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="teaching_exp"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Teaching Experience</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="none" />
                    </FormControl>
                    <FormLabel className="font-normal">None</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="<1 year" />
                    </FormControl>
                    <FormLabel className="font-normal">Less than 1 year</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="1-3 years" />
                    </FormControl>
                    <FormLabel className="font-normal">1–3 years</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="3+ years" />
                    </FormControl>
                    <FormLabel className="font-normal">3+ years</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sample_topic"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Course Idea</FormLabel>
              <FormControl>
                <Textarea placeholder="What would your first course be about?" {...field} className="resize-none" rows={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="linkedin_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>LinkedIn Profile URL <span className="text-gray-400 font-normal">(Optional)</span></FormLabel>
                <FormControl>
                  <Input placeholder="https://linkedin.com/in/username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="portfolio_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Portfolio / Website URL <span className="text-gray-400 font-normal">(Optional)</span></FormLabel>
                <FormControl>
                  <Input placeholder="https://yourwebsite.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="pt-4 border-t">
          <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
