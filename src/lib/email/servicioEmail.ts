import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(
  to: string,
  subject: string,
  react: React.ReactElement
) {
  try {
     // Import dinámico para evitar problemas de SSR
     const { render } = await import('@react-email/render');

     const html = await render(react);
     
    const { data, error } = await resend.emails.send({
      from: 'DPortfolio <onboarding@resend.dev>', // Gratis con resend.dev
      to: [to],
      subject: subject,
      react: react,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}