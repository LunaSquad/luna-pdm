import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useFonts, Inter_400Regular, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import { MuseoModerno_200ExtraLight } from '@expo-google-fonts/museomoderno';
import { cores } from '../theme';
import { aviso } from '../utils/aviso';
import { loginProfessor } from '../services/api';

const ilustracao = require('../../assets/login-ilustracao.png');

export default function LoginProfessor() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    Inter_800ExtraBold,
    MuseoModerno_200ExtraLight,
  });

  if (!fontsLoaded) return null;

  async function entrar() {
  if (!email.trim() || !senha.trim()) {
    aviso('Campos obrigatórios', 'Informe o e-mail institucional e a senha.');
    return;
  }
  try {
    setCarregando(true);
    const dados = await loginProfessor(email.trim(), senha);
    // TODO: guardar dados.token e navegar para a home do professor
    aviso('Login', 'Login realizado com sucesso!');
  } catch (erro: any) {
    aviso('Não foi possível entrar', erro.message);
  } finally {
    setCarregando(false);
  }
}

  return (
    <SafeAreaView style={styles.tela}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* Topo branco */}
          <View style={styles.topo}>
            <Pressable
              style={styles.voltar}
              hitSlop={12}
              onPress={() => aviso('Voltar')}
              accessibilityLabel="Voltar"
            >
              <Ionicons name="chevron-back" size={32} color={cores.verde} />
            </Pressable>

            <Text style={styles.logo}>luna</Text>
            <Image source={ilustracao} style={styles.ilustracao} resizeMode="contain" />
          </View>

          {/* Painel verde */}
          <View style={styles.painel}>
            <Text style={styles.titulo}>LOGIN</Text>

            <Text style={[styles.label, { marginTop: 36 }]}>E-MAIL INSTITUCIONAL</Text>
            <View style={styles.campo}>
              <TextInput
                style={styles.input}
                placeholder="E-mail institucional"
                placeholderTextColor={cores.placeholder}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Ionicons name="mail" size={20} color={cores.pessego} />
            </View>

            <Text style={[styles.label, { marginTop: 40 }]}>Senha</Text>
            <View style={styles.campo}>
              <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor={cores.placeholder}
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
                autoCapitalize="none"
              />
              <Ionicons name="lock-closed" size={20} color={cores.pessego} />
            </View>

            <Pressable
              style={({ pressed }) => [styles.botao, (pressed || carregando) && { opacity: 0.85 }]}
              onPress={entrar}
              disabled={carregando}
            >
              {carregando ? (
                <ActivityIndicator color={cores.verde} />
              ) : (
                <Text style={styles.botaoTexto}>Login</Text>
              )}
            </Pressable>

            <Text style={styles.cadastro}>
              Novo por aqui?{' '}
              <Text style={styles.cadastroLink} onPress={() => aviso('Cadastro')}>
                Cadastre-se!
              </Text>
            </Text>

            <View style={styles.divisor} />

            <View style={styles.redes}>
              <FontAwesome name="whatsapp" size={30} color={cores.pessego} />
              <FontAwesome name="instagram" size={30} color={cores.pessego} />
              <FontAwesome name="facebook-official" size={30} color={cores.pessego} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.branco },
  scroll: { flexGrow: 1 },

  topo: {
    backgroundColor: cores.branco,
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 28,
  },
  voltar: { position: 'absolute', left: 16, top: 24 },

  logo: {
    fontFamily: 'MuseoModerno_200ExtraLight',
    fontSize: 34,
    letterSpacing: 2,
    color: cores.verde,
    marginTop: 4,
  },

  ilustracao: { width: 230, height: 170, marginTop: 8 },

  painel: {
    flex: 1,
    backgroundColor: cores.verde,
    borderTopRightRadius: 56,
    paddingHorizontal: '18%',
    paddingTop: 44,
    paddingBottom: 40,
  },
  titulo: { fontFamily: 'Inter_800ExtraBold', color: cores.pessego, fontSize: 20 },
  label: { fontFamily: 'Inter_700Bold', color: cores.branco, fontSize: 13 },

  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: cores.linha,
    marginTop: 4,
  },
  input: { fontFamily: 'Inter_400Regular', flex: 1, color: cores.branco, fontSize: 12, paddingVertical: 8 },

  botao: {
    alignSelf: 'center',
    backgroundColor: cores.pessego,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 40,
    marginTop: 44,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
  },
  botaoTexto: { fontFamily: 'Inter_700Bold', color: cores.verde, fontSize: 20 },

  cadastro: {
    fontFamily: 'Inter_400Regular', 
    color: cores.branco, 
    fontSize: 13, 
    textAlign: 'center', 
    marginTop: 22 
  },

  cadastroLink: { fontFamily: 'Inter_700Bold' },

  divisor: {
    height: 1,
    backgroundColor: cores.linha,
    marginTop: 22,
  },
  redes: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 28,
    marginTop: 16,
  },
});
