const moment = require("moment")
var pool = require("../config/pool_conexoes");

const produtoModel = {

    create: async (dados) => {
        const query = `INSERT INTO PRODUTOS 
            (NOME_PRODUTO, DESCRICAO_PRODUTO, PRECO_PRODUTO, CATEGORIA_PRODUTO, TAMANHO_PRODUTO, CONDICAO_PRODUTO, ID_USUARIO, IMAGEM_PRODUTO, STATUS_PRODUTO, DATA_CADASTRO) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const params = [
            dados.NOME_PRODUTO,
            dados.DESCRICAO_PRODUTO,
            dados.PRECO_PRODUTO,
            dados.CATEGORIA_PRODUTO,
            dados.TAMANHO_PRODUTO,
            dados.CONDICAO_PRODUTO,
            dados.ID_USUARIO,
            dados.IMAGEM_PRODUTO,
            dados.STATUS_PRODUTO,
            dados.DATA_CADASTRO
        ];
        const [result] = await db.execute(query, params);
        return result;
    },

    findByCategoria: async (categoria, limit, offset) => {
        const query = "SELECT * FROM PRODUTOS WHERE CATEGORIA_PRODUTO = ? AND STATUS_PRODUTO = 1 LIMIT ? OFFSET ?";
        const [rows] = await db.execute(query, [categoria, limit, offset]);
        return rows;
    },

    countByCategoria: async (categoria) => {
        const query = "SELECT COUNT(*) as total FROM PRODUTOS WHERE CATEGORIA_PRODUTO = ? AND STATUS_PRODUTO = 1";
        const [rows] = await db.execute(query, [categoria]);
        return rows[0].total;
    },

    search: async (filtros) => {
        let query = "SELECT * FROM PRODUTOS WHERE STATUS_PRODUTO = 1";
        let params = [];
        if (filtros.termo) {
            query += " AND NOME_PRODUTO LIKE ?";
            params.push(`%${filtros.termo}%`);
        }
        if (filtros.categoria) {
            query += " AND CATEGORIA_PRODUTO = ?";
            params.push(filtros.categoria);
        }
        query += " AND PRECO_PRODUTO BETWEEN ? AND ? LIMIT ? OFFSET ?";
        params.push(filtros.precoMin, filtros.precoMax, filtros.limit, filtros.offset);
        const [rows] = await db.execute(query, params);
        return rows;
    },

    countSearch: async (filtros) => {
        let query = "SELECT COUNT(*) as total FROM PRODUTOS WHERE STATUS_PRODUTO = 1";
        let params = [];
        if (filtros.termo) {
            query += " AND NOME_PRODUTO LIKE ?";
            params.push(`%${filtros.termo}%`);
        }
        if (filtros.categoria) {
            query += " AND CATEGORIA_PRODUTO = ?";
            params.push(filtros.categoria);
        }
        query += " AND PRECO_PRODUTO BETWEEN ? AND ?";
        params.push(filtros.precoMin, filtros.precoMax);
        const [rows] = await db.execute(query, params);
        return rows[0].total;
    },

    findById: async (id) => {
        const query = "SELECT * FROM PRODUTOS WHERE ID_PROD = ? AND STATUS_PRODUTO = 1";
        const [rows] = await db.execute(query, [id]);
        return rows;
    },

    findRelacionados: async (categoria, id, limit) => {
        const query = "SELECT * FROM PRODUTOS WHERE CATEGORIA_PRODUTO = ? AND ID_PROD != ? AND STATUS_PRODUTO = 1 LIMIT ?";
        const [rows] = await db.execute(query, [categoria, id, limit]);
        return rows;
    },

    findByUserId: async (userId, limit, offset) => {
        const query = "SELECT * FROM PRODUTOS WHERE ID_USUARIO = ? LIMIT ? OFFSET ?";
        const [rows] = await db.execute(query, [userId, limit, offset]);
        return rows;
    },

    countByUserId: async (userId) => {
        const query = "SELECT COUNT(*) as total FROM PRODUTOS WHERE ID_USUARIO = ?";
        const [rows] = await db.execute(query, [userId]);
        return rows[0].total;
    },

    findByIdAndUserId: async (id, userId) => {
        const query = "SELECT * FROM PRODUTOS WHERE ID_PROD = ? AND ID_USUARIO = ?";
        const [rows] = await db.execute(query, [id, userId]);
        return rows;
    },

    update: async (dados, id) => {
        let query = `UPDATE PRODUTOS SET 
            NOME_PRODUTO = ?, DESCRICAO_PRODUTO = ?, PRECO_PRODUTO = ?, CATEGORIA_PRODUTO = ?, TAMANHO_PRODUTO = ?, CONDICAO_PRODUTO = ?`;
        let params = [
            dados.NOME_PRODUTO,
            dados.DESCRICAO_PRODUTO,
            dados.PRECO_PRODUTO,
            dados.CATEGORIA_PRODUTO,
            dados.TAMANHO_PRODUTO,
            dados.CONDICAO_PRODUTO
        ];
        if(dados.IMAGEM_PRODUTO){
            query += ", IMAGEM_PRODUTO = ?";
            params.push(dados.IMAGEM_PRODUTO);
        }
        query += " WHERE ID_PROD = ?";
        params.push(id);
        const [result] = await db.execute(query, params);
        return result;
    },

    delete: async (id) => {
        const query = "DELETE FROM PRODUTOS WHERE ID_PROD = ?";
        const [result] = await db.execute(query, [id]);
        return result;
    }
};

module.exports = produtoModel;
