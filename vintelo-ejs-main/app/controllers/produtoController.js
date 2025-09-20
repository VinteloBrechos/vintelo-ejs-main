const produto = require("../models/produtoModel");
const { body, validationResult } = require("express-validator");
const { verificarUsuAutorizado } = require("../models/autenticador_middleware");
const { removeImg } = require("../util/removeImg");

const produtoController = {

    regrasValidacaoProduto: [
        body("nome_produto")
            .isLength({ min: 3, max: 100 }).withMessage("Nome deve ter de 3 a 100 caracteres!"),
        body("descricao_produto")
            .isLength({ min: 10, max: 500 }).withMessage("Descrição deve ter de 10 a 500 caracteres!"),
        body("preco_produto")
            .isFloat({ min: 0.01 }).withMessage("Preço deve ser maior que zero!"),
        body("categoria_produto")
            .notEmpty().withMessage("Selecione uma categoria!"),
        body("tamanho_produto")
            .notEmpty().withMessage("Selecione um tamanho!"),
        body("condicao_produto")
            .isIn(['novo', 'seminovo', 'usado']).withMessage("Condição inválida!"),
        verificarUsuAutorizado([2], "pages/restrito"),
    ],

    mostrarFormAdicionar: (req, res) => {
        const campos = {
            nome_produto: "",
            descricao_produto: "",
            preco_produto: "",
            categoria_produto: "",
            tamanho_produto: "",
            condicao_produto: "",
        };
        res.render("pages/adicionar", { 
            listaErros: null, 
            dadosNotificacao: null, 
            valores: campos 
        });
    },

    adicionarProduto: async (req, res) => {
        const erros = validationResult(req);
        const erroMulter = req.session.erroMulter;

        let lista = !erros.isEmpty() ? erros : { formatter: null, errors: [] };
        if (erroMulter != null) {
            if (!lista.errors) lista.errors = [];
            lista.errors.push(erroMulter);
        }

        if (!erros.isEmpty() || erroMulter != null) {
            return res.render("pages/adicionar", { 
                listaErros: lista, 
                dadosNotificacao: null, 
            });
        }

        try {
            const dadosForm = {
                NOME_PRODUTO: req.body.nome_produto,
                DESCRICAO_PRODUTO: req.body.descricao_produto,
                PRECO_PRODUTO: parseFloat(req.body.preco_produto),
                CATEGORIA_PRODUTO: req.body.categoria_produto,
                TAMANHO_PRODUTO: req.body.tamanho_produto,
                CONDICAO_PRODUTO: req.body.condicao_produto,
                ID_USUARIO: req.session.autenticado.id,
                IMAGEM_PRODUTO: req.file ? `imagem/produtos/${req.file.filename}` : null,
                STATUS_PRODUTO: 1,
                DATA_CADASTRO: new Date()
            };

            const create = await produto.create(dadosForm);
            if (create && create.insertId) {
                res.render("pages/adicionar", {
                    listaErros: null,
                    dadosNotificacao: {
                        titulo: "Produto adicionado!",
                        mensagem: "Produto cadastrado com sucesso.",
                        tipo: "success"
                    },
                    valores: {}
                });
            } else {
                throw new Error("Falha ao criar produto");
            }
        } catch (e) {
            console.log(e);
            res.render("pages/adicionar", {
                listaErros: null,
                dadosNotificacao: {
                    titulo: "Erro ao cadastrar!",
                    mensagem: "Tente novamente mais tarde.",
                    tipo: "error"
                },
            });
        }
    },

    listarPorCategoria: async (req, res) => {
        try {
            const categoria = req.params.categoria;
            const page = parseInt(req.query.page) || 1;
            const limit = 12;
            const offset = (page - 1) * limit;

            const produtos = await produto.findByCategoria(categoria, limit, offset);
            const total = await produto.countByCategoria(categoria);
            const totalPages = Math.ceil(total / limit);

            res.render("pages/produtos", {
                produtos: produtos,
                categoria: categoria,
                currentPage: page,
                totalPages: totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            });
        } catch (e) {
            console.log(e);
            res.render("pages/produtos", {
                produtos: [],
                categoria: req.params.categoria,
                currentPage: 1,
                totalPages: 1,
                hasNext: false,
                hasPrev: false
            });
        }
    },

    buscarProdutos: async (req, res) => {
        try {
            const termo = req.query.q || '';
            const categoria = req.query.categoria || '';
            const precoMin = parseFloat(req.query.precoMin) || 0;
            const precoMax = parseFloat(req.query.precoMax) || 999999;
            const page = parseInt(req.query.page) || 1;
            const limit = 12;
            const offset = (page - 1) * limit;

            const filtros = {
                termo: termo,
                categoria: categoria,
                precoMin: precoMin,
                precoMax: precoMax,
                limit: limit,
                offset: offset
            };

            const produtos = await produto.search(filtros);
            const total = await produto.countSearch(filtros);
            const totalPages = Math.ceil(total / limit);

            res.render("pages/busca", {
                produtos: produtos,
                filtros: filtros,
                currentPage: page,
                totalPages: totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            });
        } catch (e) {
            console.log(e);
            res.render("pages/busca", {
                produtos: [],
                filtros: {},
                currentPage: 1,
                totalPages: 1,
                hasNext: false,
                hasPrev: false
            });
        }
    },


    mostrarDetalhes: async (req, res) => {
        try {
            const id = req.params.id;
            const produtoDetalhes = await produto.findById(id);
            
            if (!produtoDetalhes || produtoDetalhes.length === 0) {
                return res.render("pages/erro", {
                    titulo: "Produto não encontrado",
                    mensagem: "O produto solicitado não existe."
                });
            }

           
            const relacionados = await produto.findRelacionados(
                produtoDetalhes[0].CATEGORIA_PRODUTO, 
                id, 
                4
            );

            res.render("pages/produto-detalhes", {
                produto: produtoDetalhes[0],
                relacionados: relacionados
            });
        } catch (e) {
            console.log(e);
            res.render("pages/erro", {
                titulo: "Erro interno",
                mensagem: "Ocorreu um erro ao carregar o produto."
            });
        }
    },

    meusProdutos: async (req, res) => {
        try {
            const userId = req.session.autenticado.id;
            const page = parseInt(req.query.page) || 1;
            const limit = 10;
            const offset = (page - 1) * limit;

            const produtos = await produto.findByUserId(userId, limit, offset);
            const total = await produto.countByUserId(userId);
            const totalPages = Math.ceil(total / limit);

            res.render("pages/meus-produtos", {
                produtos: produtos,
                currentPage: page,
                totalPages: totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            });
        } catch (e) {
            console.log(e);
            res.render("pages/meus-produtos", {
                produtos: [],
                currentPage: 1,
                totalPages: 1,
                hasNext: false,
                hasPrev: false
            });
        }
    },


    editarProduto: async (req, res) => {
        const erros = validationResult(req);
        const sanitizedValues = sanitizer.sanitizeFormData(req.body);
        
        if (!erros.isEmpty()) {
            return res.render("pages/editar-produto", { 
                listaErros: erros, 
                dadosNotificacao: null, 
                valores: sanitizedValues 
            });
        }

        try {
            const id = req.params.id;
            const userId = req.session.autenticado.id;

           
            const produtoExistente = await produto.findByIdAndUserId(id, userId);
            if (!produtoExistente || produtoExistente.length === 0) {
                return res.render("pages/erro", {
                    titulo: "Acesso negado",
                    mensagem: "Você não tem permissão para editar este produto."
                });
            }

            const dadosForm = {
                NOME_PRODUTO: req.body.nome_produto,
                DESCRICAO_PRODUTO: req.body.descricao_produto,
                PRECO_PRODUTO: parseFloat(req.body.preco_produto),
                CATEGORIA_PRODUTO: req.body.categoria_produto,
                TAMANHO_PRODUTO: req.body.tamanho_produto,
                CONDICAO_PRODUTO: req.body.condicao_produto
            };

            if (req.file) {
                
                if (produtoExistente[0].IMAGEM_PRODUTO) {
                    removeImg(produtoExistente[0].IMAGEM_PRODUTO);
                }
                dadosForm.IMAGEM_PRODUTO = `imagem/produtos/${req.file.filename}`;
            }

            const update = await produto.update(dadosForm, id);
            if (update && update.changedRows > 0) {
                res.redirect("/meus-produtos");
            } else {
                throw new Error("Falha ao atualizar produto");
            }
        } catch (e) {
            console.log(e);
            res.render("pages/editar-produto", {
                listaErros: null,
                dadosNotificacao: {
                    titulo: "Erro ao atualizar!",
                    mensagem: "Tente novamente mais tarde.",
                    tipo: "error"
                },
            
            });
        }
    },

   
    excluirProduto: async (req, res) => {
        try {
            const id = req.params.id;
            const userId = req.session.autenticado.id;

            const produtoExistente = await produto.findByIdAndUserId(id, userId);
            if (!produtoExistente || produtoExistente.length === 0) {
                return res.json({ 
                    success: false, 
                    message: "Produto não encontrado ou sem permissão." 
                });
            }

         
            if (produtoExistente[0].IMAGEM_PRODUTO) {
                removeImg(produtoExistente[0].IMAGEM_PRODUTO);
            }

            const deleted = await produto.delete(id);
            if (deleted && deleted.affectedRows > 0) {
                res.json({ 
                    success: true, 
                    message: "Produto excluído com sucesso!" 
                });
            } else {
                throw new Error("Falha ao excluir produto");
            }
        } catch (e) {
            console.log(e);
            res.json({ 
                success: false, 
                message: "Erro ao excluir produto." 
            });
        }
    }
};

module.exports = produtoController;