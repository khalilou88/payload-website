import { faker } from '@faker-js/faker'
import payload from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

// ES module compatibility
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config({
  path: path.resolve(__dirname, '../.env'),
})

// Seed data configuration
const SEED_CONFIG = {
  users: 5,
  categories: 8,
  posts: 15,
  pages: 8,
  media: 20,
}

// Helper function to create realistic content
const createRichTextContent = () => {
  const paragraphs = faker.number.int({ min: 2, max: 5 })
  return Array.from({ length: paragraphs }, () => ({
    type: 'paragraph',
    children: [
      {
        text: faker.lorem.paragraphs(1, '\n\n'),
      },
    ],
  }))
}

// Helper function to create layout blocks
const createLayoutBlocks = () => {
  const blockTypes = ['hero', 'content', 'mediaBlock', 'callToAction', 'archive']
  const numBlocks = faker.number.int({ min: 2, max: 5 })

  return Array.from({ length: numBlocks }, () => {
    const blockType = faker.helpers.arrayElement(blockTypes)

    switch (blockType) {
      case 'hero':
        return {
          blockType: 'hero',
          headline: faker.lorem.sentence({ min: 3, max: 8 }),
          description: faker.lorem.paragraph(),
          media: null, // Will be populated with actual media later
        }
      case 'content':
        return {
          blockType: 'content',
          content: createRichTextContent(),
        }
      case 'mediaBlock':
        return {
          blockType: 'mediaBlock',
          media: null, // Will be populated with actual media later
          caption: faker.lorem.sentence(),
        }
      case 'callToAction':
        return {
          blockType: 'callToAction',
          headline: faker.lorem.sentence({ min: 3, max: 6 }),
          description: faker.lorem.paragraph(),
          link: {
            type: 'custom',
            url: faker.internet.url(),
            label: faker.lorem.words(2),
          },
        }
      case 'archive':
        return {
          blockType: 'archive',
          populateBy: 'collection',
          relationTo: 'posts',
          limit: faker.number.int({ min: 3, max: 12 }),
        }
      default:
        return {
          blockType: 'content',
          content: createRichTextContent(),
        }
    }
  })
}

// Seed functions
const seedUsers = async () => {
  console.log('🌱 Seeding users...')
  const users = []

  // Create admin user first
  const adminUser = await payload.create({
    collection: 'users',
    data: {
      email: 'admin@example.com',
      password: 'admin123!',
      name: 'Admin User',
      roles: ['admin'],
    },
  })
  users.push(adminUser)
  console.log(`✅ Created admin user: ${adminUser.email}`)

  // Create additional users
  for (let i = 0; i < SEED_CONFIG.users - 1; i++) {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()
    const user = await payload.create({
      collection: 'users',
      data: {
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        password: 'password123!',
        name: `${firstName} ${lastName}`,
        roles: [faker.helpers.arrayElement(['editor', 'author'])],
      },
    })
    users.push(user)
    console.log(`✅ Created user: ${user.email}`)
  }

  return users
}

const seedCategories = async () => {
  console.log('🌱 Seeding categories...')
  const categories = []

  const categoryNames = [
    'Technology',
    'Design',
    'Development',
    'Business',
    'Marketing',
    'Tutorials',
    'News',
    'Opinion',
  ]

  for (const name of categoryNames.slice(0, SEED_CONFIG.categories)) {
    const category = await payload.create({
      collection: 'categories',
      data: {
        title: name,
        slug: faker.helpers.slugify(name).toLowerCase(),
        description: faker.lorem.sentence(),
      },
    })
    categories.push(category)
    console.log(`✅ Created category: ${category.title}`)
  }

  return categories
}

const seedMedia = async () => {
  console.log('🌱 Seeding media...')
  const mediaItems = []

  // Create placeholder images using a service like Picsum
  const imageCategories = ['nature', 'technology', 'business', 'abstract', 'people']

  for (let i = 0; i < SEED_CONFIG.media; i++) {
    const width = faker.helpers.arrayElement([800, 1200, 1600])
    const height = faker.helpers.arrayElement([600, 800, 1200])
    const category = faker.helpers.arrayElement(imageCategories)

    try {
      // Note: In a real scenario, you'd want to actually upload files
      // This is a simplified version that creates media records
      const media = await payload.create({
        collection: 'media',
        data: {
          alt: faker.lorem.sentence(),
          caption: faker.lorem.sentence(),
          filename: `${faker.lorem.slug()}-${i + 1}.jpg`,
          mimeType: 'image/jpeg',
          filesize: faker.number.int({ min: 50000, max: 2000000 }),
          width: width,
          height: height,
          // Note: You would typically upload actual files here
          // For demo purposes, we're creating placeholder URLs
          url: `https://picsum.photos/${width}/${height}?random=${i + 1}`,
        },
      })
      mediaItems.push(media)
      console.log(`✅ Created media: ${media.filename}`)
    } catch (error) {
      console.log(`⚠️ Skipped media creation (may require actual file upload)`)
    }
  }

  return mediaItems
}

