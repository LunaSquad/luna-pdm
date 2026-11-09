import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { requisitar } from '../../services/api';
import { useUser } from "../../context/UserContext";

// Importando o componente reutilizável isolado (Requisito 6)
import { AlunoCard } from '../../components/turma/AlunoCard';

export default function TurmaScreen() {
  const router = useRouter();

  const contexto = useUser();
  const userId = contexto?.userId;

  // Da URL que pegamos do NFC pegamos apenas o ID da turma (Caso exista)
  const { id: turmaIdFromNFC } = useLocalSearchParams();

  // ESTADOS USANDO USESTATE
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [turmaInfo, setTurmaInfo] = useState<any>(null);
  const [professorInfo, setProfessorInfo] = useState<any>(null);
  const [alunos, setAlunos] = useState<any[]>([]);
  const [emTurma, setEmTurma] = useState(false);

  // CONSUMO DA API REST
  const carregarOuVincularTurma = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Caso tenha o turmaID do NFC, usamos para vincular
      if (turmaIdFromNFC) {
        const data = await requisitar<any>(`/alunos/${userId}/turma/vincular`, {
          method: "POST",
          body: JSON.stringify({ turmaId: turmaIdFromNFC })
        });

        if (data.emTurma) {
          setEmTurma(true);
          setTurmaInfo(data.turma);
          setProfessorInfo(data.professor);
          setAlunos(data.alunos);
          Alert.alert("Sucesso!", data.mensagem);
        }
      }
      // Se não, apenas consultamos a turma atual
      else {
        const data = await requisitar<any>(`/alunos/${userId}/turma`);

        if (data.emTurma) {
          setEmTurma(true);
          setTurmaInfo(data.turma);
          setProfessorInfo(data.professor);
          setAlunos(data.alunos);
        } else {
          setEmTurma(false);
          setError(data.mensagem);
        }
      }
    } catch (err: any) {
      // TRATAMENTO DE ERRO
      console.log("Erro de API:", err);
      const mensagemErro = err.message || 'Não foi possível conectar ao servidor.';
      setError(mensagemErro);
      Alert.alert('Atenção', mensagemErro);
    } finally {
      setLoading(false);
    }
  }, [userId, turmaIdFromNFC]);

  // useEffect
  useEffect(() => {
    carregarOuVincularTurma();
  }, [carregarOuVincularTurma]);

  //Tratamento visual de carregamento
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#005C53" />
        <Text style={styles.loadingText}>
          {turmaIdFromNFC ? "Vinculando via NFC..." : "Buscando dados da turma..."}
        </Text>
      </View>
    );
  }

  //Tratamento de Aluno sem turma ou erro
  if (!emTurma || error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="scan-circle-outline" size={80} color="#005C53" />
        <Text style={styles.errorText}>{error || "Aproxime o celular do cartão NFC da sua turma para entrar."}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={carregarOuVincularTurma}>
          <Text style={styles.retryText}>Atualizar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* header utilizando flexbox */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Minha Turma</Text>
        <Text style={styles.headerSubtitle}>{turmaInfo?.nome}</Text>
        <Text style={styles.headerSubSubtitle}>{professorInfo?.nome}</Text>
      </View>

      
      {/* Exibição de dados em lista */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Colegas de Sala</Text>

        <FlatList
          data={alunos}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <AlunoCard nome={item.nome} hiperfoco={item.hiperfoco} />
          )}
        />
      </View>
    </View>
  );
}

// Style com stylesheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 30,
  },
  header: {
    backgroundColor: '#005C53',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#e0f2f1',
    fontSize: 18,
    marginTop: 8,
    textAlign: 'center',
  },
  headerSubSubtitle: {
    color: '#b2dfdb',
    fontSize: 14,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#005C53',
    fontWeight: '600',
  },
  errorText: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#005C53',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 10,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});