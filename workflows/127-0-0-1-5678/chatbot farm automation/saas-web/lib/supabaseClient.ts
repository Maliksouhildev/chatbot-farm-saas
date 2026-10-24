import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nxovnidenzneydcovmnh.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54b3ZuaWRlbnpuZXlkY292bW5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyNzcxNzYsImV4cCI6MjEwNDg1MzE3Nn0.Tpu75w9otfIch4co_RNZtJ4bFIdV_ytulUeSrJ49uZ8';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54b3ZuaWRlbnpuZXlkY292bW5oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTI3NzE3NiwiZXhwIjoyMTA0ODUzMTc2fQ.iwOaeENgTbXx53OJkaapM7y0PUg7BLnQAvG2-aGtAQ8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Admin client with service_role key to manage cross-tenant API routes and incoming webhooks
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);
