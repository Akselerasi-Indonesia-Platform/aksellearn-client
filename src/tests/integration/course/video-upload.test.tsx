// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { CourseForm } from '@/components/admin/courses/course-form'
import { adminCourseService } from '@/services/admin/course.service'
import { adminMediaService } from '@/services/admin/media.service'

// Mock dependencies
vi.mock('@/services/admin/course.service', () => ({
  adminCourseService: {
    getVideoStatus: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
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

// Simplified translation mock to ensure we know exactly what text to look for
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
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

const mockCategories = [{ label: 'Category 1', value: '1' }]

describe('Course Video Upload Strategy', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockCourse: any = {
    id: '123',
    title: 'Test Course',
    description: 'Test Description',
    content: 'Test content',
    course_category_uuid: '1',
    thumbnail: '',
    video: '',
    is_active: true,
    createdAt: new Date().toISOString(),
  }

  it('performs early upload and polls for status', async () => {
    const mockFile = new File(['video content'], 'test-video.mp4', {
      type: 'video/mp4',
    })
    const mockVideoResource = {
      uuid: 'video-uuid-999',
      status: 'pending' as const,
    }

    ;(adminMediaService.upload as any).mockResolvedValue(mockVideoResource)
    ;(adminCourseService.getVideoStatus as any)
      .mockResolvedValueOnce({ ...mockVideoResource, status: 'processing' })
      .mockResolvedValueOnce({
        ...mockVideoResource,
        status: 'completed',
        stream_url: 'https://example.com/video.mp4',
      })

    const handleSubmit = vi.fn()

    render(
      <CourseForm
        course={mockCourse}
        categories={mockCategories}
        onSubmit={handleSubmit}
        onCancel={vi.fn()}
      />,
    )

    // Find file input
    const videoInput = document.querySelector(
      'input[type="file"][accept="video/*"]',
    ) as HTMLInputElement

    if (!videoInput) throw new Error('Video input not found')

    await act(async () => {
      fireEvent.change(videoInput, { target: { files: [mockFile] } })
    })

    expect(adminMediaService.upload).toHaveBeenCalledWith(mockFile, 'course')

    // Verify "pending" or "Video Status" is shown
    await waitFor(() => {
      expect(screen.getByText(/pending/i)).toBeTruthy()
    })

    // Fill fields using keys since t() returns keys
    fireEvent.change(screen.getByPlaceholderText('courses.titlePlaceholder'), {
      target: { value: 'Video Course' },
    })
    fireEvent.change(
      screen.getByPlaceholderText('courses.descriptionPlaceholder'),
      { target: { value: 'Desc' } },
    )
    fireEvent.change(screen.getByTestId('rich-editor'), {
      target: { value: 'Content' },
    })

    const submitBtn = screen.getByText('common.update')
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(handleSubmit.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          title: 'Video Course',
          video_uuid: 'video-uuid-999',
        }),
      )
    })
  }, 10000)

  it('allows saving while video is still processing', async () => {
    const mockFile = new File(['video content'], 'test-video.mp4', {
      type: 'video/mp4',
    })
    const mockVideoResource = {
      uuid: 'video-uuid-777',
      status: 'pending' as const,
    }

    ;(adminMediaService.upload as any).mockResolvedValue(mockVideoResource)

    const handleSubmit = vi.fn()
    render(
      <CourseForm
        course={mockCourse}
        categories={mockCategories}
        onSubmit={handleSubmit}
        onCancel={vi.fn()}
      />,
    )

    const videoInput = document.querySelector(
      'input[type="file"][accept="video/*"]',
    ) as HTMLInputElement
    if (!videoInput) throw new Error('Video input not found')

    await act(async () => {
      fireEvent.change(videoInput, { target: { files: [mockFile] } })
    })

    fireEvent.change(screen.getByPlaceholderText('courses.titlePlaceholder'), {
      target: { value: 'Quick Save' },
    })
    fireEvent.change(
      screen.getByPlaceholderText('courses.descriptionPlaceholder'),
      { target: { value: 'Desc' } },
    )
    fireEvent.change(screen.getByTestId('rich-editor'), {
      target: { value: 'Content' },
    })

    const submitBtn = screen.getByText('common.update')
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(handleSubmit.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          title: 'Quick Save',
          video_uuid: 'video-uuid-777',
        }),
      )
    })
  }, 10000)
})
