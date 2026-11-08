import { View, TextInput, TextInputProps, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

type Props = TextInputProps & {
  icon?: keyof typeof MaterialIcons.glyphMap;
};

export function Input({ icon, style, ...rest }: Props) {
  return (
    <View style={styles.container}>
      {icon && (
        <MaterialIcons name={icon} size={20} color="#6B7280" style={styles.icon} />
      )}
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor="#9CA3AF"
        autoCapitalize="none"
        autoCorrect={false}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    height: 44,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#1F2937",
  },
});