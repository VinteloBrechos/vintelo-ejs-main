const usuario = require("../models/usuarioModel");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
var salt = bcrypt.genSaltSync(12);
const {removeImg} = require("../util/removeImg");
const { verificarUsuAutorizado } = require("../models/autenticador_middleware");


const usuarioController = {

    regrasValidacaoFormLogin: [
        body("nome_usu")
            .notEmpty()
            .withMessage("Digite seu e-mail ou nome de usuário"),
        body("senha_usu")
            .notEmpty()
            .withMessage("Digite sua senha")
    ],

    regrasValidacaoFormCad: [
        body("nome_usu")
            .isLength({ min: 3, max: 45 }).withMessage("Nome deve ter de 3 a 45 caracteres!"),
        body("nomeusu_usu")
            .isLength({ min: 8, max: 45 }).withMessage("Nome de usuário deve ter de 8 a 45 caracteres!"),
        body("email_usu")
            .isEmail().withMessage("Digite um e-mail válido!"),
        body("senha_usu")
            .isStrongPassword({
                minLength: 8,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1
            }).withMessage("A senha deve ter no mínimo 8 caracteres, incluindo maiúscula, minúscula, número e símbolo")
    ],


    regrasValidacaoPerfil: [
        body("nome_usu")
            .isLength({ min: 3, max: 45 }).withMessage("Nome deve ter de 3 a 45 caracteres!"),
        body("nomeusu_usu")
            .isLength({ min: 8, max: 45 }).withMessage("Nome de usuário deve ter de 8 a 45 caracteres!"),
        body("email_usu")
            .isEmail().withMessage("Digite um e-mail válido!"),
        body("celular_usu")
            .isLength({ min: 12, max: 15 }).withMessage("Digite um celular válido!"),
        body("cep")
            .isPostalCode('BR').withMessage("Digite um CEP válido!"),
        body("numero")
            .isNumeric().withMessage("Digite um número para o endereço!"),
        verificarUsuAutorizado([1, 2, 3], "pages/restrito"),
    ],

    logar: (req, res) => {
        const erros = validationResult(req);
        if (!erros.isEmpty()) {
            return res.render("pages/entrar", { listaErros: erros, dadosNotificacao: null })
        }
        if (req.session.autenticado.autenticado != null) {
            if (req.session.autenticado.tipo === 1) {
                res.redirect("/homecomprador");
            } else if (req.session.autenticado.tipo === 2) {
                res.redirect("/homevendedor");
            } else {
                res.redirect("/");
            }
        } else {
            res.render("pages/entrar", {
                listaErros: null,
                dadosNotificacao: { titulo: "Falha ao logar!", mensagem: "Usuário e/ou senha inválidos!", tipo: "error" }
            })
        }
    },


    cadastrar: async (req, res) => {
        const erros = validationResult(req);
        
        const sanitizedValues = {
            nome_usu: req.body.nome_usu || '',
            nomeusu_usu: req.body.nomeusu_usu || '',
            email_usu: req.body.email_usu || ''
        };
        
        if (!erros.isEmpty()) {
            return res.render("pages/login", { listaErros: erros, dadosNotificacao: null, valores: sanitizedValues })
        }
        
        try {
            const emailExiste = await usuario.findCampoCustom('EMAIL_USUARIO', req.body.email_usu);
            if (emailExiste > 0) {
                return res.render("pages/login", {
                    listaErros: null, 
                    dadosNotificacao: {
                        titulo: "Email já cadastrado!", 
                        mensagem: "Este email já está em uso. Tente fazer login.", 
                        tipo: "error"
                    }, 
                    valores: sanitizedValues
                });
            }
            
            const userExiste = await usuario.findCampoCustom('USER_USUARIO', req.body.nomeusu_usu);
            if (userExiste > 0) {
                return res.render("pages/login", {
                    listaErros: null, 
                    dadosNotificacao: {
                        titulo: "Nome de usuário já existe!", 
                        mensagem: "Escolha outro nome de usuário.", 
                        tipo: "error"
                    }, 
                    valores: sanitizedValues
                });
            }
            
            var dadosForm = {
                nome_usuario: req.body.nome_usu,
                user_usuario: req.body.nomeusu_usu,
                email_usuario: req.body.email_usu,
                senha_usuario: bcrypt.hashSync(req.body.senha_usu, salt),
                tipo_usuario: 1,
                status_usuario: 1
            };
            
            let create = await usuario.create(dadosForm);
            if (create && create.insertId) {
                res.render("pages/login", {
                    listaErros: null, 
                    dadosNotificacao: {
                        titulo: "Cadastro realizado!", 
                        mensagem: "Agora você pode fazer login.", 
                        tipo: "success"
                    }, 
                    valores: {}
                });
            } else {
                throw new Error("Falha ao criar usuário");
            }
        } catch (e) {
            console.log(e);
            res.render("pages/login", {
                listaErros: null, 
                dadosNotificacao: {
                    titulo: "Erro ao cadastrar!", 
                    mensagem: "Tente novamente mais tarde.", 
                    tipo: "error"
                }, 
                valores: sanitizedValues
            })
        }
    },


    mostrarPerfil: async (req, res) => {
        try {
            let results = await usuario.findId(req.session.autenticado.id);
            if (results[0].CEP_USUARIO != null) {
                const httpsAgent = new https.Agent({
                    rejectUnauthorized: false,
                });
                const response = await fetch(`https://viacep.com.br/ws/${results[0].CEP_USUARIO}/json/`, { method: 'GET', agent: httpsAgent });
                var viaCep = await response.json();
                var cep = results[0].CEP_USUARIO.slice(0,5)+ "-"+results[0].CEP_USUARIO.slice(5)
            }else{
                var viaCep = {logradouro:"", bairro:"", localidade:"", uf:""}
                var cep = null;
            }

            let campos = {
                nome_usu: results[0].NOME_USUARIO, email_usu: results[0].EMAIL_USUARIO,
                cep:  cep, 
                numero: results[0].NUMERO_USUARIO,
                complemento: results[0].COMPLEMENTO_USUARIO, logradouro: viaCep.logradouro,
                bairro: viaCep.bairro, localidade: viaCep.localidade, uf: viaCep.uf,
                img_perfil_pasta: results[0].IMAGEM_USUARIO,
                img_perfil_banco: results[0].IMAGEM_USUARIO != null && Buffer.isBuffer(results[0].IMAGEM_USUARIO) ? `data:image/jpeg;base64,${results[0].IMAGEM_USUARIO.toString('base64')}` : null,
                nomeusu_usu: results[0].USER_USUARIO, celular_usu: results[0].CELULAR_USUARIO, senha_usu: "",
                csrfToken: csrfProtection.generateToken(req)
            }

            res.render("pages/perfil", { listaErros: null, dadosNotificacao: null, valores: campos })
        } catch (e) {
            console.log(e);
            res.render("pages/perfil", {
                listaErros: null, dadosNotificacao: null, valores: {
                    img_perfil_banco: "", img_perfil_pasta: "", nome_usu: "", email_usu: "",
                    nomeusu_usu: "", fone_usu: "", senha_usu: "", cep: "", numero: "", complemento: "",
                    logradouro: "", bairro: "", localidade: "", uf: ""
                }
            })
        }
    },

    gravarPerfil: async (req, res) => {
        const erros = validationResult(req);
        const erroMulter = req.session.erroMulter;
        let lista = !erros.isEmpty() ? erros : { formatter: null, errors: [] };
        if (erroMulter != null) {
            if (!lista.errors) lista.errors = [];
            lista.errors.push(erroMulter);
        }
        if (!erros.isEmpty() || erroMulter != null) {

            const sanitizedFormData = req.body;
            return res.render("pages/perfil", { listaErros: lista, dadosNotificacao: null, valores: sanitizedFormData })
        }
        try {
            var dadosForm = {
                USER_USUARIO: req.body.nomeusu_usu,
                NOME_USUARIO: req.body.nome_usu,
                EMAIL_USUARIO: req.body.email_usu,
                CELULAR_USUARIO: req.body.celular_usu,
                CEP_USUARIO: req.body.cep.replace("-",""),
                NUMERO_USUARIO: req.body.numero,
                COMPLEMENTO_USUARIO: req.body.complemento,
                IMAGEM_USUARIO: req.session.autenticado.IMAGEM_USUARIO,
            };
            if (req.body.senha_usu !== "") {
                dadosForm.SENHA_USUARIO = bcrypt.hashSync(req.body.senha_usu, salt);
            }
            if (req.file) {
                let caminhoArquivo = "imagem/perfil/" + req.file.filename;
                if (dadosForm.IMAGEM_USUARIO !== caminhoArquivo) {
                    removeImg(dadosForm.IMAGEM_USUARIO);
                }
                dadosForm.IMAGEM_USUARIO = caminhoArquivo;
            }
            let resultUpdate = await usuario.update(dadosForm, req.session.autenticado.id);
            if (resultUpdate && resultUpdate.changedRows === 1) {
                var result = await usuario.findId(req.session.autenticado.id);
                var autenticado = {
                    autenticado: result[0].NOME_USUARIO,
                    id: result[0].ID_USUARIO,
                    tipo: result[0].TIPO_USUARIO,
                    IMAGEM_USUARIO: result[0].IMAGEM_USUARIO
                };
                req.session.autenticado = autenticado;
                var campos = {
                    nome_usu: result[0].NOME_USUARIO, email_usu: result[0].EMAIL_USUARIO,
                    img_perfil_pasta: result[0].IMAGEM_USUARIO,
                    img_perfil_banco: result[0].IMAGEM_USUARIO != null && Buffer.isBuffer(result[0].IMAGEM_USUARIO) ? `data:image/jpeg;base64,${result[0].IMAGEM_USUARIO.toString('base64')}` : null,
                    nomeusu_usu: result[0].USER_USUARIO, celular_usu: result[0].CELULAR_USUARIO, senha_usu: ""
                }
                res.render("pages/perfil", { listaErros: null, dadosNotificacao: { titulo: "Perfil atualizado com sucesso", mensagem: "Alterações Gravadas", tipo: "success" }, valores: campos });
                } else {
                    const sanitizedFormData = req.body;
                    res.render("pages/perfil", { listaErros: null, dadosNotificacao: { titulo: "Perfil atualizado", mensagem: "Sem alterações", tipo: "info" }, valores: sanitizedFormData });
                }
        } catch (e) {
            console.log(e)
            
            const sanitizedFormData = req.body;
            res.render("pages/perfil", { listaErros: null, dadosNotificacao: { titulo: "Erro ao atualizar o perfil!", mensagem: "Verifique os valores digitados!", tipo: "error" }, valores: sanitizedFormData })
        }
    }
};

module.exports = usuarioController;