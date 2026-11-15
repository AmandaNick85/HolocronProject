import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Acesso } from '../../components/Acesso';
import { Botao } from '../../components/Botao';
import { CampoTexto } from '../../components/Campos';
import { fonte } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { useTema } from '../../hooks/useTema';

export default function Login() {
  const tema = useTema();
  const { entrar } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function submeter() {
    setErro(null);
    if (!email.trim() || senha.length < 8) {
      setErro('Informe o e-mail e uma senha com pelo menos 8 caracteres.');
      return;
    }
    setEnviando(true);
    try {
      await entrar(email.trim(), senha);
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não foi possível entrar.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Acesso
      rodape={
        <Link href="/register" asChild>
          <Pressable accessibilityRole="link">
            <Text style={[estilos.link, { color: tema.tinta }]}>Criar uma conta</Text>
          </Pressable>
        </Link>
      }
    >
      <CampoTexto
        rotulo="E-mail"
        valor={email}
        onChangeText={setEmail}
        teclado="email-address"
        autoCapitalize="none"
      />
      <CampoTexto rotulo="Senha" valor={senha} onChangeText={setSenha} seguro autoCapitalize="none" />
      <Text style={[estilos.nota, { color: tema.textoSecundario }]}>
        A conta devolve um JWT. Ele fica no cofre do aparelho e segue nos pedidos do arquivo.
      </Text>
      {erro ? <Text style={[estilos.erro, { color: tema.perigo }]}>{erro}</Text> : null}
      <Botao rotulo={enviando ? 'Entrando…' : 'Entrar'} onPress={() => void submeter()} desabilitado={enviando} />
    </Acesso>
  );
}

const estilos = StyleSheet.create({
  erro: {
    fontFamily: fonte.texto,
    fontSize: 16,
  },
  nota: {
    fontFamily: fonte.texto,
    fontSize: 16,
    lineHeight: 22,
  },
  link: {
    fontFamily: fonte.textoForte,
    fontSize: 16,
    textAlign: 'center',
  },
});
