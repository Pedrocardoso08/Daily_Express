const http = require('http')
const url = require('url')

const UsuarioBD = require('./database/UsuarioBD')
const LojaBD = require('./database/LojaBD')

const callback = (req, res)=>{
    res.setHeader('Access-Control-Allow-Origin','*')
    res.setHeader('Access-Control-Allow-Headers','*')

    var rota = url.parse(req.url,true)

    if(req.method == 'OPTIONS'){
        res.writeHead(204)
        res.end()
        return
    }

    if(req.method == 'GET'){
        if(rota.pathname == '/produtos'){
            LojaBD.getProdutos((message)=>{
                res.writeHead(message.error ? 500 : 200,{'Content-Type':'application/json'})
                res.end(JSON.stringify(message))
            })
        }else if(rota.pathname == '/cupons'){
            LojaBD.getCupons((message)=>{
                res.writeHead(message.error ? 500 : 200,{'Content-Type':'application/json'})
                res.end(JSON.stringify(message))
            })
        }else{
            res.writeHead(404,{'Content-Type':'application/json'})
            res.end(JSON.stringify({'message':'Rota inválida'}))
        }

    }else if(req.method == 'POST'){
        var body = ''
        req.on('data',(data)=>{
            body += data
        })

        if(rota.pathname == '/registro'){
            req.on('end', ()=>{
                var usuario = JSON.parse(body)
                UsuarioBD.addUsuario(usuario,(message)=>{
                    res.writeHead(message.error ? 400 : 201,{'Content-Type':'application/json'})
                    res.end(JSON.stringify(message))
                })
            })
        }else if(rota.pathname == '/login'){
            req.on('end',()=>{
                var usuario = JSON.parse(body)
                UsuarioBD.login(usuario,(message)=>{
                    res.writeHead(message.error ? 401 : 200,{'Content-Type':'application/json'})
                    res.end(JSON.stringify(message))
                })
            })
        }else if(rota.pathname == '/produto'){
            req.on('end',()=>{
                var produto = JSON.parse(body)
                LojaBD.addProduto(produto,(message)=>{
                    res.writeHead(message.error ? 400 : 201,{'Content-Type':'application/json'})
                    res.end(JSON.stringify(message))
                })
            })
        }else if(rota.pathname == '/removerProduto'){
            req.on('end',()=>{
                var produto = JSON.parse(body)
                LojaBD.removerProduto(produto,(message)=>{
                    res.writeHead(message.error ? 400 : 200,{'Content-Type':'application/json'})
                    res.end(JSON.stringify(message))
                })
            })
        }else if(rota.pathname == '/cupom'){
            req.on('end',()=>{
                var cupom = JSON.parse(body)
                LojaBD.addCupom(cupom,(message)=>{
                    res.writeHead(message.error ? 400 : 201,{'Content-Type':'application/json'})
                    res.end(JSON.stringify(message))
                })
            })
        }else if(rota.pathname == '/removerCupom'){
            req.on('end',()=>{
                var cupom = JSON.parse(body)
                LojaBD.removerCupom(cupom,(message)=>{
                    res.writeHead(message.error ? 400 : 200,{'Content-Type':'application/json'})
                    res.end(JSON.stringify(message))
                })
            })
        }else{
            res.writeHead(404,{'Content-Type':'application/json'})
            res.end(JSON.stringify({'message':'Rota inválida'}))
        }

    }else{
        res.writeHead(404,{'Content-Type':'application/json'})
        res.end(JSON.stringify({'message':'Rota inválida'}))
    }

}

const server = http.createServer(callback)

server.listen(3000,()=>{console.log('Servidor rodando em http://localhost:3000')})
