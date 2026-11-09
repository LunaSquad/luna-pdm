import { useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { theme } from "../../styles/theme";
import { Input } from "../common/input";
import CustomButton from "../common/customButton";

type Props = {
  /** Recebe o que o aluno digitou/colou (link da tag ou só o id da turma). */
  onEnviar: (texto: string) => void;
  carregando?: boolean;
};

/** Alternativa à tag NFC: colar o link/id da turma (ex.: aparelho sem NFC). */
export function CodigoTurmaForm({ onEnviar, carregando = false }: Props) {
  const [texto, setTexto] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Sem NFC ou sem a tag?</Text>
      <Text style={styles.descricao}>Cole o link ou o código que o professor te passou.</Text>

      <Input
        icon="link"
        placeholder="appluna://turma/..."
        value={texto}
        onChangeText={setTexto}
        editable={!carregando}
      />

      {carregando ? (
        <ActivityIndicator color={theme.colors.primary} style={styles.carregando} />
      ) : (
        <CustomButton
          title="Entrar com código"
          textColor={theme.colors.textPrimary}
          style={styles.botao}
          onPress={() => onEnviar(texto)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  titulo: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.normal,
    color: theme.colors.textDark,
  },
  descricao: {
    fontSize: theme.fontSize.medium,
    color: "#4B5563",
  },
  botao: {
    backgroundColor: theme.colors.primary,
    marginTop: theme.spacing.xs,
  },
  carregando: {
    marginTop: theme.spacing.md,
  },
});
