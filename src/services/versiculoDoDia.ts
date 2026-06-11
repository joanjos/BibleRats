import { getCapitulo } from './bibliaApi';

// Lista reduzida com IDs que funcionam na api
const LIVROS_SEGUROS = [
  { id: 'genesis', nome: 'Gênesis', capitulos: 50 },
  { id: 'exodus', nome: 'Êxodo', capitulos: 40 },
  { id: 'psalms', nome: 'Salmos', capitulos: 150 },
  { id: 'proverbs', nome: 'Provérbios', capitulos: 31 },
  { id: 'isaiah', nome: 'Isaías', capitulos: 66 },
  { id: 'matthew', nome: 'Mateus', capitulos: 28 },
  { id: 'mark', nome: 'Marcos', capitulos: 16 },
  { id: 'luke', nome: 'Lucas', capitulos: 24 },
  { id: 'john', nome: 'João', capitulos: 21 },
  { id: 'acts', nome: 'Atos', capitulos: 28 },
  { id: 'romans', nome: 'Romanos', capitulos: 16 },
  { id: 'philippians', nome: 'Filipenses', capitulos: 4 },
  { id: 'hebrews', nome: 'Hebreus', capitulos: 13 },
  { id: 'james', nome: 'Tiago', capitulos: 5 },
  { id: 'revelation', nome: 'Apocalipse', capitulos: 22 },
];

function getSementeDoDia(): number {
  const hoje = new Date();
  return hoje.getFullYear() * 10000 + (hoje.getMonth() + 1) * 100 + hoje.getDate();
}

function numeroAleatorioComSemente(semente: number, max: number): number {
  const x = Math.sin(semente) * 10000;
  return Math.floor((x - Math.floor(x)) * max);
}

export async function getVersiculoDoDia() {
  const semente = getSementeDoDia();

  const indiceLivro = numeroAleatorioComSemente(semente, LIVROS_SEGUROS.length);
  const livro = LIVROS_SEGUROS[indiceLivro];

  const indiceCapitulo = numeroAleatorioComSemente(semente + 1, livro.capitulos) + 1;

  try {
    const data = await getCapitulo(livro.id, indiceCapitulo);
    const versiculos = data.verses || [];

    if (versiculos.length === 0) throw new Error('Sem versículos');

    const indiceVersiculo = numeroAleatorioComSemente(semente + 2, versiculos.length);
    const versiculo = versiculos[indiceVersiculo];

    return {
      referencia: `${livro.nome} ${indiceCapitulo}:${versiculo.verse}`,
      texto: versiculo.text.trim(),
    };
  } catch {
    return {
      referencia: 'João 3:16',
      texto: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.',
    };
  }
}

export function getSaudacao() {
  const hora = new Date().getHours();
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}