const seedPosts = async (categories, users, mediaItems) => {
  console.log('🌱 Seeding posts...')
  const posts = []

  for (let i = 0; i < SEED_CONFIG.posts; i++) {
    const title = faker.lorem.sentence({ min: 3, max: 8 })
    const publishedDate = faker.date.between({
      from: new Date('2023-01-01'),
      to: new Date(),
    })

    const post = await payload.create({
      collection: 'posts',
      data: {
        title: title,
        slug: faker.helpers.slugify(title).toLowerCase(),
        meta: {
          title: title,
          description: faker.lorem.sentence({ min: 10, max: 20 }),
          keywords: faker.lorem.words(5),
        },
        hero: {
          type: 'default',
          headline: title,
          description: faker.lorem.paragraph(),
          media: mediaItems.length > 0 ? faker.helpers.arrayElement(mediaItems).id : null,
        },
        content: createRichTextContent(),
        categories: categories.length > 0 ? [faker.helpers.arrayElement(categories).id] : [],
        publishedOn: publishedDate,
        authors: users.length > 0 ? [faker.helpers.arrayElement(users).id] : [],
        populatedAuthors: [],
        _status: faker.helpers.arrayElement(['published', 'draft']),
        enablePremiumContent: faker.datatype.boolean(),
        relatedPosts: [], // Will be populated after all posts are created
      },
    })
    posts.push(post)
    console.log(`✅ Created post: ${post.title}`)
  }

  return posts
}

const seedPages = async (mediaItems) => {
  console.log('🌱 Seeding pages...')
  const pages = []

  const pageTypes = [
    { title: 'About Us', slug: 'about' },
    { title: 'Services', slug: 'services' },
    { title: 'Contact', slug: 'contact' },
    { title: 'Privacy Policy', slug: 'privacy' },
    { title: 'Terms of Service', slug: 'terms' },
    { title: 'FAQ', slug: 'faq' },
    { title: 'Our Team', slug: 'team' },
    { title: 'Careers', slug: 'careers' },
  ]

  // Create Home page first
  const homePage = await payload.create({
    collection: 'pages',
    data: {
      title: 'Home',
      slug: 'home',
      meta: {
        title: 'Welcome to Our Website',
        description: 'Discover amazing content and services on our platform.',
        keywords: 'home, welcome, main',
      },
      hero: {
        type: 'default',
        headline: 'Welcome to Our Amazing Website',
        description: faker.lorem.paragraph(),
        media: mediaItems.length > 0 ? faker.helpers.arrayElement(mediaItems).id : null,
      },
      layout: createLayoutBlocks(),
      _status: 'published',
      publishedOn: new Date(),
    },
  })
  pages.push(homePage)
  console.log(`✅ Created page: ${homePage.title}`)

  // Create other pages
  for (const pageType of pageTypes.slice(0, SEED_CONFIG.pages - 1)) {
    const page = await payload.create({
      collection: 'pages',
      data: {
        title: pageType.title,
        slug: pageType.slug,
        meta: {
          title: pageType.title,
          description: faker.lorem.sentence({ min: 10, max: 20 }),
          keywords: faker.lorem.words(5),
        },
        hero: {
          type: 'default',
          headline: pageType.title,
          description: faker.lorem.paragraph(),
          media: mediaItems.length > 0 ? faker.helpers.arrayElement(mediaItems).id : null,
        },
        layout: createLayoutBlocks(),
        _status: faker.helpers.arrayElement(['published', 'draft']),
        publishedOn: faker.date.recent({ days: 30 }),
      },
    })
    pages.push(page)
    console.log(`✅ Created page: ${page.title}`)
  }

  return pages
}

