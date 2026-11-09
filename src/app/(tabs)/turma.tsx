import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { requisitar } from '../../services/api';
import { useUser } from "../../context/UserContext";

// ==========================================
// COMPONENTE REUTILIZÁVEL COM PROPS (Requisito 6)
// ==========================================
type AlunoProps = {
  nome: string;
  hiperfoco: string;
};

const AlunoCard = ({ nome, hiperfoco }: AlunoProps) => (
  <View style={styles.card}>
    <Ionicons name="person-circle-outline" size={42} color="#005C53" />
    <View style={styles.cardInfo}>
      <Text style={styles.alunoNome}>{nome}</Text>
      <Text style={styles.alunoMatricula}>Foco: {hiperfoco || "Não definido"}</Text>
    </View>
  </View>
);

// ==========================================
// TELA PRINCIPAL
// ==========================================
export default function TurmaScreen() {
  const router = useRouter();

  const contexto = useUser();
  const userId = contexto?.userId;

  // Da URL, pegamos apenas o ID que vem da Tag NFC (se existir)
  const { id: turmaIdFromNFC } = useLocalSearchParams();

  // ESTADOS (Requisito 5)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [turmaInfo, setTurmaInfo] = useState<any>(null);
  const [professorInfo, setProfessorInfo] = useState<any>(null);
  const [alunos, setAlunos] = useState<any[]>([]);
  const [emTurma, setEmTurma] = useState(false);

  // CONSUMO DA API REST (Requisito 3)
  const carregarOuVincularTurma = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Se viemos do NFC, temos um turmaIdFromNFC para vincular (Rota 7)
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
      // Se não, apenas consultamos a turma atual (Rota 6)
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
      // TRATAMENTO DE ERRO (Requisito 7)
      console.log("Erro de API:", err);
      const mensagemErro = err.message || 'Não foi possível conectar ao servidor.';
      setError(mensagemErro);
      Alert.alert('Atenção', mensagemErro);
    } finally {
      setLoading(false);
    }
  }, [userId, turmaIdFromNFC]);

  // EFEITOS (Requisito 5)
  useEffect(() => {
    carregarOuVincularTurma();
  }, [carregarOuVincularTurma]);

  // TRATAMENTO VISUAL DE CARREGAMENTO (Requisito 7)
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

  // TRATAMENTO DE ALUNO SEM TURMA OU ERRO
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
      {/* HEADER BASEADO NO DESIGN DO LUNA (Requisito 1 - Flexbox) */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Minha Turma</Text>
        <Text style={styles.headerSubtitle}>{turmaInfo?.nome}</Text>
        <Text style={styles.headerSubSubtitle}>{professorInfo?.nome}</Text>
      </View>

      {/* EXIBIÇÃO DE DADOS EM LISTA (Requisito 4) */}
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

// ESTILIZAÇÃO VIA STYLESHEET (Requisito 1)
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