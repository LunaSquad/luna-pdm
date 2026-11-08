import { StatusBar } from "expo-status-bar";
import { useCallback, useRef, useState, useMemo } from "react";
import { theme } from "../../styles/theme";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Dimensions,
  Pressable,
  TextInput,
  Alert,
  SectionList,
  FlatList,
  ListRenderItem,
} from "react-native";
import {
  useRouter,
  useLocalSearchParams,
  useFocusEffect,
} from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { BASE_URL } from "../../services/api";
import styles from "../style";

import PerfilTest from "../../../assets/assets-home/PerfilTest.png";
import temporyMenu from "../../../assets/assets-home/menu.png";
import LogoLuna from "../../../assets/luna.png";
import seta from "../../../assets/assets-home/seta.png";
import buttonIcon from "../../../assets/assets-home/botaoIcone.png";
import Luna3d from "../../../assets/luna3d.png";

import portuguesImg from "../../../assets/assets-home/portugues.png";
import matematicaImg from "../../../assets/assets-home/matematica.png";
import geografiaImg from "../../../assets/assets-home/geografia.png";

import { MateriaCard } from "../../components/materiaCard";
import { Input } from "../../components/input";

const { width } = Dimensions.get("window");
const MENU_WIDTH = width * 0.78;

type Hiperfoco = {
  hiperfocoID?: string;
  nome?: string;
  descricao?: string;
  urlFotoHiperfoco?: string;
};

type Aluno = {
  _id?: string;
  usuarioId?: string;
  nome?: string;
  turmaId?: string | null;
  urlFotoAluno?: string | null;
  hiperfoco?: string | null;
};

type MateriaApi = {
  id?: string;
  _id?: string;
  materiaID?: string;
  nome: string;
  rota?: string;
};

type MateriaCardData = {
  id: string;
  number: string;
  title: string;
  nome: string;
  image: typeof portuguesImg;
  backgroundColor: string;
  titleColor: string;
  buttonColor: string;
  rota: string;
};

type AlunoResponse = {
  aluno?: Aluno;
  materias?: string[];
  erro?: string;
};

type MateriasResponse = {
  ok?: boolean;
  materias?: MateriaApi[];
  detail?: MateriaApi[];
  message?: string;
};

type MateriasSection = {
  title: string;
  data: MateriaCardData[][];
};

type MateriaPreset = {
  title: string;
  image: typeof portuguesImg;
  backgroundColor: string;
  titleColor: string;
  buttonColor: string;
};

