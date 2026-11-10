const mysql = require('mysql')
const fs = require('fs')
const path = require('path')

const ERRO_BANCO = 'Erro ao acessar o banco de dados. Confira se o MySQL está ligado.'

// Vale da fidelidade: 1000 pontos viram um desconto de até R$15 numa compra
const PONTOS_VALE = 1000

// Status em que o cliente ainda pode cancelar
const STATUS_CANCELAVEIS = ['Preparando', 'A caminho']

// Tamanhos fixos do app: quanto cada um soma ao preço cadastrado.
// P, M e G são os copos das bebidas (os ml de cada um ficam no produto); U é o tamanho único (doces, salgados e promoções).
const SQL_TAMANHOS = "insert ignore into tamanhos (sigla, nome, acrescimo) values ('P', 'Pequeno', 0), ('M', 'Médio', 2), ('G', 'Grande', 4), ('U', 'Único', 0)"

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
        var sql = 'select u.nome, u.email, u.foto, u.pontos_fidelidade, u.tem_vale, p.tipo_leite, p.acucar, p.receber_promocoes, p.notificacoes_ativas, p.localizacao_ativa, p.idioma from usuarios u left join preferencias p on p.usuario_id = u.id where u.id = ?'

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
        var sql = 'select pe.id, date_format(pe.criado_em, "%d/%m/%Y") as data, pe.status, pe.modo, pe.endereco_entrega, pe.total, pi.id as item_id, pi.produto_id, pi.tamanho, pi.ml, pi.opcional, pi.quantidade, pi.preco_unitario, pr.nome, pr.descricao_curta, pr.imagem from pedidos pe join pedido_itens pi on pi.pedido_id = pe.id join produtos pr on pr.id = pi.produto_id where pe.usuario_id = ? order by pe.id desc, pi.id'

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
                    produtoId: String(linha.produto_id),
                    nome: linha.nome,
                    desc: linha.descricao_curta,
                    tamanho: linha.tamanho,
                    ml: linha.ml,
                    opcional: linha.opcional,
                    precoUnitario: Number(linha.preco_unitario),
                    qtd: linha.quantidade,
                    imagem: linha.imagem ? linha.imagem : ''
                })
            })

            callback(pedidos)
        })
    }

    // dados.usarVale = true: o cliente usou o vale de R$15 da fidelidade (já está somado no desconto)
    static addPedido(dados, callback){
        if(!dados.usuario || !dados.itens || dados.itens.length == 0){
            return callback({'error':'O carrinho está vazio.'})
        }

        const connection = ClienteBD.connect()

        // Antes de criar o pedido, confere se todos os produtos ainda estão na loja e disponíveis.
        // O item vem com o id do produto; carrinhos antigos só têm o nome.
        var ids = dados.itens.filter((item)=> item.produtoId).map((item)=> Number(item.produtoId))
        var nomes = dados.itens.filter((item)=> !item.produtoId).map((item)=> item.nome)
        var sqlProdutos = 'select id, nome from produtos where ativo = true and disponivel = true and (id in (?) or nome in (?))'

        connection.query(sqlProdutos, [ids.length > 0 ? ids : [0], nomes.length > 0 ? nomes : ['']], (error, produtos)=>{
            if(error){
                connection.end()
                return callback({'error':ERRO_BANCO})
            }

            function acharProduto(item){
                if(item.produtoId){
                    return produtos.find((produto)=> produto.id == item.produtoId)
                }
                return produtos.find((produto)=> produto.nome == item.nome)
            }

            var indisponivel = dados.itens.find((item)=> !acharProduto(item))
            if(indisponivel){
                connection.end()
                return callback({'error':'"' + indisponivel.nome + '" não está mais disponível. Tire do carrinho para continuar.'})
            }

            if(!dados.usarVale){
                return salvarPedido()
            }

            // O vale só é gasto se o cliente ainda tiver um
            connection.query('update usuarios set tem_vale = false where id = ? and tem_vale = true', dados.usuario, (error, resultado)=>{
                if(error){
                    connection.end()
                    return callback({'error':ERRO_BANCO})
                }
                if(resultado.affectedRows == 0){
                    connection.end()
                    return callback({'error':'Você não tem vale para usar. Volte ao carrinho e desmarque o vale.'})
                }
                salvarPedido()
            })

            // Se der erro depois de gastar o vale, ele volta para o cliente
            function devolverVale(){
                if(dados.usarVale){
                    connection.query('update usuarios set tem_vale = true where id = ?', dados.usuario)
                }
            }

            function salvarPedido(){
                var pedido = {
                    usuario_id: dados.usuario,
                    modo: dados.modo,
                    endereco_entrega: dados.endereco ? dados.endereco : null,
                    forma_pagamento: dados.formaPagamento,
                    cupom: dados.cupom ? dados.cupom : null,
                    subtotal: dados.subtotal,
                    desconto: dados.desconto,
                    total: dados.total,
                    usou_vale: dados.usarVale ? true : false
                }

                connection.query('insert into pedidos set ?', pedido, (error, results)=>{
                    if(error){
                        devolverVale()
                        connection.end()
                        return callback({'error':'Não foi possível salvar o pedido.'})
                    }

                    var pedidoId = results.insertId

                    // O banco começa vazio: os tamanhos são criados no primeiro pedido
                    // (pedido_itens só aceita tamanho que exista na tabela tamanhos)
                    connection.query(SQL_TAMANHOS)

                    // Todos os itens num comando só. O ml do copo fica salvo no item,
                    // para o histórico não mudar se o funcionário trocar depois.
                    var linhas = dados.itens.map((item)=> [
                        pedidoId,
                        acharProduto(item).id,
                        item.tamanho,
                        item.ml ? item.ml : null,
                        item.opcional ? item.opcional : '---',
                        item.qtd,
                        item.precoUnitario
                    ])
                    var sqlItens = 'insert into pedido_itens (pedido_id, produto_id, tamanho, ml, opcional, quantidade, preco_unitario) values ?'

                    connection.query(sqlItens, [linhas], (error)=>{
                        // Sem os itens o pedido não vale: ele é apagado e nada é cobrado
                        if(error){
                            connection.query('delete from pedidos where id = ?', pedidoId)
                            devolverVale()
                            connection.end()
                            return callback({'error':'Não foi possível salvar os itens do pedido.'})
                        }

                        // Cada cliente usa cada cupom uma vez só
                        if(dados.cupom){
                            var sqlCupom = 'insert into usuario_cupons (usuario_id, cupom_id, usado) select ?, id, true from cupons where codigo = ?'
                            connection.query(sqlCupom, [dados.usuario, dados.cupom])
                        }

                        // Cada R$1,00 gasto vale 10 pontos de fidelidade
                        var pontos = Math.round(dados.total * 10)
                        connection.query('update usuarios set pontos_fidelidade = pontos_fidelidade + ? where id = ?', [pontos, dados.usuario])

                        // O end() espera os comandos de cima terminarem; só então o app recebe a resposta
                        connection.end(()=>{
                            callback({'message':'Pedido salvo!', 'pontos':pontos})
                        })
                    })
                })
            }
        })
    }

    // Só o dono do pedido cancela, e só enquanto ele está Preparando ou A caminho.
    // A loja fica com 30% e 70% volta para o cliente (só aparece na tela, não mexe em dinheiro).
    // Os pontos que o pedido deu são tirados, e o cupom e o vale usados voltam para o cliente.
    static cancelarPedido(dados, callback){
        if(!dados.usuario || !dados.id){
            return callback({'error':'Pedido inválido.'})
        }

        const connection = ClienteBD.connect()

        var sqlBusca = 'select id, total, cupom, usou_vale from pedidos where id = ? and usuario_id = ? and status in (?)'

        connection.query(sqlBusca, [dados.id, dados.usuario, STATUS_CANCELAVEIS], (error, results)=>{
            if(error){
                connection.end()
                return callback({'error':ERRO_BANCO})
            }
            if(results.length == 0){
                connection.end()
                return callback({'error':'Esse pedido não pode mais ser cancelado.'})
            }

            var pedido = results[0]

            // O "status in" de novo evita cancelar duas vezes se o funcionário mudar o status ao mesmo tempo
            connection.query("update pedidos set status = 'Cancelado' where id = ? and status in (?)", [pedido.id, STATUS_CANCELAVEIS], (error, resultado)=>{
                if(error || resultado.affectedRows == 0){
                    connection.end()
                    return callback({'error':'Esse pedido não pode mais ser cancelado.'})
                }

                // Os mesmos pontos que o pedido deu (10 por R$1,00), sem deixar o saldo negativo
                var pontos = Math.round(Number(pedido.total) * 10)
                connection.query('update usuarios set pontos_fidelidade = greatest(pontos_fidelidade - ?, 0) where id = ?', [pontos, dados.usuario])

                var mensagem = 'Pedido #' + pedido.id + ' cancelado. 70% do valor volta para você e os ' + pontos + ' pontos dele foram retirados.'

                if(pedido.cupom){
                    var sqlCupom = 'delete uc from usuario_cupons uc join cupons c on c.id = uc.cupom_id where uc.usuario_id = ? and c.codigo = ?'
                    connection.query(sqlCupom, [dados.usuario, pedido.cupom])
                    mensagem += ' O cupom ' + pedido.cupom + ' pode ser usado de novo.'
                }

                if(pedido.usou_vale){
                    connection.query('update usuarios set tem_vale = true where id = ?', dados.usuario)
                    mensagem += ' O vale de R$15 voltou para você.'
                }

                // Responde só depois que os pontos, o cupom e o vale foram atualizados
                connection.end(()=>{
                    callback({'message':mensagem})
                })
            })
        })
    }

    // ---------- FIDELIDADE: tela fidelidade ----------

    // Troca 1000 pontos por um vale de até R$15, usado no carrinho. Um vale por vez.
    static resgatarVale(dados, callback){
        if(!dados.usuario){
            return callback({'error':'Entre na sua conta de novo.'})
        }

        var sql = 'update usuarios set pontos_fidelidade = pontos_fidelidade - ?, tem_vale = true where id = ? and pontos_fidelidade >= ? and tem_vale = false'

        ClienteBD.rodar(sql, [PONTOS_VALE, dados.usuario, PONTOS_VALE], (resultado)=>{
            if(resultado.error){
                return callback(resultado)
            }
            if(resultado.affectedRows == 0){
                return callback({'error':'Você precisa de ' + PONTOS_VALE + ' pontos e não pode ter outro vale sem usar.'})
            }
            callback({'message':'Vale de R$15 resgatado! Use no carrinho da próxima compra.'})
        })
    }

    // ---------- AVALIAÇÕES: tela historicoPedidos ----------

    // As notas que o cliente já deu, ex.: [{produto_id: 3, nota: 5}]
    static getAvaliacoes(usuario, callback){
        ClienteBD.rodar('select produto_id, nota from avaliacoes where usuario_id = ?', usuario, callback)
    }

    // dados.produto = id do produto, dados.nota = 0 a 5 estrelas
    static avaliar(dados, callback){
        var nota = Number(dados.nota)

        if(!dados.usuario || !dados.produto || !Number.isInteger(nota) || nota < 0 || nota > 5){
            return callback({'error':'Escolha de 0 a 5 estrelas.'})
        }

        const connection = ClienteBD.connect()

        // Só pode avaliar o produto que já pediu
        var sqlPediu = 'select pi.id from pedido_itens pi join pedidos pe on pe.id = pi.pedido_id where pe.usuario_id = ? and pi.produto_id = ? limit 1'

        connection.query(sqlPediu, [dados.usuario, dados.produto], (error, results)=>{
            if(error){
                connection.end()
                return callback({'error':ERRO_BANCO})
            }

            if(results.length == 0){
                connection.end()
                return callback({'error':'Você só pode avaliar o que já pediu.'})
            }

            // Cada cliente tem uma nota por produto: se já avaliou, a nota é trocada
            var sql = 'insert into avaliacoes (usuario_id, produto_id, nota) values (?, ?, ?) on duplicate key update nota = ?'

            connection.query(sql, [dados.usuario, dados.produto, nota, nota], (error)=>{
                connection.end()

                if(error){
                    return callback({'error':ERRO_BANCO})
                }

                callback({'message':'Obrigado pela avaliação!'})
            })
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
        var sql = 'select distinct p.id, p.nome, p.descricao_curta, (select avg(a.nota) from avaliacoes a where a.produto_id = p.id) as nota, p.preco, p.imagem, p.ml_p, p.ml_m, p.ml_g, p.sabores, p.tem_acucar, c.nome as categoria from favoritos f join produtos p on p.id = f.produto_id join categorias c on c.id = p.categoria_id where f.usuario_id = ? and f.ativo = true and p.ativo = true and p.disponivel = true'
        ClienteBD.rodar(sql, usuario, callback)
    }

    // dados.favorito = true marca, false desmarca. O produto é achado pelo nome.
    static salvarFavorito(dados, callback){
        if(dados.favorito){
            var sql = 'insert into favoritos (usuario_id, produto_id) select ?, id from produtos where nome = ? and ativo = true limit 1'
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
        var sql = 'select n.id, n.titulo, n.descricao, n.icone, un.lida from notificacoes n left join usuario_notificacoes un on un.notificacao_id = n.id and un.usuario_id = ? where n.ativo = true order by n.id desc'
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

    // Uma notificação só (o cliente tocou nela). dados.id = id da notificação.
    static lerNotificacao(dados, callback){
        if(!dados.usuario || !dados.id){
            return callback({'error':'Notificação inválida.'})
        }

        const connection = ClienteBD.connect()

        connection.query('update usuario_notificacoes set lida = true where usuario_id = ? and notificacao_id = ?', [dados.usuario, dados.id], (error, resultado)=>{
            if(error){
                connection.end()
                return callback({'error':ERRO_BANCO})
            }

            if(resultado.affectedRows > 0){
                connection.end()
                return callback({'message':'Lida.'})
            }

            // Primeira vez que o usuário mexe nessa notificação: a linha é criada já lida
            connection.query('insert into usuario_notificacoes (usuario_id, notificacao_id, lida) values (?, ?, true)', [dados.usuario, dados.id], (error)=>{
                connection.end()

                if(error){
                    return callback({'error':ERRO_BANCO})
                }

                callback({'message':'Lida.'})
            })
        })
    }
}

module.exports = ClienteBD
