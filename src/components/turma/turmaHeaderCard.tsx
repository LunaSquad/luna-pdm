import { View, Text, Image, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { theme } from "../../styles/theme";

import Luna3d from "../../../assets/luna3d.png";

type Props = {
  nome: string;
  escola: string;
  anoLetivo?: string;
  periodo?: string;
};

function Chip({ icone, texto }: { icone: keyof typeof MaterialIcons.glyphMap; texto: string }) {
  return (
    <View style={styles.chip}>
      <MaterialIcons name={icone} size={14} color={theme.colors.secondary} />
      <Text style={styles.chipTexto}>{texto}</Text>
    </View>
  );
}

export function TurmaHeaderCard({ nome, escola, anoLetivo, periodo }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.conteudo}>
        <Text style={styles.rotulo}>SUA TURMA</Text>
        <Text style={styles.nome}>{nome}</Text>
        {escola ? (
          <Text style={styles.escola} numberOfLines={2}>
            {escola}
          </Text>
        ) : null}

        {anoLetivo || periodo ? (
          <View style={styles.chips}>
            {periodo ? <Chip icone="wb-sunny" texto={periodo} /> : null}
            {anoLetivo ? <Chip icone="event" texto={anoLetivo} /> : null}
          </View>
        ) : null}
      </View>

      <Image source={Luna3d} style={styles.luna3d} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    minHeight: 150,
    justifyContent: "center",
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  conteudo: {
    // deixa espaço à direita para a ilustração da Luna
    paddingRight: 70,
  },
  rotulo: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.small,
    letterSpacing: 1.5,
    color: theme.colors.secondary,
  },
  nome: {
    fontFamily: theme.fonts.bold,
    fontSize: 30,
    color: theme.colors.textPrimary,
    marginTop: 4,
  },
  escola: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.textPrimary,
    opacity: 0.85,
    marginTop: 2,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: theme.spacing.md,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: theme.radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipTexto: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.small,
  },
  luna3d: {
    width: 80,
    height: 140,
    position: "absolute",
    right: -6,
    bottom: -8,
    resizeMode: "contain",
  },
});
