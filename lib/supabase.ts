import { createClient } from '@supabase/supabase-js'

// Estas credenciales las vamos a reemplazar en el siguiente paso
const supabaseUrl = 'https://xmibzuegctjldsoktlia.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtaWJ6dWVnY3RqbGRzb2t0bGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ5NjQ0NzAsImV4cCI6MjExMDU0MDQ3MH0.be4fFknORofbnbxDUpNYt4EXcBUJS6sdod_DjM848eA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)