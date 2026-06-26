# backend/app/services/email.py
import os
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger("axion.email")


def enviar_email_ativacao(email_destino: str, nome_usuario: str, token_ativacao: str):
    """
    Envia e-mail de ativação de conta.
    Se as credenciais SMTP estiverem definidas no ambiente, envia um e-mail real.
    Caso contrário, loga o link de ativação no console para testes.
    """
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    link_ativacao = f"{frontend_url}/activate?token={token_ativacao}"
    
    # Credenciais SMTP
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASSWORD")
    smtp_from = os.getenv("SMTP_FROM", "no-reply@axion.com")
    
    assunto = "Ative sua conta no AXION"
    
    corpo_texto = f"""
    Olá, {nome_usuario}!
    
    Bem-vindo ao AXION. Para começar a gerenciar seus contratos e prazos de forma inteligente,
    ative sua conta clicando no link abaixo:
    
    {link_ativacao}
    
    Este link é válido por 24 horas.
    
    Se você não realizou este cadastro, por favor desconsidere este e-mail.
    
    Atenciosamente,
    Equipe AXION
    """
    
    ano_atual = datetime_now_year()
    
    corpo_html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #374151; line-height: 1.6; background-color: #f3f4f6; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #0D9488; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">AXION</h1>
            <p style="color: #6b7280; font-size: 12px; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 0.1em;">Gestão Inteligente de Contratos</p>
          </div>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin-bottom: 24px;" />
          <h2 style="color: #0f172a; margin-top: 0;">Olá, {nome_usuario}!</h2>
          <p>Seja bem-vindo ao AXION. Sua conta foi criada com sucesso!</p>
          <p>Para concluir seu cadastro e ativar seu acesso à plataforma, clique no botão abaixo:</p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="{link_ativacao}" style="background-color: #0D9488; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">Ativar Minha Conta</a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280;">Se o botão não funcionar, copie e cole o seguinte link no seu navegador:</p>
          <p style="font-size: 12px; color: #1e3a8a; word-break: break-all;"><a href="{link_ativacao}">{link_ativacao}</a></p>
          
          <p style="font-size: 12px; color: #9ca3af; margin-top: 32px;">Este link é válido por 24 horas. Se você não solicitou este cadastro, pode ignorar este e-mail.</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="font-size: 12px; color: #6b7280; text-align: center; margin: 0;">&copy; {ano_atual} AXION Sistemas. Todos os direitos reservados.</p>
        </div>
      </body>
    </html>
    """
    
    if smtp_host and smtp_user and smtp_pass:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = assunto
            msg["From"] = smtp_from
            msg["To"] = email_destino
            
            part1 = MIMEText(corpo_texto, "plain")
            part2 = MIMEText(corpo_html, "html")
            msg.attach(part1)
            msg.attach(part2)
            
            with smtplib.SMTP(smtp_host, smtp_port) as server:
                server.starttls()
                server.login(smtp_user, smtp_pass)
                server.sendmail(smtp_from, email_destino, msg.as_string())
            logger.info(f"E-mail de ativação enviado para {email_destino} via SMTP.")
            return True
        except Exception as e:
            logger.error(f"Erro ao enviar e-mail via SMTP para {email_destino}: {e}")
            
    # Fallback / Log no console
    logger.info(f"[FALLBACK] E-mail de ativação para {email_destino} ({nome_usuario})")
    logger.info(f"[FALLBACK] Link de Ativação: {link_ativacao}")
    return True

def datetime_now_year():
    from datetime import datetime
    return datetime.utcnow().year