const normalizar = (t: string) =>
  t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function Home() {
  const router = useRouter();
  const { userId: userIdParam, tipoUser } =
    useLocalSearchParams<{ userId?: string; tipoUser?: string }>();

  const userId = Array.isArray(userIdParam) ? userIdParam[0] : userIdParam;

  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [materias, setMaterias] = useState<MateriaCardData[]>([]);
  const [loading, setLoading] = useState(true);

  const [mostrarOpcoesTurma, setMostrarOpcoesTurma] = useState(false);
  const [inserindoLink, setInserindoLink] = useState(false);
  const [linkConvite, setLinkConvite] = useState("");
  const [loadingTurma, setLoadingTurma] = useState(false);

  const [menuAberto, setMenuAberto] = useState(false);
  const slideAnim = useRef(new Animated.Value(-MENU_WIDTH)).current;

  const [busca, setBusca] = useState("");

  const materiasFiltradas = useMemo(
    () =>
      materias.filter((m) =>
        normalizar(m.title).includes(normalizar(busca.trim()))
      ),
    [materias, busca]
  );

  function abrirMenu() {
    setMenuAberto(true);

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }

  function fecharMenu() {
    Animated.timing(slideAnim, {
      toValue: -MENU_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setMenuAberto(false);
    });
  }

  function sair() {
    fecharMenu();

    setTimeout(() => {
      router.replace("/login");
    }, 260);
  }

  function materiaPreset(nome: string): MateriaPreset {
    const nomeNormalizado = (nome || "").toLowerCase();

    if (nomeNormalizado.includes("port")) {
      return {
        title: "Língua Portuguesa",
        image: portuguesImg,
        backgroundColor: theme.colors.firstMatter,
        titleColor: theme.colors.primary,
        buttonColor: "#0F766E",
      };
    }

    if (nomeNormalizado.includes("mat")) {
      return {
        title: "Matemática",
        image: matematicaImg,
        backgroundColor: theme.colors.secondMatter,
        titleColor: theme.colors.borderSecondMatter,
        buttonColor: "#1E3A8A",
      };
    }

    if (nomeNormalizado.includes("geo")) {
      return {
        title: "Geografia",
        image: geografiaImg,
        backgroundColor: theme.colors.thirdMatter,
        titleColor: theme.colors.borderThirdMatter,
        buttonColor: "#71270F",
      };
    }

    if (nomeNormalizado.includes("hist")) {
      return {
        title: "História",
        image: geografiaImg,
        backgroundColor: theme.colors.fourthMatter,
        titleColor: theme.colors.borderFourthMatter,
        buttonColor: "#92400E",
      };
    }

    if (
      nomeNormalizado.includes("cien") ||
      nomeNormalizado.includes("ciên")
    ) {
      return {
        title: "Ciências",
        image: geografiaImg,
        backgroundColor: theme.colors.fifthMatter,
        titleColor: theme.colors.borderFifthMatter,
        buttonColor: "#166534",
      };
    }

    return {
      title: nome,
      image: geografiaImg,
      backgroundColor: "#EFEFEF",
      titleColor: theme.colors.primary,
      buttonColor: "#333333",
    };
  }

  function transformarMateriasEmCards(listaMaterias: string[]) {
    const cards: MateriaCardData[] = listaMaterias.map((nome, index) => {
      const preset = materiaPreset(nome);

      return {
        id: normalizar(nome) || String(index),
        number: `${String(index + 1).padStart(2, "0")}.`,
        title: preset.title,
        nome: nome,
        image: preset.image,
        backgroundColor: preset.backgroundColor,
        titleColor: preset.titleColor,
        buttonColor: preset.buttonColor,
        rota: "Atividades",
      };
    });

    setMaterias(cards);
  }

  const carregarTudo = useCallback(async (estaAtiva: () => boolean) => {
    if (!userId) {
      if (estaAtiva()) {
        setLoading(false);
        Alert.alert("Erro", "Identificação do aluno não encontrada.");
      }
      return;
    }

    try {
      setLoading(true);

      if (!BASE_URL) {
        throw new Error("URL da API não configurada.");
      }

      const resposta = await fetch(
        `${BASE_URL.replace(/\/$/, "")}/alunos/${encodeURIComponent(userId)}`
      );

      const dados: AlunoResponse = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          dados.erro || "Não foi possível carregar os dados do aluno."
        );
      }

      if (!dados.aluno) {
        throw new Error("A API não retornou o perfil do aluno.");
      }

      if (!estaAtiva()) return;

      setAluno(dados.aluno);
      transformarMateriasEmCards(dados.materias || []);

    } catch (error) {
      console.log("ERRO AO CARREGAR HOME:", error);

      if (estaAtiva()) {
        setAluno(null);
        setMaterias([]);

        Alert.alert(
          "Erro",
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os dados."
        );
      }
    } finally {
      if (estaAtiva()) {
        setLoading(false);
      }
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      let estaAtiva = true;

      carregarTudo(() => estaAtiva);

      return () => {
        estaAtiva = false;
      };
    }, [carregarTudo])
  );

  // Lê o código e o ID da turma presentes no link de convite.
  async function processarConvite(link: string) {
    const linkLimpo = link.trim();

    if (!linkLimpo) {
      Alert.alert("Aviso", "Por favor, cole um link válido.");
      return;
    }

    try {
      const queryString = linkLimpo.split("?")[1];

      if (!queryString) {
        throw new Error("Link sem parâmetros.");
      }

      const params = new URLSearchParams(queryString);
      const codigo = params.get("codigo");
      const turmaIdExtraida = params.get("turmaId");

      if (!codigo || !turmaIdExtraida) {
        Alert.alert(
          "Erro",
          "O link de convite está incompleto ou inválido."
        );
        return;
      }

      if (!userId) {
        Alert.alert("Erro", "Não foi possível identificar o aluno.");
        return;
      }

      setLoadingTurma(true);

      const response = await fetch(
        `${BASE_URL}/students/aluno/${userId}/vincular-turma`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            turmaId: turmaIdExtraida,
            codigoAcesso: codigo,
          }),
        }
      );

      const data = await response.json();

      if (response.ok || data.ok) {
        // preAdaptarTudoEmSegundoPlano(userId);

        Alert.alert("Sucesso!", "Você entrou na turma com sucesso.");
        setInserindoLink(false);
        setMostrarOpcoesTurma(false);
        setLinkConvite("");

        // Atualiza os dados do aluno para refletir o vínculo recém-criado.
        await carregarTudo(() => true);
      } else {
        Alert.alert(
          "Erro",
          data.message || "Não foi possível entrar na turma."
        );
      }
    } catch (error) {
      console.log("ERRO AO PROCESSAR CONVITE:", error);
      Alert.alert("Erro", "Não foi possível processar esse link de convite.");
    } finally {
      setLoadingTurma(false);
    }
  }

  const hiperfocoNome = aluno?.hiperfoco || "Não informado";

  const codigoTurmaAluno = aluno?.turmaId || undefined;

  const secoesMaterias: MateriasSection[] =
    codigoTurmaAluno && materiasFiltradas.length
      ? [
        {
          title: "Matérias",
          data: [materiasFiltradas],
        },
      ]
      : [];

  const renderHeader = () => (
    <>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={abrirMenu} activeOpacity={0.7}>
          <Image style={styles.menu} source={temporyMenu} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            router.push({
              pathname: "/perfil",
              params: { userId },
            })
          }
        >
          <Image
            style={styles.profilePhoto}
            source={
              aluno?.urlFotoAluno
                ? { uri: aluno.urlFotoAluno }
                : PerfilTest
            }
          />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <View style={styles.spaceLogo}>
          <Image source={LogoLuna} style={styles.logo} />
        </View>

        <View style={styles.spaceNameUsuario}>
          <Text style={styles.nameUsuario}>
            Olá, {aluno?.nome || "Usuário"}!
          </Text>
        </View>

        <View style={styles.spaceHiperfocoAux}>
          <View style={styles.spaceHiperfoco}>
            <View style={styles.hiperfocoContent}>
              <Text style={styles.textoHiperfoco}>
                Indique o hiperfoco{"\n"}da criança aqui!
              </Text>

              <View style={styles.hiperfocoActionArea}>
                <Image source={seta} style={styles.imageSeta} />

                <TouchableOpacity
                  style={styles.bottonHiperfoco}
                  onPress={() =>
                    router.push({
                      pathname: "/EditHyperfocus",
                      params: {
                        userId,
                        hiperfocoAtual: hiperfocoNome,
                      },
                    })
                  }
                >
                  <Image
                    source={buttonIcon}
                    style={styles.buttonIconHiperfoco}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <Image source={Luna3d} style={styles.luna3d} />
          </View>
        </View>

        {codigoTurmaAluno && (
          <View style={{ marginTop: 20 }}>
            <Input
              icon="search"
              placeholder="Buscar matéria..."
              value={busca}
              onChangeText={setBusca}
            />
          </View>
        )}

        {!codigoTurmaAluno && (
          <View style={styles.noClassContainer}>
            <Text style={styles.noClassText}>
              Você ainda não está em uma turma.
            </Text>

            {!mostrarOpcoesTurma ? (
              <View style={{ alignItems: "center" }}>
                <TouchableOpacity
                  style={styles.joinClassButton}
                  onPress={() => setMostrarOpcoesTurma(true)}
                >
                  <MaterialIcons name="add" size={40} color="#fff" />
                </TouchableOpacity>

                <Text style={styles.joinClassButtonText}>
                  Ingressar em{"\n"}uma turma
                </Text>
              </View>
            ) : inserindoLink ? (
              <View style={styles.joinOptionsContainer}>
                <Text style={styles.inputLabel}>
                  Cole o link de convite abaixo:
                </Text>

                <TextInput
                  style={styles.inputConvite}
                  placeholder="luna://app/convite?codigo=..."
                  value={linkConvite}
                  onChangeText={setLinkConvite}
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                {loadingTurma ? (
                  <ActivityIndicator
                    size="large"
                    color="#0F766E"
                    style={{ marginVertical: 10 }}
                  />
                ) : (
                  <TouchableOpacity
                    style={styles.btnConfirmar}
                    onPress={() => processarConvite(linkConvite)}
                  >
                    <Text style={styles.btnConfirmarText}>
                      Entrar na Turma
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.cancelJoinButton}
                  onPress={() => setInserindoLink(false)}
                >
                  <Text style={styles.cancelJoinText}>Voltar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.joinOptionsContainer}>
                <TouchableOpacity
                  style={styles.joinOptionCard}
                  onPress={() => setInserindoLink(true)}
                >
                  <MaterialIcons name="link" size={24} color="#0F766E" />
                  <Text style={styles.joinOptionText}>
                    Inserir Link da Turma
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.joinOptionCard}
                  onPress={() =>
                    router.push({
                      pathname: "/QrCodeScanner",
                      params: { userId },
                    })
                  }
                >
                  <MaterialIcons
                    name="qr-code-scanner"
                    size={24}
                    color="#0F766E"
                  />
                  <Text style={styles.joinOptionText}>Ler QR Code</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelJoinButton}
                  onPress={() => setMostrarOpcoesTurma(false)}
                >
                  <Text style={styles.cancelJoinText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    </>
  );

  const renderMateria: ListRenderItem<MateriaCardData> = ({ item }) => (
    <MateriaCard
      key={item.id}
      title={item.title}
      image={item.image}
      backgroundColor={item.backgroundColor}
      titleColor={item.titleColor}
      buttonColor={item.buttonColor}
      number={item.number}
      onPress={() =>
        router.push({
          pathname: "/atividades",
          params: {
            materiaId: item.id,
            materiaNome: item.nome,
            userId,
            turmaId: codigoTurmaAluno,
          },
        })
      }
    />
  );

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      {loading ? (
        <View
          style={[
            styles.container,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <ActivityIndicator size="large" color="#0F766E" />
          <Text style={{ marginTop: 10 }}>Carregando dados...</Text>
        </View>
      ) : (
        <SectionList
          style={styles.container}
          sections={secoesMaterias}
          keyExtractor={(_, index) => index.toString()}
          ListHeaderComponent={renderHeader()}
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          renderSectionHeader={({ section }) => (
            <View style={styles.spaceMaterias}>
              <View style={styles.spaceTituloMaterias}>
                <Text style={styles.textMaterias}>
                  {section.title}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    router.push({
                      pathname: "/em-andamento",
                      params: { userId, turmaId: codigoTurmaAluno },
                    })
                  }
                >
                  <Text style={styles.textVejamais}>
                    Veja mais →
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          renderItem={({ item }) => (
            <FlatList
              horizontal
              style={styles.containerMateria}
              data={item}
              keyExtractor={(materia) => materia.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingVertical: 16,
              }}
              renderItem={renderMateria}
            />
          )}
          ListEmptyComponent={() => {
            if (codigoTurmaAluno) {
              return (
                <View style={styles.spaceMaterias}>
                  <Text style={{ marginTop: 16 }}>
                    Nenhuma matéria encontrada.
                  </Text>
                </View>
              );
            }
            return <View />;
          }}
          stickySectionHeadersEnabled={false}
        />
      )}

      {menuAberto && (
        <Pressable style={styles.overlay} onPress={fecharMenu} />
      )}

      <Animated.View
        style={[
          styles.drawer,
          {
            width: MENU_WIDTH,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <View>
          <View style={styles.drawerProfile}>
            <Image
              style={styles.drawerPhoto}
              source={
                aluno?.urlFotoAluno
                  ? { uri: aluno.urlFotoAluno }
                  : PerfilTest
              }
            />

            <View>
              <Text style={styles.drawerName}>
                {aluno?.nome || "Usuário"}
              </Text>
              <Text style={styles.drawerSchool}>Luna App</Text>
            </View>
          </View>

          <View style={styles.drawerLine} />

          <TouchableOpacity
            style={styles.drawerItem}
            onPress={() => {
              fecharMenu();
              router.push({
                pathname: "/EditHyperfocus",
                params: {
                  userId,
                  hiperfocoAtual: hiperfocoNome,
                },
              });
            }}
          >
            <Text style={styles.drawerIcon}>☸</Text>
            <Text style={styles.drawerText}>Editar hiperfoco</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.drawerItem}
            onPress={() => {
              fecharMenu();
              router.push("/Feedback");
            }}
          >
            <Text style={styles.drawerIcon}>⚭</Text>
            <Text style={styles.drawerText}>Feedback</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.drawerItem}
            onPress={() => {
              fecharMenu();
              router.push({
                pathname: "/em-andamento",
                params: {
                  userId,
                  materiaNome: "Matemática",
                },
              });
            }}
          >
            <Text style={styles.drawerIcon}>▣</Text>
            <Text style={styles.drawerText}>Atividades concluídas</Text>
          </TouchableOpacity>
        </View>

        <View>
          <View style={styles.drawerLineBottom} />

          <TouchableOpacity style={styles.drawerItem} onPress={sair}>
            <Text style={styles.drawerIcon}>⊙</Text>
            <Text style={styles.drawerText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}