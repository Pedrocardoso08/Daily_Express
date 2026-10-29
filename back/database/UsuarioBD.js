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

        var sql = 'select id, nome, email, senha, foto from usuarios where email = ?'

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
                    'usuario':{'id':user.id, 'nome':user.nome, 'email':user.email, 'foto':user.foto}
                })
            })
        })
    }

    // Esqueci a senha: tela app/esqueciSenha.tsx
    // Como não temos servidor de e-mail, o código volta para o app e aparece na tela.
    static esqueciSenha(dados, callback){
        if(!dados.email){
            return callback({'error':'Digite o e-mail.'})
        }

        const connection = UsuarioBD.connect()

        connection.query('select id from usuarios where email = ?', dados.email, (error, results)=>{
            if(error){
                connection.end()
                return callback({'error':'Erro ao acessar o banco de dados. Confira se o MySQL está ligado.'})
            }

            if(results.length == 0){
                connection.end()
                return callback({'error':'Não existe conta com esse e-mail.'})
            }

            // Número de 6 dígitos, de 100000 a 999999
            var codigo = String(Math.floor(100000 + Math.random() * 900000))

            var sql = 'insert into recuperacao_senha (usuario_id, codigo, expira_em) values (?, ?, now() + interval 15 minute)'

            connection.query(sql, [results[0].id, codigo], (error)=>{
                connection.end()

                if(error){
                    return callback({'error':'Não foi possível gerar o código.'})
                }

                callback({'message':'Código gerado.', 'codigo':codigo})
            })
        })
    }

    // Confere o código digitado: tela app/esqueciSenha.tsx
    static conferirCodigo(dados, callback){
        const connection = UsuarioBD.connect()

        connection.query(SQL_CODIGO, [dados.email, dados.codigo], (error, results)=>{
            connection.end()

            if(error){
                return callback({'error':'Erro ao acessar o banco de dados. Confira se o MySQL está ligado.'})
            }

            if(results.length == 0){
                return callback({'error':'Código errado ou vencido.'})
            }

            callback({'message':'Código certo.'})
        })
    }

    // Troca a senha: tela app/novaSenha.tsx
    static novaSenha(dados, callback){
        var {email, codigo, senha} = dados

        if(!senha || senha.length < 6){
            return callback({'error':'A senha precisa ter pelo menos 6 caracteres.'})
        }

        const connection = UsuarioBD.connect()

        // Confere o código de novo antes de trocar
        connection.query(SQL_CODIGO, [email, codigo], async (error, results)=>{
            if(error){
                connection.end()
                return callback({'error':'Erro ao acessar o banco de dados. Confira se o MySQL está ligado.'})
            }

            if(results.length == 0){
                connection.end()
                return callback({'error':'Código errado ou vencido. Peça um novo.'})
            }

            var senhaCriptografada = await bcrypt.hash(senha,12)

            connection.query('update usuarios set senha = ? where email = ?', [senhaCriptografada, email])
            connection.query('update recuperacao_senha set usado = true where id = ?', results[0].id)
            connection.end()

            callback({'message':'Senha alterada!'})
        })
    }
}

// Código válido: é desse e-mail, não foi usado e ainda não venceu (15 minutos)
const SQL_CODIGO = 'select r.id from recuperacao_senha r join usuarios u on u.id = r.usuario_id where u.email = ? and r.codigo = ? and r.usado = false and r.expira_em > now()'
module.exports = UsuarioBD
