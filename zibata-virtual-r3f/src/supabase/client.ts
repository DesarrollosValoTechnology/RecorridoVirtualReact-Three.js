// src/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

// Reemplaza esto con tus URLs y Keys reales del dashboard de Supabase
const supabaseUrl = 'https://mvijmapubyeeuuomnbse.supabase.co';
const supabaseKey = 'sb_publishable_oKbghcF9ObHakIwqWgOYTQ_S35bQCRG';

export const supabase = createClient(supabaseUrl, supabaseKey);