const mysql = require('mysql')
const fs = require('fs')
const path = require('path')

const ERRO_BANCO = 'Erro ao acessar o banco de dados. Confira se o MySQL está ligado.'

// Tudo o que é do cliente logado: pedidos, endereços, favoritos, cartões,
// perfil (preferências e pontos) e notificações.
class ClienteBD{
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
        const connection = ClienteBD.connect()

        connection.query(sql, valores, (error, results)=>{
            connection.end()

            if(error){
                return callback({'error':ERRO_BANCO})
            }

            if(mensagem){
                return callback({'message':mensagem})
            }

            callback(results)
        })
    }

    // ---------- PERFIL: telas perfil, personalizacao, configuracoes e fidelidade ----------

    static getPerfil(usuario, callback){
        var sql = 'select u.nome, u.email, u.foto, u.pontos_fidelidade, p.tipo_leite, p.acucar, p.receber_promocoes, p.notificacoes_ativas, p.localizacao_ativa, p.idioma, p.volume from usuarios u left join preferencias p on p.usuario_id = u.id where u.id = ?'

        ClienteBD.rodar(sql, usuario, (resultado)=>{
            if(resultado.error){
                return callback(resultado)
            }
            if(resultado.length == 0){
                return callback({'error':'Usuário não encontrado.'})
            }
            callback(resultado[0])
        })
    }

    // dados.preferencias só tem os campos que a tela mudou, ex.: {idioma: 'en'}
    static salvarPreferencias(dados, callback){
        if(!dados.usuario){
            return callback({'error':'Entre na sua conta de novo.'})
        }

        const connection = ClienteBD.connect()

        if(dados.nome){
            connection.query('update usuarios set nome = ? where id = ?', [dados.nome, dados.usuario])
        }

        // Se o usuário ainda não tem a linha de preferências, ela é criada aqui
        connection.query('insert ignore into preferencias (usuario_id) values (?)', dados.usuario)

        connection.query('update preferencias set ? where usuario_id = ?', [dados.preferencias, dados.usuario], (error)=>{
            connection.end()

            if(error){
                return callback({'error':'Não foi possível salvar.'})
            }

            callback({'message':'Salvo!'})
        })
    }

    // Trocar foto: tela personalizacao.
    // A foto chega como texto (base64), vira arquivo na pasta back/fotos
    // e o banco guarda só o nome do arquivo.
    static salvarFoto(dados, callback){
        if(!dados.usuario || !dados.imagem){
            return callback({'error':'Escolha uma foto.'})
        }

        // Tira o começo "data:image/jpeg;base64," que o navegador coloca
        var base64 = dados.imagem.replace(/^data:image\/\w+;base64,/, '')

        // O número no nome muda a cada troca, para o app não mostrar a foto antiga guardada
        var arquivo = 'usuario_' + dados.usuario + '_' + Date.now() + '.jpg'
        var pasta = path.join(__dirname, '..', 'fotos')

        if(!fs.existsSync(pasta)){
            fs.mkdirSync(pasta)
        }

        fs.writeFileSync(path.join(pasta, arquivo), base64, 'base64')

        var foto = 'fotos/' + arquivo

        ClienteBD.rodar('update usuarios set foto = ? where id = ?', [foto, dados.usuario], (resultado)=>{
            if(resultado.error){
                return callback(resultado)
            }
            callback({'message':'Foto trocada!', 'foto':foto})
        })
    }

    // ---------- PEDIDOS: telas pagamento e historicoPedidos ----------

    static getPedidos(usuario, callback){
        var sql = 'select pe.id, date_format(pe.criado_em, "%d/%m/%Y") as data, pe.status, pe.modo, pe.endereco_entrega, pe.total, pi.id as item_id, pi.tamanho, pi.opcional, pi.quantidade, pi.preco_unitario, pr.nome, pr.descricao_curta, pr.imagem from pedidos pe join pedido_itens pi on pi.pedido_id = pe.id join produtos pr on pr.id = pi.produto_id where pe.usuario_id = ? order by pe.id desc, pi.id'

        ClienteBD.rodar(sql, usuario, (resultado)=>{
            if(resultado.error){
                return callback(resultado)
            }

            // O banco devolve uma linha por item. Aqui os itens são juntados no seu pedido.
            var pedidos = []

            resultado.forEach((linha)=>{
                var pedido = pedidos.find((p)=> p.id == linha.id)

                if(!pedido){
                    pedido = {
                        id: String(linha.id),
                        data: linha.data,
                        status: linha.status,
                        modo: linha.modo,
                        endereco: linha.endereco_entrega ? linha.endereco_entrega : '',
                        total: Number(linha.total),
                        itens: []
                    }
                    pedidos.push(pedido)
                }

                pedido.itens.push({
                    id: String(linha.item_id),
                    nome: linha.nome,
                    desc: linha.descricao_curta,
                    tamanho: linha.tamanho,
                    opcional: linha.opcional,
                    precoUnitario: Number(linha.preco_unitario),
                    qtd: linha.quantidade,
                    imagem: linha.imagem ? linha.imagem : ''
                })
            })

            callback(pedidos)
        })
    }

    static addPedido(dados, callback){
        if(!dados.usuario || !dados.itens || dados.itens.length == 0){
            return callback({'error':'O carrinho está vazio.'})
        }

        const connection = ClienteBD.connect()

        var pedido = {
            usuario_id: dados.usuario,
            modo: dados.modo,
            endereco_entrega: dados.endereco ? dados.endereco : null,
            forma_pagamento: dados.formaPagamento,
            cupom: dados.cupom ? dados.cupom : null,
            subtotal: dados.subtotal,
            desconto: dados.desconto,
            total: dados.total
        }

        connection.query('insert into pedidos set ?', pedido, (error, results)=>{
            if(error){
                connection.end()
                return callback({'error':'Não foi possível salvar o pedido.'})
            }

            var pedidoId = results.insertId

            // O carrinho do app guarda o nome do produto, então o id é achado pelo nome
            var sqlItem = 'insert into pedido_itens (pedido_id, produto_id, tamanho, opcional, quantidade, preco_unitario) select ?, id, ?, ?, ?, ? from produtos where nome = ? limit 1'

            dados.itens.forEach((item)=>{
                connection.query(sqlItem, [pedidoId, item.tamanho, item.opcional, item.qtd, item.precoUnitario, item.nome])
            })

            // Cada R$1,00 gasto vale 10 pontos de fidelidade
            var pontos = Math.round(dados.total * 10)
            connection.query('update usuarios set pontos_fidelidade = pontos_fidelidade + ? where id = ?', [pontos, dados.usuario])

            // O end() espera os comandos de cima terminarem antes de fechar
            connection.end()
            callback({'message':'Pedido salvo!', 'pontos':pontos})
        })
    }

    // ---------- ENDEREÇOS: telas endereco e entrega ----------

    static getEnderecos(usuario, callback){
        var sql = 'select id, tipo, rua, numero, bairro, cidade from enderecos where usuario_id = ? and ativo = true order by id'
        ClienteBD.rodar(sql, usuario, callback)
    }

    static addEndereco(dados, callback){
        if(!dados.usuario || !dados.rua || !dados.numero || !dados.bairro || !dados.cidade){
            return callback({'error':'Preencha todos os campos.'})
        }

        var endereco = {
            usuario_id: dados.usuario,
            tipo: dados.tipo,
            rua: dados.rua,
            numero: dados.numero,
            bairro: dados.bairro,
            cidade: dados.cidade
        }

        ClienteBD.rodar('insert into enderecos set ?', endereco, callback, 'Endereço salvo!')
    }

    static removerEndereco(dados, callback){
        ClienteBD.rodar('update enderecos set ativo = false where id = ?', dados.id, callback, 'Endereço removido.')
    }

    // ---------- FAVORITOS: coração do menu e do produto, aba favoritos ----------

    static getFavoritos(usuario, callback){
        var sql = 'select distinct p.id, p.nome, p.descricao_curta, p.nota, p.preco, p.imagem from favoritos f join produtos p on p.id = f.produto_id where f.usuario_id = ? and f.ativo = true'
        ClienteBD.rodar(sql, usuario, callback)
    }

    // dados.favorito = true marca, false desmarca. O produto é achado pelo nome.
    static salvarFavorito(dados, callback){
        if(dados.favorito){
            var sql = 'insert into favoritos (usuario_id, produto_id) select ?, id from produtos where nome = ? limit 1'
            ClienteBD.rodar(sql, [dados.usuario, dados.nome], callback, 'Favoritado!')
        }else{
            var sql = 'update favoritos f join produtos p on p.id = f.produto_id set f.ativo = false where f.usuario_id = ? and p.nome = ?'
            ClienteBD.rodar(sql, [dados.usuario, dados.nome], callback, 'Desfavoritado.')
        }
    }

    // ---------- CARTÕES: tela cartoes (só os 4 últimos dígitos são guardados) ----------

    static getCartoes(usuario, callback){
        var sql = 'select id, nome, ultimos_digitos, validade from cartoes where usuario_id = ? and ativo = true order by id'
        ClienteBD.rodar(sql, usuario, callback)
    }

    static addCartao(dados, callback){
        if(!dados.usuario || !dados.nome || !dados.ultimosDigitos || !dados.validade){
            return callback({'error':'Preencha todos os campos.'})
        }

        var cartao = {
            usuario_id: dados.usuario,
            nome: dados.nome,
            ultimos_digitos: dados.ultimosDigitos,
            validade: dados.validade
        }

        ClienteBD.rodar('insert into cartoes set ?', cartao, callback, 'Cartão salvo!')
    }

    static removerCartao(dados, callback){
        ClienteBD.rodar('update cartoes set ativo = false where id = ?', dados.id, callback, 'Cartão removido.')
    }

    // ---------- NOTIFICAÇÕES: aba notificacoes ----------

    // Todas as notificações da loja. "lida" vem da tabela usuario_notificacoes.
    static getNotificacoes(usuario, callback){
        var sql = 'select n.id, n.titulo, n.descricao, n.icone, un.lida from notificacoes n left join usuario_notificacoes un on un.notificacao_id = n.id and un.usuario_id = ? order by n.id desc'
        ClienteBD.rodar(sql, usuario, callback)
    }

    static lerNotificacoes(dados, callback){
        const connection = ClienteBD.connect()

        // Cria a linha das notificações que o usuário ainda não tinha
        var sqlNovas = 'insert into usuario_notificacoes (usuario_id, notificacao_id) select ?, n.id from notificacoes n where n.id not in (select notificacao_id from usuario_notificacoes where usuario_id = ?)'
        connection.query(sqlNovas, [dados.usuario, dados.usuario])

        connection.query('update usuario_notificacoes set lida = true where usuario_id = ?', dados.usuario, (error)=>{
            connection.end()

            if(error){
                return callback({'error':ERRO_BANCO})
            }

            callback({'message':'Tudo lido.'})
        })
    }
}

module.exports = ClienteBD
