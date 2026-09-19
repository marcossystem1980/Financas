const SUPABASE_URL = "https://srctbdvmfezsvwruhyrt.supabase.co";

const SUPABASE_KEY = "sb_publishable_HB2sd80wVN0HlBwImY0qkA_PQmXU6kd";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

console.log("✅ Supabase inicializado!");