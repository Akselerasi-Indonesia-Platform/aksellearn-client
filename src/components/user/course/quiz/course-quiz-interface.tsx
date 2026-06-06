import { useState, useEffect } from 'react'
import { Quiz, QuizQuestion } from '@/types/course'
import { userQuizService, QuizResult } from '@/services/user/quiz.service'
import { userCourseService } from '@/services/user/course.service'

import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import {
  Zap,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Trophy,
  Loader2,
  AlertCircle,
  Award,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface CourseQuizInterfaceProps {
  quiz: Quiz
  onComplete?: (result: QuizResult) => void
  onNext?: () => void
  isLast?: boolean
  onFinish?: () => void
}

export function CourseQuizInterface({
  quiz,
  onComplete,
  onNext,
  isLast,
  onFinish,
}: CourseQuizInterfaceProps) {
  const [quizData, setQuizData] = useState<Quiz>(quiz)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(!quiz.questions?.length)
  const [result, setResult] = useState<QuizResult | null>(null)
  const [startedAt, setStartedAt] = useState<string>('')

  useEffect(() => {
    // Record start time when quiz is first loaded
    if (!startedAt) {
      setStartedAt(new Date().toISOString())
    }

    if (!quizData.questions?.length) {
      setIsLoading(true)
      userQuizService
        .getQuiz(quiz.uuid)
        .then((data) => {
          setQuizData(data)
          // If the quiz is already completed, show the result immediately
          if (data.completed && data.result) {
            setResult(data.result as any)
          }
          setIsLoading(false)
        })
        .catch(() => {
          toast.error('Failed to load assessment questions')
          setIsLoading(false)
        })
    } else if (quiz.completed && quiz.result && !result) {
      // Quiz questions are already loaded (e.g. from cache) but quiz was previously
      // attempted — restore the result so user sees the result screen on re-visit
      setResult(quiz.result as any)
    }
  }, [quiz.uuid, startedAt])

  const questions = quizData.questions || []
  const currentQuestion = questions[currentQuestionIndex] as QuizQuestion
  const isLastQuestion = currentQuestionIndex === (questions.length || 0) - 1
  const progress = ((currentQuestionIndex + 1) / (questions.length || 1)) * 100

  // Initialize range answer if not set
  useEffect(() => {
    if (currentQuestion?.type === 'range' && !answers[currentQuestion.uuid]) {
      setAnswers((prev) => ({ ...prev, [currentQuestion.uuid]: ['5'] }))
    }
  }, [currentQuestion, answers])

  const handleOptionToggle = (
    questionUuid: string,
    optionUuid: string,
    type: string,
  ) => {
    setAnswers((prev) => {
      const currentAnswers = prev[questionUuid] || []

      // Multi-select types
      if (type === 'multiple_choice' || type === 'multiple_response') {
        if (currentAnswers.includes(optionUuid)) {
          return {
            ...prev,
            [questionUuid]: currentAnswers.filter((a) => a !== optionUuid),
          }
        } else {
          return { ...prev, [questionUuid]: [...currentAnswers, optionUuid] }
        }
      }

      // Single-select types (single_choice, true_false, range)
      return { ...prev, [questionUuid]: [optionUuid] }
    })
  }

  const handleRangeChange = (questionUuid: string, value: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionUuid]: [value.toString()],
    }))
  }

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex((prev) => prev + 1)
    } else {
      handleSubmit()
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await userQuizService.submitQuiz(
        quizData.uuid,
        answers,
        startedAt,
      )
      setResult(response)
      // Only mark module complete when the quiz is actually passed
      if (response.is_passed && onComplete) onComplete(response)
      toast.success(
        response.is_passed ? 'Assessment Passed!' : 'Assessment Failed',
      )
    } catch (err) {
      toast.error('Failed to submit quiz')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetQuiz = () => {
    setResult(null)
    setCurrentQuestionIndex(0)
    setAnswers({})
    
    // Explicitly refetch with retake flag
    setIsLoading(true)
    userQuizService
      .getQuiz(quiz.uuid, true)
      .then((data) => {
        setQuizData(data)
        setIsLoading(false)
        setStartedAt(new Date().toISOString())
      })
      .catch(() => {
        toast.error('Failed to load assessment questions')
        setIsLoading(false)
      })
  }

  // Result View
  if (result) {
    return (
      <Card className="border-none shadow-xl rounded-2xl overflow-hidden bg-white animate-in fade-in duration-500 min-h-[600px] flex flex-col justify-center">
        <CardHeader className="text-center pt-14 pb-8">
          <div
            className={cn(
              'mx-auto size-20 rounded-2xl flex items-center justify-center mb-6 shadow-xl transition-all duration-500',
              result.is_passed
                ? 'bg-primary text-white shadow-primary/20'
                : 'bg-rose-600 text-white shadow-rose-200',
            )}
          >
            {result.is_passed ? (
              <CheckCircle2 className="size-10" />
            ) : (
              <AlertCircle className="size-10" />
            )}
          </div>
          <CardTitle className="text-3xl font-bold text-slate-900 tracking-tight">
            {result.is_passed
              ? isLast
                ? 'Mastery Achieved!'
                : 'Checkpoint Reached!'
              : 'Review Required'}
          </CardTitle>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
            Passing threshold: {quiz.passing_percentage}%
          </p>
        </CardHeader>
        <CardContent className="px-6 sm:px-12 pb-10 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div
              className={cn(
                'p-6 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-all',
                result.is_passed
                  ? 'bg-primary/5 border-primary/10'
                  : 'bg-rose-50/30 border-rose-100',
              )}
            >
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">
                Quiz Score
              </p>
              <p
                className={cn(
                  'text-5xl font-bold tracking-tight',
                  result.is_passed ? 'text-primary' : 'text-rose-600',
                )}
              >
                {Math.round(result.score)}%
              </p>
            </div>
            <div className="p-6 rounded-2xl border-2 border-slate-100 bg-slate-50/30 flex flex-col items-center justify-center text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
                Status
              </p>
              <div
                className={cn(
                  'px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest',
                  result.is_passed
                    ? 'bg-primary/10 text-primary'
                    : 'bg-rose-100 text-rose-700',
                )}
              >
                {result.is_passed ? 'Module Validated' : 'Incomplete'}
              </div>
            </div>
          </div>

          {result.is_passed ? (
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex items-center gap-3">
              <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
              <p className="text-xs font-medium text-emerald-800">
                {isLast
                  ? 'Course Completed! Your official certification is now ready.'
                  : 'Excellent work! You have unlocked the next module.'}
              </p>
            </div>
          ) : (
            <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100 flex items-center gap-3">
              <Zap className="size-4 text-rose-500 shrink-0" />
              <p className="text-xs font-medium text-rose-800">
                Review the lessons above to improve your score.
              </p>
            </div>
          )}

          {/* Question Review Section */}
          {((result.details && result.details.length > 0) || (result.review && result.review.length > 0)) && (
            <div className="mt-10 border-t border-slate-100 pt-8">
              <h4 className="text-lg font-bold text-slate-800 mb-6">Question Review</h4>
              <div className="space-y-6">
                {(result.details || result.review || []).map((detail: any, idx: number) => {
                  const question = quizData.questions?.find((q) => q.uuid === detail.question_uuid)
                  const questionText = question?.question || detail.question_text
                  const questionPoints = question?.points || detail.points
                  const earnedPoints = detail.earned_points ?? detail.points ?? 0

                  if (!questionText) return null

                  // Map option UUIDs to text if we have the question loaded
                  const getOptionText = (uuids: string[]) => {
                    if (!uuids || !question?.options) return null
                    return uuids
                      .map((uuid) => question.options.find((o) => o.uuid === uuid)?.option_text)
                      .filter(Boolean)
                      .join(', ')
                  }

                  const yourAnswers = getOptionText(detail.your_answers)
                  const correctAnswers = getOptionText(detail.correct_answers || detail.correct_options)

                  return (
                    <div
                      key={detail.question_uuid || idx}
                      className={cn(
                        'p-5 rounded-xl border flex flex-col gap-3',
                        detail.is_correct
                          ? 'bg-emerald-50/30 border-emerald-100'
                          : 'bg-rose-50/30 border-rose-100'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 shrink-0">
                          {detail.is_correct ? (
                            <CheckCircle2 className="size-5 text-emerald-500" />
                          ) : (
                            <AlertCircle className="size-5 text-rose-500" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="font-bold text-slate-800 text-sm">
                            {idx + 1}. {questionText}
                          </p>
                          {questionPoints ? (
                            <p className="text-xs font-semibold text-slate-500">
                              Points: {earnedPoints} / {questionPoints}
                            </p>
                          ) : null}
                          
                          {yourAnswers && (
                            <p className="text-xs font-medium text-slate-600 mt-2">
                              <span className="font-bold text-slate-700">Your answer:</span> {yourAnswers}
                            </p>
                          )}
                          {!detail.is_correct && correctAnswers && (
                            <p className="text-xs font-medium text-emerald-700 mt-1">
                              <span className="font-bold text-emerald-800">Correct answer:</span> {correctAnswers}
                            </p>
                          )}
                        </div>
                      </div>

                      {(detail.explanation || question?.explanation) && (
                        <div className="mt-2 p-4 rounded-lg bg-white/60 border border-slate-200">
                          <div className="flex items-center gap-2 mb-1.5">
                            <HelpCircle className="size-4 text-primary" />
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                              Explanation
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap break-words">
                            {detail.explanation || question?.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="px-10 pb-10 flex gap-3">
          {result.is_passed ? (
            <Button
              onClick={() => {
                onComplete?.(result)
                if (isLast) {
                  onFinish?.()
                } else {
                  onNext?.()
                }
              }}
              className={cn(
                'flex-1 h-12 rounded-xl font-bold shadow-lg text-[10px] uppercase tracking-widest gap-2 transition-all active:scale-95',
                isLast
                  ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
                  : 'bg-primary hover:bg-primary/90 shadow-primary/20',
              )}
            >
              {isLast ? (
                <>
                  Download Certificate <Award className="size-4" />
                </>
              ) : (
                <>
                  Proceed to Next Module <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={resetQuiz}
              className="flex-1 h-12 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/10 text-[10px] uppercase tracking-widest gap-2"
            >
              <RotateCcw className="size-4" /> Retake Quiz
            </Button>
          )}
        </CardFooter>
      </Card>
    )
  }

  if (isLoading || !currentQuestion) {
    return (
      <div className="min-h-[600px] flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 animate-in fade-in duration-500">
        <Loader2 className="size-10 animate-spin text-slate-300 mx-auto mb-4" />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
          {isLoading
            ? 'Decrypting Assessment Questions...'
            : 'Loading Question Sequence...'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 min-h-[600px] flex flex-col p-6 sm:p-8">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary shadow-lg shadow-primary/5">
            <HelpCircle className="size-5" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-800 tracking-tight leading-none pt-1">
              Assessment Challenge
            </h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
        </div>
        <div className="w-48 hidden sm:block">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 px-1">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-primary/5" />
        </div>
      </div>

      <Card className="border-none shadow-2xl rounded-2xl overflow-hidden bg-white flex-1 flex flex-col">
        <CardHeader className="p-10 pb-6">
          <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded bg-primary/5 border border-primary/10 text-primary w-fit mb-4">
            {currentQuestion.type?.replace('_', ' ')}
          </span>
          <h3 className="text-2xl font-bold text-slate-800 tracking-tight leading-tight pt-2">
            {currentQuestion.question}
          </h3>
        </CardHeader>
        <CardContent className="p-6 sm:p-10 pt-0 space-y-4 flex-1">
          {currentQuestion.type === 'range' ? (
            <div className="py-12 px-4">
              <div className="relative pt-6 pb-2">
                <Slider
                  value={[Number(answers[currentQuestion.uuid]?.[0]) || 5]}
                  max={10}
                  min={1}
                  step={1}
                  onValueChange={(vals) =>
                    handleRangeChange(currentQuestion.uuid, vals[0])
                  }
                  className="py-4 cursor-grab active:cursor-grabbing"
                >
                  <span className="text-sm font-bold text-primary animate-in zoom-in duration-300">
                    {answers[currentQuestion.uuid]?.[0] || '5'}
                  </span>
                </Slider>

                <div className="flex justify-between mt-10 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 px-1">
                  <span>Low / Weak</span>
                  <span>High / Strong</span>
                </div>
              </div>

              <p className="text-center text-xs font-bold text-slate-400 italic">
                Drag the slider above to indicate your response level
              </p>
            </div>
          ) : currentQuestion.type === 'multiple_response' ||
            currentQuestion.type === 'multiple_choice' ? (
            <div className="grid gap-4">
              {currentQuestion.options.map((option) => {
                const isSelected = (
                  answers[currentQuestion.uuid] || []
                ).includes(option.uuid)
                return (
                  <div
                    key={option.uuid}
                    onClick={() =>
                      handleOptionToggle(
                        currentQuestion.uuid,
                        option.uuid,
                        currentQuestion.type,
                      )
                    }
                    className={cn(
                      'group flex items-center space-x-4 p-5 rounded-2xl border-2 transition-all cursor-pointer',
                      isSelected
                        ? 'bg-primary/5 border-primary shadow-xl shadow-primary/20 scale-[1.01]'
                        : 'bg-white border-slate-100 hover:border-slate-300',
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      className="size-5 rounded border-2 pointer-events-none"
                    />
                    <Label className="text-base font-bold text-slate-800 flex-1 cursor-pointer pointer-events-none">
                      {option.option_text}
                    </Label>
                  </div>
                )
              })}
            </div>
          ) : (
            <RadioGroup
              value={answers[currentQuestion.uuid]?.[0] || ''}
              className="grid gap-4"
              onValueChange={(val) =>
                handleOptionToggle(
                  currentQuestion.uuid,
                  val,
                  currentQuestion.type,
                )
              }
            >
              {currentQuestion.options.map((option) => {
                const isSelected = (
                  answers[currentQuestion.uuid] || []
                ).includes(option.uuid)
                return (
                  <div
                    key={option.uuid}
                    onClick={() =>
                      handleOptionToggle(
                        currentQuestion.uuid,
                        option.uuid,
                        currentQuestion.type,
                      )
                    }
                    className={cn(
                      'group flex items-center space-x-4 p-5 rounded-2xl border-2 transition-all cursor-pointer',
                      isSelected
                        ? 'bg-primary/5 border-primary shadow-xl shadow-primary/20 scale-[1.01]'
                        : 'bg-white border-slate-100 hover:border-slate-300',
                    )}
                  >
                    <RadioGroupItem
                      value={option.uuid}
                      id={option.uuid}
                      className="size-5 border-2 pointer-events-none"
                    />
                    <Label
                      htmlFor={option.uuid}
                      className="text-base font-bold text-slate-800 flex-1 cursor-pointer pointer-events-none"
                    >
                      {option.option_text}
                    </Label>
                  </div>
                )
              })}
            </RadioGroup>
          )}
        </CardContent>
        <CardFooter className="p-6 sm:p-10 pt-0 flex flex-col sm:flex-row justify-between items-center gap-6 bg-slate-50/50">
          <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
            <AlertCircle className="size-4" /> Final Selection
          </div>
          <Button
            onClick={handleNext}
            disabled={isSubmitting || !answers[currentQuestion.uuid]?.length}
            className="h-12 px-10 rounded-xl font-bold bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 text-xs uppercase tracking-widest gap-2 active:scale-95 transition-all"
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : isLastQuestion ? (
              <>
                Submit Assessment <CheckCircle2 className="size-4" />
              </>
            ) : (
              <>
                Next Question <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
