// NEW: API route for fetching client users
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from "next/server";

// Helper function to check admin role
async function isAdmin() {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) return false;

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

    return profile?.role === 'admin';
}

// GET: Fetch all users with 'client' role
export async function GET() {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email, avatar_url, role')
        .eq('role', 'client');
    
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform data to match the simpler User type for selectors
    const clients = data.map(c => ({
        id: c.id,
        name: c.full_name,
        email: c.email,
        avatarUrl: c.avatar_url,
        role: c.role
    }));
    
    return NextResponse.json({ clients });
}
