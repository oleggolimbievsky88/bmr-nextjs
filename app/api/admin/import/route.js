import { NextResponse } from 'next/server'
import { importPIESData, importACESData } from '@/lib/importXML'
import { writeFile } from 'fs/promises'
import path from 'path'
import fs from 'fs'

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

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      debug: error.stack
    })
  }
} 