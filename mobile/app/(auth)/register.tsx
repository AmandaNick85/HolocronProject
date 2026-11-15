import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Acesso } from '../../components/Acesso';
import { Botao } from '../../components/Botao';
import { CampoTexto } from '../../components/Campos';
import { fonte } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { useTema } from '../../hooks/useTema';

export default function Cadastro() {
  const tema = useTema();
  const { registrar } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function submeter() {
    setErro(null);
    if (nome.trim().length < 2) {
      setErro('Diga como quer ser chamado.');
      return;
    }
    if (!email.includes('@') || senha.length < 8) {
      setErro('Use um e-mail válido e uma senha com pelo menos 8 caracteres.');
      return;
    }
    setEnviando(true);
    try {
      await registrar(nome.trim(), email.trim(), senha);
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não foi possível criar a conta.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Acesso
      rodape={
        <Link href="/login" asChild>
          <Pressable accessibilityRole="link">
            <Text style={[estilos.link, { color: tema.tinta }]}>Já tenho conta</Text>
          </Pressable>
        </Link>
      }
    >
      <CampoTexto rotulo="Nome" valor={nome} onChangeText={setNome} autoCapitalize="words" />
      <CampoTexto
        rotulo="E-mail"
        valor={email}
        onChangeText={setEmail}
        teclado="email-address"
        autoCapitalize="none"
      />
      <CampoTexto rotulo="Senha" valor={senha} onChangeText={setSenha} seguro autoCapitalize="none" />
      {erro ? <Text style={[estilos.erro, { color: tema.perigo }]}>{erro}</Text> : null}
      <Botao rotulo={enviando ? 'Criando…' : 'Criar conta'} onPress={() => void submeter()} desabilitado={enviando} />
    </Acesso>
  );
}

const estilos = StyleSheet.create({
  erro: {
    fontFamily: fonte.texto,
    fontSize: 16,
  },
  link: {
    fontFamily: fonte.textoForte,
    fontSize: 16,
    textAlign: 'center',
  },
});
