import { createClient } from '@supabase/supabase-js';

// Suporta tanto Vite (import.meta.env) quanto Next.js (process.env)
function getEnvVar(key: string): string | undefined {
  // No servidor (Next.js)
  if (typeof window === 'undefined') {
    return process.env[key] || process.env[`NEXT_PUBLIC_${key}`];
  }
  // No cliente - tenta Vite primeiro, depois Next.js
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const viteEnv = (import.meta as any).env;
    return viteEnv[key] || viteEnv[`VITE_${key}`];
  }
  // Fallback para Next.js no cliente
  return process.env[`NEXT_PUBLIC_${key}`];
}

const supabaseUrl = getEnvVar('SUPABASE_URL') || getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('SUPABASE_ANON_KEY') || getEnvVar('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl) {
  console.error('❌ SUPABASE_URL ou VITE_SUPABASE_URL não está definida nas variáveis de ambiente');
  throw new Error('SUPABASE_URL é obrigatória');
}

if (!supabaseAnonKey) {
  console.error('❌ SUPABASE_ANON_KEY ou VITE_SUPABASE_ANON_KEY não está definida nas variáveis de ambiente');
  throw new Error('SUPABASE_ANON_KEY é obrigatória');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

