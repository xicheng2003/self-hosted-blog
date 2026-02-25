import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch all settings
export async function GET() {
  try {
    const configs: { id: string; key: string; value: string }[] = await prisma.siteConfig.findMany()

    // Convert array to object
    const settings: Record<string, string> = {}
    configs.forEach((config: { key: string; value: string }) => {
      settings[config.key] = config.value
    })

    return NextResponse.json({
      site_title: settings.site_title || '',
      site_description: settings.site_description || '',
      author_name: settings.author_name || '',
      author_email: settings.author_email || '',
    })
  } catch (error) {
    console.error('Fetch settings error:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// POST - Save settings
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { site_title, site_description, author_name, author_email } = body

    // Upsert each setting
    const settings = [
      { key: 'site_title', value: site_title || '' },
      { key: 'site_description', value: site_description || '' },
      { key: 'author_name', value: author_name || '' },
      { key: 'author_email', value: author_email || '' },
    ]

    for (const setting of settings) {
      await prisma.siteConfig.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: { key: setting.key, value: setting.value },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Save settings error:', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
