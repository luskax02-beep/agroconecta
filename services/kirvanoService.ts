
import { db } from './databaseService';

// CONFIGURAÇÃO REAL DE PAGAMENTO
export const KIRVANO_CONFIG = {
    // Link do Checkout (Produto)
    CHECKOUT_URL: "https://pay.kirvano.com/8345334a-e421-42f3-9bec-c5d6c574a644", 
    
    // URL do seu Backend (Local ou Produção)
    // Se estiver rodando o server.js localmente, é http://localhost:3000
    API_BASE_URL: "http://localhost:3000"
};

export interface KirvanoWebhookPayload {
    event: 'sale.approved' | 'sale.refunded' | 'sale.chargeback';
    customer: { email: string };
    token?: string;
}

/**
 * Método 1: Redirecionamento (Frontend Only)
 * Verifica se a URL contém ?status=success
 */
export const checkPaymentRedirect = (): boolean => {
    if (typeof window === 'undefined') return false;

    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');

    if (status === 'success') {
        console.log("Pagamento detectado via URL Redirection");
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({ path: newUrl }, '', newUrl);
        
        // Libera acesso localmente
        db.user.login();
        localStorage.setItem('agroconectaIsSubscribed', 'true');
        return true;
    }
    return false;
};

/**
 * Método 2: Consulta ao Servidor (Backend Real)
 * Pergunta ao server.js se o email consta como pagante
 */
export const checkSubscriptionStatusFromServer = async (email: string): Promise<boolean> => {
    try {
        const response = await fetch(`${KIRVANO_CONFIG.API_BASE_URL}/api/status/${email}`);
        const data = await response.json();
        
        if (data.isSubscribed) {
            localStorage.setItem('agroconectaIsSubscribed', 'true');
            return true;
        }
        return false;
    } catch (error) {
        console.warn("Não foi possível conectar ao servidor de pagamentos.", error);
        return false;
    }
};

/**
 * Simulador (Dev Only)
 */
export const processWebhook = async (payload: KirvanoWebhookPayload) => {
    // Simula envio para o servidor local se ele estiver rodando
    try {
        await fetch(`${KIRVANO_CONFIG.API_BASE_URL}/webhook/kirvano`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...payload, token: 'agro-token-123' })
        });
        return { success: true, message: "Webhook enviado ao Servidor Local" };
    } catch (e) {
        // Fallback local se o servidor estiver desligado
        if (payload.event === 'sale.approved') {
            localStorage.setItem('agroconectaIsSubscribed', 'true');
            return { success: true, message: "Acesso Liberado (Simulação Local)" };
        }
    }
    return { success: false, message: "Erro na simulação" };
};

export const generateTestPayload = (): KirvanoWebhookPayload => {
    return {
        event: 'sale.approved',
        customer: { email: 'teste@agro.com' },
        token: 'agro-token-123'
    };
};
