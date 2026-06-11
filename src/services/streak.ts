import { supabase } from './supabase';

export async function atualizarStreak(userId: string) {
  const { data: perfil } = await supabase
    .from('perfis')
    .select('streak_atual, streak_maximo, ultimo_checkin')
    .eq('id', userId)
    .single();

  if (!perfil) return;

  const hoje = new Date().toISOString().split('T')[0];
  const ontem = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Se fez check-in hoje, não faz nada
  if (perfil.ultimo_checkin === hoje) return;

  let novoStreak = 1;

  // Se fez check-in ontem, incrementa
  if (perfil.ultimo_checkin === ontem) {
    novoStreak = (perfil.streak_atual || 0) + 1;
  }

  const novoMaximo = Math.max(novoStreak, perfil.streak_maximo || 0);

  await supabase
    .from('perfis')
    .update({
      streak_atual: novoStreak,
      streak_maximo: novoMaximo,
      ultimo_checkin: hoje,
    })
    .eq('id', userId);

  return novoStreak;
}

export async function getStreak(userId: string) {
  const { data } = await supabase
    .from('perfis')
    .select('streak_atual, streak_maximo, ultimo_checkin')
    .eq('id', userId)
    .single();

  if (!data) return { streakAtual: 0, streakMaximo: 0 };

  // Verificar se o streak quebrou (não fez check-in ontem nem hoje)
  const hoje = new Date().toISOString().split('T')[0];
  const ontem = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const streakAtivo = data.ultimo_checkin === hoje || data.ultimo_checkin === ontem;

  return {
    streakAtual: streakAtivo ? (data.streak_atual || 0) : 0,
    streakMaximo: data.streak_maximo || 0,
  };
}