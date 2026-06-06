import apiClient from '@/lib/api-client'
import { sanitizePayload } from '@/lib/utils'
import type { Quiz, QuizQuestion, QuizOption } from '@/types/course'

export const adminQuizService = {
  // Quiz Root
  async getAll(): Promise<Quiz[]> {
    const response = await apiClient.get('/api/admin/quiz')
    return response.data.data
  },

  async getOne(uuid: string): Promise<Quiz> {
    const response = await apiClient.get(`/api/admin/quiz/${uuid}`)
    return response.data.data
  },

  async find(uuid: string): Promise<Quiz> {
    return this.getOne(uuid)
  },

  async create(data: {
    title: string
    description?: string
    passing_percentage: number
    module_uuid?: string
  }): Promise<Quiz> {
    const response = await apiClient.post(
      '/api/admin/quiz',
      sanitizePayload(data),
    )
    return response.data.data
  },

  async update(uuid: string, data: Partial<Quiz>): Promise<Quiz> {
    const response = await apiClient.put(
      `/api/admin/quiz/${uuid}`,
      sanitizePayload(data),
    )
    return response.data.data
  },

  async destroy(uuid: string): Promise<void> {
    await apiClient.delete(`/api/admin/quiz/${uuid}`)
  },

  // Questions
  async getQuestions(quizUuid: string): Promise<QuizQuestion[]> {
    const response = await apiClient.get(`/api/admin/quiz/${quizUuid}/question`)
    return response.data.data
  },

  async findQuestion(
    quizUuid: string,
    questionUuid: string,
  ): Promise<QuizQuestion> {
    const response = await apiClient.get(
      `/api/admin/quiz/${quizUuid}/question/${questionUuid}`,
    )
    return response.data.data
  },

  async addQuestion(
    quizUuid: string,
    data: Partial<QuizQuestion>,
  ): Promise<QuizQuestion> {
    const response = await apiClient.post(
      `/api/admin/quiz/${quizUuid}/question`,
      sanitizePayload(data),
    )
    return response.data.data
  },

  async storeQuestion(
    quizUuid: string,
    data: Partial<QuizQuestion>,
  ): Promise<QuizQuestion> {
    return this.addQuestion(quizUuid, data)
  },

  async updateQuestion(
    quizUuid: string,
    questionUuid: string,
    data: Partial<QuizQuestion>,
  ): Promise<QuizQuestion> {
    const response = await apiClient.put(
      `/api/admin/quiz/${quizUuid}/question/${questionUuid}`,
      sanitizePayload(data),
    )
    return response.data.data
  },

  async destroyQuestion(quizUuid: string, questionUuid: string): Promise<void> {
    await apiClient.delete(
      `/api/admin/quiz/${quizUuid}/question/${questionUuid}`,
    )
  },

  // Options
  async getOptions(
    quizUuid: string,
    questionUuid: string,
  ): Promise<QuizOption[]> {
    const response = await apiClient.get(
      `/api/admin/quiz/${quizUuid}/question/${questionUuid}/option`,
    )
    return response.data.data
  },

  async addOption(
    quizUuid: string,
    questionUuid: string,
    data: Partial<QuizOption>,
  ): Promise<QuizOption> {
    const response = await apiClient.post(
      `/api/admin/quiz/${quizUuid}/question/${questionUuid}/option`,
      sanitizePayload(data),
    )
    return response.data.data
  },

  async storeOption(
    quizUuid: string,
    questionUuid: string,
    data: Partial<QuizOption>,
  ): Promise<QuizOption> {
    return this.addOption(quizUuid, questionUuid, data)
  },

  async updateOption(
    quizUuid: string,
    questionUuid: string,
    optionUuid: string,
    data: Partial<QuizOption>,
  ): Promise<QuizOption> {
    const response = await apiClient.put(
      `/api/admin/quiz/${quizUuid}/question/${questionUuid}/option/${optionUuid}`,
      sanitizePayload(data),
    )
    return response.data.data
  },

  async destroyOption(
    quizUuid: string,
    questionUuid: string,
    optionUuid: string,
  ): Promise<void> {
    await apiClient.delete(
      `/api/admin/quiz/${quizUuid}/question/${questionUuid}/option/${optionUuid}`,
    )
  },
}
