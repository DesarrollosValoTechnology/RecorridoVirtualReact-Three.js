// src/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

// Reemplaza esto con tus URLs y Keys reales del dashboard de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

