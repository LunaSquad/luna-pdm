import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

import { BASE_URL } from "../../services/api";

import PerfilTest from "../../../assets/assets-home/PerfilTest.png";
import LogoLuna from "../../../assets/luna.png";

import { CampoPerfil } from "../../components/ProfileField";
import { AcaoPerfil } from "../../components/ProfileAction";

const USAR_MOCK = true;

const COR_PRIMARIA = "#00595F";
const COR_BOTAO_LAUDO  = "#DDEFF1";

type Aluno = {
  nome?: string;
  cpf?: string;
  dataNascimento?: string;
  email?: string;
  urlLaudo?: string;
  urlFotoAluno?: string;
};

type AlunoResponse = {
  ok?: boolean;
  aluno?: Aluno;
  message?: string;
};

const ALUNO_MOCK: Aluno = {
  nome: "Maria Barbosa",
  cpf: "327.655.454-56",
  dataNascimento: "05/07/2020",
  email: "maria.barbosa11@gmail.com",
  urlLaudo: "https://exemplo.com/laudo.pdf",
};

export default function Perfil() {
  const router = useRouter();
  const { userId: userIdParam } = useLocalSearchParams<{ userId?: string }>();
  const userId = Array.isArray(userIdParam) ? userIdParam[0] : userIdParam;

  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [loading, setLoading] = useState(true);

  const carregarAluno = useCallback(
    async (estaAtiva: () => boolean) => {
      if (USAR_MOCK) {
        setAluno(ALUNO_MOCK);
        setLoading(false);
        return;
      }

      if (!userId) {
        if (estaAtiva()) setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const resp = await fetch(`${BASE_URL}/students/aluno/${userId}`);

        if (!resp.ok) {
          throw new Error("Não foi possível carregar os dados do aluno.");
        }

        const data: AlunoResponse = await resp.json();

        if (!estaAtiva()) return;

        if (data.ok && data.aluno) {
          setAluno(data.aluno);
        } else {
          setAluno(null);
          console.log("Erro ao carregar aluno:", data.message);
        }
      } catch (error) {
        console.log("ERRO AO CARREGAR PERFIL:", error);
        if (estaAtiva()) {
          Alert.alert(
            "Erro",
            "Não foi possível carregar os dados. Verifique sua conexão e tente novamente."
          );
        }
      } finally {
        if (estaAtiva()) setLoading(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    let estaAtiva = true;
    carregarAluno(() => estaAtiva);

    return () => {
      estaAtiva = false;
    };
  }, [carregarAluno]);

  function verLaudo() {
    if (!aluno?.urlLaudo) {
      Alert.alert("Aviso", "Nenhum laudo disponível.");
      return;
    }
    Linking.openURL(aluno.urlLaudo);
  }

  if (loading) {
    return (
      <View style={[styles.screen, styles.center]}>
        <ActivityIndicator size="large" color={COR_PRIMARIA} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.header}>
          <Image
            source={require("../../../assets/logo-mobile.png")}
            style={styles.logoBorboleta}
            resizeMode="contain"
          />

          <Image source={LogoLuna} style={styles.logo} resizeMode="contain" />

          <View style={styles.headerRow}>
            <Text style={styles.headerNome}>{aluno?.nome || "Usuário"}</Text>

            <Image
              style={styles.foto}
              source={
                aluno?.urlFotoAluno ? { uri: aluno.urlFotoAluno } : PerfilTest
              }
            />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.dados}>
            <CampoPerfil label="NOME" valor={aluno?.nome} />
            <CampoPerfil label="CPF" valor={aluno?.cpf} />
            <CampoPerfil
              label="DATA DE NASCIMENTO"
              valor={aluno?.dataNascimento}
            />
            <CampoPerfil label="E-MAIL" valor={aluno?.email} />

            <CampoPerfil label="LAUDO">
              <TouchableOpacity
                style={styles.botaoLaudo}
                activeOpacity={0.8}
                onPress={verLaudo}
              >
                <MaterialIcons
                  name="description"
                  size={16}
                  color={COR_PRIMARIA}
                />
                <Text style={styles.botaoLaudoTexto}>Ver laudo</Text>
              </TouchableOpacity>
            </CampoPerfil>
          </View>

          <AcaoPerfil
            icone="edit-note"
            texto="Editar hiperfoco"
            onPress={() =>
              router.push({
                pathname: "/EditHyperfocus",
                params: { userId },
              })
            }
          />

          <AcaoPerfil
            icone="edit"
            texto="Editar dados"
            onPress={() =>
              router.push({
                pathname: "/EditarDados",
                params: { userId },
              })
            }
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: COR_PRIMARIA,
    height: 285,
    borderBottomRightRadius: 80,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  logoBorboleta: {
    position: "absolute",
    top: 44,
    right: 24,
  },
  logo: {
    alignSelf: "center",
    width: 70,
    height: 30,
    tintColor: "#FFDDD2",
    marginTop: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 15,
  },
  headerNome: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  foto: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "#FFDDD2",
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 34,
    marginTop: -65,
    borderRadius: 10,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  dados: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
  },
  botaoLaudo: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    backgroundColor: COR_BOTAO_LAUDO,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 8,
  },
  botaoLaudoTexto: {
    color: COR_PRIMARIA,
    fontSize: 13,
    fontWeight: "700",
  },
});
