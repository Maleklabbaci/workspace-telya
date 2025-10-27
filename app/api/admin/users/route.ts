import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from "next/server";

// Helper function to check admin role
async function isAdmin(request: Request) {
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

// GET: Fetch all users
export async function GET(request: Request) {
    if (!(await isAdmin(request))) {
        return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const { data: usersData, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch profiles to get roles
    const { data: profilesData, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, role, avatar_url');

    if (profilesError) {
        return NextResponse.json({ error: profilesError.message }, { status: 500 });
    }

    const profilesMap = new Map(profilesData.map(p => [p.id, p]));

    const combinedUsers = usersData.users.map(user => {
        // FIX: Add type assertion to resolve 'unknown' type error
        const profile = profilesMap.get(user.id) as { full_name: string | null; role: string | null; avatar_url: string | null; } | undefined;
        return {
            id: user.id,
            email: user.email,
            created_at: user.created_at,
            full_name: profile?.full_name || 'N/A',
            role: profile?.role || 'N/A',
            avatar_url: profile?.avatar_url || null,
        }
    });

    return NextResponse.json({ users: combinedUsers });
}


// POST: Create a new user
export async function POST(request: Request) {
    if (!(await isAdmin(request))) {
        return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }
    
    const { fullName, email, password, role } = await request.json();

    if (!fullName || !email || !password || !role) {
        return NextResponse.json({ error: 'Tous les champs sont requis.' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirme l'email pour l'admin
        user_metadata: {
            full_name: fullName,
            role: role,
        },
    });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // The trigger will create the profile, but let's ensure it's created immediately
    // This is a workaround in case the trigger is slow or fails
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
            id: data.user.id,
            full_name: fullName,
            role: role,
        });

    if (profileError) {
      // Log the error but don't fail the request as the user was created
      console.error("Error creating profile:", profileError.message);
    }


    return NextResponse.json({ user: data.user }, { status: 201 });
}