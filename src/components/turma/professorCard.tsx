import { View, Text, Image, StyleSheet } from "react-native";
import { theme } from "../../styles/theme";

type Props = {
  nome: string;
  urlFoto?: string;
};

function iniciais(nome: string) {
  const partes = nome
    .replace(/^Prof\.?ª?\s*/i, "")
    .trim()
    .split(/\s+/);
  const primeira = partes[0]?.[0] ?? "?";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

export function ProfessorCard({ nome, urlFoto }: Props) {
  return (
    <View style={styles.card}>
      {urlFoto ? (
        <Image source={{ uri: urlFoto }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarIniciais]}>
          <Text style={styles.iniciais}>{iniciais(nome)}</Text>
        </View>
      )}

      <View style={styles.textos}>
        <Text style={styles.rotulo}>PROFESSOR(A) DA TURMA</Text>
        <Text style={styles.nome} numberOfLines={2}>
          {nome}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: theme.radius.full,
    borderWidth: 3,
    borderColor: theme.colors.background,
  },
  avatarIniciais: {
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  iniciais: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.large,
    color: theme.colors.secondary,
  },
  textos: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  rotulo: {
    fontFamily: theme.fonts.bold,
    fontSize: 11,
    letterSpacing: 1,
    color: theme.colors.borderThirdMatter,
  },
  nome: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.large,
    color: theme.colors.primary,
    marginTop: 2,
  },
});
