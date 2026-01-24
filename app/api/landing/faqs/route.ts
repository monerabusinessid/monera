import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createAdminClient()
    // OPTIMIZATION: Select only needed fields
    const { data, error } = await supabase
      .from('landing_faqs')
      .select('id, question, answer, display_order, is_active')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching FAQs:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // OPTIMIZATION: Add cache headers for better performance
    return NextResponse.json({ success: true, data }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      }
    })
  } catch (error: any) {
    console.error('Error in GET /api/landing/faqs:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createAdminClient()
    const body = await request.json()
    const { question, answer, display_order } = body

    const { data, error } = await supabase
      .from('landing_faqs')
      .insert({
        question,
        answer,
        display_order: display_order || 0,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating FAQ:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Error in POST /api/landing/faqs:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createAdminClient()
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required for update' }, { status: 400 })
    }

    // Remove id from updates if it exists
    delete updates.id

    const { data, error } = await supabase
      .from('landing_faqs')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating FAQ:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('Error in PUT /api/landing/faqs:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createAdminClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('landing_faqs')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting FAQ:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in DELETE /api/landing/faqs:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
