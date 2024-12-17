import xml2js from 'xml2js'
import fs from 'fs'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function importPIESData(xmlFilePath) {
  try {
    const parser = new xml2js.Parser({ explicitArray: true })
    const xmlData = fs.readFileSync(xmlFilePath, 'utf8')
    
    const result = await parser.parseStringPromise(xmlData)
    
    if (!result?.PIES?.Items?.[0]?.Item) {
      throw new Error('No items found in PIES data')
    }

    const items = result.PIES.Items[0].Item
    let processed = 0
    let errors = []

    for (const item of items) {
      try {
        const partNumber = item.PartNumber?.[0]
        const brand = item.BrandLabel?.[0]
        
        if (!partNumber || !brand) {
          throw new Error('Missing required fields')
        }

        const attributes = (item.ProductAttributes?.[0]?.ProductAttribute || [])
          .map(attr => ({
            name: attr.$?.AttributeID,
            value: attr._,
            language: attr.$?.LanguageCode || 'EN'
          }))
          .filter(attr => attr.name && attr.value) // Filter out invalid attributes

        // Create or update product with attributes
        const product = await prisma.product.upsert({
          where: { partNumber },
          create: {
            partNumber,
            brand,
            attributes: {
              create: attributes
            }
          },
          update: {
            brand,
            attributes: {
              deleteMany: {}, // Remove old attributes
              create: attributes
            }
          },
          include: {
            attributes: true
          }
        })

        processed++
      } catch (error) {
        errors.push({
          partNumber: item.PartNumber?.[0],
          error: error.message
        })
      }
    }

    return {
      message: `Processed ${processed} items (${errors.length} errors)`,
      debug: {
        totalItems: items.length,
        processed,
        errors: errors.slice(0, 5) // Show first 5 errors
      },
      success: true
    }
  } catch (error) {
    return {
      error: error.message,
      debug: {
        error: error.message,
        stack: error.stack
      },
      success: false
    }
  } finally {
    await prisma.$disconnect()
  }
}

export async function importACESData(xmlFilePath) {
  // Your ACES import logic here
}