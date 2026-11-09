import { StatusBar } from "expo-status-bar";
import React, { useCallback, useState } from "react";
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
import { useRouter, useFocusEffect } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

// Importando a função requisitar da API (Requisito 3)
import { requisitar } from "../../services/api";

// Importando o Contexto Global para pegar o usuário logado
import { useUser } from "../../context/UserContext";

import PerfilTest from "../../../assets/assets-home/PerfilTest.png";
import LogoLuna from "../../../assets/luna.png";

// Importação de componentes reutilizáveis com Props (Requisito 6)
import { CampoPerfil } from "../../components/perfil/ProfileField";

const COR_PRIMARIA = "#00595F";
const COR_BOTAO_LAUDO = "#DDEFF1";

type Aluno = {
  nome?: string;
  cpf?: string;
  dataNasc?: string;
  email?: string;
  urlLaudo?: string;
  urlFotoAluno?: string;
};

type AlunoResponse = {
  ok?: boolean;
  aluno?: Aluno;
  message?: string;
};

export default function Perfil() {
  const router = useRouter();

  const contexto = useUser();
  const userId = contexto?.userId;

  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [loading, setLoading] = useState(true);

  const carregarAluno = useCallback(async (estaAtiva: () => boolean) => {
    if (!userId) {
      if (estaAtiva()) setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Consumo de API real usando fetch/requisitar (Requisitos 3 e 4)
      const data = await requisitar<AlunoResponse>(`/alunos/${userId}`);

      if (!estaAtiva()) return;

      if (data && data.aluno) {
        setAluno(data.aluno);
      } else {
        setAluno(null);
      }
    } catch (error) {
      console.log("ERRO AO CARREGAR PERFIL:", error);
      if (estaAtiva()) {
        // Tratamento de Erros de comunicação com o backend (Requisito 7)
        Alert.alert(
          "Erro de Conexão",
          "Não foi possível carregar os dados do aluno. Verifique o backend e tente novamente."
        );
      }
    } finally {
      if (estaAtiva()) setLoading(false);
    }
  }, [userId]);

  // useFocusEffect garante que a API será chamada sempre que a aba for focada
  useFocusEffect(
    useCallback(() => {
      let estaAtiva = true;
      carregarAluno(() => estaAtiva);

      return () => {
        estaAtiva = false;
      };
    }, [carregarAluno])
  );

  function verLaudo() {
    if (!aluno?.urlLaudo) {
      Alert.alert("Aviso", "Nenhum laudo disponível para este aluno.");
      return;
    }
    Linking.openURL(aluno.urlLaudo);
  }

  // Apresentação de mensagem/indicador de carregamento (Requisito 7)
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
        {/* Interface e Estilização com Flexbox e StyleSheet (Requisito 1) */}
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
            {/* Componentes reutilizáveis recebendo Props (Requisito 6) */}
            <CampoPerfil label="NOME" valor={aluno?.nome} />
            <CampoPerfil label="CPF" valor={aluno?.cpf} />
            <CampoPerfil
              label="DATA DE NASCIMENTO"
              valor={aluno?.dataNasc ? new Date(aluno.dataNasc).toLocaleDateString('pt-BR') : ""}
            />
            <CampoPerfil label="E-MAIL" valor={aluno?.email} />

            <CampoPerfil label="LAUDO">
              <TouchableOpacity
                style={styles.botaoLaudo}
                activeOpacity={0.8}
                onPress={verLaudo}
              >
                <MaterialIcons name="description" size={16} color={COR_PRIMARIA} />
                <Text style={styles.botaoLaudoTexto}>Ver laudo</Text>
              </TouchableOpacity>
            </CampoPerfil>
          </View>

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