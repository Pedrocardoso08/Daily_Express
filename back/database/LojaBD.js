const mysql = require('mysql')

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

    // Lista do cardápio: tela app/(tabs)/menu.tsx
    static getProdutos(callback){
        const connection = LojaBD.connect()

        var sql = 'select p.id, p.nome, p.descricao_curta, p.preco, p.preco_antigo, p.nota, p.imagem, c.nome as categoria from produtos p join categorias c on c.id = p.categoria_id where p.ativo = true order by p.id desc'

        connection.query(sql, (error, results)=>{
            connection.end()

            if(error){
                return callback({'error':'Erro ao acessar o banco de dados. Confira se o MySQL está ligado.'})
            }

            callback(results)
        })
    }

    // Cadastro: tela app/funcionarios.tsx
    static addProduto(produto, callback){
        var {nome, descricao, categoria, preco, precoAntigo, nota, imagem} = produto

        if(!nome || !descricao || !categoria || !preco){
            return callback({'error':'Preencha nome, descrição, categoria e preço.'})
        }

        const connection = LojaBD.connect()

        var sqlCategoria = 'select id from categorias where nome = ?'

        connection.query(sqlCategoria, categoria, (error, results)=>{
            if(error){
                connection.end()
                return callback({'error':'Erro ao acessar o banco de dados. Confira se o MySQL está ligado.'})
            }

            if(results.length == 0){
                connection.end()
                return callback({'error':'Categoria não encontrada.'})
            }

            var novoProduto = {
                categoria_id: results[0].id,
                nome: nome,
                descricao_curta: descricao,
                preco: preco,
                preco_antigo: precoAntigo ? precoAntigo : null,
                nota: nota ? nota : 5,
                imagem: imagem ? imagem : null
            }

            var sql = 'insert into produtos set ?'

            connection.query(sql, novoProduto, (error)=>{
                connection.end()

                if(error){
                    return callback({'error':'Não foi possível cadastrar o produto.'})
                }

                callback({'message':'Produto cadastrado com sucesso!'})
            })
        })
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

    // Lista: tela app/cupons.tsx e o botão Aplicar do carrinho
    static getCupons(callback){
        const connection = LojaBD.connect()

        var sql = 'select id, codigo, titulo, descricao, tipo, valor from cupons where ativo = true order by id desc'

        connection.query(sql, (error, results)=>{
            connection.end()

            if(error){
                return callback({'error':'Erro ao acessar o banco de dados. Confira se o MySQL está ligado.'})
            }

            callback(results)
        })
    }

    // Cadastro: tela app/funcionarios.tsx
    static addCupom(cupom, callback){
        var {codigo, titulo, descricao, tipo, valor} = cupom

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
}

module.exports = LojaBD
