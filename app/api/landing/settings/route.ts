import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createAdminClient()
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (key) {
      const { data, error } = await supabase
        .from('landing_page_settings')
        .select('key, value')
        .eq('key', key)
        .single()
      if (error) {
        console.error('Error fetching setting:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }
      // OPTIMIZATION: Add cache headers for better performance (5 minutes cache)
      return NextResponse.json({ success: true, data }, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        }
      })
    } else {
      const { data, error } = await supabase
        .from('landing_page_settings')
        .select('key, value')
      if (error) {
        console.error('Error fetching settings:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }
      // Convert array to object with key as property name
      const settingsObject = data?.reduce((acc: any, item: any) => {
        acc[item.key] = item.value
        return acc
      }, {}) || {}
      console.log('Settings fetched from DB:', settingsObject)
      return NextResponse.json({ success: true, data: settingsObject }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      })
    }
  } catch (error: any) {
    console.error('Error in GET /api/landing/settings:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createAdminClient()
    const body = await request.json()
    const { key, value, description } = body

    if (!key) {
      return NextResponse.json({ success: false, error: 'Key is required' }, { status: 400 })
    }

    console.log(`Updating setting: ${key} = ${value}`)

    // Upsert setting
    const { data, error } = await supabase
      .from('landing_page_settings')
      .upsert({
        key,
        value: value !== null && value !== undefined ? String(value) : '',
        description: description || null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'key'
      })
      .select()
      .single()

    if (error) {
      console.error('Error updating setting:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    console.log(`Setting ${key} updated successfully:`, data)
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Error in PUT /api/landing/settings:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
