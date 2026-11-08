import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores } from './cores';

type Props = {
  icone: React.ComponentProps<typeof Ionicons>['name'];
  titulo: string;
  descricao: string;
  onPress: () => void;
};

export default function OpcaoFoto({ icone, titulo, descricao, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${titulo}. ${descricao}`}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.circulo}>
        <Ionicons name={icone} size={18} color={cores.verde} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.descricao}>{descricao}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 17,
    backgroundColor: cores.pessego,
    borderRadius: 6,
    paddingVertical: 11,
    paddingHorizontal: 12,
    marginTop: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
  },
  circulo: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: cores.circuloFoto,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: { fontFamily: 'Inter_700Bold', color: cores.verde, fontSize: 12 },
  descricao: { fontFamily: 'Inter_400Regular', color: cores.verde, fontSize: 10, marginTop: 2 },
});