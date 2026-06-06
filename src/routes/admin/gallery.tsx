import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { MediaGallery } from '@/components/admin/gallery/media-gallery'
import { AdminPage } from '@/components/admin/shared/layout/admin-page'

export const Route = createFileRoute('/admin/gallery')({
  component: GalleryPage,
})

function GalleryPage() {
  const { t } = useTranslation()

  return (
    <AdminPage>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t('gallery.title')}
        </h1>
        <p className="text-muted-foreground">{t('gallery.description')}</p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <MediaGallery />
      </div>
    </AdminPage>
  )
}
