import { useEffect } from 'react';
import { Platform } from 'react-native';
import { router, Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { loja } from '../lib/loja';
import { fundo, TemaProvider, useTema } from '../lib/tema';

// Páginas que podem ser abertas sem estar logado.
// Funcionários tem o próprio código de acesso, então não volta para o login.
const PAGINAS_PUBLICAS = ['/login', '/cadastro', '/esqueciSenha', '/novaSenha', '/funcionarios'];

export default function RootLayout() {
  return (
    <TemaProvider>
      <Navegacao />
    </TemaProvider>
  );
}

function Navegacao() {
  const pathname = usePathname();
  const { escuro } = useTema();

  // No navegador, tira o contorno laranja que aparece ao clicar numa caixa de texto
  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }
    const estilo = document.createElement('style');
    estilo.textContent = 'input:focus, textarea:focus { outline: none !important; }';
    document.head.appendChild(estilo);
    return () => {
      estilo.remove();
    };
  }, []);

  // Roda toda vez que a página muda (inclusive pelo botão voltar do navegador)
  useEffect(() => {
    const paginaPublica = PAGINAS_PUBLICAS.includes(pathname);

    // O setTimeout espera a navegação terminar de abrir a página atual;
    // sem ele, o router.replace é ignorado quando o app acabou de carregar.
    const timer = setTimeout(() => {
      if (!loja.usuario && !paginaPublica) {
        router.replace('/login');
      }

      if (loja.usuario && (pathname === '/login' || pathname === '/cadastro')) {
        router.replace('/menu');
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      <StatusBar style={escuro ? 'light' : 'dark'} />
      <Stack
        initialRouteName="login"
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: fundo('#EAD1A8'),
          },
        }}
      >
        <Stack.Screen name="login" options={{ title: 'Login' }} />
        <Stack.Screen name="cadastro" options={{ title: 'Criar conta' }} />
        <Stack.Screen name="esqueciSenha" options={{ title: 'Esqueci a senha' }} />
        <Stack.Screen name="novaSenha" options={{ title: 'Nova senha' }} />
        <Stack.Screen name="historicoPedidos" options={{ title: 'Histórico de pedidos' }} />
        <Stack.Screen name="cupons" options={{ title: 'Cupons' }} />
        <Stack.Screen name="funcionarios" options={{ title: 'Área do funcionário' }} />
        <Stack.Screen name="endereco" options={{ title: 'Endereços' }} />
        <Stack.Screen name="ajuda" options={{ title: 'Ajuda' }} />
        <Stack.Screen name="faleconosco" options={{ title: 'Fale conosco' }} />
        <Stack.Screen name="sobrenos" options={{ title: 'Sobre nós' }} />
        <Stack.Screen name="produto" options={{ title: 'Produto' }} />
        <Stack.Screen name="fidelidade" options={{ title: 'Fidelidade' }} />
        <Stack.Screen name="personalizacao" options={{ title: 'Personalização' }} />
        <Stack.Screen name="cartoes" options={{ title: 'Cartões' }} />
        <Stack.Screen name="configuracoes" options={{ title: 'Configurações' }} />
        <Stack.Screen name="entrega" options={{ title: 'Entrega' }} />
        <Stack.Screen name="pagamento" options={{ title: 'Pagamento' }} />
        <Stack.Screen name="finalizado" options={{ title: 'Pedido finalizado' }} />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
