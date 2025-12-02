export interface MessageTemplate {
  id: string
  title: string
  content: string
  category: string
  createdAt: number
  updatedAt: number
}

export const DEFAULT_CATEGORIES = [
  'General',
  'Code',
  'Writing',
  'Analysis',
  'Research',
  'Creative',
  'Business',
  'Education',
  'Other',
]