const seedGlobals = async (mediaItems, pages) => {
  console.log('🌱 Seeding globals...')

  // Seed Header global
  try {
    await payload.updateGlobal({
      slug: 'header',
      data: {
        navItems: [
          {
            link: {
              type: 'reference',
              reference: {
                relationTo: 'pages',
                value: pages.find((p) => p.slug === 'home')?.id,
              },
              label: 'Home',
            },
          },
          {
            link: {
              type: 'reference',
              reference: {
                relationTo: 'pages',
                value: pages.find((p) => p.slug === 'about')?.id,
              },
              label: 'About',
            },
          },
          {
            link: {
              type: 'custom',
              url: '/posts',
              label: 'Blog',
            },
          },
          {
            link: {
              type: 'reference',
              reference: {
                relationTo: 'pages',
                value: pages.find((p) => p.slug === 'contact')?.id,
              },
              label: 'Contact',
            },
          },
        ],
      },
    })
    console.log('✅ Updated header global')
  } catch (error) {
    console.log(`⚠️ Could not update header global: ${error.message}`)
  }

  // Seed Footer global
  try {
    await payload.updateGlobal({
      slug: 'footer',
      data: {
        navItems: [
          {
            link: {
              type: 'reference',
              reference: {
                relationTo: 'pages',
                value: pages.find((p) => p.slug === 'privacy')?.id,
              },
              label: 'Privacy Policy',
            },
          },
          {
            link: {
              type: 'reference',
              reference: {
                relationTo: 'pages',
                value: pages.find((p) => p.slug === 'terms')?.id,
              },
              label: 'Terms of Service',
            },
          },
        ],
        socialLinks: [
          {
            platform: 'twitter',
            url: 'https://twitter.com/yourcompany',
          },
          {
            platform: 'linkedin',
            url: 'https://linkedin.com/company/yourcompany',
          },
          {
            platform: 'github',
            url: 'https://github.com/yourcompany',
          },
        ],
      },
    })
    console.log('✅ Updated footer global')
  } catch (error) {
    console.log(`⚠️ Could not update footer global: ${error.message}`)
  }
}

// Helper function to create redirects
const seedRedirects = async () => {
  console.log('🌱 Seeding redirects...')

  const redirects = [
    {
      from: '/old-blog',
      to: '/posts',
      type: '301',
    },
    {
      from: '/old-about',
      to: '/about',
      type: '301',
    },
    {
      from: '/contact-us',
      to: '/contact',
      type: '301',
    },
  ]

  for (const redirectData of redirects) {
    try {
      const redirect = await payload.create({
        collection: 'redirects',
        data: redirectData,
      })
      console.log(`✅ Created redirect: ${redirect.from} -> ${redirect.to}`)
    } catch (error) {
      console.log(`⚠️ Could not create redirect: ${error.message}`)
    }
  }
}

// Main seeding function
const seed = async () => {
  try {
    console.log('🚀 Starting Payload website seeding process...')
    console.log('📊 Seed configuration:', SEED_CONFIG)

    // Initialize Payload with config
    await payload.init({
      secret: process.env.PAYLOAD_SECRET,
      configPath: path.resolve(__dirname, '../src/payload.config.ts'),
      local: true,
    })

    console.log('✅ Payload initialized')

    // Check if database is already seeded
    const existingUsers = await payload.find({
      collection: 'users',
      limit: 1,
    })

    if (existingUsers.docs.length > 0) {
      console.log('⚠️ Database appears to already contain data.')
      console.log('⚠️ This seeding process will add to existing data.')
      console.log('⚠️ To start fresh, clear your database first.')
    }

    // Seed in order (respecting relationships)
    const users = await seedUsers()
    const categories = await seedCategories()
    const mediaItems = await seedMedia()
    const posts = await seedPosts(categories, users, mediaItems)
    const pages = await seedPages(mediaItems)

    // Update posts with related posts
    console.log('🔗 Updating post relationships...')
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i]
      const relatedPosts = faker.helpers
        .arrayElements(
          posts.filter((p) => p.id !== post.id),
          faker.number.int({ min: 0, max: 3 }),
        )
        .map((p) => p.id)

      if (relatedPosts.length > 0) {
        await payload.update({
          collection: 'posts',
          id: post.id,
          data: {
            relatedPosts: relatedPosts,
          },
        })
        console.log(`✅ Updated related posts for: ${post.title}`)
      }
    }

    // Seed globals
    await seedGlobals(mediaItems, pages)

    // Seed redirects
    await seedRedirects()

    // Final summary
    console.log('\n🎉 Seeding completed successfully!')
    console.log('📈 Summary:')
    console.log(`   👥 Users: ${users.length}`)
    console.log(`   📂 Categories: ${categories.length}`)
    console.log(`   📝 Posts: ${posts.length}`)
    console.log(`   📄 Pages: ${pages.length}`)
    console.log(`   🖼️  Media: ${mediaItems.length}`)
    console.log('\n🔐 Admin Login Details:')
    console.log('   Email: admin@example.com')
    console.log('   Password: admin123!')
    console.log('\n🌐 Visit http://localhost:3000/admin to access the admin panel')
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    throw error
  } finally {
    process.exit(0)
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⚠️ Seeding interrupted')
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

// Run the seeding
seed().catch((error) => {
  console.error('❌ Fatal error during seeding:', error)
  process.exit(1)
})
