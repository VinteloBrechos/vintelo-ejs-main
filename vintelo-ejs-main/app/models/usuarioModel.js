
var pool = require("../config/pool_conexoes");
 
const usuarioModel = {
    findAll: async () => {
        try {
            const [resultados] = await pool.query(
                "SELECT u.ID_USUARIO, u.NOME_USUARIO, u.USER_USUARIO, " +
                "u.SENHA_USUARIO, u.EMAIL_USUARIO, u.CELULAR_USUARIO, U.TIPO_USUARIO, " +
                "u.STATUS_USUARIO, T.TIPO_USUARIO, T.DESCRICAO_USUARIO " +
                "FROM USUARIOS u, TIPO_USUARIO t where u.STATUS_USUARIO = 1 and " + 
                "u.TIPO_USUARIO = t.ID_TIPO_USUARIO"
            );
            return resultados;
        } catch (error) {
            console.log(error);
            return error;
        }
    },
    findUserEmail: async (camposForm) => {
        try {
            const [resultados] = await pool.query (
                "SELECT * FROM USUARIOS WHERE USER_USUARIO = ? or EMAIL_USUARIO =? ", 
                [camposForm.user_usuario, camposForm.user_usuario]
            )
            return resultados;
        } catch (error) {
            console.log(error);
            return error;
        }
    },
 
    findCampoCustom: async (campo, valor) => {
        try {
            const [resultados] = await pool.query(
                `SELECT count(*) as totalReg FROM USUARIOS WHERE ${campo} = ?`,
                [valor]
            )
            return resultados[0].totalReg;
        } catch (error) {
            console.log (error);
            return 0;
        }
    },
 
    findId: async (id) => {
        try {
            const [resultados] = await pool.query(
                "SELECT u.ID_USUARIO, u.NOME_USUARIO, u.USER_USUARIO, " + 
                "u.SENHA_USUARIO, u.EMAIL_USUARIO, u.CELULAR_USUARIO, u.TIPO_USUARIO, " +
                "u.STATUS_USUARIO, u.NUMERO_USUARIO, u.CEP_USUARIO, u.IMAGEM_USUARIO," + 
                " t.ID_TIPO_USUARIO, t.DESCRICAO_USUARIO " +
                "FROM USUARIOS u, TIPO_USUARIO t where u.STATUS_USUARIO = 1 and " +
                "u.TIPO_USUARIO = t.ID_TIPO_USUARIO and u.ID_USUARIO = ? ", [id]
            )
            return resultados;
        } catch (error) {
            console.log(error);
            return error;
        }
    },
 
    create: async (camposForm) => {
        try {
            const [resultados] = await pool.query(
                "INSERT INTO USUARIOS (NOME_USUARIO, USER_USUARIO, EMAIL_USUARIO, SENHA_USUARIO, TIPO_USUARIO, STATUS_USUARIO) VALUES (?, ?, ?, ?, ?, ?)",
                [camposForm.nome_usuario, camposForm.user_usuario, camposForm.email_usuario, camposForm.senha_usuario, camposForm.tipo_usuario, camposForm.status_usuario]
            )
            return resultados;
        } catch (error) {
            console.log(error);
            return null;
        }
    },
 
    update: async ( camposForm, id) => {
        try {
            const [resultados] = await pool.query(
                "UPDATE USUARIOS SET ?" +
                " WHERE ID_USUARIO = ?",
                [camposForm, id]
            )
            return resultados;
        }catch (error) {
            console.log(error);
            return error;
        }
    },
 
    delete: async (id) => {
        try {
            const [resultados] = await pool.query(
                "UPDATE USUARIOS SET STATUS_USUARIO = 0 WHERE ID_USUARIO = ? ", [id] 
            )
            return resultados;
        } catch (error) {
            console.log(error);
            return error;
        }
    },
};
 
module.exports = usuarioModel