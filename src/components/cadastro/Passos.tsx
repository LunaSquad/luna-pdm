import React from 'react';
import { StyleSheet, View } from 'react-native';
import { cores } from './cores';

export default function Passos({ total, atual }: { total: number; atual: number }) {
  return (
    <View
      style={styles.linha}
      accessible
      accessibilityLabel={`Passo ${atual + 1} de ${total}`}
    >
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[styles.bolinha, i === atual && styles.ativa]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  
  linha: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 31, marginBottom: 31 },
  bolinha: { width: 10, height: 10, borderRadius: 5, borderWidth: 1, borderColor: cores.pessego },
  ativa: { backgroundColor: cores.pessego },
});