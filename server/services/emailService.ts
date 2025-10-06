import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY environment variable not set. Email notifications will be disabled.");
}

const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('Email would be sent:', params.subject, 'to', params.to);
    return true; // Return true in development
  }

  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function sendPaymentReminderEmail(
  userEmail: string,
  userName: string,
  groupName: string,
  amount: number,
  dueDate: Date
): Promise<boolean> {
  const subject = `Payment Reminder: ${groupName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Payment Reminder</h2>
      <p>Hi ${userName},</p>
      <p>This is a friendly reminder that your contribution for <strong>${groupName}</strong> is due soon.</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Amount Due:</strong> $${amount}</p>
        <p><strong>Due Date:</strong> ${dueDate.toLocaleDateString()}</p>
      </div>
      <p>Please make your payment to avoid any delays in the group rotation.</p>
      <p>Best regards,<br>CircleSave Team</p>
    </div>
  `;

  return sendEmail({
    to: userEmail,
    from: process.env.FROM_EMAIL || 'no-reply@circlesave.com',
    subject,
    html,
  });
}

export async function sendPayoutNotificationEmail(
  userEmail: string,
  userName: string,
  groupName: string,
  amount: number,
  payoutDate: Date
): Promise<boolean> {
  const subject = `Payout Ready: ${groupName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669;">Congratulations! Your Payout is Ready</h2>
      <p>Hi ${userName},</p>
      <p>Great news! It's your turn to receive the payout from <strong>${groupName}</strong>.</p>
      <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
        <p><strong>Payout Amount:</strong> $${amount}</p>
        <p><strong>Payout Date:</strong> ${payoutDate.toLocaleDateString()}</p>
      </div>
      <p>The funds will be transferred to your account within 2-3 business days.</p>
      <p>Best regards,<br>CircleSave Team</p>
    </div>
  `;

  return sendEmail({
    to: userEmail,
    from: process.env.FROM_EMAIL || 'no-reply@circlesave.com',
    subject,
    html,
  });
}

export async function sendGroupInvitationEmail(
  userEmail: string,
  inviterName: string,
  groupName: string,
  inviteCode: string
): Promise<boolean> {
  const subject = `You're invited to join ${groupName}`;
  const inviteLink = `${process.env.BASE_URL || 'https://circlesave.com'}/groups/join/${inviteCode}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">You're Invited to Join a Savings Group!</h2>
      <p>Hi there,</p>
      <p><strong>${inviterName}</strong> has invited you to join their savings group: <strong>${groupName}</strong>.</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Group:</strong> ${groupName}</p>
        <p><strong>Invite Code:</strong> ${inviteCode}</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${inviteLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Join Group</a>
      </div>
      <p>CircleSave helps you save money with friends and family through rotating savings groups.</p>
      <p>Best regards,<br>CircleSave Team</p>
    </div>
  `;

  return sendEmail({
    to: userEmail,
    from: process.env.FROM_EMAIL || 'no-reply@circlesave.com',
    subject,
    html,
  });
}
