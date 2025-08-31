// scripts/cleanup.js
import payload from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

// ES module compatibility
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
})

const COLLECTIONS_TO_CLEAN = ['users', 'posts', 'pages', 'categories', 'media', 'redirects']

const cleanup = async () => {
  try {
    console.log('🧹 Starting database cleanup...')

    // Initialize Payload with config
    await payload.init({
      secret: process.env.PAYLOAD_SECRET,
      configPath: path.resolve(__dirname, '../payload.config.ts'),
      local: true,
    })

    console.log('✅ Payload initialized')

    // Confirm cleanup
    if (process.env.NODE_ENV === 'production') {
      console.log('❌ Cleanup is disabled in production environment')
      process.exit(1)
    }

    // Clean each collection
    for (const collection of COLLECTIONS_TO_CLEAN) {
      try {
        console.log(`🗑️  Cleaning ${collection} collection...`)

        // Get all documents in the collection
        const docs = await payload.find({
          collection,
          limit: 1000, // Adjust if you have more than 1000 docs
        })

        // Delete all documents
        for (const doc of docs.docs) {
          try {
            await payload.delete({
              collection,
              id: doc.id,
            })
          } catch (deleteError) {
            console.log(`⚠️ Could not delete ${collection} ${doc.id}: ${deleteError.message}`)
          }
        }

        console.log(`✅ Cleaned ${docs.docs.length} documents from ${collection}`)
      } catch (error) {
        console.log(`⚠️ Could not clean ${collection}: ${error.message}`)
      }
    }

    // Reset globals to empty state
    const globals = ['header', 'footer']
    for (const globalSlug of globals) {
      try {
        await payload.updateGlobal({
          slug: globalSlug,
          data: {
            navItems: [],
          },
        })
        console.log(`✅ Reset ${globalSlug} global`)
      } catch (error) {
        console.log(`⚠️ Could not reset ${globalSlug} global: ${error.message}`)
      }
    }

    console.log('\n🎉 Database cleanup completed!')
    console.log('💡 You can now run the seed script to populate fresh data.')
  } catch (error) {
    console.error('❌ Cleanup failed:', error)
    throw error
  } finally {
    process.exit(0)
  }
}

// Run cleanup
cleanup().catch((error) => {
  console.error('❌ Fatal error during cleanup:', error)
  process.exit(1)
})
