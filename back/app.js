const http = require('http')
const url = require('url')
const fs = require('fs')
const path = require('path')

const UsuarioBD = require('./database/UsuarioBD')
const LojaBD = require('./database/LojaBD')
const ClienteBD = require('./database/ClienteBD')

// Manda para o app a resposta que veio do banco
function responder(res, message){
    res.writeHead(message.error ? 400 : 200,{'Content-Type':'application/json; charset=utf-8'})
    res.end(JSON.stringify(message))
}

function rotaInvalida(res){
    res.writeHead(404,{'Content-Type':'application/json'})
    res.end(JSON.stringify({'message':'Rota inválida'}))
}

const callback = (req, res)=>{
    res.setHeader('Access-Control-Allow-Origin','*')
    res.setHeader('Access-Control-Allow-Headers','*')

    var rota = url.parse(req.url,true)

    // Função que todas as rotas usam para devolver a resposta
    var resposta = (message)=>{
        responder(res, message)
    }

    if(req.method == 'OPTIONS'){
        res.writeHead(204)
        res.end()
        return
    }

    if(req.method == 'GET'){
        // As listas do cliente recebem o id do usuário assim: /pedidos?usuario=1
        var usuario = rota.query.usuario

        if(rota.pathname == '/produtos'){
            LojaBD.getProdutos(resposta)
        }else if(rota.pathname == '/cupons'){
            LojaBD.getCupons(resposta)
        }else if(rota.pathname == '/perfil'){
            ClienteBD.getPerfil(usuario, resposta)
        }else if(rota.pathname == '/pedidos'){
            ClienteBD.getPedidos(usuario, resposta)
        }else if(rota.pathname == '/enderecos'){
            ClienteBD.getEnderecos(usuario, resposta)
        }else if(rota.pathname == '/favoritos'){
            ClienteBD.getFavoritos(usuario, resposta)
        }else if(rota.pathname == '/cartoes'){
            ClienteBD.getCartoes(usuario, resposta)
        }else if(rota.pathname == '/notificacoes'){
            ClienteBD.getNotificacoes(usuario, resposta)
        }else if(rota.pathname.startsWith('/fotos/')){
            // Entrega a foto de perfil salva na pasta back/fotos
            // (o basename impede de pedir arquivos fora dessa pasta)
            var arquivo = path.join(__dirname, 'fotos', path.basename(rota.pathname))

            fs.readFile(arquivo, (error, conteudo)=>{
                if(error){
                    return rotaInvalida(res)
                }
                res.writeHead(200,{'Content-Type':'image/jpeg'})
                res.end(conteudo)
            })
        }else{
            rotaInvalida(res)
        }

    }else if(req.method == 'POST'){
        var body = ''
        req.on('data',(data)=>{
            body += data
        })

        // Quando o corpo chega inteiro, vira objeto e vai para a rota certa
        req.on('end',()=>{
            var dados = JSON.parse(body)

            // Login e senha
            if(rota.pathname == '/registro'){
                UsuarioBD.addUsuario(dados, resposta)
            }else if(rota.pathname == '/login'){
                UsuarioBD.login(dados, resposta)
            }else if(rota.pathname == '/esqueciSenha'){
                UsuarioBD.esqueciSenha(dados, resposta)
            }else if(rota.pathname == '/conferirCodigo'){
                UsuarioBD.conferirCodigo(dados, resposta)
            }else if(rota.pathname == '/novaSenha'){
                UsuarioBD.novaSenha(dados, resposta)

            // Área do funcionário
            }else if(rota.pathname == '/produto'){
                LojaBD.addProduto(dados, resposta)
            }else if(rota.pathname == '/removerProduto'){
                LojaBD.removerProduto(dados, resposta)
            }else if(rota.pathname == '/cupom'){
                LojaBD.addCupom(dados, resposta)
            }else if(rota.pathname == '/removerCupom'){
                LojaBD.removerCupom(dados, resposta)

            // Área do cliente
            }else if(rota.pathname == '/preferencias'){
                ClienteBD.salvarPreferencias(dados, resposta)
            }else if(rota.pathname == '/foto'){
                ClienteBD.salvarFoto(dados, resposta)
            }else if(rota.pathname == '/pedido'){
                ClienteBD.addPedido(dados, resposta)
            }else if(rota.pathname == '/endereco'){
                ClienteBD.addEndereco(dados, resposta)
            }else if(rota.pathname == '/removerEndereco'){
                ClienteBD.removerEndereco(dados, resposta)
            }else if(rota.pathname == '/favorito'){
                ClienteBD.salvarFavorito(dados, resposta)
            }else if(rota.pathname == '/cartao'){
                ClienteBD.addCartao(dados, resposta)
            }else if(rota.pathname == '/removerCartao'){
                ClienteBD.removerCartao(dados, resposta)
            }else if(rota.pathname == '/lerNotificacoes'){
                ClienteBD.lerNotificacoes(dados, resposta)
            }else{
                rotaInvalida(res)
            }
        })

    }else{
        rotaInvalida(res)
    }

}

const server = http.createServer(callback)

server.listen(3000,()=>{console.log('Servidor rodando em http://localhost:3000')})
