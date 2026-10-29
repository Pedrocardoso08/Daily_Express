import React, { createContext, useContext, useState } from 'react';
import { StyleSheet } from 'react-native';

// Modo escuro do app inteiro.
// As telas continuam escrevendo as cores do modo claro; aqui cada cor clara
// ganha a sua versão escura, separada por tipo (fundo, borda e texto).

const FUNDO_ESCURO: Record<string, string> = {
  '#EAD1A8': '#1E1611',
  '#C9A075': '#3A2A1E',
  '#F6EBDD': '#2C211A',
  '#FFF4E3': '#2C211A',
  '#FFFFFF': '#33261D',
  '#FFF': '#33261D',
  '#FFFDF9': '#33261D',
  '#E5DFD7': '#3A2C22',
  '#4A3525': '#8B6A4A',
  '#3B291A': '#8B6A4A',
};

const BORDA_ESCURA: Record<string, string> = {
  '#4A3525': '#C9A075',
  '#E4D3C4': '#5A4535',
  '#D3BFAB': '#5A4535',
  '#EAD1A8': '#1E1611',
  '#F6EBDD': '#2C211A',
  '#FFFDF9': '#33261D',
};

const TEXTO_ESCURO: Record<string, string> = {
  '#4A3525': '#F3E6D3',
  '#3B291A': '#F3E6D3',
  '#2A1F17': '#F3E6D3',
  '#2C1810': '#F3E6D3',
  '#1A1A1A': '#F3E6D3',
  '#333': '#F3E6D3',
  '#6B5849': '#CDBBA6',
  '#8C837A': '#B5A493',
  '#A08970': '#B5A493',
  '#9B2335': '#FF8A80',
  '#8B2E2E': '#FF8A80',
  '#B3261E': '#FF8A80',
  '#1F7A4D': '#8EDBA8',
  '#2E5A32': '#8EDBA8',
};

// Cor da logo no modo escuro (ela é marrom e sumiria no fundo escuro)
const COR_LOGO_ESCURO = '#EAD1A8';

let escuroAtual = false;

function trocar(tabela: Record<string, string>, valor: unknown) {
  if (typeof valor !== 'string') {
    return valor;
  }
  return tabela[valor.toUpperCase()] ?? valor;
}

// Para cores escritas direto na tela, como color="#4A3525" nos ícones
export function cor(valor: string) {
  return escuroAtual ? (trocar(TEXTO_ESCURO, valor) as string) : valor;
}

// Para fundos escritos direto na tela, fora de um criarEstilos
export function fundo(valor: string) {
  return escuroAtual ? (trocar(FUNDO_ESCURO, valor) as string) : valor;
}

function versaoEscura(estilos: Record<string, Record<string, unknown>>) {
  const escuros: Record<string, Record<string, unknown>> = {};

  Object.keys(estilos).forEach((nome) => {
    const estilo: Record<string, unknown> = { ...estilos[nome] };

    Object.keys(estilo).forEach((propriedade) => {
      if (propriedade === 'backgroundColor') {
        estilo[propriedade] = trocar(FUNDO_ESCURO, estilo[propriedade]);
      } else if (propriedade.startsWith('border') && propriedade.endsWith('Color')) {
        estilo[propriedade] = trocar(BORDA_ESCURA, estilo[propriedade]);
      } else if (propriedade === 'color' || propriedade === 'tintColor') {
        estilo[propriedade] = trocar(TEXTO_ESCURO, estilo[propriedade]);
      }
    });

    if (/logo/i.test(nome) || nome === 'brandImage') {
      estilo.tintColor = COR_LOGO_ESCURO;
    }

    escuros[nome] = estilo;
  });

  return escuros;
}

// Usado no lugar do StyleSheet.create: guarda a versão clara e a escura
// e entrega a do tema atual.
export function criarEstilos<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  estilos: T & StyleSheet.NamedStyles<any>
): T {
  const claro = StyleSheet.create(estilos) as Record<string | symbol, unknown>;
  const escuro = StyleSheet.create(
    versaoEscura(estilos as Record<string, Record<string, unknown>>)
  ) as Record<string | symbol, unknown>;

  return new Proxy(claro, {
    get(_alvo, nome) {
      return escuroAtual ? escuro[nome] : claro[nome];
    },
  }) as T;
}

type Tema = {
  escuro: boolean;
  alternarTema: () => void;
};

const TemaContexto = createContext<Tema>({ escuro: false, alternarTema: () => {} });

export function TemaProvider({ children }: { children: React.ReactNode }) {
  const [escuro, setEscuro] = useState(false);

  function alternarTema() {
    escuroAtual = !escuroAtual;
    setEscuro(escuroAtual);
  }

  return (
    <TemaContexto.Provider value={{ escuro, alternarTema }}>
      {children}
    </TemaContexto.Provider>
  );
}

// Toda tela chama useTema() para ser desenhada de novo quando o tema muda
export function useTema() {
  return useContext(TemaContexto);
}
