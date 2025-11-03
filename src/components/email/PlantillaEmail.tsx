import { BaseEmail } from './BaseEmail';

export const WelcomeEmail = ({ userName, email, password }: { userName: string; email: string; password?: string }) => (
  <BaseEmail
    title="¡Bienvenido a DPortfolio!"
    greeting={`Hola ${userName},`}
    content={
      <div>
        <p>Te damos la bienvenida a <strong>DPortfolio</strong>, tu gestor de criptomonedas personal.</p>
        
        <div style={{ 
          backgroundColor: '#f3f4f6', 
          padding: '15px',
          borderRadius: '6px',
          margin: '15px 0',
          borderLeft: '4px solid #10b981'
        }}>
          <h3 style={{ marginTop: '0', color: '#1f2937' }}>Tus credenciales de acceso:</h3>
          <p style={{ margin: '8px 0' }}><strong>📧 Email:</strong> {email}</p>
          <p style={{ margin: '8px 0' }}><strong>🔑 Contraseña:</strong> {password}</p>
        </div>

        <div style={{ 
          backgroundColor: '#fef3c7', 
          padding: '12px',
          borderRadius: '6px',
          border: '1px solid #f59e0b',
          margin: '15px 0'
        }}>
          <p style={{ margin: '0', color: '#92400e' }}>
            <strong>⚠️ Importante:</strong> Guarda estas credenciales en un lugar seguro.
          </p>
        </div>

        <p>Ahora puedes:</p>
        <ul style={{ paddingLeft: '20px' }}>
          <li>Conectar tus exchanges favoritos</li>
          <li>Seguir tu portfolio en tiempo real</li>
          <li>Configurar alertas de precios</li>
          <li>Analizar tu rendimiento</li>
        </ul>
        <p>¡Empieza a gestionar tus inversiones de manera inteligente!</p>
      </div>
    }
    buttonText="Ir a mi Dashboard"
    buttonUrl={`${process.env.NEXT_PUBLIC_APP_URL}/inicio`}
    footerText="Gracias por unirte a nuestra comunidad."
  />
);

export const PasswordChangedEmail = ({ userName }: { userName: string }) => (
  <BaseEmail
    title="Contraseña actualizada"
    greeting={`Hola ${userName},`}
    content={
      <div>
        <p>Tu contraseña en <strong>DPortfolio</strong> ha sido actualizada exitosamente.</p>
        <p>Si fuiste tú quien realizó este cambio, no necesitas hacer nada más.</p>
        <p style={{ 
          backgroundColor: '#fef3c7', 
          padding: '12px',
          borderRadius: '6px',
          border: '1px solid #f59e0b'
        }}>
          <strong>⚠️ Seguridad:</strong> Si NO realizaste este cambio, por favor contacta con soporte inmediatamente.
        </p>
      </div>
    }
    buttonText="Ir a DPortfolio"
    buttonUrl={`${process.env.NEXT_PUBLIC_APP_URL}/inicio`}
    footerText="Protege siempre tus credenciales de acceso."
  />
);