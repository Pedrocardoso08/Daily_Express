const mysql = require('mysql')
const fs = require('fs')
const path = require('path')

// Categorias fixas do app (os botões do menu) e o ícone de cada uma
const ICONES_CATEGORIA = {
    'Promoção':'gift',
    'Bebidas':'cafe',
    'Salgados':'fast-food',
    'Doces':'ice-cream'
}

// Nome de cada copo das bebidas (o U, tamanho único, não aparece)
const NOMES_TAMANHO = {
    'P':'200 ml',
    'M':'300 ml',
    'G':'400 ml'
}

class LojaBD{
    static connect(){
        const connection = mysql.createConnection({
            host:'localhost',
            user:'root',
            password:'',
            database:'daily_express'
        })
        // Sem isso, o servidor cai quando o MySQL está desligado
        connection.on('error', ()=>{})
        connection.connect()
        return connection
    }

    // Roda um comando SQL e já devolve a resposta para o app.
    // Sem mensagem: devolve as linhas encontradas (usado nas listas).
    // Com mensagem: devolve {message: mensagem} (usado para salvar e remover).
    static rodar(sql, valores, callback, mensagem){
        const connection = LojaBD.connect()

        connection.query(sql, valores, (error, results)=>{
            connection.end()

            if(error){
                return callback({'error':'Erro ao acessar o banco de dados. Confira se o MySQL está ligado.'})
            }

            if(mensagem){
                return callback({'message':mensagem})
            }

            callback(results)
        })
    }

    // Lista do cardápio: tela app/(tabs)/menu.tsx (só os disponíveis).
    // Com todos (tela de funcionários): mostra também os esgotados.
    // A nota é a média das avaliações dos clientes (null quando ninguém avaliou ainda).
    static getProdutos(todos, callback){
        const connection = LojaBD.connect()

        var sql = 'select p.id, p.nome, p.descricao_curta, p.preco, p.preco_antigo, p.imagem, p.disponivel, c.nome as categoria, (select avg(a.nota) from avaliacoes a where a.produto_id = p.id) as nota from produtos p join categorias c on c.id = p.categoria_id where p.ativo = true'

        if(!todos){
            sql += ' and p.disponivel = true'
        }

        sql += ' order by p.id desc'

        connection.query(sql, (error, results)=>{
            connection.end()

            if(error){
                return callback({'error':'Erro ao acessar o banco de dados. Confira se o MySQL está ligado.'})
            }

            callback(results)
        })
    }

    // Cadastro e edição: tela app/funcionarios.tsx
    // Se vier produto.id, o produto que já existe é atualizado.
    static addProduto(produto, callback){
        var {nome, descricao, categoria, preco, precoAntigo, imagem} = produto

        if(!nome || !descricao || !categoria || !preco){
            return callback({'error':'Preencha nome, descrição, categoria e preço.'})
        }

        if(precoAntigo && Number(precoAntigo) <= Number(preco)){
            return callback({'error':'O preço anterior precisa ser maior que o preço atual.'})
        }

        if(!ICONES_CATEGORIA[categoria]){
            return callback({'error':'Categoria não encontrada.'})
        }

        const connection = LojaBD.connect()

        var sqlCategoria = 'select id from categorias where nome = ?'

        connection.query(sqlCategoria, categoria, (error, results)=>{
            if(error){
                connection.end()
                return callback({'error':'Erro ao acessar o banco de dados. Confira se o MySQL está ligado.'})
            }

            if(results.length > 0){
                return salvarProduto(results[0].id)
            }

            // O banco começa vazio: a categoria é criada no primeiro produto dela
            var novaCategoria = {nome: categoria, icone: ICONES_CATEGORIA[categoria]}

            connection.query('insert into categorias set ?', novaCategoria, (error, resultado)=>{
                if(error){
                    connection.end()
                    return callback({'error':'Não foi possível criar a categoria.'})
                }
                salvarProduto(resultado.insertId)
            })
        })

        function salvarProduto(categoriaId){
            var novoProduto = {
                categoria_id: categoriaId,
                nome: nome,
                descricao_curta: descricao,
                preco: preco,
                preco_antigo: precoAntigo ? precoAntigo : null,
                imagem: imagem ? imagem : null
            }

            var sql = 'insert into produtos set ?'
            var dados = novoProduto

            if(produto.id){
                sql = 'update produtos set ? where id = ?'
                dados = [novoProduto, produto.id]
            }

            connection.query(sql, dados, (error)=>{
                connection.end()

                if(error){
                    return callback({'error':'Não foi possível salvar o produto.'})
                }

                callback({'message': produto.id ? 'Produto atualizado!' : 'Produto cadastrado com sucesso!'})
            })
        }
    }

