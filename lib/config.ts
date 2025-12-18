export interface AppConfig {
  supabaseUrl: string
  supabaseAnonKey: string
}

function getConfig(): AppConfig {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('[Config] Environment variables loaded:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      urlPrefix: supabaseUrl.substring(0, 30),
      keyPrefix: supabaseAnonKey.substring(0, 20),
    })
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
  }
}

export function validateConfig(config: AppConfig): boolean {
  const isValid = !!(
    config.supabaseUrl &&
    config.supabaseAnonKey &&
    !config.supabaseUrl.includes('your-project-url-here') &&
    !config.supabaseAnonKey.includes('your-anon-key-here') &&
    config.supabaseUrl.startsWith('https://')
  )

  if (!isValid && typeof window !== 'undefined') {
    console.error('[Config] Validation failed:', {
      hasUrl: !!config.supabaseUrl,
      hasKey: !!config.supabaseAnonKey,
      urlStartsWithHttps: config.supabaseUrl.startsWith('https://'),
      urlIsPlaceholder: config.supabaseUrl.includes('your-project-url-here'),
      keyIsPlaceholder: config.supabaseAnonKey.includes('your-anon-key-here'),
    })
  }

  return isValid
}

export const config = getConfig()
