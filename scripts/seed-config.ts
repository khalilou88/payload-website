// scripts/seed-config.ts
import { faker } from '@faker-js/faker'

export interface SeedConfig {
  users: number
  categories: number
  posts: number
  pages: number
  media: number
  enableRelatedContent: boolean
  createDrafts: boolean
  locales?: string[]
}

export const DEFAULT_SEED_CONFIG: SeedConfig = {
  users: 5,
  categories: 8,
  posts: 15,
  pages: 8,
  media: 20,
  enableRelatedContent: true,
  createDrafts: true,
  locales: ['en'], // Add more locales if using i18n
}

// Content templates for different types of posts
export const CONTENT_TEMPLATES = {
  blog: {
    titles: [
      'Getting Started with {technology}',
      'Advanced {topic} Techniques',
      'The Future of {industry}',
      'How to Master {skill}',
      'Common Mistakes in {field}',
      'Best Practices for {domain}',
    ],
    categories: ['Technology', 'Development', 'Tutorials'],
  },
  news: {
    titles: [
      'Breaking: {event} Announced',
      'Industry Update: {topic}',
      'New Trends in {field}',
      'Market Analysis: {industry}',
    ],
    categories: ['News', 'Business', 'Industry'],
  },
  opinion: {
    titles: [
      'Why {topic} Matters',
      'The Problem with {issue}',
      'In Defense of {concept}',
      'Rethinking {approach}',
    ],
    categories: ['Opinion', 'Analysis'],
  },
}

// Layout block templates
export const LAYOUT_BLOCK_TEMPLATES = {
  hero: () => ({
    blockType: 'hero',
    headline: faker.lorem.sentence({ min: 3, max: 8 }),
    description: faker.lorem.paragraph(),
    actions: [
      {
        link: {
          type: 'custom',
          url: faker.internet.url(),
          label: faker.helpers.arrayElement([
            'Get Started',
            'Learn More',
            'Contact Us',
            'Try Now',
            'Discover',
          ]),
        },
      },
    ],
  }),

  content: () => ({
    blockType: 'content',
    content: {
      root: {
        type: 'root',
        children: [
          {
            type: 'heading',
            tag: 'h2',
            children: [{ text: faker.lorem.sentence({ min: 3, max: 6 }) }],
          },
          ...Array.from({ length: faker.number.int({ min: 2, max: 4 }) }, () => ({
            type: 'paragraph',
            children: [{ text: faker.lorem.paragraph() }],
          })),
          {
            type: 'list',
            listType: 'bullet',
            children: Array.from({ length: faker.number.int({ min: 3, max: 5 }) }, () => ({
              type: 'listitem',
              children: [{ text: faker.lorem.sentence() }],
            })),
          },
        ],
      },
    },
  }),

  mediaBlock: () => ({
    blockType: 'mediaBlock',
    caption: faker.lorem.sentence(),
    enableLink: faker.datatype.boolean(),
    ...(faker.datatype.boolean() && {
      link: {
        type: 'custom',
        url: faker.internet.url(),
        label: 'View Details',
      },
    }),
  }),

  callToAction: () => ({
    blockType: 'callToAction',
    headline: faker.lorem.sentence({ min: 3, max: 6 }),
    description: faker.lorem.paragraph(),
    actions: [
      {
        link: {
          type: 'custom',
          url: faker.internet.url(),
          label: faker.helpers.arrayElement([
            'Get Started Today',
            'Contact Sales',
            'Learn More',
            'Try Free Trial',
            'Request Demo',
          ]),
        },
      },
    ],
  }),

  archive: () => ({
    blockType: 'archive',
    introContent: {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ text: faker.lorem.paragraph() }],
          },
        ],
      },
    },
    populateBy: 'collection',
    relationTo: 'posts',
    limit: faker.number.int({ min: 6, max: 12 }),
    selectedDocs: [],
    populatedDocs: [],
    populatedDocsTotal: 0,
  }),
}

// SEO templates
export const SEO_TEMPLATES = {
  generateMetaTitle: (title: string) => {
    const suffixes = [
      '| Your Company',
      '- Professional Services',
      '| Expert Solutions',
      '- Learn More',
    ]
    return `${title} ${faker.helpers.arrayElement(suffixes)}`
  },

  generateMetaDescription: (type: 'page' | 'post' | 'category') => {
    const templates = {
      page: [
        'Discover {topic} solutions with our expert team. Get started today.',
        'Learn about {topic} and how it can benefit your business.',
        'Professional {topic} services tailored to your needs.',
      ],
      post: [
        'Read our latest insights on {topic}. Expert analysis and practical tips.',
        'Comprehensive guide to {topic}. Everything you need to know.',
        'Stay updated with the latest {topic} trends and best practices.',
      ],
      category: [
        'Browse all {topic} content. Articles, guides, and resources.',
        'Explore our {topic} section for expert insights and tutorials.',
        'Everything about {topic} in one place. Start learning today.',
      ],
    }

    const template = faker.helpers.arrayElement(templates[type])
    const topic = faker.lorem.word()
    return template.replace('{topic}', topic)
  },

  generateKeywords: (primary: string) => {
    const related = faker.lorem.words(4).split(' ')
    return [primary, ...related, faker.company.buzzPhrase(), faker.hacker.noun()].join(', ')
  },
}

// User role templates
export const USER_ROLES = [
  {
    role: 'admin',
    permissions: ['all'],
    count: 1,
  },
  {
    role: 'editor',
    permissions: ['edit', 'publish'],
    count: 2,
  },
  {
    role: 'author',
    permissions: ['create', 'edit_own'],
    count: 3,
  },
]

// Media categories for better organization
export const MEDIA_CATEGORIES = [
  'hero-images',
  'blog-featured',
  'thumbnails',
  'icons',
  'backgrounds',
  'team-photos',
  'product-images',
  'logos',
]

export default {
  DEFAULT_SEED_CONFIG,
  CONTENT_TEMPLATES,
  LAYOUT_BLOCK_TEMPLATES,
  SEO_TEMPLATES,
  USER_ROLES,
  MEDIA_CATEGORIES,
}
