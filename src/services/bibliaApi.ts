const BASE_URL = 'https://bible-api.com';
const TRADUCAO = 'almeida';

const LIVROS = [
  { id: 'genesis', nome: 'Gênesis', capitulos: 50 },
  { id: 'exodus', nome: 'Êxodo', capitulos: 40 },
  { id: 'leviticus', nome: 'Levítico', capitulos: 27 },
  { id: 'numbers', nome: 'Números', capitulos: 36 },
  { id: 'deuteronomy', nome: 'Deuteronômio', capitulos: 34 },
  { id: 'joshua', nome: 'Josué', capitulos: 24 },
  { id: 'judges', nome: 'Juízes', capitulos: 21 },
  { id: 'ruth', nome: 'Rute', capitulos: 4 },
  { id: '1+samuel', nome: '1 Samuel', capitulos: 31 },
  { id: '2+samuel', nome: '2 Samuel', capitulos: 24 },
  { id: '1+kings', nome: '1 Reis', capitulos: 22 },
  { id: '2+kings', nome: '2 Reis', capitulos: 25 },
  { id: '1+chronicles', nome: '1 Crônicas', capitulos: 29 },
  { id: '2+chronicles', nome: '2 Crônicas', capitulos: 36 },
  { id: 'ezra', nome: 'Esdras', capitulos: 10 },
  { id: 'nehemiah', nome: 'Neemias', capitulos: 13 },
  { id: 'esther', nome: 'Ester', capitulos: 10 },
  { id: 'job', nome: 'Jó', capitulos: 42 },
  { id: 'psalms', nome: 'Salmos', capitulos: 150 },
  { id: 'proverbs', nome: 'Provérbios', capitulos: 31 },
  { id: 'ecc', nome: 'Eclesiastes', capitulos: 12 },
  { id: 'song+of+solomon', nome: 'Cantares', capitulos: 8 },
  { id: 'isaiah', nome: 'Isaías', capitulos: 66 },
  { id: 'jeremiah', nome: 'Jeremias', capitulos: 52 },
  { id: 'lamentations', nome: 'Lamentações', capitulos: 5 },
  { id: 'ezekiel', nome: 'Ezequiel', capitulos: 48 },
  { id: 'daniel', nome: 'Daniel', capitulos: 12 },
  { id: 'hosea', nome: 'Oseias', capitulos: 14 },
  { id: 'joel', nome: 'Joel', capitulos: 3 },
  { id: 'amos', nome: 'Amós', capitulos: 9 },
  { id: 'obadiah', nome: 'Obadias', capitulos: 1 },
  { id: 'jonah', nome: 'Jonas', capitulos: 4 },
  { id: 'micah', nome: 'Miquéias', capitulos: 7 },
  { id: 'nahum', nome: 'Naum', capitulos: 3 },
  { id: 'habakkuk', nome: 'Habacuque', capitulos: 3 },
  { id: 'zephaniah', nome: 'Sofonias', capitulos: 3 },
  { id: 'haggai', nome: 'Ageu', capitulos: 2 },
  { id: 'zechariah', nome: 'Zacarias', capitulos: 14 },
  { id: 'malachi', nome: 'Malaquias', capitulos: 4 },
  { id: 'matthew', nome: 'Mateus', capitulos: 28 },
  { id: 'mark', nome: 'Marcos', capitulos: 16 },
  { id: 'luke', nome: 'Lucas', capitulos: 24 },
  { id: 'john', nome: 'João', capitulos: 21 },
  { id: 'acts', nome: 'Atos', capitulos: 28 },
  { id: 'romans', nome: 'Romanos', capitulos: 16 },
  { id: '1+corinthians', nome: '1 Coríntios', capitulos: 16 },
  { id: '2+corinthians', nome: '2 Coríntios', capitulos: 13 },
  { id: 'galatians', nome: 'Gálatas', capitulos: 6 },
  { id: 'ephesians', nome: 'Efésios', capitulos: 6 },
  { id: 'philippians', nome: 'Filipenses', capitulos: 4 },
  { id: 'colossians', nome: 'Colossenses', capitulos: 4 },
  { id: '1+thessalonians', nome: '1 Tessalonicenses', capitulos: 5 },
  { id: '2+thessalonians', nome: '2 Tessalonicenses', capitulos: 3 },
  { id: '1+timothy', nome: '1 Timóteo', capitulos: 6 },
  { id: '2+timothy', nome: '2 Timóteo', capitulos: 4 },
  { id: 'titus', nome: 'Tito', capitulos: 3 },
  { id: 'philemon', nome: 'Filemon', capitulos: 1 },
  { id: 'hebrews', nome: 'Hebreus', capitulos: 13 },
  { id: 'james', nome: 'Tiago', capitulos: 5 },
  { id: '1+peter', nome: '1 Pedro', capitulos: 5 },
  { id: '2+peter', nome: '2 Pedro', capitulos: 3 },
  { id: '1+john', nome: '1 João', capitulos: 5 },
  { id: '2+john', nome: '2 João', capitulos: 1 },
  { id: '3+john', nome: '3 João', capitulos: 1 },
  { id: 'jude', nome: 'Judas', capitulos: 1 },
  { id: 'revelation', nome: 'Apocalipse', capitulos: 22 },
];

export function getLivros() {
  return LIVROS;
}

export async function getCapitulo(livroId: string, capitulo: number) {
  const response = await fetch(
    `${BASE_URL}/${livroId}+${capitulo}?translation=${TRADUCAO}`
  );
  return response.json();
}