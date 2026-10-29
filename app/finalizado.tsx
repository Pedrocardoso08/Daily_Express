import React from 'react';
import { 
  Text, 
  View, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { cor, criarEstilos, useTema } from '../lib/tema';
 
export default function FinalizadoScreen() {
  useTema();
  const router = useRouter();
 
  const handleVoltar = () => {
    // Redireciona de volta para a Home limpando a pilha de telas do fluxo de compra
    router.replace('/menu');
  };
 
  return (
<View style={styles.container}>
<View style={styles.content}>
        {/* Círculo central com ícone de confirmação/café */}
<View style={styles.circle}>
<Ionicons name="cafe" size={70} color={cor('#C9A075')} />
</View>
 
        {/* Mensagem de confirmação */}
<Text style={styles.statusText}>
          Seu pedido já está a{'\n'}sendo feito!
</Text>
 
        {/* Botão Voltar */}
<TouchableOpacity 
          style={styles.backButton} 
          onPress={handleVoltar}
          activeOpacity={0.85}
>
<Text style={styles.backButtonText}>Voltar</Text>
</TouchableOpacity>
 
      </View>
</View>
  );
}
 
// --- ESTILIZAÇÃO RESPONSIVA ---
const styles = criarEstilos({
  container: {
    flex: 1,
    backgroundColor: '#C9A075',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 30,
  },
  circle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#F6EBDD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2A1F17',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 22,
  },
  backButton: {
    backgroundColor: '#4A3525',
    borderRadius: 12,
    paddingVertical: 13,
    width: '56%',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});