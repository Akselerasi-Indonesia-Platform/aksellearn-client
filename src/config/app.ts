/**
 * Global Application Configuration
 *
 * Use this file to toggle features and configure global application behavior.
 */
export const APP_CONFIG = {
  name: 'Aksellearn',
  description: 'Core Learning App',

  // Feature Toggles (Show/Hide entire modules)
  features: {
    articles: false, // Default hidden as requested
    revenue: true,
    users: true,
    organizations: true,
    courses: true,
    quizzes: true,

    gallery: true,
    settings: true,
    analytics: false,
    exports: false,
    platform: false,
    more_projects: false,
  },

  // Contact & Support
  contact: {
    email: 'hello@madacore.id',
    whatsapp: '6281234567890', // Format: country code + number (no +)
    address: 'Jakarta, Indonesia',
    socials: {
      instagram: 'https://instagram.com/madacore',
      linkedin: 'https://linkedin.com/company/madacore',
      youtube: 'https://youtube.com/@madacore',
    },
  },

  // Appearance
  appearance: {
    defaultTheme: 'light',
    sidebarCollapsible: 'icon' as const,
  },
}

export type AppConfig = typeof APP_CONFIG
