import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import { PrismaClient } from '@prisma/client'
import xml2js from 'xml2js'
import fs from 'fs'

const prisma = new PrismaClient()

async function importPIESData(xmlFilePath) {
  try {
    const debugInfo = {
      step1: 'Starting import',
    }
    
    const parser = new xml2js.Parser()
    const xmlData = fs.readFileSync(xmlFilePath, 'utf8')
    debugInfo.step2 = 'File read successfully'
    
    const result = await parser.parseStringPromise(xmlData)
    debugInfo.step3 = {
      hasResult: !!result,
      topLevelKeys: Object.keys(result || {}),
      hasPIES: !!result?.PIES,
      hasItems: !!result?.PIES?.Items
    }
    
    const items = result?.PIES?.Items?.[0]?.Item || []
    debugInfo.step4 = `Found ${items?.length || 0} items`

    return {
      message: `Successfully processed items`,
      debug: debugInfo
    }
  } catch (error) {
    return {
      error: error.message,
      debug: error.stack
    }
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    
    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'No file uploaded',
        debug: 'File missing from form data'
      })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const piesTempPath = path.join(process.cwd(), 'tmp', 'pies.xml')
    await writeFile(piesTempPath, buffer)
    
    const result = await importPIESData(piesTempPath)

    return NextResponse.json({ 
      success: true,
      ...result
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      debug: error.stack
    })
  }
} 