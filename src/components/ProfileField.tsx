import { ReactNode } from "react";
import { View, Text, StyleSheet } from "react-native";

type CampoPerfilProps = {
  label: string;
  valor?: string;
  children?: ReactNode;
};

export function CampoPerfil({ label, valor, children }: CampoPerfilProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {children ?? <Text style={styles.valor}>{valor || "-"}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#000",
  },
  valor: {
    fontSize: 13,
    color: "#222",
    marginTop: 4,
  },
});
