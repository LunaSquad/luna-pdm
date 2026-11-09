import { View, Text, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { theme } from "../../styles/theme";

type Props = {
  nome: string;
  numero: string;
};

type Estilo = {
  icone: keyof typeof MaterialIcons.glyphMap;
  fundo: string;
  cor: string;
};

// Mesmas cores das matérias da Home, para a turma "conversar" com ela.
function estiloDaMateria(nome: string): Estilo {
  const n = nome.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

  if (n.includes("port"))
    return { icone: "menu-book", fundo: theme.colors.firstMatter, cor: theme.colors.borderFirstMatter };
  if (n.includes("mat"))
    return { icone: "calculate", fundo: theme.colors.secondMatter, cor: theme.colors.borderSecondMatter };
  if (n.includes("geo"))
    return { icone: "public", fundo: theme.colors.thirdMatter, cor: theme.colors.borderThirdMatter };
  if (n.includes("hist"))
    return { icone: "history-edu", fundo: theme.colors.fourthMatter, cor: theme.colors.borderFourthMatter };
  if (n.includes("cien"))
    return { icone: "science", fundo: theme.colors.fifthMatter, cor: theme.colors.borderFifthMatter };

  return { icone: "school", fundo: "#EFEFEF", cor: theme.colors.primary };
}

export function MateriaItem({ nome, numero }: Props) {
  const { icone, fundo, cor } = estiloDaMateria(nome);

  return (
    <View style={[styles.item, { backgroundColor: fundo }]}>
      <View style={styles.iconeBolha}>
        <MaterialIcons name={icone} size={24} color={cor} />
      </View>

      <Text style={[styles.nome, { color: cor }]} numberOfLines={1}>
        {nome}
      </Text>

      <Text style={[styles.numero, { color: cor }]}>{numero}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: theme.spacing.md,
    marginBottom: 10,
  },
  iconeBolha: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.full,
    backgroundColor: "rgba(255,255,255,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  nome: {
    flex: 1,
    marginLeft: theme.spacing.md,
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.normal,
  },
  numero: {
    fontFamily: theme.fonts.bold,
    fontSize: theme.fontSize.medium,
    opacity: 0.7,
  },
});
