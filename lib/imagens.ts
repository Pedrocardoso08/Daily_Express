import { ImageSourcePropType } from 'react-native';
import { API } from './api';
import { loja } from './loja';

// Logo da cafeteria, pasta imagens/
export const logo = require('../imagens/logo.png');

// Mesmo tamanho em todas as telas
export const estiloLogo = {
  width: 200,
  height: 160,
};

export const banner = require('../imagens/banner.jpg');
export const fotoPerfil = require('../imagens/perfil.jpg');
export const mapa = require('../imagens/mapa.jpg');

// Foto do usuário logado (vem do back-end). Sem foto, usa a imagem padrão.
export function fotoDoUsuario() {
  if (loja.usuario && loja.usuario.foto) {
    return { uri: API + '/' + loja.usuario.foto };
  }
  return fotoPerfil;
}

// Imagem do produto cadastrada na Área do funcionário.
// Produto sem imagem mostra a logo da cafeteria.
// O "nome" não é usado; fica só para as telas continuarem chamando igual.
export function origemImagem(imagem?: string | null, nome?: string): ImageSourcePropType {
  // Imagem escolhida da galeria: fica na pasta fotos do back-end
  if (imagem && imagem.startsWith('fotos/')) {
    return { uri: API + '/' + imagem };
  }

  // Links de fora (Unsplash, Imgur) não carregam nesta rede
  if (
    !imagem ||
    imagem.includes('unsplash.com') ||
    imagem.includes('imgur.com') ||
    imagem.includes('randomuser.me')
  ) {
    return logo;
  }

  return { uri: imagem };
}
