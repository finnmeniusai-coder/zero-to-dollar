import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const envFile = fs.readFileSync('.env.local', 'utf8')
const env = Object.fromEntries(
  envFile.split('\n')
    .filter(line => line.includes('='))
    .map(line => line.split('='))
)

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL.trim(),
  env.SUPABASE_SERVICE_ROLE_KEY.trim()
)

async function check() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1)
  if (error) {
    console.error('Error fetching profiles:', error)
  } else {
    console.log('Profiles table exists. Sample row data:', data[0] || 'empty')
  }
}

check()
