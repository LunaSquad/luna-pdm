import { ComponentProps } from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const COR_PRIMARIA = "#00595F";

type AcaoPerfilProps = {
  icone: ComponentProps<typeof MaterialIcons>["name"];
  texto: string;
  onPress: () => void;
};

export function AcaoPerfil({ icone, texto, onPress }: AcaoPerfilProps) {
  return (
    <TouchableOpacity style={styles.acao} activeOpacity={0.7} onPress={onPress}>
      <MaterialIcons name={icone} size={20} color={COR_PRIMARIA} />
      <Text style={styles.texto}>{texto}</Text>
      <MaterialIcons name="arrow-forward" size={20} color={COR_PRIMARIA} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  acao: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  texto: {
    flex: 1,
    fontSize: 13,
    color: "#222",
  },
});
