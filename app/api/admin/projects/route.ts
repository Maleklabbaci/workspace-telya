// NEW: API route for managing projects
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

// GET: Fetch all projects with client names
export async function GET() {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const { data, error } = await supabaseAdmin
        .from('projects')
        .select(`
            id,
            name,
            status,
            progress,
            client:profiles (id, full_name)
        `);
    
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform data to match front-end types
    const projects = data.map(p => ({
        id: p.id,
        name: p.name,
        status: p.status,
        progress: p.progress,
        client: {
            id: (p.client as any).id,
            name: (p.client as any).full_name,
        },
        members: [] // Placeholder
    }));
    
    return NextResponse.json({ projects });
}

// POST: Create a new project
export async function POST(request: Request) {
    if (!(await isAdmin())) {
        return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }
    
    const { name, client_id } = await request.json();

    if (!name || !client_id) {
        return NextResponse.json({ error: 'Le nom du projet et le client sont requis.' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
        .from('projects')
        .insert([{ name, client_id: client_id }])
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ project: data }, { status: 201 });
}