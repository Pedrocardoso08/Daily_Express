import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { criarEstilos, useTema } from '../lib/tema';

// Cor oficial da ODS 12 da ONU
export const COR_ODS12 = '#BF8B2E';

// Selo da ODS 12 (Consumo e Produção Responsáveis). Tocar abre a página /ods12.
// compacto = só uma faixa pequena; sem ele, um cartão com o número 12 grande.
export default function SeloOds12({ texto, compacto }: { texto?: string; compacto?: boolean }) {
  useTema();
  const router = useRouter();

  if (compacto) {
    return (
      <TouchableOpacity style={styles.faixa} onPress={() => router.push('/ods12')} activeOpacity={0.85}>
        <Ionicons name="infinite" size={18} color="#FFFFFF" />
        <Text style={styles.faixaTexto}>{texto ? texto : 'Seguimos a ODS 12 da ONU'}</Text>
        <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.cartao} onPress={() => router.push('/ods12')} activeOpacity={0.85}>
      <View style={styles.numeroCaixa}>
        <Text style={styles.numero}>12</Text>
        <Ionicons name="infinite" size={22} color="#FFFFFF" />
      </View>
      <View style={styles.textos}>
        <Text style={styles.titulo}>NÓS SEGUIMOS A ODS 12</Text>
        <Text style={styles.subtitulo}>Consumo e Produção Responsáveis · ONU</Text>
        {texto ? <Text style={styles.texto}>{texto}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={22} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

const styles = criarEstilos({
  cartao: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COR_ODS12,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  numeroCaixa: {
    width: 58,
    height: 58,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numero: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 26,
  },
  textos: {
    flex: 1,
    gap: 2,
  },
  titulo: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  subtitulo: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  texto: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },

  faixa: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: COR_ODS12,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 8,
  },
  faixaTexto: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    flexShrink: 1,
  },
});
