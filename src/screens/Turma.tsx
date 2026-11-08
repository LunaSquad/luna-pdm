import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  StyleSheet,
} from "react-native";
import { useFocusEffect, useLocalSearchParams } from "expo-router";

import { theme } from "../styles/theme";
import { aviso } from "../utils/aviso";
import { useUser } from "../context/UserContext";
import {
  buscarTurmaDoAluno,
  extrairConvite,
  TurmaCompleta,
  vincularTurma,
} from "../services/turmaService";

import { TurmaHeaderCard } from "../components/turmaHeaderCard";
import { ProfessorCard } from "../components/professorCard";
import { MateriaItem } from "../components/materiaItem";
import { NfcConviteCard, NfcStatus } from "../components/nfcConviteCard";
import { EstadoMensagem } from "../components/estadoMensagem";

import LogoLuna from "../../assets/luna.png";

export default function Turma() {
  const { userId: userIdParam } = useLocalSearchParams<{ userId?: string }>();
  const { userId: userIdContexto } = useUser();

  // Na tab bar o userId não vem pela rota, então cai para o UserContext.
  const userId =
    (Array.isArray(userIdParam) ? userIdParam[0] : userIdParam) ??
    userIdContexto;

  const [dados, setDados] = useState<TurmaCompleta | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [nfcStatus, setNfcStatus] = useState<NfcStatus>("ocioso");

  /* ------------------------------ dados ------------------------------ */

  const carregar = useCallback(
    async (estaAtiva: () => boolean, puxandoParaAtualizar = false) => {
      try {
        if (puxandoParaAtualizar) setAtualizando(true);
        else setCarregando(true);
        setErro(null);

        if (!userId) {
          throw new Error("Não foi possível identificar o aluno.");
        }

        const resultado = await buscarTurmaDoAluno(userId);

        if (estaAtiva()) {
          setDados(resultado);
        }

        if (estaAtiva()) setDados(resultado);
      } catch (e: any) {
        console.log("ERRO AO CARREGAR TURMA:", e);
        if (estaAtiva()) setErro(e?.message ?? "Erro ao carregar a turma.");
      } finally {
        if (estaAtiva()) {
          setCarregando(false);
          setAtualizando(false);
        }
      }
    },
    [userId]
  );

  // Recarrega sempre que a aba ganha foco (ex.: depois de entrar numa turma).
  useFocusEffect(
    useCallback(() => {
      let ativa = true;
      carregar(() => ativa);
      return () => {
        ativa = false;
      };
    }, [carregar])
  );

  // Depois de sucesso/erro, o card do NFC volta ao estado inicial.
  useEffect(() => {
    if (nfcStatus !== "sucesso" && nfcStatus !== "erro") return;
    const timer = setTimeout(() => setNfcStatus("ocioso"), 3500);
    return () => clearTimeout(timer);
  }, [nfcStatus]);

  /* --------------------------- entrar na turma --------------------------- */

  /**
   * Recebe o link de convite (o que estiver gravado na tag NFC) e vincula o aluno.
   * 👉 Na parte do NFC, basta ler a tag e chamar processarConvite(linkLido).
   */
  async function processarConvite(link: string) {
    try {
      setNfcStatus("lendo");
      const convite = extrairConvite(link);

      if (!userId) {
        throw new Error("Não foi possível identificar o aluno.");
      }

      await vincularTurma(userId, convite);

      setNfcStatus("sucesso");
      await carregar(() => true, true);
    } catch (e: any) {
      setNfcStatus("erro");
      aviso("Não foi possível entrar na turma", e?.message);
    }
  }

  function aoPressionarNfc() {
    aviso(
      "NFC",
      "A leitura da tag NFC será implementada na próxima etapa."
    );
  }

  /* ------------------------------ telas ------------------------------ */

  if (carregando && !atualizando && !dados) {
    return (
      <View style={[styles.tela, styles.centro]}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#0F766E" />
        <Text style={styles.textoCarregando}>Carregando turma...</Text>
      </View>
    );
  }

  if (erro && !dados) {
    return (
      <View style={[styles.tela, styles.centro]}>
        <StatusBar style="dark" />
        <EstadoMensagem
          icone="cloud-off"
          titulo="Ops! Algo deu errado"
          descricao={erro}
          textoBotao="Tentar novamente"
          onPress={() => carregar(() => true)}
        />
      </View>
    );
  }

  const cabecalho = (
    <View>
      <View style={styles.topo}>
        <Text style={styles.titulo}>Minha turma</Text>
        <Image source={LogoLuna} style={styles.logo} />
      </View>

      {dados ? (
        <>
          <TurmaHeaderCard
            nome={dados.turma.nome}
            escola={dados.turma.escola}
            anoLetivo={dados.turma.anoLetivo}
            periodo={dados.turma.periodo}
          />

          {dados.professor && (
            <View style={styles.espaco}>
              <ProfessorCard nome={dados.professor.nome} urlFoto={dados.professor.urlFoto} />
            </View>
          )}

          <Text style={styles.tituloSecao}>Matérias da turma</Text>
        </>
      ) : (
        <>
          <EstadoMensagem
            icone="groups"
            titulo="Você ainda não está em uma turma."
            descricao="Peça a tag de convite para o seu professor."
          />
          <NfcConviteCard status={nfcStatus} temTurma={false} onPress={aoPressionarNfc} />
        </>
      )}
    </View>
  );

  return (
    <View style={styles.tela}>
      <StatusBar style="dark" />

      <FlatList
        data={dados?.materias ?? []}
        keyExtractor={(materia) => materia.id}
        ListHeaderComponent={cabecalho}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={() => carregar(() => true, true)}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        renderItem={({ item, index }) => (
          <MateriaItem nome={item.nome} numero={String(index + 1).padStart(2, "0")} />
        )}
        ListEmptyComponent={
          dados ? (
            <EstadoMensagem
              icone="menu-book"
              titulo="Nenhuma matéria cadastrada ainda."
              descricao="Quando o professor adicionar, elas aparecem aqui."
            />
          ) : undefined
        }
        ListFooterComponent={
          dados ? (
            <View style={styles.espaco}>
              <NfcConviteCard status={nfcStatus} temTurma onPress={aoPressionarNfc} />
            </View>
          ) : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centro: {
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  textoCarregando: {
    marginTop: 10,
    color: theme.colors.textDark,
  },
  lista: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 56,
    paddingBottom: theme.spacing.xl,
  },
  topo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  titulo: {
    fontFamily: theme.fonts.bold,
    fontSize: 26,
    color: theme.colors.primary,
  },
  logo: {
    width: 70,
    height: 32,
    resizeMode: "contain",
  },
  espaco: {
    marginTop: theme.spacing.md,
  },
  tituloSecao: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.large,
    color: theme.colors.textDark,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
});
