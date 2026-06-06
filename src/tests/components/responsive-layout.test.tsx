// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ImageUploadInput } from '@/components/admin/shared/image-upload-input'
import { VideoUploadInput } from '@/components/admin/shared/video-upload-input'

// Mock translations
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
  }),
}))

describe('Responsive Upload Inputs Content Visibility', () => {
  it('ImageUploadInput contains the dynamic visibility classes for high-res layout', () => {
    const { container } = render(
      <ImageUploadInput value="" onUpload={vi.fn()} onClear={vi.fn()} />,
    )

    // Check for the parent visibility container that hides on MD but shows on XL (for 1440p)
    const visibilityDiv = container.querySelector(
      '.block.md\\:hidden.xl\\:block',
    )
    expect(visibilityDiv).toBeTruthy()
  })

  it('VideoUploadInput contains the dynamic visibility classes for high-res layout', () => {
    const { container } = render(
      <VideoUploadInput value="" onUpload={vi.fn()} onClear={vi.fn()} />,
    )

    // Check for the parent visibility container
    const visibilityDiv = container.querySelector(
      '.block.md\\:hidden.xl\\:block',
    )
    expect(visibilityDiv).toBeTruthy()
  })

  it('ImageUploadInput shows full context (JPG, PNG) without sub-breakpoints', () => {
    render(<ImageUploadInput value="" onUpload={vi.fn()} onClear={vi.fn()} />)
    const detailText = screen.getByText(/JPG, PNG, WEBP/i)

    // Ensure it doesn't have the redundant 'hidden sm:block' anymore
    expect(detailText.className).not.toContain('hidden sm:block')
    expect(detailText.className).not.toContain('sm:block')
  })
})
