import React from 'react';
import { Text, View, TouchableOpacity, Image, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect} from 'expo-router';
import { estiloLogo, logo, origemImagem } from '../../lib/imagens';
import { useState, useCallback } from 'react';
import { loja, alternarFavorito, ProdutoFavorito} from '../../lib/loja';
import { cor, criarEstilos, useTema } from '../../lib/tema';

export default function FavoritosScreen() {
  useTema();
  const router = useRouter();
  const [favoritos, setFavoritos] = useState<ProdutoFavorito[]>([]);

  useFocusEffect(
    useCallback(() => {
      setFavoritos([...loja.favoritos]);
    }, [])
  );

  function desfavoritar(item: ProdutoFavorito) {
    alternarFavorito(item);
    setFavoritos([...loja.favoritos]);
  }

  function abrirProduto(item: ProdutoFavorito) {
    router.push({
      pathname: '/produto',
      params: {
        nome: item.nome,
        descricao: item.desc,
        nota: item.nota,
        preco: item.preco,
        imagem: item.imagem,
      },
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.curveContainer}>
        <Image
          source={logo}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.screenTitle}>Favoritos</Text>
      </View>

      {favoritos.length === 0 ? (
        <View style={styles.vazio}>
          <Ionicons name="heart-outline" size={80} color={cor('#4A3525')} />
          <Text style={styles.vazioTitulo}>Nenhum favorito ainda</Text>
          <Text style={styles.vazioTexto}>Toque no coração de um produto para salvar ele aqui.</Text>

          <TouchableOpacity style={styles.botao} onPress={() => router.push('/menu')}>
            <Text style={styles.botaoTexto}>Ver cardápio</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favoritos}
          keyExtractor={(item) => item.nome}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => abrirProduto(item)}
            >
              <Image source={origemImagem(item.imagem, item.nome)} style={styles.cardImagem} />
              <View style={styles.cardInfo}>
                <Text style={styles.cardNome} numberOfLines={1}>{item.nome}</Text>
                <Text style={styles.cardDesc} numberOfLines={1}>{item.desc}</Text>
                <Text style={styles.cardPreco}>R${item.preco}</Text>
              </View>
              <TouchableOpacity onPress={() => desfavoritar(item)} hitSlop={8}>
                <Ionicons name="heart" size={26} color={cor('#4A3525')} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = criarEstilos({
  container: {
    flex: 1,
    backgroundColor: '#EAD1A8',
  },
  curveContainer: {
    backgroundColor: '#C9A075',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingTop: 45,
    paddingBottom: 22,
    alignItems: 'center',
  },
  logo: {
    ...estiloLogo,
  },
  screenTitle: {
    fontSize: 26,
    color: '#4A3525',
    fontWeight: 'bold',
    marginTop: 8,
  },
  vazio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingBottom: 100,
  },
  vazioTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2A1F17',
    marginTop: 16,
  },
  vazioTexto: {
    fontSize: 14,
    color: '#3B291A',
    textAlign: 'center',
    marginTop: 6,
  },
  botao: {
    backgroundColor: '#4A3525',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 28,
    marginTop: 24,
  },
  botaoTexto: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  lista: {
    padding: 20,
    paddingBottom: 110,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6EBDD',
    borderRadius: 16,
    padding: 12,
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardImagem: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardNome: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2A1F17',
  },
  cardDesc: {
    fontSize: 12,
    color: '#3B291A',
    marginTop: 2,
  },
  cardPreco: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4A3525',
    marginTop: 4,
  },
});
