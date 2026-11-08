import { useEffect, useRef } from "react";
import { View, Text, Animated, Easing, StyleSheet, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { theme } from "../styles/theme";
import CustomButton from "./customButton";

export type NfcStatus = "ocioso" | "lendo" | "sucesso" | "erro";

type Props = {
  status: NfcStatus;
  /**
   * Com turma: versão compacta ("trocar de turma").
   * Sem turma: versão grande, é a ação principal da tela.
   */
  temTurma: boolean;
  onPress: () => void;
};

const TEXTOS: Record<NfcStatus, string> = {
  ocioso: "Ative o NFC e aproxime a tag de convite da parte de trás do celular.",
  lendo: "Aproxime a tag do celular e aguarde...",
  sucesso: "Pronto! Você entrou na turma.",
  erro: "Não foi possível ler a tag. Tente novamente.",
};

const TEXTOS_COMPACTO: Record<NfcStatus, string> = {
  ocioso: "Aproxime a tag NFC para entrar em outra turma.",
  lendo: "Aproxime a tag e aguarde...",
  sucesso: "Pronto! Turma atualizada.",
  erro: "Não foi possível ler a tag.",
};

export function NfcConviteCard({ status, temTurma, onPress }: Props) {
  // Anel que "pulsa" enquanto o app espera a tag
  const pulso = useRef(new Animated.Value(0)).current;
  const lendo = status === "lendo";

  useEffect(() => {
    if (!lendo) {
      pulso.setValue(0);
      return;
    }
    const animacao = Animated.loop(
      Animated.timing(pulso, {
        toValue: 1,
        duration: 1400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    );
    animacao.start();
    return () => animacao.stop();
  }, [lendo, pulso]);

  const tamanho = temTurma ? 44 : 64;

  const corIcone =
    status === "sucesso" ? "#166534" : status === "erro" ? "#B91C1C" : theme.colors.primary;

  const icone: keyof typeof MaterialIcons.glyphMap =
    status === "sucesso" ? "check-circle" : status === "erro" ? "error-outline" : "nfc";

  const iconeComAnel = (
    <View style={{ width: tamanho + 8, height: tamanho + 8, alignItems: "center", justifyContent: "center" }}>
      <Animated.View
        style={[
          styles.anel,
          {
            width: tamanho,
            height: tamanho,
            borderRadius: tamanho / 2,
            opacity: pulso.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
            transform: [{ scale: pulso.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] }) }],
          },
        ]}
      />
      <View style={[styles.bolha, { width: tamanho, height: tamanho, borderRadius: tamanho / 2 }]}>
        <MaterialIcons name={icone} size={temTurma ? 24 : 34} color={corIcone} />
      </View>
    </View>
  );

  const acao = lendo ? (
    <ActivityIndicator color={theme.colors.primary} style={temTurma ? undefined : styles.carregandoGrande} />
  ) : (
    <CustomButton
      title={status === "erro" ? "Tentar de novo" : temTurma ? "Ler tag" : "Ler tag NFC"}
      onPress={onPress}
      textColor={theme.colors.textPrimary}
      style={temTurma ? styles.botaoCompacto : styles.botao}
    />
  );

  if (temTurma) {
    return (
      <View style={styles.cardCompacto}>
        {iconeComAnel}
        <View style={styles.textosCompacto}>
          <Text style={styles.tituloCompacto}>Trocar de turma</Text>
          <Text style={styles.descricaoCompacto}>{TEXTOS_COMPACTO[status]}</Text>
        </View>
        {acao}
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {iconeComAnel}
      <Text style={styles.titulo}>Entrar em uma turma</Text>
      <Text style={styles.descricao}>{TEXTOS[status]}</Text>
      {acao}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardCompacto: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.firstMatter,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: "#BDE6E1",
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  anel: {
    position: "absolute",
    backgroundColor: theme.colors.primary,
  },
  bolha: {
    backgroundColor: theme.colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  titulo: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.large,
    color: theme.colors.primary,
    marginTop: theme.spacing.md,
    textAlign: "center",
  },
  descricao: {
    fontSize: theme.fontSize.medium,
    lineHeight: 20,
    color: theme.colors.textDark,
    textAlign: "center",
    marginTop: theme.spacing.sm,
  },
  textosCompacto: {
    flex: 1,
  },
  tituloCompacto: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.normal,
    color: theme.colors.primary,
  },
  descricaoCompacto: {
    fontSize: theme.fontSize.small,
    lineHeight: 16,
    color: theme.colors.textDark,
    marginTop: 2,
  },
  botao: {
    backgroundColor: theme.colors.primary,
    marginTop: theme.spacing.md,
    paddingHorizontal: 32,
  },
  botaoCompacto: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  carregandoGrande: {
    marginTop: theme.spacing.md,
  },
});
