const { GoogleGenAI } = require('@google/genai');

// Inicializa a IA caso exista uma chave no .env
let ai = null;
if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

/**
 * Valida o conteúdo de uma mídia base64 para ver se é uma foto real de um problema urbano
 * e se não contém conteúdo inapropriado.
 * @param {string} base64String A string base64 completa (ex: data:image/jpeg;base64,/9j...)
 * @returns {Promise<{isValid: boolean, reason?: string}>}
 */
const validateMediaWithAI = async (base64String) => {
    // Se não tivermos a chave configurada, pula a validação de IA (fallback)
    if (!ai) {
        return { isValid: true };
    }

    try {
        const isImage = base64String.startsWith('data:image');
        // Só validamos imagens por enquanto com IA, vídeos seriam mais pesados para decodificar aqui,
        // mas o modelo Gemini suporta vídeos se passarmos pela File API.
        if (!isImage) {
            return { isValid: true }; // Skip video validation for now
        }

        const match = base64String.match(/^data:(image\/[a-zA-Z]*);base64,([^\"]*)$/);
        if (!match) return { isValid: false, reason: 'Formato de imagem inválido.' };
        
        const mimeType = match[1];
        const base64Data = match[2];

        const prompt = `Analise esta imagem que um usuário enviou para um aplicativo de denúncias de zeladoria urbana (Alerta Cidadão).
Sua tarefa é verificar se a imagem é autêntica e válida para este contexto.

Regras de Rejeição:
1. Rejeite se a imagem for um desenho, cartoon, ilustração ou meme aleatório.
2. Rejeite se contiver conteúdo explícito, pornografia, gore, ou violência.
3. Rejeite se não parecer minimamente com uma foto do mundo real (ex: captura de tela de um jogo).
4. Rejeite se não houver NENHUM contexto urbano visível (ex: uma selfie fechada no rosto, foto de um prato de comida dentro de casa).

Responda ESTRITAMENTE em formato JSON com duas chaves:
"isValid" (boolean: true se for uma foto real de um problema ou ambiente urbano externo/interno público, false se ferir as regras acima)
"reason" (string: se isValid for false, explique brevemente o porquê. Se true, envie uma string vazia "")`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                prompt,
                {
                    inlineData: {
                        mimeType: mimeType,
                        data: base64Data
                    }
                }
            ],
            config: {
                responseMimeType: "application/json"
            }
        });

        const resultText = response.text;
        const parsed = JSON.parse(resultText);
        
        return {
            isValid: parsed.isValid === true,
            reason: parsed.reason || 'Imagem não relacionada ao contexto de zeladoria.'
        };
    } catch (error) {
        console.error('Erro ao validar imagem com IA:', error);
        // Em caso de erro na API, aprovamos para não bloquear o usuário, ou podemos bloquear.
        return { isValid: true };
    }
};

module.exports = {
    validateMediaWithAI
};

