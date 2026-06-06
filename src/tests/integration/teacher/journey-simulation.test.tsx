// @vitest-environment jsdom
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { renderWithProviders } from '@/tests/__utils__/test-utils'
import { CourseForm } from '@/components/admin/courses/course-form'
import { ModuleManager } from '@/components/admin/courses/modules/module-manager'
import { QuizModal } from '@/components/admin/quiz/quiz-modal'
import { adminCourseService } from '@/services/admin/course.service'
import { adminCourseModuleService } from '@/services/admin/course-module.service'
import { adminQuizService } from '@/services/admin/quiz.service'
import React from 'react'

// Mock Services
vi.mock('@/services/admin/course.service', () => ({
  adminCourseService: {
    create: vi
      .fn()
      .mockResolvedValue({
        id: 'course-123',
        uuid: 'course-123-uuid',
        title: 'New Course',
      }),
    upload: vi.fn().mockResolvedValue({ url: 'http://example.com/thumb.jpg' }),
    uploadVideo: vi.fn(),
    getVideoStatus: vi.fn(),
  },
}))

vi.mock('@/services/admin/course-module.service', () => ({
  adminCourseModuleService: {
    getAll: vi.fn().mockResolvedValue([]),
    create: vi
      .fn()
      .mockResolvedValue({
        id: 'mod-1',
        title: 'Lesson 1',
        module_type: 'lesson',
        order: 0,
      }),
    update: vi
      .fn()
      .mockResolvedValue({
        id: 'mod-1',
        title: 'Lesson 1 Updated',
        module_type: 'lesson',
      }),
  },
}))

vi.mock('@/services/admin/quiz.service', () => ({
  adminQuizService: {
    getAll: vi.fn().mockResolvedValue([]),
    create: vi
      .fn()
      .mockResolvedValue({
        uuid: 'quiz-abc',
        title: 'Final Quiz',
        passing_percentage: 80,
      }),
  },
}))

// Mock complex UI components
vi.mock('@/components/admin/shared/searchable-select', () => ({
  SearchableSelect: ({ onValueChange, placeholder }: any) => (
    <select
      data-testid="mock-category-select"
      onChange={(e) => onValueChange(e.target.value)}
    >
      <option value="">{placeholder}</option>
      <option value="1">Tech</option>
    </select>
  ),
}))

vi.mock('@/components/ui/rich-editor', () => ({
  RichEditor: ({ value, onChange }: any) => (
    <textarea
      data-testid="rich-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

describe('Teacher Journey Simulation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('Simulates Phase 1: Course Creation with Image Upload', async () => {
    const handleSuccess = vi.fn()

    renderWithProviders(
      <CourseForm
        categories={[{ label: 'Tech', value: '1' }]}
        onSubmit={handleSuccess}
        onCancel={vi.fn()}
      />,
    )

    // 1. Fill Course Details (Required Fields)
    fireEvent.change(screen.getByPlaceholderText(/Course title/i), {
      target: { value: 'Mastering React' },
    })
    fireEvent.change(screen.getByPlaceholderText(/Brief overview/i), {
      target: { value: 'Learn React from scratch.' },
    })

    // Fill Rich Editor (Content)
    const contentEditor = screen.getByTestId('rich-editor')
    fireEvent.change(contentEditor, {
      target: { value: '<p>Mastering React content...</p>' },
    })

    // Use Mock Category Select for successful simulation
    const categorySelect = screen.getByTestId('mock-category-select')
    fireEvent.change(categorySelect, { target: { value: '1' } })

    // 2. Mock Image Upload Interaction
    const thumbnailLabel = screen.getByText(/common.thumbnail|Thumbnail/i)
    expect(thumbnailLabel).toBeInTheDocument()

    // 3. Submit Course Foundation
    // Target the button specifically by text content which we see in the DOM
    const createBtn = screen.getByText(/common.create|create/i)
    fireEvent.click(createBtn)

    await waitFor(
      () => {
        expect(handleSuccess).toHaveBeenCalled()
      },
      { timeout: 4000 },
    )
  })

  it('Simulates Phase 2: Building Curriculum (Modules)', async () => {
    renderWithProviders(<ModuleManager courseUuid="course-123-uuid" />)

    // 1. Wait for loading to finish
    await waitFor(
      () => {
        expect(screen.queryByTestId('loading-spinner')).toBeNull()
      },
      { timeout: 3000 },
    )

    // 2. Verify initial state (empty modules) - using actual text from DOM
    expect(await screen.findByText(/No modules added yet/i)).toBeInTheDocument()

    // 3. Add a Lesson Module - Open Dropdown
    const addBtn = screen.getByRole('button', { name: /Add Module/i })

    // Radix UI often requires pointerDown + click to open in JSDOM
    fireEvent.pointerDown(addBtn, { button: 0 })
    fireEvent.click(addBtn)

    // 4. Select Lesson Module from dropdown (Wait for Portal to appear in body)
    const lessonItem = await screen.findByText(/Lesson Module/i)
    fireEvent.click(lessonItem)

    await waitFor(() => {
      expect(adminCourseModuleService.create).toHaveBeenCalled()
    })
  })

  it('Simulates Phase 3: Assessment Design (Creating Quiz)', async () => {
    const handleSuccess = vi.fn()
    renderWithProviders(
      <QuizModal isOpen={true} onClose={vi.fn()} onSuccess={handleSuccess} />,
    )

    // 1. Fill Quiz Foundation
    const titleInput = screen.getByPlaceholderText(/Enter quiz title/i)
    fireEvent.change(titleInput, { target: { value: 'Unit 1 Assessment' } })

    const passingInput = document.querySelector('input[name="passing_percentage"]')!
    fireEvent.change(passingInput, { target: { value: '85' } })

    // 2. Save Quiz - use actual button text "Create"
    const saveBtn = screen.getByRole('button', { name: /Create/i })
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(adminQuizService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Unit 1 Assessment',
          passing_percentage: 85,
        }),
      )
      expect(handleSuccess).toHaveBeenCalled()
    })
  })
})
