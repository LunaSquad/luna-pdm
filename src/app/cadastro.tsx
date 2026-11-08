import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  type ScrollViewInstance,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { File } from 'expo-file-system';
import { fetch as expoFetch } from 'expo/fetch';

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useFonts, Inter_300Light, Inter_400Regular, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import { MuseoModerno_200ExtraLight } from '@expo-google-fonts/museomoderno';
import { cores } from '../components/cadastro/cores';
import {
  cpfValido,
  dataParaIso,
  dataValida,
  emailValido,
  mascaraCpf,
  mascaraData,
  mascaraTelefone,
  soNumeros,
  telefoneValido,
} from '../utils/cadastro/mascaras';
import { BASE_URL } from '../services/api';
import Campo from '../components/cadastro/Campo';
import OpcaoFoto from '../components/cadastro/OpcaoFoto';
import Passos from '../components/cadastro/Passos';

type Foto = { uri: string } | null;
type Erros = Record<string, string>;

const TOTAL_PASSOS = 4;
const COR_ICONE = cores.pessego;
const TAM_ICONE = 20;

type CadastroResponse = {
  mensagem?: string;
  erro?: string;
  aluno?: {
    _id: string;
    usuarioId: string;
    nome: string;
    email: string;
  };
};

export default function Cadastro() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: larguraTela } = useWindowDimensions();
  // Em alguns Androids (Expo Go) os insets chegam zerados; usamos mínimos pra não cortar topo/rodapé.
  const barraStatus = Math.max(insets.top, Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0);
  const folgaInferior = Math.max(insets.bottom, Platform.OS === 'android' ? 40 : 0);
  const [passo, setPasso] = useState(0);
  const [erros, setErros] = useState<Erros>({});
  const [loading, setLoading] = useState(false);
  const rolagem = useRef<ScrollViewInstance>(null);

  // Ao trocar de passo, a rolagem volta pro topo.
  useEffect(() => {
    rolagem.current?.scrollTo({ y: 0, animated: false });
  }, [passo]);

  // passo 1
  const [nome, setNome] = useState('');
  const [nomeResp, setNomeResp] = useState('');
  const [cpf, setCpf] = useState('');
  const [cpfResp, setCpfResp] = useState('');
  // passo 2
  const [nascimento, setNascimento] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [hiperfoco, setHiperfoco] = useState('');
  // passo 3
  const [laudo, setLaudo] = useState<Foto>(null);
  const [rosto, setRosto] = useState<Foto>(null);
  // passo 4
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [verSenha, setVerSenha] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_700Bold,
    Inter_800ExtraBold,
    MuseoModerno_200ExtraLight,
  });
  if (!fontsLoaded) return null;

  const ion = (nomeIcone: React.ComponentProps<typeof Ionicons>['name']) => (
    <Ionicons name={nomeIcone} size={TAM_ICONE} color={COR_ICONE} />
  );
  const mci = (nomeIcone: React.ComponentProps<typeof MaterialCommunityIcons>['name']) => (
    <MaterialCommunityIcons name={nomeIcone} size={TAM_ICONE} color={COR_ICONE} />
  );
  const iconePessoa = mci('account-edit-outline');
  const iconeCpf = mci('card-account-details');
  const olho = (visivel: boolean, alternar: () => void) => (
    <Pressable onPress={alternar} hitSlop={12} accessibilityLabel={visivel ? 'Ocultar senha' : 'Mostrar senha'}>
      <Ionicons name={visivel ? 'eye-outline' : 'eye-off-outline'} size={TAM_ICONE} color={COR_ICONE} />
    </Pressable>
  );

  async function escolherFoto(origem: 'camera' | 'galeria', definir: (f: Foto) => void, chave: string) {
    const opcoes: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.7 };
    let resultado: ImagePicker.ImagePickerResult;

    if (origem === 'camera') {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permissão necessária', 'Autorize o uso da câmera nas configurações do aparelho.');
        return;
      }
      resultado = await ImagePicker.launchCameraAsync(opcoes);
    } else {
      resultado = await ImagePicker.launchImageLibraryAsync(opcoes);
    }

    if (!resultado.canceled) {
      definir({ uri: resultado.assets[0].uri });
      setErros((e) => ({ ...e, [chave]: '' }));
    }
  }

  function validar(): Erros {
    const e: Erros = {};
    if (passo === 0) {
      if (nome.trim().length < 3) e.nome = 'Informe o nome completo do aluno.';
      if (nomeResp.trim().length < 3) e.nomeResp = 'Informe o nome do responsável.';
      if (!cpfValido(cpf)) e.cpf = 'CPF inválido.';
      if (!cpfValido(cpfResp)) e.cpfResp = 'CPF do responsável inválido.';
    }
    if (passo === 1) {
      if (!dataValida(nascimento)) e.nascimento = 'Use o formato DD/MM/AAAA.';
      if (!emailValido(email)) e.email = 'E-mail inválido.';
      if (!telefoneValido(telefone)) e.telefone = 'Informe DDD + número.';
      if (hiperfoco.trim().length === 1) {
        e.hiperfoco = 'Informe pelo menos dois caracteres.';
      }
    }
    if (passo === 3) {
      if (senha.length < 6) e.senha = 'A senha precisa ter ao menos 6 caracteres.';
      if (confirmar !== senha) e.confirmar = 'As senhas não conferem.';
    }
    return e;
  }

  async function continuar() {
    const e: Erros = validar();
    setErros(e);
    if (Object.keys(e).length) return;

    if (passo < TOTAL_PASSOS - 1) {
      setPasso(passo + 1);
      return;
    }

    await enviarCadastro();
  }


  async function enviarCadastro() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    try {
      setLoading(true);

      if (!BASE_URL) {
        throw new Error("URL da API não configurada.");
      }

      const form = new FormData();

      form.append("nome", nome.trim());
      form.append("cpf", soNumeros(cpf));
      form.append("email", email.trim().toLowerCase());
      form.append("senha", senha);
      form.append("nomeResponsavel", nomeResp.trim());
      form.append("cpfResponsavel", soNumeros(cpfResp));
      form.append("dataNasc", dataParaIso(nascimento));
      form.append("telefone", soNumeros(telefone));

      if (hiperfoco.trim()) {
        form.append("hiperfoco", hiperfoco.trim());
      }

      // As fotos são opcionais segundo o contrato da API.
      if (rosto) {
        form.append('fotoAluno', new File(rosto.uri));
      }

      if (laudo) {
        form.append('fotoLaudo', new File(laudo.uri));
      }

      const response = await expoFetch(
        `${BASE_URL.replace(/\/$/, '')}/auth/cadastro`,
        {
          method: "POST",
          body: form,
          signal: controller.signal,
        }
      );

      const data: CadastroResponse = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.erro || "Não foi possível concluir o cadastro."
        );
      }

      Alert.alert(
        "Cadastro realizado!",
        data.mensagem || "Seu cadastro foi concluído com sucesso.",
        [
          {
            text: "Ir para login",
            onPress: () => router.replace("/login"),
          },
        ]
      );

    } catch (error: unknown) {
      console.log("ERRO AO CADASTRAR:", error);

      const mensagem =
        error instanceof Error && error.name === "AbortError"
          ? "O servidor demorou para responder. Tente novamente."
          : error instanceof Error
            ? error.message
            : "Não foi possível concluir o cadastro.";

      Alert.alert("Erro", mensagem);

    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }


  function voltar() {
    if (passo > 0) setPasso(passo - 1);
    else if (router.canGoBack()) router.back();
    else router.replace('/login');
  }

  const ultimo = passo === TOTAL_PASSOS - 1;

  return (
    <View style={[styles.tela, { paddingTop: barraStatus }]}>
      {/* Topo branco */}
      <View style={styles.topo}>
        <Pressable style={styles.voltar} hitSlop={12} onPress={voltar} accessibilityLabel="Voltar">
          <Ionicons name="chevron-back" size={32} color={cores.verde} />
        </Pressable>
        <Text style={styles.logo}>luna</Text>
      </View>

      {/* Painel verde */}
      <KeyboardAvoidingView
        style={styles.painel}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={rolagem}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.titulo}>CADASTRO</Text>
          <Text style={styles.subtitulo}>Dados do aluno</Text>
          <Passos total={TOTAL_PASSOS} atual={passo} />

          {passo === 0 && (
            <>
              <Campo label="Nome" placeholder="Nome" value={nome} onChangeText={setNome}
                icone={iconePessoa} erro={erros.nome} autoCapitalize="words" />
              <Campo label="Nome do responsável" placeholder="Nome do responsável" value={nomeResp}
                onChangeText={setNomeResp} icone={iconePessoa} erro={erros.nomeResp}
                autoCapitalize="words" />
              <Campo label="CPF" placeholder="CPF" value={cpf} onChangeText={(v) => setCpf(mascaraCpf(v))}
                icone={iconeCpf} erro={erros.cpf} keyboardType="number-pad" maxLength={14} />
              <Campo label="CPF do responsável" placeholder="CPF do responsável" value={cpfResp}
                onChangeText={(v) => setCpfResp(mascaraCpf(v))} icone={iconeCpf} erro={erros.cpfResp}
                keyboardType="number-pad" maxLength={14} />
            </>
          )}

          {passo === 1 && (
            <>
              <Campo label="Data de nascimento" placeholder="Data de nascimento" value={nascimento}
                onChangeText={(v) => setNascimento(mascaraData(v))} icone={mci('calendar-month')}
                erro={erros.nascimento} keyboardType="number-pad" maxLength={10} />
              <Campo label="E-mail" placeholder="E-mail" value={email} onChangeText={setEmail}
                icone={ion('mail')} erro={erros.email} keyboardType="email-address"
                autoCapitalize="none" autoCorrect={false} />
              <Campo label="Telefone" placeholder="Telefone" value={telefone}
                onChangeText={(v) => setTelefone(mascaraTelefone(v))} icone={ion('phone-portrait-outline')}
                erro={erros.telefone} keyboardType="phone-pad" maxLength={15} />
              <Campo label="Hiperfoco" placeholder="Indique o hiperfoco da criança" value={hiperfoco}
                onChangeText={setHiperfoco} icone={ion('happy-outline')} erro={erros.hiperfoco} />
            </>
          )}

          {passo === 2 && (
            <>
              <View style={{ marginTop: -10 }} />
              <SecaoFoto
                titulo="Laudo de TDAH do aluno"
                foto={laudo}
                erro={erros.laudo}
                onCamera={() => escolherFoto('camera', setLaudo, 'laudo')}
                onGaleria={() => escolherFoto('galeria', setLaudo, 'laudo')}
                onRemover={() => setLaudo(null)}
              />
              <View style={{ height: 42 }} />
              <SecaoFoto
                titulo="Imagem do rosto do aluno"
                foto={rosto}
                erro={erros.rosto}
                onCamera={() => escolherFoto('camera', setRosto, 'rosto')}
                onGaleria={() => escolherFoto('galeria', setRosto, 'rosto')}
                onRemover={() => setRosto(null)}
              />
            </>
          )}

          {passo === 3 && (
            <>
              <View style={{ height: 96 }} />
              <Campo label="Senha" placeholder="Senha" value={senha} onChangeText={setSenha}
                secureTextEntry={!verSenha} autoCapitalize="none" erro={erros.senha}
                icone={olho(verSenha, () => setVerSenha((v) => !v))} />
              <Campo label="Confirmar senha" placeholder="Confirme sua senha" value={confirmar}
                onChangeText={setConfirmar} secureTextEntry={!verConfirmar} autoCapitalize="none"
                erro={erros.confirmar} icone={olho(verConfirmar, () => setVerConfirmar((v) => !v))} />
            </>
          )}
        </ScrollView>

        {/* Rodapé fixo, respeitando a barra de navegação do Android/iOS */}
        <View style={[styles.rodape, { paddingBottom: folgaInferior + 38 }]}>
          <Pressable
            style={({ pressed }) => [
              styles.botao,
              { width: larguraTela * 0.41 },
              (pressed || loading) && { opacity: 0.85 },
            ]}
            onPress={continuar}
            disabled={loading}
            accessibilityRole="button"
          >
            {loading ? (
              <ActivityIndicator color={cores.verde} />
            ) : (
              <Text style={styles.botaoTexto}>{ultimo ? 'Cadastrar' : 'Continuar'}</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

type SecaoFotoProps = {
  titulo: string;
  foto: Foto;
  erro?: string;
  onCamera: () => void;
  onGaleria: () => void;
  onRemover: () => void;
};

function SecaoFoto({ titulo, foto, erro, onCamera, onGaleria, onRemover }: SecaoFotoProps) {
  return (
    <View>
      <Text style={styles.labelSecao}>{titulo}</Text>
      {foto ? (
        <View style={styles.previa}>
          <Image source={{ uri: foto.uri }} style={styles.miniatura} />
          <Text style={styles.previaTexto}>Imagem selecionada</Text>
          <Pressable onPress={onRemover} hitSlop={12} accessibilityLabel="Remover imagem">
            <Ionicons name="close-circle" size={28} color={cores.verde} />
          </Pressable>
        </View>
      ) : (
        <>
          <OpcaoFoto icone="camera" titulo="Tire uma foto" descricao="Use a câmera do seu dispositivo" onPress={onCamera} />
          <View style={{ marginTop: 12 }}>
            <OpcaoFoto icone="image" titulo="Escolha da galeria" descricao="Selecione uma imagem salva" onPress={onGaleria} />
          </View>
        </>
      )}
      {!!erro && <Text style={styles.erro}>{erro}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.branco },

  // Figma: topo branco alto, seta à esquerda, logo centralizado
  topo: { backgroundColor: cores.branco, height: 132 },
  voltar: { position: 'absolute', left: 8, top: 0 },
  logo: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: 'MuseoModerno_200ExtraLight',
    fontSize: 32,
    color: cores.verde,
  },

  painel: { flex: 1, backgroundColor: cores.verde, borderTopRightRadius: 56 },
  // Figma: margem lateral de 15%, título a ~37 do topo do painel
  scroll: { paddingHorizontal: '15%', paddingTop: 32, paddingBottom: 16 },
  titulo: { fontFamily: 'Inter_800ExtraBold', color: cores.pessego, fontSize: 20 },
  subtitulo: {
    fontFamily: 'Inter_300Light',
    color: cores.pessego,
    fontSize: 17,
    marginTop: 23,
    textAlign: 'center',
  },

  labelSecao: { fontFamily: 'Inter_700Bold', color: cores.branco, fontSize: 13, textTransform: 'uppercase' },
  previa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 17,
    backgroundColor: cores.pessego,
    borderRadius: 6,
    paddingVertical: 11,
    paddingHorizontal: 12,
    marginTop: 14,
  },
  miniatura: { width: 34, height: 34, borderRadius: 17, backgroundColor: cores.circuloFoto },
  previaTexto: { flex: 1, fontFamily: 'Inter_700Bold', color: cores.verde, fontSize: 12 },
  erro: { fontFamily: 'Inter_400Regular', color: cores.pessego, fontSize: 12, marginTop: 6 },

  rodape: { alignItems: 'center', paddingTop: 12, paddingHorizontal: 24 },
  botao: {
    backgroundColor: cores.pessego,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
  },
  botaoTexto: { fontFamily: 'Inter_700Bold', color: cores.verde, fontSize: 18 },
});