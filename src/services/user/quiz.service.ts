import apiClient from '@/lib/api-client'
import type { Quiz } from '@/types/course'

export type QuizSubmissionPayload = Record<string, string[]>;

export interface QuizResult {
  score: number
  is_passed: boolean
  attempt_uuid: string
  details: {
    question_uuid: string
    is_correct: boolean
    earned_points: number
    correct_options: string[]
    explanation?: string | null
  }[]
  review?: any[]
}

export const userQuizService = {
  async getQuiz(uuid: string, retake: boolean = false): Promise<Quiz> {
    const url = retake ? `/api/course/quiz/${uuid}?retake=1` : `/api/course/quiz/${uuid}`
    const response = await apiClient.get(url)
    const { data } = response.data

    // Flatten the response so the quiz data is at the root,
    // but keep completed status for the UI
    return {
      ...(data.quiz || data),
      completed: data.is_completed,
      result: data.result,
    }
  },

  async submitQuiz(
    uuid: string,
    answers: QuizSubmissionPayload,
    startedAt?: string,
  ): Promise<QuizResult> {
    const payload = {
      user_answers: answers,
      started_at: startedAt,
    }
    const response = await apiClient.post(
      `/api/course/quiz/${uuid}/submit`,
      payload,
    )
    return response.data.data || response.data
  },
}
