import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Helper functions to mimic Prisma API
export const db = {
  user: {
    findUnique: async ({ where }: any) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq(Object.keys(where)[0], Object.values(where)[0])
        .single()
      
      if (error) return null
      return data
    },
    findMany: async ({ where, include, skip, take }: any = {}) => {
      let query = supabase.from('profiles').select('*')
      
      if (where) {
        Object.entries(where).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }
      
      if (skip) query = query.range(skip, skip + (take || 10) - 1)
      if (take) query = query.limit(take)
      
      const { data, error } = await query
      return data || []
    },
    create: async ({ data }: any) => {
      const { data: result, error } = await supabase
        .from('profiles')
        .insert(data)
        .select()
        .single()
      
      if (error) throw error
      return result
    },
    update: async ({ where, data }: any) => {
      const { data: result, error } = await supabase
        .from('profiles')
        .update(data)
        .eq(Object.keys(where)[0], Object.values(where)[0])
        .select()
        .single()
      
      if (error) throw error
      return result
    },
    delete: async ({ where }: any) => {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq(Object.keys(where)[0], Object.values(where)[0])
      
      if (error) throw error
      return { success: true }
    },
    count: async ({ where }: any = {}) => {
      let query = supabase.from('profiles').select('*', { count: 'exact', head: true })
      
      if (where) {
        Object.entries(where).forEach(([key, value]) => {
          query = query.eq(key, value as any)
        })
      }
      
      const { count } = await query
      return count || 0
    }
  },
  
  job: {
    findMany: async ({ where, include, skip, take, orderBy }: any = {}) => {
      let query = supabase.from('jobs').select('*, company:companies(*), recruiter:profiles(*)')
      
      if (where) {
        Object.entries(where).forEach(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            // Handle complex queries
            if ('contains' in value) {
              query = query.ilike(key, `%${value.contains}%`)
            }
          } else {
            query = query.eq(key, value)
          }
        })
      }
      
      if (skip) query = query.range(skip, skip + (take || 10) - 1)
      if (take) query = query.limit(take)
      
      if (orderBy) {
        const orderKey = Object.keys(orderBy)[0]
        const orderDir = Object.values(orderBy)[0] as string
        query = query.order(orderKey, { ascending: orderDir === 'asc' })
      }
      
      const { data, error } = await query
      return data || []
    },
    findUnique: async ({ where, include }: any) => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, company:companies(*), recruiter:profiles(*)')
        .eq(Object.keys(where)[0], Object.values(where)[0])
        .single()
      
      if (error) return null
      return data
    },
    create: async ({ data }: any) => {
      const { data: result, error } = await supabase
        .from('jobs')
        .insert(data)
        .select()
        .single()
      
      if (error) throw error
      return result
    },
    update: async ({ where, data }: any) => {
      const { data: result, error } = await supabase
        .from('jobs')
        .update(data)
        .eq(Object.keys(where)[0], Object.values(where)[0])
        .select()
        .single()
      
      if (error) throw error
      return result
    },
    count: async ({ where }: any = {}) => {
      let query = supabase.from('jobs').select('*', { count: 'exact', head: true })
      
      if (where) {
        Object.entries(where).forEach(([key, value]) => {
          query = query.eq(key, value as any)
        })
      }
      
      const { count } = await query
      return count || 0
    }
  },
  
  application: {
    findMany: async ({ where, include, skip, take }: any = {}) => {
      let query = supabase.from('applications').select('*, job:jobs(*), candidate:profiles(*)')
      
      if (where) {
        Object.entries(where).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }
      
      if (skip) query = query.range(skip, skip + (take || 10) - 1)
      if (take) query = query.limit(take)
      
      const { data, error } = await query
      return data || []
    },
    create: async ({ data }: any) => {
      const { data: result, error } = await supabase
        .from('applications')
        .insert(data)
        .select()
        .single()
      
      if (error) throw error
      return result
    },
    update: async ({ where, data }: any) => {
      const { data: result, error } = await supabase
        .from('applications')
        .update(data)
        .eq(Object.keys(where)[0], Object.values(where)[0])
        .select()
        .single()
      
      if (error) throw error
      return result
    }
  },
  
  company: {
    findMany: async ({ skip, take }: any = {}) => {
      let query = supabase.from('companies').select('*')
      
      if (skip) query = query.range(skip, skip + (take || 10) - 1)
      if (take) query = query.limit(take)
      
      const { data, error } = await query
      return data || []
    },
    findUnique: async ({ where }: any) => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq(Object.keys(where)[0], Object.values(where)[0])
        .single()
      
      if (error) return null
      return data
    },
    create: async ({ data }: any) => {
      const { data: result, error } = await supabase
        .from('companies')
        .insert(data)
        .select()
        .single()
      
      if (error) throw error
      return result
    },
    update: async ({ where, data }: any) => {
      const { data: result, error } = await supabase
        .from('companies')
        .update(data)
        .eq(Object.keys(where)[0], Object.values(where)[0])
        .select()
        .single()
      
      if (error) throw error
      return result
    },
    delete: async ({ where }: any) => {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq(Object.keys(where)[0], Object.values(where)[0])
      
      if (error) throw error
      return { success: true }
    },
    count: async ({ where }: any = {}) => {
      let query = supabase.from('companies').select('*', { count: 'exact', head: true })
      
      if (where) {
        Object.entries(where).forEach(([key, value]) => {
          query = query.eq(key, value as any)
        })
      }
      
      const { count } = await query
      return count || 0
    }
  },
  
  skill: {
    findMany: async ({ where }: any = {}) => {
      let query = supabase.from('skills').select('*')
      
      if (where?.name?.contains) {
        query = query.ilike('name', `%${where.name.contains}%`)
      }
      
      const { data, error } = await query
      return data || []
    },
    create: async ({ data }: any) => {
      const { data: result, error } = await supabase
        .from('skills')
        .insert(data)
        .select()
        .single()
      
      if (error) throw error
      return result
    }
  },
  
  talentRequest: {
    findMany: async ({ where, skip, take }: any = {}) => {
      let query = supabase.from('talent_requests').select('*')
      
      if (where) {
        Object.entries(where).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }
      
      if (skip) query = query.range(skip, skip + (take || 10) - 1)
      if (take) query = query.limit(take)
      
      const { data, error } = await query
      return data || []
    },
    findUnique: async ({ where }: any) => {
      const { data, error } = await supabase
        .from('talent_requests')
        .select('*')
        .eq(Object.keys(where)[0], Object.values(where)[0])
        .single()
      
      if (error) return null
      return data
    },
    update: async ({ where, data }: any) => {
      const { data: result, error } = await supabase
        .from('talent_requests')
        .update(data)
        .eq(Object.keys(where)[0], Object.values(where)[0])
        .select()
        .single()
      
      if (error) throw error
      return result
    },
    delete: async ({ where }: any) => {
      const { error } = await supabase
        .from('talent_requests')
        .delete()
        .eq(Object.keys(where)[0], Object.values(where)[0])
      
      if (error) throw error
      return { success: true }
    },
    count: async ({ where }: any = {}) => {
      let query = supabase.from('talent_requests').select('*', { count: 'exact', head: true })
      
      if (where) {
        Object.entries(where).forEach(([key, value]) => {
          query = query.eq(key, value as any)
        })
      }
      
      const { count } = await query
      return count || 0
    }
  },
  
  candidateProfile: {
    findUnique: async ({ where, include }: any) => {
      const { data, error } = await supabase
        .from('talent_profiles')
        .select('*')
        .eq(Object.keys(where)[0], Object.values(where)[0])
        .single()
      
      if (error) return null
      return data
    },
    create: async ({ data }: any) => {
      const { data: result, error } = await supabase
        .from('talent_profiles')
        .insert(data)
        .select()
        .single()
      
      if (error) throw error
      return result
    },
    update: async ({ where, data }: any) => {
      const { data: result, error } = await supabase
        .from('talent_profiles')
        .update(data)
        .eq(Object.keys(where)[0], Object.values(where)[0])
        .select()
        .single()
      
      if (error) throw error
      return result
    },
    upsert: async ({ where, create, update }: any) => {
      const existing = await supabase
        .from('talent_profiles')
        .select('*')
        .eq(Object.keys(where)[0], Object.values(where)[0])
        .single()
      
      if (existing.data) {
        const { data: result, error } = await supabase
          .from('talent_profiles')
          .update(update)
          .eq(Object.keys(where)[0], Object.values(where)[0])
          .select()
          .single()
        
        if (error) throw error
        return result
      } else {
        const { data: result, error } = await supabase
          .from('talent_profiles')
          .insert(create)
          .select()
          .single()
        
        if (error) throw error
        return result
      }
    },
    count: async ({ where }: any = {}) => {
      let query = supabase.from('talent_profiles').select('*', { count: 'exact', head: true })
      
      if (where) {
        Object.entries(where).forEach(([key, value]) => {
          query = query.eq(key, value as any)
        })
      }
      
      const { count } = await query
      return count || 0
    }
  },
  
  recruiterProfile: {
    findUnique: async ({ where }: any) => {
      const { data, error } = await supabase
        .from('recruiter_profiles')
        .select('*')
        .eq(Object.keys(where)[0], Object.values(where)[0])
        .single()
      
      if (error) return null
      return data
    },
    create: async ({ data }: any) => {
      const { data: result, error } = await supabase
        .from('recruiter_profiles')
        .insert(data)
        .select()
        .single()
      
      if (error) throw error
      return result
    },
    update: async ({ where, data }: any) => {
      const { data: result, error } = await supabase
        .from('recruiter_profiles')
        .update(data)
        .eq(Object.keys(where)[0], Object.values(where)[0])
        .select()
        .single()
      
      if (error) throw error
      return result
    },
    upsert: async ({ where, create, update }: any) => {
      const existing = await supabase
        .from('recruiter_profiles')
        .select('*')
        .eq(Object.keys(where)[0], Object.values(where)[0])
        .single()
      
      if (existing.data) {
        const { data: result, error } = await supabase
          .from('recruiter_profiles')
          .update(update)
          .eq(Object.keys(where)[0], Object.values(where)[0])
          .select()
          .single()
        
        if (error) throw error
        return result
      } else {
        const { data: result, error } = await supabase
          .from('recruiter_profiles')
          .insert(create)
          .select()
          .single()
        
        if (error) throw error
        return result
      }
    },
    count: async ({ where }: any = {}) => {
      let query = supabase.from('recruiter_profiles').select('*', { count: 'exact', head: true })
      
      if (where) {
        Object.entries(where).forEach(([key, value]) => {
          query = query.eq(key, value as any)
        })
      }
      
      const { count } = await query
      return count || 0
    }
  },
  
  companyDocument: {
    findMany: async ({ where, skip, take }: any = {}) => {
      let query = supabase.from('company_documents').select('*')
      
      if (where) {
        Object.entries(where).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }
      
      if (skip) query = query.range(skip, skip + (take || 10) - 1)
      if (take) query = query.limit(take)
      
      const { data, error } = await query
      return data || []
    },
    create: async ({ data }: any) => {
      const { data: result, error } = await supabase
        .from('company_documents')
        .insert(data)
        .select()
        .single()
      
      if (error) throw error
      return result
    }
  }
}

export default db
