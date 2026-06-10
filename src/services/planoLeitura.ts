import { supabase } from './supabase';

export async function calcularPassagemDoDia(grupo: any): Promise<string> {
  const { data: livros } = await supabase
    .from('livros_biblia')
    .select('*')
    .order('ordem');

  if (!livros) return 'Gênesis 1';

  if (grupo.tipo_plano === 'personalizado') {
    return grupo.passagem_personalizada || 'Gênesis 1';
  }

  const dataInicio = new Date(grupo.data_inicio);
  const hoje = new Date();
  const diffDias = Math.floor((hoje.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24));
  const capituloAtual = (diffDias * (grupo.capitulos_por_dia || 1));

  if (grupo.tipo_plano === 'anual') {
    // Plano anual: 3 capítulos por dia para cobrir a Bíblia em 1 ano
    const totalCapitulos = livros.reduce((acc, l) => acc + l.total_capitulos, 0);
    const capDoDia = capituloAtual % totalCapitulos;
    return encontrarPassagem(livros, capDoDia, grupo.capitulos_por_dia || 1);
  }

  // Plano sequencial
  const totalCapitulos = livros.reduce((acc, l) => acc + l.total_capitulos, 0);
  const capDoDia = capituloAtual % totalCapitulos;
  return encontrarPassagem(livros, capDoDia, grupo.capitulos_por_dia || 1);
}

function encontrarPassagem(livros: any[], capituloGlobal: number, quantCaps: number): string {
  let acumulado = 0;

  for (const livro of livros) {
    if (capituloGlobal < acumulado + livro.total_capitulos) {
      const capInicio = capituloGlobal - acumulado + 1;
      const capFim = Math.min(capInicio + quantCaps - 1, livro.total_capitulos);

      if (capInicio === capFim) {
        return `${livro.nome} ${capInicio}`;
      }
      return `${livro.nome} ${capInicio}-${capFim}`;
    }
    acumulado += livro.total_capitulos;
  }

  return 'Gênesis 1';
}