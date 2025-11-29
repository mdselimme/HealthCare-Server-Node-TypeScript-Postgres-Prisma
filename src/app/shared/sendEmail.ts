import nodemailer from 'nodemailer';
import config from '../../config';
import path from 'path';
import ejs from 'ejs';
import { AppError } from '../helpers/AppError';

interface IEmailOptions {
    to: string;
    subject: string;
    templateName: string;
    templateData?: Record<string, any>;
    attachments?: {
        filename: string;
        content: Buffer | string;
        contentType?: string;
    }[];
};


const transporter = nodemailer.createTransport({
    service: config.smtp.email_sender_service,
    auth: {
        user: config.smtp.email_sender_user,
        pass: config.smtp.email_sender_password,
    },
    host: config.smtp.email_sender_host,
    port: Number(config.smtp.email_sender_port),
});

export const sendEmail = async (options: IEmailOptions) => {
    try {
        const templatePath = path.join(__dirname, `email_templates/${options.templateName}.ejs`);
        const html = await ejs.renderFile(templatePath, options.templateData);
        const info = await transporter.sendMail({
            from: config.smtp.email_sender_user,
            to: options.to,
            subject: options.subject,
            html,
            attachments: options.attachments?.map(att => ({
                filename: att.filename,
                content: att.content,
                contentType: att.contentType,
            }))
        });
        console.log(`\u2709\uFE0F Email sent to ${options.to}: ${info.messageId}`)
    } catch (error: any) {
        throw new AppError(500, `Failed to send email. Error Message: ${error.message}`);
    }
}