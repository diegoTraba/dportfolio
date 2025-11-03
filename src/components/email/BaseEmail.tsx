import * as React from 'react';

interface BaseEmailProps {
  title: string;
  greeting?: string;
  content: React.ReactNode;
  buttonText?: string;
  buttonUrl?: string;
  footerText?: string;
}

export const BaseEmail: React.FC<Readonly<BaseEmailProps>> = ({
  title,
  greeting = "Hola,",
  content,
  buttonText,
  buttonUrl,
  footerText = "Si no has sido tú, por favor ignora este email."
}) => (
  <div style={{ 
    fontFamily: 'Arial, sans-serif', 
    maxWidth: '600px', 
    margin: '0 auto', 
    padding: '20px',
    backgroundColor: '#f9f9f9'
  }}>
    {/* Header */}
    <div style={{ 
      backgroundColor: '#1f2937', 
      padding: '20px', 
      textAlign: 'center',
      borderRadius: '8px 8px 0 0'
    }}>
      <img src="https://dportfolio-pi.vercel.app/img/logo_DPortfolio.png" alt="DPortfolio" style={{ height: '40px', width: 'auto', maxWidth: '200px' }}  />
    </div>

    {/* Content */}
    <div style={{ 
      backgroundColor: 'white', 
      padding: '30px',
      borderRadius: '0 0 8px 8px',
      border: '1px solid #e5e7eb'
    }}>
      <h2 style={{ 
        color: '#1f2937', 
        marginTop: '0',
        fontSize: '20px'
      }}>
        {title}
      </h2>
      
      <p style={{ 
        color: '#6b7280', 
        fontSize: '16px',
        lineHeight: '1.5'
      }}>
        <strong>{greeting}</strong>
      </p>

      <div style={{ 
        color: '#374151', 
        fontSize: '16px',
        lineHeight: '1.6',
        margin: '20px 0'
      }}>
        {content}
      </div>

      {buttonText && buttonUrl && (
        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <a
            href={buttonUrl}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              padding: '12px 24px',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              display: 'inline-block'
            }}
          >
            {buttonText}
          </a>
        </div>
      )}

      <div style={{ 
        borderTop: '1px solid #e5e7eb', 
        paddingTop: '20px',
        marginTop: '20px'
      }}>
        <p style={{ 
          color: '#9ca3af', 
          fontSize: '14px',
          textAlign: 'center'
        }}>
          {footerText}
        </p>
      </div>
    </div>
  </div>
);