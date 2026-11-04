-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 03/11/2026 às 15:14
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

--
-- Despejando dados para a tabela `cartoes`
--

INSERT INTO `cartoes` (`id`, `usuario_id`, `nome`, `ultimos_digitos`, `validade`, `ativo`) VALUES
(1, 1, 'Visa final 4821', '4821', '08/30', 1),
(2, 1, 'Mastercard final 9927', '9927', '11/29', 1),
(3, 1, 'Alimentação final 5371', '5371', '01/27', 1);

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
(1, 'Promoção', 'gift'),
(2, 'Bebidas', 'cafe'),
(3, 'Salgados', 'fast-food'),
(4, 'Doces', 'ice-cream');

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
(1, 'CAFE10', '10% OFF', 'Desconto de 10% em qualquer pedido', 'PORCENTAGEM', 10.00, '2026-12-31', 1),
(2, 'FRETEGRÁTIS', 'Entrega grátis', 'R$ 5,00 de desconto na entrega', 'VALOR', 5.00, '2026-12-31', 1),
(3, 'ANIVERSÁRIO', 'Sobremesa grátis', 'Uma sobremesa grátis (R$ 11,90) no mês do seu aniversário', 'VALOR', 11.90, '2026-12-31', 1),
(5, 'TESTEDEL', 'Voltou', NULL, 'PORCENTAGEM', 5.00, NULL, 0);

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
(1, 1, 'CASA', 'Rua Exemplo', '100', 'Centro', 'Criciúma - SC', 1),
(2, 1, 'EMPRESA', 'Rua Exemplo', '200', 'Centro', 'Criciúma - SC', 1);

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
(2, 3, 2, 1),
(3, 3, 3, 1),
(4, 3, 5, 1),
(5, 3, 8, 1),
(6, 3, 7, 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `notificacoes`
--

CREATE TABLE `notificacoes` (
  `id` int(11) NOT NULL,
  `titulo` varchar(100) NOT NULL,
  `descricao` varchar(255) NOT NULL,
  `icone` varchar(50) NOT NULL,
  `criado_em` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `notificacoes`
--

INSERT INTO `notificacoes` (`id`, `titulo`, `descricao`, `icone`, `criado_em`) VALUES
(1, 'Temos um novo café!', 'Venha experimentar nosso novo café, feito com grãos selecionados e de maneira sustentável!', 'cafe', '2026-10-13 09:14:59'),
(2, 'Confira a semana de promoções!', 'Aproveite para vir tomar café na Daily Express na semana de promoções.', 'gift', '2026-10-13 09:14:59'),
(3, 'Aproveite o dia do cliente!', 'Aproveite o dia do cliente e economize comendo mais do que gosta.', 'gift', '2026-10-13 09:14:59'),
(4, 'Você ganhou cupons!', 'Feliz Aniversário! Você ganhou cupons de promoção!', 'pricetag', '2026-10-13 09:14:59');

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
(1, 1, 'Levar', 'Rua Exemplo, 200 - Centro, Criciúma - SC', 'Pix', NULL, 38.80, 0.00, 38.80, 'Entregue', '2026-09-15 10:30:00'),
(2, 1, 'Comer aqui', NULL, 'Cartão de crédito', NULL, 25.80, 0.00, 25.80, 'Entregue', '2026-09-24 15:10:00'),
(3, 1, 'Levar', 'Rua Exemplo, 100 - Centro, Criciúma - SC', 'Dinheiro', NULL, 28.80, 0.00, 28.80, 'Entregue', '2026-10-01 09:00:00'),
(6, 3, 'Comer aqui', NULL, 'Pix', NULL, 342.90, 0.00, 342.90, 'Preparando', '2026-10-15 14:07:33');

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
(1, 1, 4, 'P', '---', 1, 12.90),
(2, 1, 3, 'P', '---', 1, 25.90),
(3, 2, 1, 'P', 'Sem açúcar', 1, 13.90),
(4, 2, 9, 'P', '---', 1, 11.90),
(5, 3, 1, 'P', 'Sem açúcar', 1, 13.90),
(6, 3, 6, 'P', '---', 1, 14.90),
(10, 6, 1, 'G', '---', 10, 17.90),
(11, 6, 6, 'P', '---', 11, 14.90);

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
(3, 'Sem lactose', 'Eu coloco', 0, 1, 1, 0, 'pt', 70);

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
  `nota` decimal(2,1) DEFAULT 0.0,
  `imagem` varchar(255) DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `produtos`
--

INSERT INTO `produtos` (`id`, `categoria_id`, `nome`, `descricao_curta`, `descricao_completa`, `preco`, `preco_antigo`, `nota`, `imagem`, `ativo`) VALUES
(1, 1, 'Capuccino clássico', 'Leite vaporizado e expresso cremoso', 'O cappuccino clássico italiano é uma bebida equilibrada, famosa por sua textura aveludada. Na receita tradicional, ele tem 1/3 de café expresso, 1/3 de leite vaporizado e 1/3 de espuma de leite.', 13.90, 18.90, 4.9, 'https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=400&auto=format&fit=crop', 1),
(2, 1, 'Latte + Cheesecake', 'Latte suave com fatia de frutas vermelhas', NULL, 28.90, 35.80, 4.7, 'https://images.unsplash.com/photo-1567327613485-fbc7bf196198?q=80&w=400&auto=format&fit=crop', 1),
(3, 1, 'Combo Lanche Leve', 'Sanduíche natural e chá gelado de pêssego', NULL, 25.90, 30.80, 4.6, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=400&auto=format&fit=crop', 1),
(4, 1, 'Mocha Especial', 'Leite vaporizado, calda de chocolate belga', NULL, 12.90, 15.90, 4.7, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=400&auto=format&fit=crop', 1),
(5, 1, 'Combo Choc. Quente', 'Chocolate quente cremoso e biscoitos', NULL, 29.90, 35.80, 4.9, 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?q=80&w=400&auto=format&fit=crop', 1),
(6, 1, 'Croissant Presunto', 'Massa folhada recheada com queijo derretido', NULL, 14.90, 17.90, 4.8, 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?q=80&w=400&auto=format&fit=crop', 1),
(7, 1, 'Espresso + Cookie', 'Espresso duplo e cookie com gotas de cacau', NULL, 16.50, 22.00, 4.8, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=400&auto=format&fit=crop', 1),
(8, 1, 'Frappuccino Caramelo', 'Café batido gelado com chantilly e calda', NULL, 19.90, 24.90, 4.9, 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?q=80&w=400&auto=format&fit=crop', 1),
(9, 4, 'Cheesecake', 'Sobremesa gelada clássica', NULL, 11.90, NULL, 4.8, 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?q=80&w=400&auto=format&fit=crop', 1),
(10, 2, 'Cha gelado', 'Cha de pessego com gelo', NULL, 9.50, 12.00, 4.5, NULL, 0),
(11, 2, 'Chá gelado', 'Chá de pêssego com gelo', NULL, 9.50, NULL, 5.0, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=400&auto=format&fit=crop', 0),
(12, 2, 'teste', 'teste123', NULL, 123.00, 23124.00, 5.0, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=400&auto=format&fit=crop', 1),
(13, 2, 'brownie de uranio', 'feito de uranio 237', NULL, 99999999.99, 10.00, 5.0, NULL, 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `recompensas`
--

CREATE TABLE `recompensas` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `pontos` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `recompensas`
--

INSERT INTO `recompensas` (`id`, `nome`, `pontos`) VALUES
(1, 'Café expresso', 500),
(2, 'Fatia de bolo', 500),
(3, 'Combo café + croissant', 1000);

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
('P', 'Pequeno', 0.00);

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
(1, 'Fulano de tal', 'fulano@email.com', '$2b$12$WZnYE57BL2RzqcamDIfAxOgJi7zbeOMPvDAEhPP1nrkF.5KY/y/Dq', NULL, '2008-10-08', 320, '2026-10-29 13:21:32', '2026-10-13 09:14:59'),
(2, 'Lara :)', 'lara@email.com', '$2b$12$C9v4HWbCrN/23nRMqG5WxexCXLtO7x91sqG.6YZZXFvkK2nwV37Ji', NULL, NULL, 0, NULL, '2026-10-13 10:36:52'),
(3, 'lucas louco', 'lucaslegal@email.com', '$2b$12$5pQ7XBvgfK3G6V3OMHlKoemmVpHe3UaL6MH29fMJGl.nwBAvgCVwS', 'fotos/usuario_3_1793292005055.jpg', NULL, 342, '2026-10-29 13:40:28', '2026-10-13 10:37:25');

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuario_cupons`
--

CREATE TABLE `usuario_cupons` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `cupom_id` int(11) NOT NULL,
  `usado` tinyint(1) DEFAULT 0,
  `no_carrinho` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `usuario_cupons`
--

INSERT INTO `usuario_cupons` (`id`, `usuario_id`, `cupom_id`, `usado`, `no_carrinho`) VALUES
(1, 1, 1, 0, 0),
(2, 1, 2, 0, 0),
(3, 1, 3, 0, 0),
(7, 2, 3, 0, 0),
(8, 3, 3, 0, 0),
(9, 2, 1, 0, 0),
(10, 3, 1, 0, 0),
(11, 2, 2, 0, 0),
(12, 3, 2, 0, 0);

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
-- Despejando dados para a tabela `usuario_notificacoes`
--

INSERT INTO `usuario_notificacoes` (`id`, `usuario_id`, `notificacao_id`, `lida`) VALUES
(1, 1, 1, 0),
(2, 1, 2, 0),
(3, 1, 3, 0),
(4, 1, 4, 0),
(9, 2, 1, 0),
(10, 3, 1, 1),
(11, 2, 2, 0),
(12, 3, 2, 1),
(13, 2, 3, 0),
(14, 3, 3, 1),
(15, 2, 4, 0),
(16, 3, 4, 1);

--
-- Índices para tabelas despejadas
--

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
-- AUTO_INCREMENT de tabela `carrinho_itens`
--
ALTER TABLE `carrinho_itens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de tabela `cartoes`
--
ALTER TABLE `cartoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `cupons`
--
ALTER TABLE `cupons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `enderecos`
--
ALTER TABLE `enderecos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `favoritos`
--
ALTER TABLE `favoritos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de tabela `notificacoes`
--
ALTER TABLE `notificacoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de tabela `pedido_itens`
--
ALTER TABLE `pedido_itens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de tabela `produtos`
--
ALTER TABLE `produtos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de tabela `recompensas`
--
ALTER TABLE `recompensas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `recuperacao_senha`
--
ALTER TABLE `recuperacao_senha`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `usuario_cupons`
--
ALTER TABLE `usuario_cupons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de tabela `usuario_notificacoes`
--
ALTER TABLE `usuario_notificacoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- Restrições para tabelas despejadas
--

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
