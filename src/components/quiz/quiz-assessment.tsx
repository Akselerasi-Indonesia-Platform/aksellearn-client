'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  Clock,
  HelpCircle,
  Trophy,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  RefreshCcw,
  Sparkles,
  Loader2,
} from 'lucide-react'
import confetti from 'canvas-confetti'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { CourseModule, Quiz, QuizQuestion } from '@/types/course'
import {
  userCourseService,
  QuizSubmissionResponse,
} from '@/services/user/course.service'
import { toast } from 'sonner'
import { Slider } from '@/components/ui/slider'

interface QuizAssessmentProps {
  module: CourseModule
  onComplete?: (score: number, total: number) => void
}

type QuizState = 'start' | 'in-progress' | 'results'

export function QuizAssessment({ module, onComplete }: QuizAssessmentProps) {
  const [quiz, setQuiz] = React.useState<Quiz>(module.quiz as Quiz)
  const [questions, setQuestions] = React.useState<QuizQuestion[]>([])
  const [state, setState] = React.useState<QuizState>('start')
  const [answers, setAnswers] = React.useState<Record<string, string[]>>({})
  const [timeLeft, setTimeLeft] = React.useState<number>(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(false)
  const [results, setResults] = React.useState<QuizSubmissionResponse | null>(
    null,
  )

  const totalQuestions = questions.length
  const answeredCount = Object.keys(answers).length
  const progress =
    totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0

  React.useEffect(() => {
    setQuiz(module.quiz as Quiz)
    setQuestions([])
    setState('start')
    setAnswers({})
    setTimeLeft(0)
    setCurrentQuestionIndex(0)
    setResults(null)
  }, [module.uuid])

  // Timer logic
  React.useEffect(() => {
    let timer: any
    if (state === 'in-progress' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleAutoSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [state, timeLeft])

  const handleStart = async () => {
    setIsLoading(true)
    try {
      const quizUuid = quiz?.uuid || (module as any).quiz_uuid
      if (!quizUuid) throw new Error('Quiz ID missing')

      const fullQuiz = await userCourseService.getQuiz(quizUuid)
      setQuiz(fullQuiz)
      setQuestions(fullQuiz.questions || [])

      if (fullQuiz.time_limit_minutes) {
        setTimeLeft(fullQuiz.time_limit_minutes * 60)
      }
      setState('in-progress')
    } catch (err) {
      toast.error('Failed to load quiz questions')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelect = (questionUuid: string, optionUuid: string) => {
    if (state !== 'in-progress') return

    setAnswers((prev) => {
      const current = prev[questionUuid] || []
      const question = questions.find((q) => q.uuid === questionUuid)

      // Determine selection behavior
      const isMultiple = question?.type === 'multiple_choice'

      if (isMultiple) {
        if (current.includes(optionUuid)) {
          return {
            ...prev,
            [questionUuid]: current.filter((id) => id !== optionUuid),
          }
        }
        return { ...prev, [questionUuid]: [...current, optionUuid] }
      } else {
        // Single choice, true/false, range
        return { ...prev, [questionUuid]: [optionUuid] }
      }
    })
  }

  const handleAutoSubmit = () => {
    handleSubmit()
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const response = await userCourseService.submitQuiz(quiz.uuid, answers)
      setResults(response)
      setState('results')

      if (response.is_passing) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#10b981', '#ffffff'],
        })
      }

      if (onComplete) {
        onComplete(response.score, 100)
      }
    } catch (err) {
      toast.error('Failed to submit quiz. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetry = () => {
    setAnswers({})
    setCurrentQuestionIndex(0)
    setState('start')
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!quiz) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed border-muted">
        <AlertCircle className="size-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-bold">Quiz Not Found</h3>
        <p className="text-muted-foreground">
          The assessment data is missing or corrupted.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <AnimatePresence mode="wait">
        {state === 'start' && (
          <motion.div
            key="start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-12 py-16"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 p-1 pl-1 pr-4 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-4">
                <div className="size-6 rounded-full bg-primary flex items-center justify-center text-white fill-white">
                  <Sparkles className="size-3" />
                </div>
                New Assessment Available
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter bg-gradient-to-b from-slate-900 to-slate-500 bg-clip-text text-transparent italic">
                {quiz.title}
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                {quiz.description ||
                  'Test your knowledge on the concepts covered in this module.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="flex flex-col items-center gap-2 p-6 rounded-3xl bg-slate-50 border border-slate-100 shadow-sm">
                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600">
                  <HelpCircle className="size-6" />
                </div>
                <span className="text-xl font-bold">{questions.length}</span>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Questions
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 p-6 rounded-3xl bg-slate-50 border border-slate-100 shadow-sm">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600">
                  <Trophy className="size-6" />
                </div>
                <span className="text-xl font-bold">
                  {quiz.passing_percentage}%
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  To Pass
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 p-6 rounded-3xl bg-slate-50 border border-slate-100 shadow-sm">
                <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-600">
                  <Clock className="size-6" />
                </div>
                <span className="text-xl font-bold">
                  {quiz.time_limit_minutes
                    ? `${quiz.time_limit_minutes}m`
                    : 'Unlimited'}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Time Limit
                </span>
              </div>
            </div>

            <Button
              onClick={handleStart}
              disabled={isLoading}
              className="h-16 px-12 text-xl font-bold rounded-2xl bg-primary text-primary-foreground hover:scale-105 hover:shadow-xl hover:shadow-primary/20 transition-all group"
            >
              {isLoading ? (
                <Loader2 className="mr-2 size-6 animate-spin" />
              ) : (
                <>
                  Start Assessment
                  <ChevronRight className="ml-2 size-6 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </motion.div>
        )}

        {state === 'in-progress' && (
          <motion.div
            key="in-progress"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Header: Progress & Timer */}
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b p-4 space-y-4 rounded-b-3xl shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className="rounded-full px-3 py-1 bg-primary/5 text-primary border-primary/20 font-bold"
                  >
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                  </Badge>
                </div>
                {quiz.time_limit_minutes && (
                  <div
                    className={cn(
                      'flex items-center gap-2 px-4 py-1 rounded-full text-lg font-black tracking-tighter',
                      timeLeft < 60
                        ? 'bg-red-500/10 text-red-600 animate-pulse'
                        : 'bg-slate-100 text-slate-800',
                    )}
                  >
                    <Clock className="size-4" />
                    {formatTime(timeLeft)}
                  </div>
                )}
              </div>
              <Progress
                value={progress}
                className="h-2 bg-slate-100 [&>div]:bg-primary transition-all duration-1000"
              />
            </div>

            {/* Questions View */}
            <div className="space-y-12 py-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={questions[currentQuestionIndex].uuid}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="space-y-4">
                    <h3 className="text-2xl md:text-3xl font-bold leading-tight">
                      {questions[currentQuestionIndex].question}
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="rounded-md font-black"
                      >
                        {questions[currentQuestionIndex].points} Points
                      </Badge>
                      <span className="opacity-60">
                        {questions[currentQuestionIndex].type ===
                        'multiple_choice'
                          ? 'Select one or more options'
                          : questions[currentQuestionIndex].type === 'range'
                            ? 'Select your level on the scale'
                            : 'Select the correct answer'}
                      </span>
                    </p>
                  </div>

                  <div className="grid gap-4">
                    {questions[currentQuestionIndex].type === 'range' ? (
                      <div className="py-8 space-y-6">
                        <div className="flex flex-wrap items-center justify-center gap-3">
                          {questions[currentQuestionIndex].options.map(
                            (opt, i) => {
                              const isSelected = answers[
                                questions[currentQuestionIndex].uuid
                              ]?.includes(opt.uuid)
                              return (
                                <button
                                  key={opt.uuid}
                                  onClick={() =>
                                    handleSelect(
                                      questions[currentQuestionIndex].uuid,
                                      opt.uuid,
                                    )
                                  }
                                  className={cn(
                                    'relative min-w-[60px] flex-1 py-4 px-3 rounded-2xl border-2 transition-all duration-300 group',
                                    isSelected
                                      ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10 ring-4 ring-primary/5'
                                      : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50 shadow-sm',
                                  )}
                                >
                                  <div className="flex flex-col items-center gap-2">
                                    <span
                                      className={cn(
                                        'text-xs font-black uppercase tracking-widest transition-colors',
                                        isSelected
                                          ? 'text-primary'
                                          : 'text-slate-400 group-hover:text-slate-600',
                                      )}
                                    >
                                      {opt.option_text}
                                    </span>
                                    <div
                                      className={cn(
                                        'size-2 rounded-full transition-all duration-500',
                                        isSelected
                                          ? 'bg-primary scale-125'
                                          : 'bg-slate-200',
                                      )}
                                    />
                                  </div>
                                  {isSelected && (
                                    <motion.div
                                      layoutId="range-active"
                                      className="absolute inset-0 rounded-2xl border-2 border-primary pointer-events-none"
                                    />
                                  )}
                                </button>
                              )
                            },
                          )}
                        </div>
                        <div className="flex justify-between px-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                          <span>
                            {
                              questions[currentQuestionIndex].options[0]
                                .option_text
                            }
                          </span>
                          <span>
                            {
                              questions[currentQuestionIndex].options[
                                questions[currentQuestionIndex].options.length -
                                  1
                              ].option_text
                            }
                          </span>
                        </div>
                      </div>
                    ) : (
                      questions[currentQuestionIndex].options.map(
                        (option, idx) => (
                          <div
                            key={option.uuid}
                            onClick={() =>
                              handleSelect(
                                questions[currentQuestionIndex].uuid,
                                option.uuid,
                              )
                            }
                            className={cn(
                              'relative group flex items-center gap-4 p-6 rounded-[2rem] border-2 cursor-pointer transition-all duration-300 overflow-hidden',
                              answers[
                                questions[currentQuestionIndex].uuid
                              ]?.includes(option.uuid)
                                ? 'border-primary bg-primary/5 shadow-md shadow-primary/5'
                                : 'border-slate-100 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50',
                            )}
                          >
                            <div
                              className={cn(
                                'size-8 rounded-full border-2 flex items-center justify-center text-xs font-black transition-all',
                                answers[
                                  questions[currentQuestionIndex].uuid
                                ]?.includes(option.uuid)
                                  ? 'bg-primary border-primary text-white'
                                  : 'bg-white border-slate-300 text-slate-400 group-hover:border-slate-400',
                              )}
                            >
                              {questions[currentQuestionIndex].type ===
                              'multiple_choice' ? (
                                <div
                                  className={cn(
                                    'size-3 rounded-sm border',
                                    answers[
                                      questions[currentQuestionIndex].uuid
                                    ]?.includes(option.uuid)
                                      ? 'bg-white'
                                      : 'bg-transparent',
                                  )}
                                />
                              ) : (
                                String.fromCharCode(65 + idx)
                              )}
                            </div>
                            <span
                              className={cn(
                                'text-lg font-bold transition-all',
                                answers[
                                  questions[currentQuestionIndex].uuid
                                ]?.includes(option.uuid)
                                  ? 'text-slate-900'
                                  : 'text-slate-600',
                              )}
                            >
                              {option.option_text}
                            </span>
                            {answers[
                              questions[currentQuestionIndex].uuid
                            ]?.includes(option.uuid) && (
                              <motion.div
                                layoutId="active-indicator"
                                className="absolute right-6 size-6 rounded-full bg-primary flex items-center justify-center text-white"
                              >
                                <CheckCircle2 className="size-4" />
                              </motion.div>
                            )}
                          </div>
                        ),
                      )
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Pagination / Submit */}
            <div className="flex items-center justify-between pt-8 border-t border-slate-100">
              <Button
                variant="ghost"
                disabled={currentQuestionIndex === 0}
                className="rounded-xl h-12 px-6 font-bold gap-2"
                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
              >
                <ChevronLeft className="size-4" />
                Previous
              </Button>

              {currentQuestionIndex < totalQuestions - 1 ? (
                <Button
                  className="rounded-xl h-12 px-8 font-bold gap-2 bg-slate-900 text-white hover:bg-slate-800"
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                >
                  Next Question
                  <ChevronRight className="size-4" />
                </Button>
              ) : (
                <Button
                  className="rounded-xl h-12 px-10 font-black gap-2 bg-primary text-primary-foreground hover:scale-105 transition-all"
                  onClick={handleSubmit}
                  disabled={answeredCount < totalQuestions}
                >
                  Submit Assessment
                  <CheckCircle2 className="size-4" />
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {state === 'results' && results && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="space-y-12">
              <div className="space-y-6">
                <div
                  className={cn(
                    'size-32 rounded-full mx-auto flex items-center justify-center shadow-2xl relative',
                    results.is_passing
                      ? 'bg-emerald-500 text-white'
                      : 'bg-red-500 text-white',
                  )}
                >
                  <div className="absolute inset-0 bg-current opacity-20 rounded-full animate-ping" />
                  {results.is_passing ? (
                    <Trophy className="size-16 relative z-10" />
                  ) : (
                    <AlertCircle className="size-16 relative z-10" />
                  )}
                </div>
                <h2
                  className={cn(
                    'text-5xl font-black tracking-tighter bg-clip-text text-transparent',
                    results.is_passing
                      ? 'bg-gradient-to-b from-emerald-600 to-emerald-400'
                      : 'bg-gradient-to-b from-red-600 to-red-400',
                  )}
                >
                  {results.is_passing ? 'Excellent Work!' : 'Keep Practicing!'}
                </h2>
                <p className="text-muted-foreground text-xl max-w-md mx-auto leading-relaxed">
                  {results.is_passing
                    ? `Congratulations! You've successfully passed the assessment and mastered this module.`
                    : `You didn't reach the required ${quiz.passing_percentage}% this time. Review the content and try again.`}
                </p>
              </div>

              <div className="p-10 rounded-[3rem] bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-10 max-w-xl mx-auto shadow-inner">
                <div className="flex flex-col">
                  <span className="text-xs font-black uppercase tracking-[0.25em] text-slate-400 mb-2">
                    Your Score
                  </span>
                  <span className="text-6xl font-black tabular-nums">
                    {Math.round(results.score)}%
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black uppercase tracking-[0.25em] text-slate-400 mb-2">
                    Points
                  </span>
                  <span className="text-4xl font-black tabular-nums">
                    {results.details?.reduce(
                      (acc, d) => acc + d.earned_points,
                      0,
                    ) || results.correct_count}
                    <span className="text-xl text-slate-400">
                      /
                      {results.details?.reduce((acc, d) => acc + d.points, 0) ||
                        results.total_questions}
                    </span>
                  </span>
                </div>
              </div>

              {results.details && (
                <div className="max-w-2xl mx-auto text-left space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 px-6">
                    Performance Breakdown
                  </h3>
                  <div className="grid gap-3">
                    {results.details.map((detail, i) => {
                      const question = questions.find(
                        (q) => q.uuid === detail.question_uuid,
                      )
                      return (
                        <div
                          key={detail.question_uuid}
                          className="p-5 rounded-2xl bg-white border border-slate-100 flex items-center justify-between group hover:border-primary/20 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={cn(
                                'size-10 rounded-xl flex items-center justify-center font-bold',
                                detail.earned_points === detail.points
                                  ? 'bg-emerald-500/10 text-emerald-600'
                                  : detail.earned_points > 0
                                    ? 'bg-amber-500/10 text-amber-600'
                                    : 'bg-red-500/10 text-red-600',
                              )}
                            >
                              {i + 1}
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-sm font-bold line-clamp-1">
                                {question?.question || 'Question'}
                              </p>
                              <p className="text-[10px] font-black uppercase tracking-wider opacity-40">
                                {detail.earned_points === detail.points
                                  ? 'Fully Correct'
                                  : detail.earned_points > 0
                                    ? 'Partial Credit'
                                    : 'Incorrect'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-black">
                              {detail.earned_points}
                            </span>
                            <span className="text-xs text-slate-400 font-bold">
                              /{detail.points}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  className="h-16 px-10 text-lg font-bold rounded-2xl border-slate-200 hover:bg-slate-100 transition-all font-bold gap-2"
                  variant="outline"
                  onClick={handleRetry}
                >
                  <RefreshCcw className="size-5" />
                  Retry Assessment
                </Button>
                <Button
                  asChild
                  className="h-16 px-12 text-lg font-bold rounded-2xl shadow-xl hover:shadow-primary/20 transition-all gap-2"
                >
                  <button onClick={() => window.location.reload()}>
                    Continue Learning
                    <CheckCircle2 className="size-5" />
                  </button>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
