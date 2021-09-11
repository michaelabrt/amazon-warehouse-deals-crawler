import nodemailer from 'nodemailer';
import { SentMessageInfo } from 'nodemailer/lib/smtp-transport';
import configType from './config/config';

export interface EmailAttachment {
  content: Buffer;
  name: string;
}

const send = (
  config: typeof configType.email,
  subject: string,
  description: string,
  attachments: EmailAttachment[] = []
): Promise<SentMessageInfo> =>
  nodemailer.createTransport(config.smtpConfig).sendMail({
    from: config.from,
    to: config.to,
    subject,
    html: `<p>${description}</p>`,
    attachments: attachments.map(({ name, content }) => ({
      filename: name,
      content,
    })),
  });

export default send;
