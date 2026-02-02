import { createClient } from '@supabase/supabase-js'
//Conexión con Supabase
const supabaseUrl = 'https://olnyuwvhnwemejkkxwnr.supabase.co' 
//Llave de Supabase
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sbnl1d3ZobndlbWVqa2t4d25yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NTI0MjAsImV4cCI6MjA4NTIyODQyMH0.Ym-UEglwsAn2V7EisH1MIPjP7RkEoTa1ztxB--eO05s'

export const supabase = createClient(supabaseUrl, supabaseKey)