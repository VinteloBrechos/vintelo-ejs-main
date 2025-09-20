const pool = require("./app/config/pool_conexoes_local");
const bcrypt = require("bcryptjs");
const usuario = require("./app/models/usuarioModel");

async function debugLogin() {
    try {
        console.log("=== DEBUG LOGIN ===");
        

        const [users] = await pool.query("SELECT * FROM USUARIOS");
        console.log("1. Usuários no banco:", users.length);
        
        if (users.length > 0) {
            console.log("Primeiro usuário:", {
                id: users[0].ID_USUARIO,
                nome: users[0].NOME_USUARIO,
                user: users[0].USER_USUARIO,
                email: users[0].EMAIL_USUARIO,
                senha_hash: users[0].SENHA_USUARIO?.substring(0, 20) + "...",
                tipo: users[0].TIPO_USUARIO
            });
        }
        
        console.log("\n2. Testando findUserEmail...");
        const dadosForm = {
            user_usuario: "teste@teste.com"
        };
        
        const results = await usuario.findUserEmail(dadosForm);
        console.log("Resultado findUserEmail:", results.length);
        
        if (results.length > 0) {
            console.log("Usuário encontrado:", {
                nome: results[0].NOME_USUARIO,
                user: results[0].USER_USUARIO,
                email: results[0].EMAIL_USUARIO
            });
            
            console.log("\n3. Testando senha...");
            const senhaCorreta = bcrypt.compareSync("123456", results[0].SENHA_USUARIO);
            console.log("Senha '123456' está correta:", senhaCorreta);
        }
        
        process.exit(0);
    } catch (error) {
        console.error("Erro no debug:", error);
        process.exit(1);
    }
}

debugLogin();