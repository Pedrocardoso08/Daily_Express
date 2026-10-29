const mysql = require('mysql')
const bcrypt = require('bcrypt')

class UsuarioBD{
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

    // Cadastro: tela app/cadastro.tsx
    static async addUsuario(usuario, callback){
        var {nome, email, senha} = usuario

        if(!nome || !email || !senha){
            return callback({'error':'Preencha todos os campos.'})
        }

        if(senha.length < 6){
            return callback({'error':'A senha precisa ter pelo menos 6 caracteres.'})
        }

        const connection = UsuarioBD.connect()

        // O email é único: confere se já existe antes de cadastrar
        var sqlBusca = 'select id from usuarios where email = ?'

        connection.query(sqlBusca, email, async (error, results)=>{
            if(error){
                connection.end()
                return callback({'error':'Erro ao acessar o banco de dados. Confira se o MySQL está ligado.'})
            }

            if(results.length > 0){
                connection.end()
                return callback({'error':'Este email já está cadastrado.'})
            }

            var senhaCriptografada = await bcrypt.hash(senha,12)

            var novoUsuario = {
                nome: nome,
                email: email,
                senha: senhaCriptografada
            }

            var sql = 'insert into usuarios set ?'

            connection.query(sql, novoUsuario, (error, results)=>{
                if(error) throw error

                // Todo usuário novo começa com as preferências padrão
                var sqlPreferencias = 'insert into preferencias (usuario_id) values (?)'

                connection.query(sqlPreferencias, results.insertId, (error)=>{
                    if(error) throw error

                    connection.end()
                    callback({'message':'Usuário cadastrado com sucesso!'})
                })
            })
        })
    }

    // Login: tela app/login.tsx
    static login(usuario, callback){
        var {email, senha} = usuario

        if(!email || !senha){
            return callback({'error':'Preencha o email e a senha.'})
        }

        const connection = UsuarioBD.connect()

        var sql = 'select id, nome, email, senha from usuarios where email = ?'

        connection.query(sql, email, (error, results)=>{
            if(error){
                connection.end()
                return callback({'error':'Erro ao acessar o banco de dados. Confira se o MySQL está ligado.'})
            }

            if(results.length == 0){
                connection.end()
                return callback({'error':'Usuário não cadastrado.'})
            }

            var user = results[0]

            var senhaValida = bcrypt.compareSync(senha, user.senha)

            if(!senhaValida){
                connection.end()
                return callback({'error':'Senha incorreta.'})
            }

            var sqlLogin = 'update usuarios set ultimo_login = now() where id = ?'

            connection.query(sqlLogin, user.id, (error)=>{
                if(error) throw error

                connection.end()
                callback({
                    'message':'Logado com sucesso!',
                    'usuario':{'id':user.id, 'nome':user.nome, 'email':user.email}
                })
            })
        })
    }
}
module.exports = UsuarioBD
