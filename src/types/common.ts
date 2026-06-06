export interface GalleryImage {
  id: string
  url: string
  order: number
}

export interface ProcessedImage {
  filename: string
  images: Record<string, string>
}
