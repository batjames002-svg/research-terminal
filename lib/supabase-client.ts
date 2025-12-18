import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { config, validateConfig } from './config'

let supabaseClient: ReturnType<typeof createSupabaseClient> | null = null
let configValidated = false

export function isSupabaseConfigured(): boolean {
  const isValid = validateConfig(config)

  if (!isValid && typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.error('[Supabase] Configuration check failed. Missing or invalid environment variables.')
    console.error('[Supabase] Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your .env file.')
    console.error('[Supabase] Current values:', {
      urlExists: !!config.supabaseUrl,
      keyExists: !!config.supabaseAnonKey,
    })
  }

  return isValid
}

export function createClient() {
  if (typeof window === 'undefined') {
    throw new Error('Supabase client can only be created on the client side')
  }

  if (supabaseClient) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Supabase] Returning existing client instance')
    }
    return supabaseClient
  }

  if (!configValidated) {
    if (!isSupabaseConfigured()) {
      const errorMessage =
        'Missing Supabase configuration. ' +
        'Environment variables NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set. ' +
        'If you just updated your .env file, you need to restart the development server completely. ' +
        'See SUPABASE_SETUP.md for setup instructions.'

      console.error('[Supabase]', errorMessage)
      throw new Error(errorMessage)
    }
    configValidated = true
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[Supabase] Creating new client instance with URL:', config.supabaseUrl.substring(0, 30) + '...')
  }

  try {
    supabaseClient = createSupabaseClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })

    if (process.env.NODE_ENV === 'development') {
      console.log('[Supabase] Client created successfully')
    }

    return supabaseClient
  } catch (error) {
    console.error('[Supabase] Failed to create client:', error)
    throw new Error(`Failed to initialize Supabase client: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
