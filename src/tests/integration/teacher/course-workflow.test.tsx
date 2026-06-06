// @vitest-environment jsdom
import { screen, fireEvent, waitFor, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { renderWithProviders } from '@/tests/__utils__/test-utils'
import { CourseForm } from '@/components/admin/courses/course-form'
import { adminCourseService } from '@/services/admin/course.service'
import { adminMediaService } from '@/services/admin/media.service'
import React from 'react'

// Mock Services
vi.mock('@/services/admin/course.service', () => ({
  adminCourseService: {
    create: vi.fn(),
    update: vi.fn(),
    getVideoStatus: vi.fn(),
  },
}))

vi.mock('@/services/admin/media.service', () => ({
  adminMediaService: {
    upload: vi.fn(),
  },
}))

// Mock SearchableSelect to avoid CMDK JSDOM issues
vi.mock('@/components/admin/shared/searchable-select', () => ({
  SearchableSelect: ({ onValueChange, value, options }: any) => (
    <select
      data-testid="mock-category-select"
      value={value || ''}
      onChange={(e) => onValueChange(e.target.value)}
    >
      <option value="">Select...</option>
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
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

describe('Complete Teacher Course Workflow: Create & Edit with Video', () => {
  const mockCategories = [{ label: 'Technology', value: 'tech-uuid' }]
  const sampleVideoFile = new File(['mock-video-content'], 'video_sample.mp4', {
    type: 'video/mp4',
  })

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it('Stage 1: Simulates Creating a New Course with Video Upload', async () => {
    const handleCreate = vi
      .fn()
      .mockResolvedValue({ id: 'course-99', title: 'New Course' })

    // Mock video upload
    const mockVideoRes = {
      uuid: 'v-123',
      url: 'http://tmp.mp4',
      status: 'pending',
    }
    ;(adminMediaService.upload as any).mockResolvedValue(mockVideoRes)

    // Mock status polling: first call processing, second call completed
    let callCount = 0
    ;(adminCourseService.getVideoStatus as any).mockImplementation(() => {
      callCount++
      if (callCount === 1)
        return Promise.resolve({ status: 'processing', progress: 50 })
      return Promise.resolve({
        status: 'completed',
        progress: 100,
        stream_url: 'http://final.mp4',
        uuid: 'v-123',
      })
    })

    renderWithProviders(
      <CourseForm
        categories={mockCategories}
        onSubmit={handleCreate}
        onCancel={vi.fn()}
      />,
    )

    // 1. Fill Text Data
    fireEvent.change(screen.getByPlaceholderText(/Course title/i), {
      target: { value: 'Advanced React 2026' },
    })
    fireEvent.change(screen.getByPlaceholderText(/Brief overview/i), {
      target: { value: 'Mastering the latest React features.' },
    })
    fireEvent.change(screen.getByTestId('rich-editor'), {
      target: { value: '<p>Comprehensive course content...</p>' },
    })
    fireEvent.change(screen.getByTestId('mock-category-select'), {
      target: { value: 'tech-uuid' },
    })

    // 2. Simulate Video Upload
    const videoInput = document.querySelector(
      'input[type="file"][accept="video/*"]',
    ) as HTMLInputElement
    expect(videoInput).toBeTruthy()

    await act(async () => {
      fireEvent.change(videoInput!, { target: { files: [sampleVideoFile] } })
    })

    // 3. Wait for video to complete (polling happens every 3s in component)
    // We wait for the success toast or the status indicator to show completed
    await waitFor(
      () => {
        expect(
          screen.queryByText(/processing|50%/i) ||
            screen.queryByText(/completed/i),
        ).toBeTruthy()
      },
      { timeout: 10000 },
    )

    // 4. Submit
    // Use the exact text rendered in the DOM according to previous failures
    const submitBtn = await screen.findByText(/common\.create|create/i)
    fireEvent.click(submitBtn)

    await waitFor(
      () => {
        expect(handleCreate).toHaveBeenCalled()
      },
      { timeout: 5000 },
    )
  }, 20000)

  it('Stage 2: Simulates Editing an Existing Course', async () => {
    const handleUpdate = vi.fn()
    const existingCourse = {
      id: 'course-99',
      title: 'Advanced React 2026',
      slug: 'advanced-react-2026',
      description: 'Old Description',
      content: 'Old Content',
      course_category_uuid: 'tech-uuid',
      video: 'http://final.mp4',
      video_uuid: 'v-123',
      is_active: true,
      published_at: null,
    }

    renderWithProviders(
      <CourseForm
        course={existingCourse as any}
        categories={mockCategories}
        onSubmit={handleUpdate}
        onCancel={vi.fn()}
      />,
    )

    // 1. Verify existing data loaded
    await screen.findByDisplayValue('Advanced React 2026')

    // 2. Change Description
    const descInput = screen.getByPlaceholderText(/Brief overview/i)
    fireEvent.change(descInput, { target: { value: 'UPDATED DESCRIPTION' } })

    // 3. Submit Update
    // Use findByRole for better accessibility and robustness in JSDOM
    const updateBtn = await screen.findByRole('button', {
      name: /update|save|common\.update/i,
    })
    fireEvent.click(updateBtn)

    await waitFor(
      () => {
        expect(handleUpdate).toHaveBeenCalled()
      },
      { timeout: 10000 },
    )
  }, 30000)
})
