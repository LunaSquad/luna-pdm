import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { cores } from './cores';

type Props = TextInputProps & {
  label: string;
  icone: React.ReactNode;
  erro?: string;
};

export default function Campo({ label, icone, erro, style, ...input }: Props) {
  return (
    <View style={styles.bloco}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.campo, !!erro && styles.campoErro]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={cores.placeholderCampo}
          accessibilityLabel={label}
          {...input}
        />
        <View style={styles.icone}>{icone}</View>
      </View>
      {!!erro && <Text style={styles.erro}>{erro}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({

  bloco: { marginBottom: 47 },
  label: { fontFamily: 'Inter_700Bold', color: cores.branco, fontSize: 13, textTransform: 'uppercase' },
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: cores.linhaCampo,
    marginTop: 7,
  },
  campoErro: { borderBottomColor: cores.pessego, borderBottomWidth: 2 },
  input: {
    fontFamily: 'Inter_300Light',
    flex: 1,
    color: cores.branco,
    fontSize: 11,
    paddingTop: 8,
    paddingBottom: 3,
    paddingLeft: 0,
  },
  icone: { marginRight: 2 },
  erro: { fontFamily: 'Inter_400Regular', color: cores.pessego, fontSize: 12, marginTop: 4 },
});