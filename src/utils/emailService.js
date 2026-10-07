const nodemailer = require('nodemailer');

// Configuração do transporter reutilizável usando Gmail
// O usuário precisará fornecer o e-mail do Gmail e uma Senha de App nas variáveis de ambiente.
const transporter = nodemailer.createTransport({
    service: 'gmail', // Usa os padrões do Gmail
    auth: {
        user: process.env.EMAIL_USER, // Ex: seuemail@gmail.com
        pass: process.env.EMAIL_PASS  // Senha de App gerada no Google
    }
});

/**
 * Envia um e-mail genérico
 */
exports.sendEmail = async (to, subject, text, html) => {
    try {
        const mailOptions = {
            from: `"Alerta Cidadão" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('E-mail enviado: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Erro ao enviar e-mail:', error);
        throw error;
    }
};

/**
 * E-mail de Boas-vindas (Cadastro)
 */
exports.sendWelcomeEmail = async (to, nome) => {
    const subject = 'Bem-vindo ao Alerta Cidadão!';
    const html = `
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Olá, ${nome}!</h2>
            <p>Seja muito bem-vindo ao <strong>Alerta Cidadão</strong>.</p>
            <p>O seu cadastro foi realizado com sucesso. A partir de agora, você pode relatar problemas da sua comunidade e ajudar a construir uma cidade melhor!</p>
            <br>
            <p>Atenciosamente,<br><strong>Equipe Alerta Cidadão</strong></p>
        </div>
    `;
    const text = `Olá, ${nome}! Seja muito bem-vindo ao Alerta Cidadão. O seu cadastro foi realizado com sucesso.`;
    
    return this.sendEmail(to, subject, text, html);
};

/**
 * E-mail de Confirmação de Denúncia (Criação)
 */
exports.sendDenunciaCreatedEmail = async (to, nome, tituloDenuncia) => {
    const subject = 'Denúncia Recebida - Alerta Cidadão';
    const html = `
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Olá, ${nome}!</h2>
            <p>Recebemos a sua denúncia: <strong>"${tituloDenuncia}"</strong>.</p>
            <p>Ela já foi registrada no nosso sistema. Os órgãos públicos ou privados competentes serão notificados e, em breve, poderão responder ou atualizar o andamento do caso.</p>
            <p>Você receberá um novo e-mail sempre que houver uma atualização de status.</p>
            <br>
            <p>Atenciosamente,<br><strong>Equipe Alerta Cidadão</strong></p>
        </div>
    `;
    const text = `Olá, ${nome}! Recebemos a sua denúncia: "${tituloDenuncia}". Ela já foi registrada e os órgãos públicos/privados poderão responder em breve.`;
    
    return this.sendEmail(to, subject, text, html);
};

/**
 * E-mail de Atualização de Status da Denúncia
 */
exports.sendDenunciaStatusEmail = async (to, nome, tituloDenuncia, novoEstado, respostaOrgao) => {
    const subject = 'Atualização de Denúncia - Alerta Cidadão';
    let respostaHtml = '';
    let respostaText = '';

    if (respostaOrgao) {
        respostaHtml = `
            <div style="background-color: #f4f4f4; padding: 15px; border-left: 4px solid #4CAF50; margin-top: 15px;">
                <strong>Resposta do Órgão:</strong><br>
                ${respostaOrgao}
            </div>
        `;
        respostaText = `\nResposta do Órgão: ${respostaOrgao}\n`;
    }

    const html = `
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Olá, ${nome}!</h2>
            <p>Houve uma atualização na sua denúncia: <strong>"${tituloDenuncia}"</strong>.</p>
            <p>O novo status é: <strong style="color: #2196F3;">${novoEstado.toUpperCase()}</strong></p>
            ${respostaHtml}
            <br>
            <p>Atenciosamente,<br><strong>Equipe Alerta Cidadão</strong></p>
        </div>
    `;
    const text = `Olá, ${nome}! A sua denúncia "${tituloDenuncia}" teve o status atualizado para: ${novoEstado.toUpperCase()}.${respostaText}`;
    
    return this.sendEmail(to, subject, text, html);
};

