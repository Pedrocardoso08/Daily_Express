-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 05/11/2026 às 18:51
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `daily_express`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `avaliacoes`
--

CREATE TABLE `avaliacoes` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `produto_id` int(11) NOT NULL,
  `nota` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `avaliacoes`
--

INSERT INTO `avaliacoes` (`id`, `usuario_id`, `produto_id`, `nota`) VALUES
(1, 1, 1, 5),
(2, 2, 1, 1),
(3, 1, 2, 5);

-- --------------------------------------------------------

--
-- Estrutura para tabela `carrinho_itens`
--

CREATE TABLE `carrinho_itens` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `produto_id` int(11) NOT NULL,
  `tamanho` char(1) DEFAULT 'P',
  `opcional` varchar(50) DEFAULT '---',
  `quantidade` int(11) DEFAULT 1,
  `ativo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `cartoes`
--

CREATE TABLE `cartoes` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `nome` varchar(50) NOT NULL,
  `ultimos_digitos` char(4) NOT NULL,
  `validade` char(5) NOT NULL,
  `ativo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `categorias`
--

CREATE TABLE `categorias` (
  `id` int(11) NOT NULL,
  `nome` varchar(50) NOT NULL,
  `icone` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `categorias`
--

INSERT INTO `categorias` (`id`, `nome`, `icone`) VALUES
(1, 'Bebidas', 'cafe'),
(2, 'Promoção', 'gift'),
(3, 'Doces', 'ice-cream'),
(4, 'Salgados', 'fast-food');

-- --------------------------------------------------------

--
-- Estrutura para tabela `cupons`
--

CREATE TABLE `cupons` (
  `id` int(11) NOT NULL,
  `codigo` varchar(30) NOT NULL,
  `titulo` varchar(100) NOT NULL,
  `descricao` varchar(255) DEFAULT NULL,
  `tipo` varchar(15) NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `validade` date DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `cupons`
--

INSERT INTO `cupons` (`id`, `codigo`, `titulo`, `descricao`, `tipo`, `valor`, `validade`, `ativo`) VALUES
(1, 'SATT10', '10% off', 'só pode essa semana', 'PORCENTAGEM', 10.00, '0000-00-00', 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `enderecos`
--

CREATE TABLE `enderecos` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `tipo` varchar(10) NOT NULL,
  `rua` varchar(150) NOT NULL,
  `numero` varchar(10) NOT NULL,
  `bairro` varchar(100) NOT NULL,
  `cidade` varchar(100) NOT NULL,
  `ativo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `enderecos`
--

INSERT INTO `enderecos` (`id`, `usuario_id`, `tipo`, `rua`, `numero`, `bairro`, `cidade`, `ativo`) VALUES
(1, 1, 'CASA', 'do superman', '256', 'rua do superman', 'metropolis', 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `favoritos`
--

CREATE TABLE `favoritos` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `produto_id` int(11) NOT NULL,
  `ativo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `favoritos`
--

INSERT INTO `favoritos` (`id`, `usuario_id`, `produto_id`, `ativo`) VALUES
(1, 1, 2, 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `notificacoes`
--

CREATE TABLE `notificacoes` (
  `id` int(11) NOT NULL,
  `titulo` varchar(100) NOT NULL,
  `descricao` varchar(255) NOT NULL,
  `icone` varchar(50) NOT NULL,
  `criado_em` datetime DEFAULT current_timestamp(),
  `ativo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `pedidos`
--

CREATE TABLE `pedidos` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `modo` varchar(15) NOT NULL,
  `endereco_entrega` varchar(255) DEFAULT NULL,
  `forma_pagamento` varchar(30) NOT NULL,
  `cupom` varchar(30) DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `desconto` decimal(10,2) DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL,
  `status` varchar(20) DEFAULT 'Preparando',
  `criado_em` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `pedidos`
--

INSERT INTO `pedidos` (`id`, `usuario_id`, `modo`, `endereco_entrega`, `forma_pagamento`, `cupom`, `subtotal`, `desconto`, `total`, `status`, `criado_em`) VALUES
(1, 1, 'Comer aqui', NULL, 'Pix', NULL, 123123.00, 0.00, 123123.00, 'Cancelado', '2026-11-05 11:23:58'),
(2, 2, 'Comer aqui', NULL, 'Pix', NULL, 123123.00, 0.00, 123123.00, 'Cancelado', '2026-11-05 11:25:03'),
(3, 1, 'Levar', 'do superman, 256 - rua do superman, metropolis', 'Cartão de crédito', NULL, 104.00, 0.00, 104.00, 'Finalizado', '2026-11-05 13:36:15'),
(4, 1, 'Comer aqui', NULL, 'Pix', NULL, 79.90, 0.00, 79.90, 'Finalizado', '2026-11-05 14:31:56');

-- --------------------------------------------------------

--
-- Estrutura para tabela `pedido_itens`
--

CREATE TABLE `pedido_itens` (
  `id` int(11) NOT NULL,
  `pedido_id` int(11) NOT NULL,
  `produto_id` int(11) NOT NULL,
  `tamanho` char(1) DEFAULT 'P',
  `opcional` varchar(50) DEFAULT '---',
  `quantidade` int(11) DEFAULT 1,
  `preco_unitario` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `pedido_itens`
--

INSERT INTO `pedido_itens` (`id`, `pedido_id`, `produto_id`, `tamanho`, `opcional`, `quantidade`, `preco_unitario`) VALUES
(1, 1, 1, 'P', '---', 1, 123123.00),
(2, 2, 1, 'P', '---', 1, 123123.00),
(3, 3, 2, 'P', '---', 13, 8.00),
(4, 4, 31, 'U', '---', 1, 10.00),
(5, 4, 16, 'U', '---', 1, 14.00),
(6, 4, 14, 'P', '---', 1, 12.00),
(7, 4, 13, 'P', '---', 1, 18.00),
(8, 4, 26, 'U', '---', 1, 10.00),
(9, 4, 6, 'U', '---', 1, 15.90);

-- --------------------------------------------------------

--
-- Estrutura para tabela `preferencias`
--

CREATE TABLE `preferencias` (
  `usuario_id` int(11) NOT NULL,
  `tipo_leite` varchar(30) DEFAULT 'Integral',
  `acucar` varchar(30) DEFAULT '2 colheres',
  `receber_promocoes` tinyint(1) DEFAULT 0,
  `notificacoes_ativas` tinyint(1) DEFAULT 1,
  `localizacao_ativa` tinyint(1) DEFAULT 1,
  `modo_escuro` tinyint(1) DEFAULT 0,
  `idioma` varchar(2) DEFAULT 'pt',
  `volume` int(11) DEFAULT 70
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `preferencias`
--

INSERT INTO `preferencias` (`usuario_id`, `tipo_leite`, `acucar`, `receber_promocoes`, `notificacoes_ativas`, `localizacao_ativa`, `modo_escuro`, `idioma`, `volume`) VALUES
(1, 'Integral', '2 colheres', 0, 1, 1, 0, 'pt', 70),
(2, 'Integral', '2 colheres', 0, 1, 1, 0, 'pt', 70),
(3, 'Integral', '2 colheres', 0, 1, 1, 0, 'pt', 70);

-- --------------------------------------------------------

--
-- Estrutura para tabela `produtos`
--

CREATE TABLE `produtos` (
  `id` int(11) NOT NULL,
  `categoria_id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `descricao_curta` varchar(150) NOT NULL,
  `descricao_completa` text DEFAULT NULL,
  `preco` decimal(10,2) NOT NULL,
  `preco_antigo` decimal(10,2) DEFAULT NULL,
  `imagem` varchar(255) DEFAULT NULL,
  `disponivel` tinyint(1) DEFAULT 1,
  `ativo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `produtos`
--

INSERT INTO `produtos` (`id`, `categoria_id`, `nome`, `descricao_curta`, `descricao_completa`, `preco`, `preco_antigo`, `imagem`, `disponivel`, `ativo`) VALUES
(1, 1, 'teste', 'teste', NULL, 123123.00, 99999999.99, 'fotos/produto_1793888464348.jpg', 1, 0),
(2, 1, 'Espresso', 'Café curto, intenso e encorpado.', NULL, 8.00, NULL, 'https://images.pexels.com/photos/18604200/pexels-photo-18604200.jpeg', 1, 1),
(3, 2, 'Expresso duplo', 'Duas doses de expresso para quem prefere um café mais forte', NULL, 10.50, 12.99, 'https://images.pexels.com/photos/20372607/pexels-photo-20372607.jpeg', 1, 1),
(4, 1, 'Café coado', 'Café filtrado tradicional, sabor suave', NULL, 8.00, NULL, 'https://images.pexels.com/photos/36643347/pexels-photo-36643347.jpeg', 1, 1),
(5, 1, 'Café com leite', 'Expresso com leite vaporizado.', NULL, 11.00, NULL, 'https://images.pexels.com/photos/32590864/pexels-photo-32590864.jpeg', 1, 1),
(6, 2, 'Capuccino tradicional', 'Expresso, leite vaporizado, espuma e canela/cacau', NULL, 15.90, 18.90, 'https://images.pexels.com/photos/29621584/pexels-photo-29621584.jpeg', 1, 1),
(7, 2, 'Latte', 'Café com bastante leite vaporizado e espuma leve', NULL, 16.00, 19.00, 'https://images.pexels.com/photos/6747870/pexels-photo-6747870.jpeg', 1, 1),
(8, 1, 'Mocha', 'Expresso, chocolate e leite vaporizado', NULL, 18.01, NULL, 'https://images.pexels.com/photos/26951875/pexels-photo-26951875.jpeg', 1, 1),
(9, 1, 'Macchiato', 'Expresso com uma pequena camada de espuma de leite', NULL, 12.99, NULL, 'https://images.pexels.com/photos/6763217/pexels-photo-6763217.jpeg', 1, 1),
(10, 1, 'Affogato', 'Bola de sorvete de baunilha com expresso quente', NULL, 22.00, NULL, 'https://images.pexels.com/photos/32972513/pexels-photo-32972513.jpeg', 1, 1),
(11, 1, 'Cold brew', 'Café extraído lentamente em água fria, servido gelado', NULL, 18.00, NULL, 'https://images.pexels.com/photos/24023677/pexels-photo-24023677.jpeg', 1, 1),
(12, 2, 'Latte gelado', 'Expresso, leite, gelo, e calda', NULL, 17.00, 18.00, 'https://images.pexels.com/photos/18142624/pexels-photo-18142624.jpeg', 1, 1),
(13, 1, 'Chocolate quente', 'Chocolate cremoso preparado com leite', NULL, 18.00, NULL, 'https://images.pexels.com/photos/21854116/pexels-photo-21854116.jpeg', 1, 1),
(14, 1, 'Chá artesanal', 'Chás premium quentes ou gelados', NULL, 12.00, NULL, 'https://images.pexels.com/photos/7649784/pexels-photo-7649784.jpeg', 1, 1),
(15, 2, 'Cookie artesanal', 'Cookie macio com gotas de chocolate', NULL, 8.00, 10.00, 'https://images.pexels.com/photos/15115646/pexels-photo-15115646.jpeg', 1, 1),
(16, 3, 'Brownie', 'Brownie de chocolate servido simples e aquecido', NULL, 14.00, NULL, 'https://images.pexels.com/photos/40262827/pexels-photo-40262827.jpeg', 1, 1),
(17, 3, 'Cheesecake', 'Cheesecake com calda de frutas vermelhas', NULL, 22.00, NULL, 'https://images.pexels.com/photos/17429510/pexels-photo-17429510.jpeg', 1, 1),
(18, 2, 'Fatia de bolo', 'Sabores variados do dia', NULL, 12.00, 15.00, 'https://images.pexels.com/photos/8470233/pexels-photo-8470233.jpeg', 1, 1),
(19, 4, 'Croissant simples', 'Massa folhada amanteigada', NULL, 12.00, NULL, 'https://images.pexels.com/photos/15937218/pexels-photo-15937218.jpeg', 1, 1),
(20, 4, 'Croissant recheado salgado', 'Presunto e queijo ou frango com cream cheese', NULL, 19.00, NULL, 'https://images.pexels.com/photos/28442301/pexels-photo-28442301.jpeg', 1, 1),
(21, 3, 'Croissant recheado doce', 'chocolate ou chocolate branco', NULL, 19.00, NULL, 'https://images.pexels.com/photos/30391094/pexels-photo-30391094.jpeg', 1, 1),
(22, 4, 'Pão de queijo', 'Porção de 5 unidades', NULL, 12.00, NULL, 'https://images.pexels.com/photos/38598140/pexels-photo-38598140.jpeg', 1, 1),
(23, 4, 'Quiche', 'Lorraine, alho-poró ou queijo', NULL, 18.00, NULL, 'https://images.pexels.com/photos/31882545/pexels-photo-31882545.jpeg', 1, 1),
(24, 4, 'Sanduíche artesanal', 'Pão artesanal, queijo, salada e proteina', NULL, 26.00, NULL, 'https://images.pexels.com/photos/8644038/pexels-photo-8644038.jpeg', 1, 1),
(25, 4, 'Bruschetta', 'Pão italiano com tomate, manjericão e parmesão', NULL, 19.00, NULL, 'https://images.pexels.com/photos/5639411/pexels-photo-5639411.jpeg', 1, 1),
(26, 2, 'Donut tradicional', 'cobertura de chocolate com confeitos', NULL, 10.00, 12.00, 'https://images.pexels.com/photos/7440369/pexels-photo-7440369.jpeg', 1, 1),
(27, 3, 'Donut recheado', 'Nutella e morango', NULL, 15.00, NULL, 'https://images.pexels.com/photos/17927079/pexels-photo-17927079.jpeg', 1, 1),
(28, 3, 'Macaron (unidade)', 'Casquinha francesa recheada', NULL, 9.00, NULL, 'https://images.pexels.com/photos/32600939/pexels-photo-32600939.jpeg', 1, 1),
(29, 3, 'Éclair', 'Massa choux recheada com creme e cobertura de chocolate', NULL, 14.00, NULL, 'https://images.pexels.com/photos/28657096/pexels-photo-28657096.jpeg', 1, 1),
(30, 3, 'Alfajor argentino', 'Recheado com doce de leite e coberto com chocolate', NULL, 13.00, NULL, 'https://images.pexels.com/photos/9501652/pexels-photo-9501652.jpeg', 1, 1),
(31, 3, 'Palha Italiana', 'Brigadeiro com biscoito', NULL, 10.00, NULL, 'https://images.pexels.com/photos/9501670/pexels-photo-9501670.jpeg', 1, 1),
(32, 4, 'Empada de Frango', 'Massa amanteigada com recheio cremoso', NULL, 13.00, NULL, 'https://images.pexels.com/photos/39070762/pexels-photo-39070762.jpeg', 1, 1),
(33, 4, 'Empada de palmito', 'Recheio bem temperado', NULL, 13.00, NULL, 'https://images.pexels.com/photos/34318142/pexels-photo-34318142.jpeg', 1, 1),
(34, 4, 'Tostex artesanal', 'Queijo e presunto no pão de fermentação natural', NULL, 18.00, NULL, 'https://images.pexels.com/photos/17429550/pexels-photo-17429550.jpeg', 1, 1),
(35, 4, 'Bagel com salmão defumado', 'Cream cheese, salmão e alface', NULL, 34.00, NULL, 'https://images.pexels.com/photos/38399734/pexels-photo-38399734.jpeg', 1, 1),
(36, 4, 'Begel de frango', 'Frango empanado, cream cheese e alface', NULL, 25.00, NULL, 'https://images.pexels.com/photos/30270636/pexels-photo-30270636.jpeg', 1, 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `recompensas`
--

CREATE TABLE `recompensas` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `pontos` int(11) NOT NULL,
  `ativo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `recuperacao_senha`
--

CREATE TABLE `recuperacao_senha` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `codigo` varchar(6) NOT NULL,
  `expira_em` datetime NOT NULL,
  `usado` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `recuperacao_senha`
--

INSERT INTO `recuperacao_senha` (`id`, `usuario_id`, `codigo`, `expira_em`, `usado`) VALUES
(1, 1, '263791', '2026-11-05 12:02:32', 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `tamanhos`
--

CREATE TABLE `tamanhos` (
  `sigla` char(1) NOT NULL,
  `nome` varchar(20) NOT NULL,
  `acrescimo` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `tamanhos`
--

INSERT INTO `tamanhos` (`sigla`, `nome`, `acrescimo`) VALUES
('G', 'Grande', 4.00),
('M', 'Médio', 2.00),
('P', 'Pequeno', 0.00),
('U', 'Único', 0.00);

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `data_nascimento` date DEFAULT NULL,
  `pontos_fidelidade` int(11) DEFAULT 0,
  `ultimo_login` datetime DEFAULT NULL,
  `criado_em` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `usuarios`
--

INSERT INTO `usuarios` (`id`, `nome`, `email`, `senha`, `foto`, `data_nascimento`, `pontos_fidelidade`, `ultimo_login`, `criado_em`) VALUES
(1, 'Lucas Manarim', 'lucaslegal@email.com', '$2b$12$sInHaLBK4fP.xRZmYyp2A.H2YEyWFf4Gb54YgtX44mHWopzZwtcYO', 'fotos/usuario_1_1793890041495.jpg', NULL, 1233069, '2026-11-05 14:30:47', '2026-11-05 11:16:18'),
(2, 'Lara Andrade', 'lara@email.com', '$2b$12$XgyeNEHw/vuKacYh/Xpis.MvuCmGtpPHhUfn/F1kw2MM4T/fsi666', NULL, NULL, 1231230, '2026-11-05 11:24:54', '2026-11-05 11:24:44'),
(3, 'Lara Andrade Fernandes', 'laraandrade@email.com', '$2b$12$S9i8XaipiyliYz.x2SYfTeasudBSUd/1LGSdgk6Ui7umqc7BQ9LMq', NULL, NULL, 0, '2026-11-05 14:38:28', '2026-11-05 14:34:56');

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuario_cupons`
--

CREATE TABLE `usuario_cupons` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `cupom_id` int(11) NOT NULL,
  `usado` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuario_notificacoes`
--

CREATE TABLE `usuario_notificacoes` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `notificacao_id` int(11) NOT NULL,
  `lida` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `avaliacoes`
--
ALTER TABLE `avaliacoes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `usuario_id` (`usuario_id`,`produto_id`),
  ADD KEY `produto_id` (`produto_id`);

--
-- Índices de tabela `carrinho_itens`
--
ALTER TABLE `carrinho_itens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `produto_id` (`produto_id`),
  ADD KEY `tamanho` (`tamanho`);

--
-- Índices de tabela `cartoes`
--
ALTER TABLE `cartoes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Índices de tabela `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `cupons`
--
ALTER TABLE `cupons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`);

--
-- Índices de tabela `enderecos`
--
ALTER TABLE `enderecos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Índices de tabela `favoritos`
--
ALTER TABLE `favoritos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `produto_id` (`produto_id`);

--
-- Índices de tabela `notificacoes`
--
ALTER TABLE `notificacoes`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Índices de tabela `pedido_itens`
--
ALTER TABLE `pedido_itens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pedido_id` (`pedido_id`),
  ADD KEY `produto_id` (`produto_id`),
  ADD KEY `tamanho` (`tamanho`);

--
-- Índices de tabela `preferencias`
--
ALTER TABLE `preferencias`
  ADD PRIMARY KEY (`usuario_id`);

--
-- Índices de tabela `produtos`
--
ALTER TABLE `produtos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categoria_id` (`categoria_id`);

--
-- Índices de tabela `recompensas`
--
ALTER TABLE `recompensas`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `recuperacao_senha`
--
ALTER TABLE `recuperacao_senha`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Índices de tabela `tamanhos`
--
ALTER TABLE `tamanhos`
  ADD PRIMARY KEY (`sigla`);

--
-- Índices de tabela `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Índices de tabela `usuario_cupons`
--
ALTER TABLE `usuario_cupons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `cupom_id` (`cupom_id`);

--
-- Índices de tabela `usuario_notificacoes`
--
ALTER TABLE `usuario_notificacoes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `notificacao_id` (`notificacao_id`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `avaliacoes`
--
ALTER TABLE `avaliacoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `carrinho_itens`
--
ALTER TABLE `carrinho_itens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `cartoes`
--
ALTER TABLE `cartoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `cupons`
--
ALTER TABLE `cupons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `enderecos`
--
ALTER TABLE `enderecos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `favoritos`
--
ALTER TABLE `favoritos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `notificacoes`
--
ALTER TABLE `notificacoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `pedido_itens`
--
ALTER TABLE `pedido_itens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de tabela `produtos`
--
ALTER TABLE `produtos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT de tabela `recompensas`
--
ALTER TABLE `recompensas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `recuperacao_senha`
--
ALTER TABLE `recuperacao_senha`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `usuario_cupons`
--
ALTER TABLE `usuario_cupons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `usuario_notificacoes`
--
ALTER TABLE `usuario_notificacoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `avaliacoes`
--
ALTER TABLE `avaliacoes`
  ADD CONSTRAINT `avaliacoes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `avaliacoes_ibfk_2` FOREIGN KEY (`produto_id`) REFERENCES `produtos` (`id`);

--
-- Restrições para tabelas `carrinho_itens`
--
ALTER TABLE `carrinho_itens`
  ADD CONSTRAINT `carrinho_itens_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `carrinho_itens_ibfk_2` FOREIGN KEY (`produto_id`) REFERENCES `produtos` (`id`),
  ADD CONSTRAINT `carrinho_itens_ibfk_3` FOREIGN KEY (`tamanho`) REFERENCES `tamanhos` (`sigla`);

--
-- Restrições para tabelas `cartoes`
--
ALTER TABLE `cartoes`
  ADD CONSTRAINT `cartoes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Restrições para tabelas `enderecos`
--
ALTER TABLE `enderecos`
  ADD CONSTRAINT `enderecos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Restrições para tabelas `favoritos`
--
ALTER TABLE `favoritos`
  ADD CONSTRAINT `favoritos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `favoritos_ibfk_2` FOREIGN KEY (`produto_id`) REFERENCES `produtos` (`id`);

--
-- Restrições para tabelas `pedidos`
--
ALTER TABLE `pedidos`
  ADD CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Restrições para tabelas `pedido_itens`
--
ALTER TABLE `pedido_itens`
  ADD CONSTRAINT `pedido_itens_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`),
  ADD CONSTRAINT `pedido_itens_ibfk_2` FOREIGN KEY (`produto_id`) REFERENCES `produtos` (`id`),
  ADD CONSTRAINT `pedido_itens_ibfk_3` FOREIGN KEY (`tamanho`) REFERENCES `tamanhos` (`sigla`);

--
-- Restrições para tabelas `preferencias`
--
ALTER TABLE `preferencias`
  ADD CONSTRAINT `preferencias_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Restrições para tabelas `produtos`
--
ALTER TABLE `produtos`
  ADD CONSTRAINT `produtos_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`);

--
-- Restrições para tabelas `recuperacao_senha`
--
ALTER TABLE `recuperacao_senha`
  ADD CONSTRAINT `recuperacao_senha_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Restrições para tabelas `usuario_cupons`
--
ALTER TABLE `usuario_cupons`
  ADD CONSTRAINT `usuario_cupons_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `usuario_cupons_ibfk_2` FOREIGN KEY (`cupom_id`) REFERENCES `cupons` (`id`);

--
-- Restrições para tabelas `usuario_notificacoes`
--
ALTER TABLE `usuario_notificacoes`
  ADD CONSTRAINT `usuario_notificacoes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `usuario_notificacoes_ibfk_2` FOREIGN KEY (`notificacao_id`) REFERENCES `notificacoes` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
