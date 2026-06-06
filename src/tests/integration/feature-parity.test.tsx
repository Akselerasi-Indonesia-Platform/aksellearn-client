import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import { CourseForm } from '@/components/admin/courses/course-form'
import { CourseCertificateSettings } from '@/components/admin/courses/course-certificate-settings'
import { CourseQuizInterface } from '@/components/user/course/quiz/course-quiz-interface'
import { FormDynamicList } from '@/components/admin/shared/form/form-dynamic-list'
import { useForm, FormProvider } from 'react-hook-form'

// Mock dependencies
vi.mock('@/services/admin/course.service', () => ({
  adminCourseService: {
    getCertificateUrl: vi.fn(() => 'http://mock-url.com'),
  },
}))

vi.mock('@/services/admin/media.service', () => ({
  adminMediaService: {
    upload: vi.fn(),
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

vi.mock('@/lib/auth', () => ({
  getUser: vi.fn(() => ({ name: 'Test User' })),
  getToken: vi.fn(() => 'mock-token'),
}))

// Mock RichEditor
vi.mock('@/components/ui/rich-editor', () => ({
  RichEditor: ({ value, onChange }: any) => (
    <textarea
      data-testid="rich-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}))

// Mock ModuleManager
vi.mock('@/components/admin/courses/modules/module-manager', () => ({
  ModuleManager: () => <div data-testid="module-manager" />,
}))

describe('Feature Parity - Course Summary Fields', () => {
  it('renders summary tab trigger', async () => {
    const mockCourse = {
      id: '1',
      title: 'Test Course',
      certificate_config: { variant: 'modern' },
    }

    render(
      <CourseForm
        course={mockCourse as any}
        categories={[]}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    // The Summary tab should be present in the tabs list
    expect(screen.getByText(/summary/i)).toBeTruthy()
  })
})

describe('Feature Parity - Certificate Customization', () => {
  it('renders certificate settings tab', () => {
    const mockCourse = {
      id: '1',
      title: 'Test Course',
      certificate_config: {
        variant: 'modern',
        title: 'Cert Title',
      },
    }

    render(
      <CourseForm
        course={mockCourse as any}
        categories={[]}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(screen.getByText(/certificate/i)).toBeTruthy()
  })
})

describe('Feature Parity - Quiz Range Question Interaction', () => {
  it('renders range question correctly', () => {
    const mockQuiz = {
      uuid: 'quiz-1',
      questions: [
        {
          uuid: 'q-1',
          question: 'Rate this',
          type: 'range',
          options: [],
        },
      ],
    }

    render(<CourseQuizInterface quiz={mockQuiz as any} />)

    // Check for range indicator text
    expect(screen.getByText(/range/i)).toBeTruthy()
  })
})