    // Imagem do produto: tela app/funcionarios.tsx.
    // A imagem chega como texto (base64), vira arquivo na pasta back/fotos
    // e volta o caminho, que a tela guarda no produto ao salvar.
    static salvarFotoProduto(dados, callback){
        if(!dados.imagem){
            return callback({'error':'Escolha uma imagem.'})
        }

        // Tira o começo "data:image/jpeg;base64," que o navegador coloca
        var base64 = dados.imagem.replace(/^data:image\/\w+;base64,/, '')

        var arquivo = 'produto_' + Date.now() + '.jpg'
        var pasta = path.join(__dirname, '..', 'fotos')

        if(!fs.existsSync(pasta)){
            fs.mkdirSync(pasta)
        }

        fs.writeFileSync(path.join(pasta, arquivo), base64, 'base64')

        callback({'message':'Imagem enviada!', 'foto':'fotos/' + arquivo})
    }

    // Esgotado: o produto some do cardápio, mas continua na lista do funcionário
    static mudarDisponivel(produto, callback){
        if(!produto.id){
            return callback({'error':'Produto não encontrado.'})
        }

        var mensagem = produto.disponivel ? 'Produto de volta no cardápio.' : 'Produto marcado como esgotado.'

        LojaBD.rodar('update produtos set disponivel = ? where id = ?', [produto.disponivel, produto.id], callback, mensagem)
    }

    // Exclusão lógica: o produto continua no banco, só deixa de aparecer na loja
    static removerProduto(produto, callback){
        if(!produto.id){
            return callback({'error':'Produto não encontrado.'})
        }

        const connection = LojaBD.connect()

        var sql = 'update produtos set ativo = false where id = ? and ativo = true'

        connection.query(sql, produto.id, (error, results)=>{
            connection.end()

            if(error){
                return callback({'error':'Não foi possível remover o produto.'})
            }

            if(results.affectedRows == 0){
                return callback({'error':'Produto não encontrado.'})
            }

            callback({'message':'Produto removido.'})
        })
    }

    // Lista: tela app/cupons.tsx e o botão Aplicar do carrinho.
    // Com usuario: só os cupons dentro da validade que esse cliente ainda não usou.
    // Sem usuario (tela de funcionários): todos os cupons ativos.
    static getCupons(usuario, callback){
        const connection = LojaBD.connect()

        var sql = 'select id, codigo, titulo, descricao, tipo, valor, date_format(validade, "%d/%m/%Y") as validade from cupons where ativo = true'

        if(usuario){
            sql += ' and (validade is null or validade >= curdate()) and id not in (select cupom_id from usuario_cupons where usuario_id = ? and usado = true)'
        }

        sql += ' order by id desc'

        connection.query(sql, usuario, (error, results)=>{
            connection.end()

            if(error){
                return callback({'error':'Erro ao acessar o banco de dados. Confira se o MySQL está ligado.'})
            }

            callback(results)
        })
    }

    // Cadastro: tela app/funcionarios.tsx
    static addCupom(cupom, callback){
        // validade chega como "2026-12-31" ou vazia (cupom sem prazo)
        var {codigo, titulo, descricao, tipo, valor, validade} = cupom

        if(!codigo || !titulo || !tipo || !valor){
            return callback({'error':'Preencha código, título, tipo e valor.'})
        }

        if(tipo != 'porcentagem' && tipo != 'valor'){
            return callback({'error':'Tipo de cupom inválido.'})
        }

        const connection = LojaBD.connect()

        var sqlBusca = 'select id, ativo from cupons where codigo = ?'

        connection.query(sqlBusca, codigo.trim().toUpperCase(), (error, results)=>{
            if(error){
                connection.end()
                return callback({'error':'Erro ao acessar o banco de dados. Confira se o MySQL está ligado.'})
            }

            if(results.length > 0 && results[0].ativo){
                connection.end()
                return callback({'error':'Já existe um cupom com esse código.'})
            }

            var novoCupom = {
                codigo: codigo.trim().toUpperCase(),
                titulo: titulo,
                descricao: descricao ? descricao : null,
                tipo: tipo == 'porcentagem' ? 'PORCENTAGEM' : 'VALOR',
                valor: valor,
                validade: validade ? validade : null,
                ativo: true
            }

            // O código é único: se o cupom foi removido antes, ele volta com os dados novos
            var sql = 'insert into cupons set ?'
            var dados = novoCupom

            if(results.length > 0){
                sql = 'update cupons set ? where id = ?'
                dados = [novoCupom, results[0].id]
            }

            connection.query(sql, dados, (error)=>{
                connection.end()

                if(error){
                    return callback({'error':'Não foi possível cadastrar o cupom.'})
                }

                callback({'message':'Cupom cadastrado com sucesso!'})
            })
        })
    }

