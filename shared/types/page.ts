export interface PageComponent {
  id: string
  type: string
  content: any
  order: number
}

export interface Page {
  id: string
  slug: string
  titleTag: string
  metaDescription?: string
  canonicalUrl?: string
  h1Title: string
  bodyText?: string
  jsonLd?: any
  featuredImage?: string
  featuredImageAlt?: string
  components: PageComponent[]
  createdAt: string
  updatedAt: string
}
