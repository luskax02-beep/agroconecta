
/*
  SERVIDOR BACKEND (Node.js)
  --------------------------
  Este arquivo simula o backend que receberá os dados da Kirvano.
  
  Para rodar:
  1. Instale dependências: npm install express cors body-parser
  2. Inicie o servidor: node server.js
  3. Exponha para a internet: npx ngrok http 3000
*/

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Configurações
app.use(cors());
app.use(bodyParser.json());

// "Banco de Dados" em memória (Em produção, use MongoDB/Postgres)
const usersDatabase = {};

// Configuração de Segurança
const SECRET_TOKEN = "agro-token-123"; // O mesmo Token que você configurou na Kirvano

// ROTA 1: WEBHOOK (A Kirvano envia dados para cá)
app.post('/webhook/kirvano', (req, res) => {
    const { event, customer, token } = req.body;

    console.log(`🔔 Webhook Recebido: ${event}`);

    // Validação de Token (Simples)
    // A Kirvano pode mandar o token no corpo ou header, adapte conforme a documentação exata se necessário.
    // Aqui assumimos que você configurou para enviar no corpo ou estamos apenas logando.
    if (req.body.token && req.body.token !== SECRET_TOKEN) {
         console.warn("⚠️ Token inválido recebido!");
         // return res.status(403).json({ error: "Token inválido" }); // Descomente para bloquear
    }

    if (!customer || !customer.email) {
        return res.status(400).json({ error: "Dados do cliente inválidos" });
    }

    const email = customer.email;

    // 2. Processamento do Evento
    if (event === 'sale.approved') {
        console.log(`✅ Pagamento Aprovado para: ${email}`);
        
        // Atualiza o status do usuário no banco
        usersDatabase[email] = {
            isSubscribed: true,
            plan: 'premium',
            updatedAt: new Date()
        };
    } else if (event === 'sale.refunded' || event === 'sale.chargeback') {
        console.log(`❌ Reembolso/Cancelamento para: ${email}`);
        
        if (usersDatabase[email]) {
            usersDatabase[email].isSubscribed = false;
        }
    }

    res.status(200).json({ received: true });
});

// ROTA 2: API PARA O FRONTEND (Seu site pergunta se o usuário pagou)
app.get('/api/status/:email', (req, res) => {
    const email = req.params.email;
    const user = usersDatabase[email];

    if (user && user.isSubscribed) {
        res.json({ isSubscribed: true });
    } else {
        res.json({ isSubscribed: false });
    }
});

// Inicialização
app.listen(PORT, () => {
    console.log(`🚀 Servidor Backend rodando na porta ${PORT}`);
    console.log(`\n--- INSTRUÇÕES PARA KIRVANO ---`);
    console.log(`1. Rode em outro terminal: npx ngrok http ${PORT}`);
    console.log(`2. Copie a URL HTTPS gerada (ex: https://xyz.ngrok-free.app)`);
    console.log(`3. Na Kirvano, o campo 'URL da Integração' deve ser:`);
    console.log(`   👉 [SUA_URL_NGROK]/webhook/kirvano`);
    console.log(`4. Token: ${SECRET_TOKEN}`);
    console.log(`-------------------------------\n`);
});
