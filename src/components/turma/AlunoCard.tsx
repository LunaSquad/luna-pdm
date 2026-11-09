import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type AlunoProps = {
  nome: string;
  hiperfoco: string;
};

export const AlunoCard = ({ nome, hiperfoco }: AlunoProps) => (
  <View style={styles.card}>
    <Ionicons name="person-circle-outline" size={42} color="#005C53" />
    <View style={styles.cardInfo}>
      <Text style={styles.alunoNome}>{nome}</Text>
      <Text style={styles.alunoMatricula}>Foco: {hiperfoco || "Não definido"}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardInfo: {
    marginLeft: 15,
    flex: 1,
  },
  alunoNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  alunoMatricula: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});