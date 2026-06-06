import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QuestionForm } from '@/components/admin/quiz/builder/question-form'

// Mock dependencies
vi.mock('@/services/admin/quiz.service', () => ({
  adminQuizService: {
    storeQuestion: vi.fn(),
    updateQuestion: vi.fn(),
    storeOption: vi.fn(),
    updateOption: vi.fn(),
    findQuestion: vi.fn(),
  },
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
  }),
}))

describe('QuestionForm Assessment Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Select components need ResizeObserver/matchMedia mocks which are in setup.ts
  })

  const mockQuizUuid = 'quiz-uuid'

  it('renders correctly for a new Single Choice question', () => {
    render(
      <QuestionForm
        quizUuid={mockQuizUuid}
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        question={null}
      />,
    )

    // Check for title atoms and labels
    expect(screen.getByText(/Add Question/i)).toBeTruthy()
    expect(screen.getByText(/Question Text/i)).toBeTruthy()
  })

  it('allows entering question text', () => {
    render(
      <QuestionForm
        quizUuid={mockQuizUuid}
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        question={null}
      />,
    )
    const textarea = screen.getByPlaceholderText(/Enter the question here/i)
    fireEvent.change(textarea, { target: { value: 'Is this a test?' } })
    expect((textarea as HTMLTextAreaElement).value).toBe('Is this a test?')
  })

  it('renders initial options correctly', () => {
    render(
      <QuestionForm
        quizUuid={mockQuizUuid}
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
        question={null}
      />,
    )
    const options = screen.getAllByPlaceholderText(/Define response option/i)
    expect(options.length).toBeGreaterThanOrEqual(2) // At least 2 default options
  })
})
