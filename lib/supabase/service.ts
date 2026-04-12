import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Service-role client — bypasses Row Level Security.
 * Use ONLY for server-side actions that need to read public data
 * across all users (e.g. user search, public profiles).
 * Never expose this client or the service key to the browser.
 */
export function createServiceClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}
