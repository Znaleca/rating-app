const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
    const [k, ...v] = line.split('=');
    if (k && v.length > 0) acc[k.trim()] = v.join('=').trim().replace(/^"|"$/g, '');
    return acc;
}, {});

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
    // Just select * to see what columns exist in profiles
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    console.log("Profiles data:", data);
    console.log("Profiles error:", error);
}

test();
