import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailPramas {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailPramas) {
    const { data, error } = await resend.emails.send({
        from: 'Once <noreply@once-arka.vercel.app>',
        to: [to],
        subject,
        html
    });

    if (error) {
        console.error("Email sending error: ", error);
        throw error;
    }

    return data;
}