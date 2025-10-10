import { MailService } from "@sendgrid/mail";

const isValidSendGridKey = (key: string) => key && key.startsWith("SG.");

if (
  !process.env.SENDGRID_API_KEY ||
  !isValidSendGridKey(process.env.SENDGRID_API_KEY)
) {
  console.warn(
    "SENDGRID_API_KEY environment variable not set or invalid. Email notifications will be disabled."
  );
}

const mailService = new MailService();
if (
  process.env.SENDGRID_API_KEY &&
  isValidSendGridKey(process.env.SENDGRID_API_KEY)
) {
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
  if (
    !process.env.SENDGRID_API_KEY ||
    !isValidSendGridKey(process.env.SENDGRID_API_KEY)
  ) {
    console.log("Email would be sent:", params.subject, "to", params.to);
    return true; // Return true in development
  }

  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text || "",
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error("SendGrid email error:", error);
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
        <p><strong>Amount Due:</strong> £${amount}</p>
        <p><strong>Due Date:</strong> ${dueDate.toLocaleDateString()}</p>
      </div>
      <p>Please make your payment to avoid any delays in the group rotation.</p>
      <p>Best regards,<br>CircleSave Team</p>
    </div>
  `;

  return sendEmail({
    to: userEmail,
    from: process.env.FROM_EMAIL || "no-reply@circlesave.com",
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
        <p><strong>Payout Amount:</strong> £${amount}</p>
        <p><strong>Payout Date:</strong> ${payoutDate.toLocaleDateString()}</p>
      </div>
      <p>The funds will be transferred to your account within 2-3 business days.</p>
      <p>Best regards,<br>CircleSave Team</p>
    </div>
  `;

  return sendEmail({
    to: userEmail,
    from: process.env.FROM_EMAIL || "no-reply@circlesave.com",
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
  const inviteLink = `${
    process.env.BASE_URL || "https://circlesave.com"
  }/groups/join/${inviteCode}`;

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
    from: process.env.FROM_EMAIL || "no-reply@circlesave.com",
    subject,
    html,
  });
}

export async function sendWelcomeEmail(
  userEmail: string,
  userName: string
): Promise<boolean> {
  const subject = "Welcome to CircleSave!";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb; text-align: center;">Welcome to CircleSave! 🎉</h1>
      <p>Hi ${userName},</p>
      <p>Welcome to CircleSave! We're excited to have you join our community of smart savers.</p>
      
      <div style="background-color: #f0f7ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
        <h3 style="color: #2563eb; margin-top: 0;">What's Next?</h3>
        <ul style="margin: 0; padding-left: 20px;">
          <li>🏦 <strong>Join a savings group</strong> or create your own</li>
          <li>💰 <strong>Start saving</strong> with friends and family</li>
          <li>🔄 <strong>Take turns</strong> receiving the pooled contributions</li>
          <li>📈 <strong>Build your trust score</strong> with on-time payments</li>
        </ul>
      </div>

      <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #059669; margin-top: 0;">How CircleSave Works:</h3>
        <p><strong>1. Join or Create a Group:</strong> Find friends or family to save with</p>
        <p><strong>2. Contribute Regularly:</strong> Everyone puts in the same amount each cycle</p>
        <p><strong>3. Take Turns Receiving:</strong> Each member gets the full pot when it's their turn</p>
        <p><strong>4. Build Trust:</strong> Complete groups and maintain good payment history</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.BASE_URL || "https://circlesave.com"}/dashboard" 
           style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
          Get Started Now
        </a>
      </div>

      <p>If you have any questions, feel free to reach out to our support team.</p>
      <p>Happy saving!</p>
      <p><strong>The CircleSave Team</strong></p>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      <p style="font-size: 12px; color: #6b7280; text-align: center;">
        CircleSave - Building financial communities together<br>
        This email was sent because you registered for a CircleSave account.
      </p>
    </div>
  `;

  return sendEmail({
    to: userEmail,
    from: process.env.FROM_EMAIL || "horebsaves@gmail.com",
    subject,
    html,
  });
}

export async function sendGroupCreatedEmail(
  userEmail: string,
  userName: string,
  groupName: string,
  contributionAmount: string,
  frequency: string,
  maxMembers: number
): Promise<boolean> {
  const subject = `🎉 Your group "${groupName}" has been created!`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Group Created Successfully!</h1>
        <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px;">Your savings circle is ready to grow</p>
      </div>

      <div style="padding: 30px 20px; background-color: white;">
        <p>Hi ${userName},</p>
        <p>Congratulations! Your savings group has been successfully created and is ready for members to join.</p>

        <div style="background-color: #f8fafc; padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px solid #e2e8f0;">
          <h3 style="color: #2563eb; margin-top: 0; margin-bottom: 20px; text-align: center;">📋 Group Details</h3>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
              <span style="font-weight: bold; color: #4b5563;">Group Name:</span>
              <span style="color: #1f2937;">${groupName}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
              <span style="font-weight: bold; color: #4b5563;">Contribution Amount:</span>
              <span style="color: #059669; font-weight: bold;">$${contributionAmount}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
              <span style="font-weight: bold; color: #4b5563;">Payment Frequency:</span>
              <span style="color: #1f2937; text-transform: capitalize;">${frequency.replace('-', ' ')}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0;">
              <span style="font-weight: bold; color: #4b5563;">Maximum Members:</span>
              <span style="color: #1f2937;">${maxMembers} people</span>
            </div>
          </div>
        </div>
        
        <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
          <h3 style="color: #059669; margin-top: 0;">What Happens Next?</h3>
          <ul style="margin: 0; padding-left: 20px; color: #064e3b;">
            <li>📨 <strong>Invite members</strong> to join your group</li>
            <li>⏰ <strong>Wait for members</strong> to reach your target group size</li>
            <li>🚀 <strong>Start the cycle</strong> once your group is full</li>
            <li>💰 <strong>Begin receiving</strong> or making contributions</li>
          </ul>
        </div>

        <div style="background-color: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #ea580c; margin-top: 0;">💡 Pro Tips for Group Success:</h3>
          <p><strong>✅ Invite trusted friends and family</strong> - Trust is the foundation of successful savings circles</p>
          <p><strong>📢 Communicate clearly</strong> - Keep everyone informed about payment dates and group progress</p>
          <p><strong>⏰ Stay consistent</strong> - Regular, on-time contributions help everyone succeed</p>
          <p><strong>🤝 Be supportive</strong> - Help members who might be struggling to keep the circle strong</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.BASE_URL || "https://circlesave.com"}/groups" 
             style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; margin-right: 10px;">
            Manage Your Group
          </a>
          <a href="${process.env.BASE_URL || "https://circlesave.com"}/dashboard" 
             style="background-color: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
            View Dashboard
          </a>
        </div>

        <p>Your group is now live and ready to help you and your members achieve your savings goals together!</p>
        <p>Best of luck with your savings journey!</p>
        <p><strong>The CircleSave Team</strong></p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="font-size: 12px; color: #6b7280; text-align: center;">
          CircleSave - Building financial communities together<br>
          You received this email because you created a savings group on CircleSave.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: userEmail,
    from: process.env.FROM_EMAIL || "horebsaves@gmail.com",
    subject,
    html,
  });
}
