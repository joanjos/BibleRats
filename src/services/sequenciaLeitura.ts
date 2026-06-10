import { getLivros } from './bibliaApi';

const LIVROS = getLivros();

// Converte "Gênesis 1" para índice global
export function passagemParaIndice(passagem: string): number {
  let indiceGlobal = 0;

  for (const livro of LIVROS) {
    const nomeNormalizado = livro.nome.toLowerCase();
    const passagemNormalizada = passagem.toLowerCase();

    if (passagemNormalizada.startsWith(nomeNormalizado)) {
      const resto = passagem.slice(livro.nome.length).trim();
      const capitulo = parseInt(resto) || 1;
      return indiceGlobal + capitulo - 1;
    }
    indiceGlobal += livro.capitulos;
  }

  return 0;
}

// Converte índice global para "Gênesis 1"
export function indiceParaPassagem(indice: number): { livro: any; capitulo: number } | null {
  let acumulado = 0;

  for (const livro of LIVROS) {
    if (indice < acumulado + livro.capitulos) {
      const capitulo = indice - acumulado + 1;
      return { livro, capitulo };
    }
    acumulado += livro.capitulos;
  }

  return null;
}

export function proximaPassagem(passagemAtual: string): { livro: any; capitulo: number } | null {
  const indiceAtual = passagemParaIndice(passagemAtual);
  return indiceParaPassagem(indiceAtual + 1);
}