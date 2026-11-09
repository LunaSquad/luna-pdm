import { StatusBar } from "expo-status-bar";
import { useCallback, useRef, useState, useEffect, useMemo } from "react";
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

import { buscarAluno } from "../../services/alunoService";
import { useUser } from "../../context/UserContext";
import styles from "../../styles/home.styles";

import PerfilTest from "../../../assets/assets-home/PerfilTest.png";
import temporyMenu from "../../../assets/assets-home/menu.png";
import LogoLuna from "../../../assets/luna.png";
import seta from "../../../assets/assets-home/seta.png";
import buttonIcon from "../../../assets/assets-home/botaoIcone.png";
import Luna3d from "../../../assets/luna3d.png";

import portuguesImg from "../../../assets/assets-home/portugues.png";
import matematicaImg from "../../../assets/assets-home/matematica.png";
import geografiaImg from "../../../assets/assets-home/geografia.png";

import { MateriaCard } from "../../components/home/materiaCard";
import { Input } from "../../components/common/input";

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

  const { userId: userIdContexto } = useUser();

  const userId =
    (Array.isArray(userIdParam) ? userIdParam[0] : userIdParam) ?? userIdContexto;

  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [materias, setMaterias] = useState<MateriaCardData[]>([]);
  const [loading, setLoading] = useState(true);

  const [menuAberto, setMenuAberto] = useState(false);
  const slideAnim = useRef(new Animated.Value(-MENU_WIDTH)).current;

  const [busca, setBusca] = useState("");
  const [buscaDebounced, setBuscaDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setBuscaDebounced(busca), 300);
    return () => clearTimeout(t);
  }, [busca]);

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

      const dados = await buscarAluno(userId);

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
              pathname: "/userProfile",
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
                Seja Bem Vindo{"\n"}ao Luna!
              </Text>
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

            <View style={{ alignItems: "center" }}>
              <TouchableOpacity
                style={styles.joinClassButton}
                onPress={() => router.push("/turma")}
              >
                <MaterialIcons name="nfc" size={40} color="#fff" />
              </TouchableOpacity>

              <Text style={styles.joinClassButtonText}>
                Ingressar em{"\n"}uma turma
              </Text>
            </View>
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