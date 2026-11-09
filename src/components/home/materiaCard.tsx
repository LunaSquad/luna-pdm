import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageSourcePropType,
} from "react-native";
import { theme } from "../../styles/theme";
import CustomButton from "../common/customButton";

type Props = {
  title: string;
  image: ImageSourcePropType;
  backgroundColor: string;
  titleColor?: string;
  buttonColor: string;
  number: string | number;
  onPress?: () => void;
};

const BADGE_WIDTH = 32;
const BADGE_HEIGHT = 32;
const POINT_HEIGHT = 12;

function NumeroBadge({ number, color }: { number: string; color: string }) {
  return (
    <View style={{ alignItems: "center" }}>
      <View
        style={{
          width: BADGE_WIDTH,
          height: BADGE_HEIGHT,
          backgroundColor: color,
          borderTopLeftRadius: 6,
          borderTopRightRadius: 6,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 12,
            fontWeight: "700",
            alignItems: "center",
          }}
        >
          {number}
        </Text>
      </View>

      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: BADGE_WIDTH / 2,
          borderRightWidth: BADGE_WIDTH / 2,
          borderTopWidth: POINT_HEIGHT,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderTopColor: color,
        }}
      />
    </View>
  );
}

export function MateriaCard({
  title,
  image,
  backgroundColor,
  titleColor,
  buttonColor,
  number,
  onPress,
}: Props) {
  return (
    <View style={[styles.card, { backgroundColor }]}>
      <View style={styles.badgeWrapper}>
        <NumeroBadge number={String(number)} color={buttonColor} />
      </View>

      <View style={styles.containerTitulo}>
        <Text style={[styles.title, titleColor && { color: titleColor }]}>
          {title}
        </Text>
      </View>

      <Image
        source={image}
        style={styles.image}
        resizeMode="contain"
      />

      <Text style={styles.description}>
        Clique no botão para visualizar as lições atribuídas pelo professor.
      </Text>

      <CustomButton
        title="Visualizar"
        onPress={onPress}
        textColor="#FFFFFF"
        fontWeight="bold"
        style={[
          styles.button,
          { backgroundColor: buttonColor },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200,
    height: 310,
    borderRadius: 14,
    padding: theme.spacing.md || 12,
    marginRight: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    justifyContent: "space-between",
    alignItems: "center",
  },
  numberContainer: {
    alignSelf: "flex-end",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderBottomLeftRadius: 10,
    borderTopRightRadius: 12,
    marginTop: -4,
    marginRight: -4,
  },
  numberText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  containerTitulo:{
    width: "100%",
    marginTop: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "start",
    width: 150,
    paddingHorizontal: 10,
    marginTop: 14,
  },
  image: {
    width: "100%",
    height: 85,
    alignSelf: "center",
  },
  description: {
    fontSize: 11,
    lineHeight: 15,
    textAlign: "center",
    color: "#4B5563",
    paddingHorizontal: 4,
  },
  button: {
    width: 105,
    paddingVertical: 7,
    paddingHorizontal: 0,
    borderRadius: 6,
  },
  badgeWrapper: {
    position: "absolute",
    top: -10,
    right: 16,
  },
});