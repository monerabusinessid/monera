import { NextRequest } from 'next/server'
import { createSkillSchema } from '@/lib/validations'
import { requireAuth, successResponse, handleApiError } from '@/lib/api-utils'
import { getSupabaseClient } from '@/lib/supabase/server-helper'


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const category = searchParams.get('category')

    const supabase = await getSupabaseClient()
    
    let skillsQuery = supabase
      .from('skills')
      .select('*')
      .order('name', { ascending: true })
      .limit(100)

    // Apply filters
    if (query) {
      skillsQuery = skillsQuery.ilike('name', `%${query}%`)
    }
    if (category) {
      skillsQuery = skillsQuery.eq('category', category)
    }

    const { data: skills, error } = await skillsQuery

    if (error) {
      console.error('Error fetching skills:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      return handleApiError(error)
    }

    console.log('Fetched skills:', skills?.length || 0, 'skills')
    console.log('Skills data:', JSON.stringify(skills?.slice(0, 3), null, 2)) // Log first 3 for debugging
    
    // Ensure we return skills in the correct format
    const formattedSkills = (skills || []).map((skill: any) => ({
      id: skill.id,
      name: skill.name,
      category: skill.category,
    }))
    
    return successResponse(formattedSkills)
  } catch (error) {
    return handleApiError(error)
  }
}

export const POST = requireAuth(async (req, userId) => {
  try {
    const body = await req.json()
    const validatedData = createSkillSchema.parse(body)

    const supabase = await getSupabaseClient()

    // Check if skill already exists
    const { data: existingSkill } = await supabase
      .from('skills')
      .select('*')
      .eq('name', validatedData.name)
      .single()

    if (existingSkill) {
      return successResponse(existingSkill)
    }

    // Create new skill
    const { data: skill, error } = await supabase
      .from('skills')
      .insert({
        name: validatedData.name,
        category: validatedData.category || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating skill:', error)
      return handleApiError(error)
    }

    return successResponse(skill, 201)
  } catch (error) {
    return handleApiError(error)
  }
})
