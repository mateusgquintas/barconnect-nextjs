import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Cliente Supabase com Service Role (acesso admin)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Cliente normal para validar admin
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      email, 
      password, 
      name, 
      username,
      role,
      adminUsername,
      adminPassword 
    } = body;

    // Validação básica
    if (!email || !password || !name || !username || !role) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios: name, username, email, password, role' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Validar username (sem espaços e caracteres especiais)
    const usernameRegex = /^[a-zA-Z0-9._-]+$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { error: 'Nome de usuário deve conter apenas letras, números, ponto, hífen ou underscore' },
        { status: 400 }
      );
    }

    if (!adminUsername || !adminPassword) {
      return NextResponse.json(
        { error: 'Credenciais de administrador são obrigatórias' },
        { status: 401 }
      );
    }

    // 1. Validar credenciais do admin
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: adminUsername.includes('@') ? adminUsername : `${adminUsername}@barconnect.com`,
      password: adminPassword
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: 'Credenciais de administrador inválidas' },
        { status: 401 }
      );
    }

    // Verificar se o usuário autenticado é admin
    const { data: adminProfile } = await supabase
      .from('users')
      .select('role')
      .eq('auth_user_id', authData.user.id)
      .single();

    if (!adminProfile || adminProfile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Apenas administradores podem criar usuários' },
        { status: 403 }
      );
    }

    // 2. Verificar se email/username já existe
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .or(`username.eq.${username},email.eq.${email}`)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Nome de usuário ou email já existe' },
        { status: 400 }
      );
    }

    // 3. Criar usuário no Supabase Auth
    const { data: newAuthUser, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirmar email
      user_metadata: {
        name: name
      }
    });

    if (createAuthError || !newAuthUser.user) {
      console.error('Erro ao criar usuário no Supabase Auth:', createAuthError);
      return NextResponse.json(
        { error: createAuthError?.message || 'Erro ao criar usuário no Supabase Auth' },
        { status: 400 }
      );
    }

    const authUserId = newAuthUser.user.id;

    // 4. Criar perfil em public.users
    const { data: newProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        username: username,
        email: email,
        name: name,
        role: role,
        active: true,
        auth_user_id: authUserId,
        password: '', // Senha gerenciada pelo Supabase Auth
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      console.error('Erro ao criar perfil:', profileError);
      
      // Rollback: deletar do auth.users se falhar
      try {
        await supabaseAdmin.auth.admin.deleteUser(authUserId);
      } catch (rollbackError) {
        console.error('Erro no rollback:', rollbackError);
      }
      
      return NextResponse.json(
        { error: profileError.message || 'Erro ao criar perfil do usuário' },
        { status: 400 }
      );
    }

    // 5. Sucesso!
    return NextResponse.json({
      success: true,
      user: {
        id: newProfile.id,
        username: newProfile.username,
        email: newProfile.email,
        name: newProfile.name,
        role: newProfile.role
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Erro inesperado ao criar usuário:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
