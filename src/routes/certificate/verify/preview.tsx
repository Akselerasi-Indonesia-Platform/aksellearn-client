import { createFileRoute } from '@tanstack/react-router'
import { VerifyCertificatePage } from './$uuid'

export const Route = createFileRoute('/certificate/verify/preview')({
  component: () => <VerifyCertificatePage isPreview={true} />,
})
