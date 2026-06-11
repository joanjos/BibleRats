import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Image } from 'react-native';
import { useState } from 'react';
import { getLivros } from '../services/bibliaApi';

const LIVROS = getLivros();

export default function BibliaScreen({ navigation }: any) {
  const [busca, setBusca] = useState('');

  const livrosFiltrados = LIVROS.filter(l =>
    l.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const AT = livrosFiltrados.filter((_, i) => LIVROS.indexOf(livrosFiltrados[i]) < 39);
  const NT = livrosFiltrados.filter((_, i) => LIVROS.indexOf(livrosFiltrados[i]) >= 39);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.tituloContainer}>
          <Image source={require('../../assets/bible.png')} style={styles.tituloIcone} />
          <Text style={styles.title}>Bíblia</Text>
        </View>
      </View>

      <TextInput
        style={styles.busca}
        placeholder="Buscar livro..."
        value={busca}
        onChangeText={setBusca}
      />

      <FlatList
        data={[
          { tipo: 'secao', texto: 'Antigo Testamento' },
          ...LIVROS.slice(0, 39).filter(l => l.nome.toLowerCase().includes(busca.toLowerCase())).map(l => ({ tipo: 'livro', ...l })),
          { tipo: 'secao', texto: 'Novo Testamento' },
          ...LIVROS.slice(39).filter(l => l.nome.toLowerCase().includes(busca.toLowerCase())).map(l => ({ tipo: 'livro', ...l })),
        ]}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }: any) => {
          if (item.tipo === 'secao') {
            return <Text style={styles.secao}>{item.texto}</Text>;
          }
          return (
            <TouchableOpacity
              style={styles.livroItem}
              onPress={() => navigation.navigate('Livro', { livro: item })}
            >
              <Text style={styles.livroNome}>{item.nome}</Text>
              <Text style={styles.livroCapitulos}>{item.capitulos} cap.</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff', paddingBottom: 80 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1B4F8A' },
  busca: { borderWidth: 1, borderColor: '#C9DEF4', borderRadius: 8, padding: 12, fontSize: 15, marginBottom: 16 },
  secao: { fontSize: 13, fontWeight: 'bold', color: '#3A7FC1', marginTop: 16, marginBottom: 8, textTransform: 'uppercase' },
  livroItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEF4FB' },
  livroNome: { fontSize: 16, color: '#333' },
  livroCapitulos: { fontSize: 13, color: '#999' },
  header: { alignItems: 'center', marginTop: 48, marginBottom: 16 },
  tituloContainer: { flexDirection: 'row', alignItems: 'center' },
  tituloIcone: { width: 22, height: 22, marginRight: 8, tintColor: '#1B4F8A' },
});