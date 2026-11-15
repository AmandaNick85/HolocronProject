import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Botao } from '../../components/Botao';
import { CampoTexto } from '../../components/Campos';
import { EstadoVazio } from '../../components/Estados';
import { Medidor } from '../../components/Medidor';
import { Moldura } from '../../components/Moldura';
import { comportamentoTeclado } from '../../constants/plataforma';
import { fonte } from '../../constants/theme';
import { useHolocron } from '../../contexts/HolocronContext';
import { useTema } from '../../hooks/useTema';
import { chaveRascunho } from '../../services/chaves';
import { apagar, gravar, ler } from '../../services/storage';
import { STATUS_ESTUDO, type StatusEstudo } from '../../types/starwars';

function unico(valor: string | string[] | undefined): string {
  if (Array.isArray(valor)) {
    return valor[0] ?? '';
  }
  return valor ?? '';
}

export default function EditarModal() {
  const tema = useTema();
  const { itemId: itemBruto } = useLocalSearchParams<{ itemId?: string | string[] }>();
  const itemId = unico(itemBruto);
  const { obter, atualizar, incrementar, carregando } = useHolocron();
  const arquivo = obter(itemId);
  const [status, setStatus] = useState<StatusEstudo>('Para Explorar');
  const [nota, setNota] = useState(0);
  const [anotacao, setAnotacao] = useState('');
  const [formularioPronto, setFormularioPronto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [avancando, setAvancando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const rascunhoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!arquivo || formularioPronto) {
      return;
    }
    let vivo = true;
    setStatus(arquivo.status);
    setNota(arquivo.nota);
    setAnotacao(arquivo.anotacao);
    void ler<{ texto?: string }>(chaveRascunho(itemId)).then((salvo) => {
      if (vivo && salvo && typeof salvo.texto === 'string') {
        setAnotacao(salvo.texto);
      }
      if (vivo) {
        setFormularioPronto(true);
      }
    });
    return () => {
      vivo = false;
    };
  }, [arquivo, formularioPronto, itemId]);

  function aoDigitar(valor: string) {
    setAnotacao(valor);
    if (rascunhoTimer.current) {
      clearTimeout(rascunhoTimer.current);
    }
    rascunhoTimer.current = setTimeout(() => {
      void gravar(chaveRascunho(itemId), { texto: valor });
    }, 500);
  }

  if (carregando || (arquivo && !formularioPronto)) {
    return (
      <SafeAreaView style={[estilos.tela, { backgroundColor: tema.fundo }]}>
        <ActivityIndicator color={tema.tinta} />
      </SafeAreaView>
    );
  }

  if (!arquivo) {
    return (
      <SafeAreaView style={[estilos.tela, { backgroundColor: tema.fundo }]}>
        <EstadoVazio mensagem="Esta entrada saiu do Holocron." />
        <Botao rotulo="Fechar" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  async function avancar() {
    setErro(null);
    setAvancando(true);
    try {
      await incrementar(itemId);
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não foi possível avançar o progresso.');
    } finally {
      setAvancando(false);
    }
  }

  async function guardar() {
    setErro(null);
    setEnviando(true);
    try {
      await atualizar(itemId, { status, nota, anotacao: anotacao.trim() });
      await apagar(chaveRascunho(itemId));
      router.back();
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não foi possível guardar o estudo.');
      setEnviando(false);
    }
  }

  return (
    <SafeAreaView style={[estilos.tela, { backgroundColor: tema.fundo }]} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView style={estilos.flex} behavior={comportamentoTeclado}>
        <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
          <Text style={[estilos.nome, { color: tema.texto }]} numberOfLines={2}>
            {arquivo.nome}
          </Text>
          <View style={estilos.medidor}>
            <Medidor valor={arquivo.progresso} tamanho={168} />
          </View>
          <Botao
            rotulo={arquivo.progresso >= 100 ? 'Leitura em 100%' : 'Avançar +25%'}
            onPress={() => void avancar()}
            desabilitado={avancando || enviando || arquivo.progresso >= 100}
          />
          <View style={estilos.grade}>
            {STATUS_ESTUDO.map((item) => {
              const ativo = status === item;
              return (
                <Pressable
                  key={item}
                  accessibilityRole="button"
                  accessibilityState={{ selected: ativo }}
                  onPress={() => setStatus(item)}
                  style={estilos.celula}
                >
                  <Moldura preenchido={ativo} semSombra>
                    <View style={estilos.celulaMiolo}>
                      <Text style={[estilos.celulaTexto, { color: ativo ? tema.tinta : tema.texto }]}>{item}</Text>
                    </View>
                  </Moldura>
                </Pressable>
              );
            })}
          </View>
          <Text style={[estilos.rotulo, { color: tema.textoSecundario }]}>Nota na lore</Text>
          <View style={estilos.notas}>
            {Array.from({ length: 11 }, (_, indice) => indice).map((valor) => {
              const ativa = nota === valor;
              return (
                <Pressable
                  key={valor}
                  accessibilityRole="button"
                  accessibilityLabel={`Nota ${valor}`}
                  accessibilityState={{ selected: ativa }}
                  onPress={() => setNota(valor)}
                  style={[
                    estilos.nota,
                    { borderColor: tema.tinta, backgroundColor: ativa ? tema.tinta : 'transparent' },
                  ]}
                >
                  <Text style={[estilos.notaTexto, { color: ativa ? tema.tintaSobre : tema.texto }]}>{valor}</Text>
                </Pressable>
              );
            })}
          </View>
          <CampoTexto rotulo="Anotação" valor={anotacao} onChangeText={aoDigitar} multiline />
          <Text style={[estilos.contador, { color: tema.textoSecundario }]}>{anotacao.length}/4000</Text>
          {erro ? <Text style={[estilos.erro, { color: tema.perigo }]}>{erro}</Text> : null}
          <Botao rotulo={enviando ? 'Guardando…' : 'Guardar estudo'} onPress={() => void guardar()} desabilitado={enviando || avancando} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  flex: {
    flex: 1,
  },
  conteudo: {
    gap: 16,
    paddingBottom: 32,
  },
  nome: {
    fontFamily: fonte.titulo,
    fontSize: 28,
  },
  medidor: {
    alignItems: 'center',
  },
  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  celula: {
    flexGrow: 1,
    flexBasis: 140,
  },
  celulaMiolo: {
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  celulaTexto: {
    fontFamily: fonte.textoForte,
    fontSize: 16,
    textAlign: 'center',
  },
  rotulo: {
    fontFamily: fonte.textoForte,
    fontSize: 14,
  },
  notas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  nota: {
    width: 40,
    height: 40,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notaTexto: {
    fontFamily: fonte.mono,
    fontSize: 14,
  },
  contador: {
    fontFamily: fonte.mono,
    fontSize: 12,
    textAlign: 'right',
  },
  erro: {
    fontFamily: fonte.texto,
    fontSize: 16,
  },
});
