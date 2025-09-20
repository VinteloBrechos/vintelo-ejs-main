var pool = require("../../config/pool_conexoes");

const tipoUsuarioModel = {
	findAll: async () => {
		try {
			const [resultados] = await pool.query(
				"SELECT * FROM TIPO_USUARIO WHERE STATUS_TIPO_USUARIO = 'ATIVO'"
			)
			return resultados;
		} catch (error) {
			return error;
		}
	},
	
	findId: async (id) => {
		try {
			const [resultados] = await pool.query(
				"SELECT * FROM TIPO_USUARIO WHERE ID_TIPO_USUARIO = ? AND STATUS_TIPO_USUARIO = 'ATIVO'",
				[id]
			)
			return resultados;
		} catch (error) {
			return error;
		}
	},
	create: async (camposJson) => {
		try {
			const [resultados] = await pool.query(
				"INSERT INTO TIPO_USUARIO SET ?",
				[camposJson]
			)
			return resultados;
		} catch (error) {
			return error;
		}
	},
	update: async (camposJson) => {
		try {
			const [resultados] = await pool.query(
				"UPDATE TIPO_USUARIO SET TIPO_USUARIO = ?, DESCRICAO_USUARIO = ? WHERE ID_TIPO_USUARIO = ?",
				[camposJson.TIPO_USUARIO, camposJson.DESCRICAO_USUARIO, camposJson.ID_TIPO_USUARIO],
			)
			return resultados;
		} catch (error) {
			return error;
		}
	},
	delete: async (id) => {
		try {
			
			const [resultados] = await pool.query(
				"UPDATE TIPO_USUARIO SET STATUS_TIPO_USUARIO = 'INATIVO' WHERE ID_TIPO_USUARIO = ?", [id]
			)
			return resultados;
		} catch (error) {
			return error;
		}
	}
};

module.exports = tipoUsuarioModel