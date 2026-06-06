import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Polyfill PointerEvent for Radix UI / Shadcn components
if (!global.PointerEvent) {
  class PointerEvent extends MouseEvent {
    constructor(type: string, params: any = {}) {
      super(type, params)
    }
  }
  global.PointerEvent = PointerEvent as any
}

// Mock DOMParser
global.DOMParser = class {
  parseFromString(html: string) {
    return {
      body: {
        textContent: html.replace(/<[^>]*>?/gm, ''),
      },
    }
  }
} as any

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Global API Mock
export const mockApiResponse = (url: string, method: string) => {
  console.log(`[Mock API] ${method} ${url}`)
  if (url.includes('/stats')) {
    return {
      courses: {
        total: 2,
        total_views: 100,
        total_enrolled: 5,
        average_progress: 50,
        total_modules: 10,
        total_video_time: 3600,
      },
      revenue: {
        total: 5000,
        monthly: 500,
        currency: 'USD',
      },
      engagement: {
        total_students: 10,
      },
      meta: {
        can_manage_all: true,
        server_time: new Date().toISOString(),
      },
    }
  }

  if (url.includes('/api/admin/organization/tag')) {
    if (url.includes('/option')) {
      return {
        data: [
          { uuid: 'tag-1', name: 'Technology' },
          { uuid: 'tag-2', name: 'Finance' },
        ],
      }
    }
    return {
      data: [
        {
          uuid: 'tag-1',
          name: 'Technology',
          description: 'Software and IT',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      meta: { total: 1, page: 1, limit: 10 },
    }
  }

  if (url.includes('/api/admin/organization')) {
    return {
      data: [
        {
          id: 1,
          uuid: 'org-1',
          name: 'Test Org',
          tag: 'business',
          contact_email: 'contact@test.org',
          parent_email: '@test.org',
          organization_tag: {
            uuid: 'tag-1',
            name: 'Technology',
            description: 'Software and IT',
          },
          contents: {
            website: 'https://test.org',
            address: '123 Test St',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      meta: { total: 1, page: 1, limit: 10 },
    }
  }

  if (url.includes('/api/user/organizations')) {
    return {
      data: [
        { id: 1, uuid: 'org-uuid-1', name: 'Test Org' },
      ],
    }
  }

  if (url.includes('/api/admin/user')) {
    return {
      data: [
        {
          id: '1',
          uuid: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'student',
          is_active: true,
          status: 'active',
          createdAt: new Date().toISOString(),
        },
      ],
      meta: { total: 1, page: 1, limit: 10 },
    }
  }

  if (url.includes('/api/admin/course')) {
    if (url.includes('/category')) {
      return [{ label: 'Development', value: 'cat-1' }]
    }
    if (url.includes('/enrollment')) {
      return {
        data: [
          {
            uuid: 'enr-1',
            user: { name: 'John Doe', email: 'john@example.com' },
            course: { title: 'Test Course', uuid: 'course-1-uuid' },
            created_at: new Date().toISOString(),
          },
        ],
        meta: { total: 1, page: 1, limit: 10 },
      }
    }
    return {
      courses: [
        {
          id: '1',
          uuid: 'course-1',
          title: 'Test Course',
          is_active: true,
          created_at: new Date().toISOString(),
        },
      ],
      meta: { total: 1, page: 1, limit: 10 },
    }
  }

  if (url.includes('/api/admin/role')) {
    return [
      { label: 'Admin', value: 'admin' },
      { label: 'Student', value: 'student' },
    ]
  }

  if (url.includes('/api/course/enrollment')) {
    return {
      data: [
        {
          uuid: 'enr-1',
          course: {
            id: 'course-1',
            uuid: 'course-1',
            title: 'Test Student Course',
            category: { name: 'IT' },
          },
          progress_percentage: 45,
          created_at: new Date().toISOString(),
        },
      ],
      meta: { total: 1, current_page: 1, per_page: 10 },
    }
  }

  if (url.includes('/api/course/note')) {
    return {
      data: [
        {
          uuid: 'note-1',
          content: 'Test Note Content',
          course_uuid: 'course-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    }
  }

  if (url.includes('/announcement')) {
    return {
      data: [
        {
          id: 'ann-1',
          uuid: 'ann-1',
          title: 'Test Announcement',
          content: 'Test Content',
          created_at: new Date().toISOString(),
        },
      ],
    }
  }

  if (url.includes('/related')) {
    return {
      data: [
        {
          uuid: 'related-course-1',
          title: 'Related Course 1',
          slug: 'related-course-1',
          price: 150000,
          price_discount: 99000,
          category: { name: 'Development', slug: 'development' },
          summary: {
            stats: {
              average_rating: 4.8,
              total_reviews: 10,
              total_lessons: 5,
              total_duration: '2h',
            }
          }
        }
      ]
    }
  }

  return { data: [], meta: { total: 0 } }
}

vi.mock('@/lib/api-client', () => ({
  default: {
    get: vi.fn(async (url) => ({ data: mockApiResponse(url, 'GET') })),
    post: vi.fn(async () => ({ data: { success: true } })),
    put: vi.fn(async () => ({ data: { success: true } })),
    delete: vi.fn(async () => ({ data: { success: true } })),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
  },
  getProxyUrl: vi.fn((url) => url),
}))

vi.mock('@/components/admin/shared/form/form-editor', async () => {
  const React = await import('react')
  const { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } = await import('../../components/ui/form') as any
  const { RichEditor } = await import('../../components/ui/rich-editor') as any

  return {
    FormEditor: ({ control, name, label, description, className, disabled, required }: any) => {
      return React.createElement(
        FormField,
        {
          control,
          name,
          render: ({ field }: any) => {
            return React.createElement(
              FormItem,
              { className: className || '' },
              label && React.createElement(
                FormLabel,
                { className: 'font-bold' },
                label,
                required && React.createElement('span', { className: 'text-destructive ml-1' }, '*')
              ),
              React.createElement(
                FormControl,
                null,
                React.createElement(RichEditor, {
                  disabled,
                  value: field.value || '',
                  onChange: field.onChange,
                })
              ),
              description && React.createElement(FormDescription, null, description),
              React.createElement(FormMessage)
            )
          }
        }
      )
    }
  }
})

