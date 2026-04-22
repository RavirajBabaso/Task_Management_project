import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: env.smtp.port === 465, // true for 465, false for other ports
  auth: {
    user: env.smtp.user,
    pass: env.smtp.pass,
  },
});

const EMAIL_FROM = 'EduTask Pro <noreply@adhira.edu>';

const SCHOOL_HEADER_HTML = `
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; font-family: Arial, sans-serif;">
    <h1 style="margin: 0; font-size: 24px;">EduTask Pro — Adhira International School</h1>
  </div>
`;

const BASE_HTML_TEMPLATE = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
    ${SCHOOL_HEADER_HTML}
    <div style="padding: 20px;">
      {{CONTENT}}
    </div>
  </body>
  </html>
`;

export const sendTaskAssignedEmail = async (
  to: string,
  taskTitle: string,
  dueDate: Date,
  assignedBy: string
) => {
  const dueDateStr = dueDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isUrgent = daysUntilDue <= 2;

  const content = `
    <h2 style="color: #333;">New Task Assigned</h2>
    <p>You have been assigned a new task. Here are the details:</p>

    <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
      <tr>
        <td style="border: 1px solid #ddd; padding: 12px; background-color: #f2f2f2; font-weight: bold;">Task Title</td>
        <td style="border: 1px solid #ddd; padding: 12px;">${taskTitle}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #ddd; padding: 12px; background-color: #f2f2f2; font-weight: bold;">Due Date</td>
        <td style="border: 1px solid #ddd; padding: 12px; ${isUrgent ? 'color: red; font-weight: bold;' : ''}">${dueDateStr}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #ddd; padding: 12px; background-color: #f2f2f2; font-weight: bold;">Assigned By</td>
        <td style="border: 1px solid #ddd; padding: 12px;">${assignedBy}</td>
      </tr>
    </table>

    ${isUrgent ? '<p style="color: red; font-weight: bold;">⚠️ This task is due within 2 days. Please prioritize completion.</p>' : ''}

    <p>Please log in to EduTask Pro to view full task details and update your progress.</p>

    <p>Best regards,<br>EduTask Pro Team</p>
  `;

  const html = BASE_HTML_TEMPLATE.replace('{{CONTENT}}', content);

  await transporter.sendMail({
    from: EMAIL_FROM,
    to,
    subject: `New Task Assigned: ${taskTitle}`,
    html,
  });
};

export const sendDelayAlertEmail = async (
  to: string,
  taskTitle: string,
  daysOverdue: number
) => {
  const content = `
    <div style="border: 2px solid red; padding: 20px; margin: 20px 0; background-color: #fff5f5;">
      <h2 style="color: red; margin-top: 0;">⚠️ Task Delay Alert</h2>
      <p>The following task is now overdue:</p>

      <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
        <tr>
          <td style="border: 1px solid #ddd; padding: 12px; background-color: #f2f2f2; font-weight: bold;">Task Title</td>
          <td style="border: 1px solid #ddd; padding: 12px;">${taskTitle}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 12px; background-color: #f2f2f2; font-weight: bold;">Days Overdue</td>
          <td style="border: 1px solid #ddd; padding: 12px; color: red; font-weight: bold;">${daysOverdue} days</td>
        </tr>
      </table>

      <p style="color: red; font-weight: bold;">This task will be escalated to the Chairman if not completed within 24 hours.</p>

      <p>Please update the task status immediately or contact your supervisor for assistance.</p>
    </div>

    <p>Best regards,<br>EduTask Pro Team</p>
  `;

  const html = BASE_HTML_TEMPLATE.replace('{{CONTENT}}', content);

  await transporter.sendMail({
    from: EMAIL_FROM,
    to,
    subject: `Task Delay Alert: ${taskTitle}`,
    html,
  });
};

export const sendEscalationEmail = async (
  to: string,
  taskTitle: string,
  escalationPath: string
) => {
  const content = `
    <div style="border: 2px solid #ff6b35; padding: 20px; margin: 20px 0; background-color: #fff8f5;">
      <h2 style="color: #ff6b35; margin-top: 0;">🚨 Task Escalation Notice</h2>
      <p>A task has been escalated requiring your immediate attention:</p>

      <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
        <tr>
          <td style="border: 1px solid #ddd; padding: 12px; background-color: #f2f2f2; font-weight: bold;">Task Title</td>
          <td style="border: 1px solid #ddd; padding: 12px;">${taskTitle}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 12px; background-color: #f2f2f2; font-weight: bold;">Escalation Path</td>
          <td style="border: 1px solid #ddd; padding: 12px;">${escalationPath}</td>
        </tr>
      </table>

      <p style="font-weight: bold;">As Chairman, you are required to review this escalated task and take appropriate action.</p>

      <p>Please log in to EduTask Pro to review the task details and provide guidance.</p>
    </div>

    <p>Best regards,<br>EduTask Pro Team</p>
  `;

  const html = BASE_HTML_TEMPLATE.replace('{{CONTENT}}', content);

  await transporter.sendMail({
    from: EMAIL_FROM,
    to,
    subject: `Task Escalation: ${taskTitle}`,
    html,
  });
};