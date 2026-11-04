import { Alert, Platform } from 'react-native';

export function aviso(titulo: string, mensagem?: string) {
  if (Platform.OS === 'web') {
    window.alert(mensagem ? `${titulo}\n${mensagem}` : titulo);
  } else {
    Alert.alert(titulo, mensagem);
  }
}
