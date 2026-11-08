import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { theme } from "../styles/theme";
import CustomButton from "./customButton";

type Props = {
  icone: keyof typeof MaterialIcons.glyphMap;
  titulo: string;
  descricao?: string;
  /** Se informado, mostra um botão (ex.: "Tentar novamente"). */
  textoBotao?: string;
  onPress?: () => void;
};

/** Bloco centralizado para erro, lista vazia e "sem turma". */
export function EstadoMensagem({ icone, titulo, descricao, textoBotao, onPress }: Props) {
  return (
    <View style={styles.container}>
      <MaterialIcons name={icone} size={56} color={theme.colors.primary} />
      <Text style={styles.titulo}>{titulo}</Text>
      {descricao ? <Text style={styles.descricao}>{descricao}</Text> : null}
      {textoBotao && onPress ? (
        <CustomButton
          title={textoBotao}
          onPress={onPress}
          textColor={theme.colors.textPrimary}
          style={styles.botao}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
  titulo: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.normal,
    color: theme.colors.primary,
    textAlign: "center",
    marginTop: theme.spacing.md,
  },
  descricao: {
    fontSize: theme.fontSize.medium,
    color: "#4B5563",
    textAlign: "center",
    marginTop: theme.spacing.sm,
  },
  botao: {
    backgroundColor: theme.colors.primary,
    marginTop: theme.spacing.md,
  },
});
