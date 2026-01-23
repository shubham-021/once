import { Resend } from 'resend';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, "../../../../.env") });


const resend = new Resend(process.env.RESEND_API_KEY);
console.log("Resend api: ", (process.env.RESEND_API_KEY)?.slice(0, 2));

interface SendEmailPramas {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailPramas) {
    const { data, error } = await resend.emails.send({
        from: 'Once <noreply@once.im-arka.in>',
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