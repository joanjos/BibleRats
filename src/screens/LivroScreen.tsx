import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

export default function LivroScreen({ route, navigation }: any) {
  const { livro } = route.params;
  const capitulos = Array.from({ length: livro.capitulos }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.voltar}>← Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{livro.nome}</Text>
      <Text style={styles.subtitle}>Selecione um capítulo</Text>

      <FlatList
        data={capitulos}
        keyExtractor={(item) => item.toString()}
        numColumns={5}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.capBtn}
            onPress={() => navigation.navigate('Capitulo', { livro, capitulo: item })}
          >
            <Text style={styles.capTexto}>{item}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  voltar: { color: '#1B4F8A', fontSize: 16, marginTop: 48, marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1B4F8A', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 24 },
  capBtn: { flex: 1, margin: 4, aspectRatio: 1, backgroundColor: '#EEF4FB', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  capTexto: { fontSize: 16, fontWeight: 'bold', color: '#1B4F8A' },
});