    // Exclusão lógica: o cupom continua no banco (e nos usuários que já tinham), só some da loja
    static removerCupom(cupom, callback){
        if(!cupom.id){
            return callback({'error':'Cupom não encontrado.'})
        }

        const connection = LojaBD.connect()

        var sql = 'update cupons set ativo = false where id = ? and ativo = true'

        connection.query(sql, cupom.id, (error, results)=>{
            connection.end()

            if(error){
                return callback({'error':'Não foi possível remover o cupom.'})
            }

            if(results.affectedRows == 0){
                return callback({'error':'Cupom não encontrado.'})
            }

            callback({'message':'Cupom removido.'})
        })
    }

    // ---------- PEDIDOS DA LOJA: aba Pedidos da tela app/funcionarios.tsx ----------

    // Todos os pedidos de todos os clientes, do mais novo para o mais antigo
    static getPedidosLoja(callback){
        var sql = 'select pe.id, date_format(pe.criado_em, "%d/%m/%Y") as data, date_format(pe.criado_em, "%H:%i") as hora, pe.status, pe.modo, pe.endereco_entrega, pe.forma_pagamento, pe.total, u.nome as cliente, pi.quantidade, pi.tamanho, pr.nome from pedidos pe join usuarios u on u.id = pe.usuario_id join pedido_itens pi on pi.pedido_id = pe.id join produtos pr on pr.id = pi.produto_id order by pe.id desc, pi.id'

        LojaBD.rodar(sql, [], (resultado)=>{
            if(resultado.error){
                return callback(resultado)
            }

            // O banco devolve uma linha por item. Aqui os itens são juntados no seu pedido,
            // num texto só, ex.: "2x Mocha (300 ml), 1x Croissant"
            var pedidos = []

            resultado.forEach((linha)=>{
                var pedido = pedidos.find((p)=> p.id == linha.id)

                if(!pedido){
                    pedido = {
                        id: String(linha.id),
                        data: linha.data,
                        hora: linha.hora,
                        status: linha.status,
                        modo: linha.modo,
                        endereco: linha.endereco_entrega ? linha.endereco_entrega : '',
                        pagamento: linha.forma_pagamento,
                        total: Number(linha.total),
                        cliente: linha.cliente,
                        itens: ''
                    }
                    pedidos.push(pedido)
                }

                if(pedido.itens != ''){
                    pedido.itens += ', '
                }
                pedido.itens += linha.quantidade + 'x ' + linha.nome

                // Tamanho único não aparece; os copos aparecem em ml
                if(linha.tamanho != 'U'){
                    pedido.itens += ' (' + NOMES_TAMANHO[linha.tamanho] + ')'
                }
            })

            callback(pedidos)
        })
    }

    // status: Preparando, A caminho, Finalizado ou Cancelado (o cliente vê no histórico).
    // Cancelado: a loja fica com 30% e 70% volta para o cliente (só aparece na tela, não mexe em dinheiro).
    static mudarStatus(pedido, callback){
        var STATUS_VALIDOS = ['Preparando', 'A caminho', 'Finalizado', 'Cancelado']

        if(!pedido.id || !STATUS_VALIDOS.includes(pedido.status)){
            return callback({'error':'Pedido ou status inválido.'})
        }

        var mensagem = 'Pedido #' + pedido.id + ' agora está: ' + pedido.status
        if(pedido.status == 'Cancelado'){
            mensagem = 'Pedido #' + pedido.id + ' cancelado. 70% do valor volta para o cliente.'
        }

        LojaBD.rodar('update pedidos set status = ? where id = ?', [pedido.status, pedido.id], callback, mensagem)
    }

    // ---------- AVISOS: aba Avisos (aparecem na aba Notificações do cliente) ----------

    static addNotificacao(aviso, callback){
        if(!aviso.titulo || !aviso.descricao){
            return callback({'error':'Preencha título e mensagem.'})
        }

        var novoAviso = {
            titulo: aviso.titulo,
            descricao: aviso.descricao,
            icone: aviso.icone ? aviso.icone : 'notifications'
        }

        LojaBD.rodar('insert into notificacoes set ?', novoAviso, callback, 'Aviso enviado para os clientes.')
    }

    static removerNotificacao(aviso, callback){
        LojaBD.rodar('update notificacoes set ativo = false where id = ?', aviso.id, callback, 'Aviso removido.')
    }

    // ---------- PRÊMIOS: aba Prêmios e tela app/fidelidade.tsx ----------

    static getRecompensas(callback){
        LojaBD.rodar('select id, nome, pontos from recompensas where ativo = true order by pontos', [], callback)
    }

    static addRecompensa(recompensa, callback){
        if(!recompensa.nome || !recompensa.pontos){
            return callback({'error':'Preencha o nome e os pontos.'})
        }

        var novaRecompensa = {
            nome: recompensa.nome,
            pontos: recompensa.pontos
        }

        LojaBD.rodar('insert into recompensas set ?', novaRecompensa, callback, 'Prêmio cadastrado!')
    }

    static removerRecompensa(recompensa, callback){
        LojaBD.rodar('update recompensas set ativo = false where id = ?', recompensa.id, callback, 'Prêmio removido.')
    }
}

module.exports = LojaBD
