import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useState } from 'react';
import { supabase } from '../services/supabase';

const GENEROS = [
  { valor: 'masculino', label: 'Masculino' },
  { valor: 'feminino', label: 'Feminino' }
];

export default function CadastroScreen({ navigation }: any) {
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [genero, setGenero] = useState('');
  const [igreja, setIgreja] = useState('');
  const [loading, setLoading] = useState(false);

  function formatarData(texto: string) {
    const numeros = texto.replace(/\D/g, '');
    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 4) return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
    return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4, 8)}`;
  }

  function validarData(data: string): boolean {
    const partes = data.split('/');
    if (partes.length !== 3) return false;
    const dia = parseInt(partes[0]);
    const mes = parseInt(partes[1]);
    const ano = parseInt(partes[2]);
    if (isNaN(dia) || isNaN(mes) || isNaN(ano)) return false;
    if (dia < 1 || dia > 31) return false;
    if (mes < 1 || mes > 12) return false;
    if (ano < 1900 || ano > new Date().getFullYear()) return false;
    return true;
  }

  async function handleCadastro() {
    if (nomeCompleto.trim().length < 3) {
      alert('Digite seu nome completo.');
      return;
    }
    if (nomeUsuario.trim().length < 3) {
      alert('O nome de usuário precisa ter pelo menos 3 caracteres.');
      return;
    }
    if (!email.includes('@')) {
      alert('Digite um e-mail válido.');
      return;
    }
    if (senha.length < 6) {
      alert('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (senha !== confirmarSenha) {
      alert('As senhas não coincidem.');
      return;
    }
    if (dataNascimento && !validarData(dataNascimento)) {
      alert('Digite uma data de nascimento válida (DD/MM/AAAA).');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({ email, password: senha });

    if (error) {
      alert('Erro ao cadastrar: ' + error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      let dataNascimentoISO = null;
      if (dataNascimento && validarData(dataNascimento)) {
        const partes = dataNascimento.split('/');
        dataNascimentoISO = `${partes[2]}-${partes[1]}-${partes[0]}`;
      }

      await supabase.from('perfis').upsert({
        id: data.user.id,
        nome_completo: nomeCompleto.trim(),
        nome_usuario: nomeUsuario.trim(),
        data_nascimento: dataNascimentoISO,
        genero: genero || null,
        igreja: igreja.trim() || null,
      });
    }

    setLoading(false);
    alert('Cadastro realizado com sucesso! 🎉 Faça login para continuar.');
    navigation.goBack();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.voltar}>← Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Criar Conta</Text>
      <Text style={styles.subtitle}>Preencha seus dados para começar</Text>

      <Text style={styles.label}>Nome completo *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: João Melone"
        value={nomeCompleto}
        onChangeText={setNomeCompleto}
      />

      <Text style={styles.label}>Nome de usuário *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: joaomelone"
        value={nomeUsuario}
        onChangeText={setNomeUsuario}
        autoCapitalize="none"
      />

      <Text style={styles.label}>E-mail *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: joao@email.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Senha *</Text>
      <TextInput
        style={styles.input}
        placeholder="Mínimo de 6 caracteres"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />

      <Text style={styles.label}>Confirmar senha *</Text>
      <TextInput
        style={styles.input}
        placeholder="Repita a senha"
        value={confirmarSenha}
        onChangeText={setConfirmarSenha}
        secureTextEntry
      />

      <Text style={styles.label}>Data de nascimento</Text>
      <TextInput
        style={styles.input}
        placeholder="DD/MM/AAAA"
        value={dataNascimento}
        onChangeText={(t) => setDataNascimento(formatarData(t))}
        keyboardType="numeric"
        maxLength={10}
      />

      <Text style={styles.label}>Gênero</Text>
      <View style={styles.generoContainer}>
        {GENEROS.map((g) => (
          <TouchableOpacity
            key={g.valor}
            style={[styles.generoBtn, genero === g.valor && styles.generoBtnSelecionado]}
            onPress={() => setGenero(g.valor)}
          >
            <Text style={[styles.generoBtnTexto, genero === g.valor && styles.generoBtnTextoSelecionado]}>
              {g.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Igreja / Comunidade</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Igreja Cristã Casa Favorita"
        value={igreja}
        onChangeText={setIgreja}
      />

      <Text style={styles.obrigatorio}>* Campos obrigatórios</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#1B4F8A" style={{ marginTop: 24 }} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleCadastro}>
          <Text style={styles.buttonText}>Criar Conta</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#fff', flexGrow: 1 },
  voltar: { color: '#1B4F8A', fontSize: 16, marginTop: 48, marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1B4F8A', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#666', marginBottom: 24 },
  label: { fontSize: 15, fontWeight: '600', marginBottom: 8, color: '#333' },
  input: { borderWidth: 1, borderColor: '#C9DEF4', borderRadius: 8, padding: 12, fontSize: 15, marginBottom: 16 },
  generoContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  generoBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#C9DEF4' },
  generoBtnSelecionado: { backgroundColor: '#1B4F8A', borderColor: '#1B4F8A' },
  generoBtnTexto: { fontSize: 14, color: '#333' },
  generoBtnTextoSelecionado: { color: '#fff', fontWeight: 'bold' },
  obrigatorio: { fontSize: 12, color: '#999', marginBottom: 16 },
  button: { backgroundColor: '#1B4F8A', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8, marginBottom: 32 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});