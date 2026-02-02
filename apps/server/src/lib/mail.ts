import { logger } from "./logger";

export interface WelcomeEmailData {
  to: string[];
  username: string;
  actionUrl: string;
  loginUrl: string;
  guideUrl: string;
}
export interface VerificationEmailData {
  to: string[];
  verificationLink: string;
}
export interface PasswordResetEmailData {
  to: string[];
  resetLink: string;
}

class MailService {
  private apiKey: string;
  private senderEmail: string;
  private supportEmail: string;
  private senderName: string;
  private templateIds: Record<string, string> = {
    WELCOME: "0401641",
    EMAIL_VERIFICATION: "9399681",
    PASSWORD_RESET: "1904532",
  };
  constructor(
    apiKey: string,
    senderEmail: string,
    supportEmail: string,
    senderName: string,
  ) {
    this.apiKey = apiKey;
    this.senderEmail = senderEmail;
    this.supportEmail = supportEmail;
    this.senderName = senderName;
  }

  private async sendMail(mailOptions: Object) {
    try {
      const response = await fetch("https://api.smtp2go.com/v3/email/send", {
        body: JSON.stringify({
          sender: this.senderEmail,
          "api-key": this.apiKey,
          ...mailOptions,
        }),
        headers: {
          "Content-Type": "application/json",
          "X-Smtp2go-Api-Key": this.apiKey,
        },
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          `Failed to send email: ${data.message || response.statusText}`,
        );
      }
      logger.info({ data }, "Email sent successfully");
      return true;
    } catch (error) {
      logger.error({ error }, "Error sending email:");
      return false;
    }
  }

  async sendVerificationEmail(data: VerificationEmailData) {
    const mailOptions = {
      to: data.to,
      subject: "Please verify your email address",
      template_id: this.templateIds.EMAIL_VERIFICATION,
      template_data: {
        product_name: "RelayCat",
        confirm_url: data.verificationLink,
      },
    };
    return await this.sendMail(mailOptions);
  }

  async sendWelcomeEmail(data: WelcomeEmailData) {
    const mailOptions = {
      to: data.to,
      subject: "Welcome to RelayCat!",
      template_id: this.templateIds.WELCOME,
      template_data: {
        product_name: "RelayCat",
        username: data.username,
        action_url: data.actionUrl,
        login_url: data.loginUrl,
        guide_url: data.guideUrl,
        support_email: this.supportEmail,
        sender_name: this.senderName,
      },
    };
    return await this.sendMail(mailOptions);
  }
  async sendPasswordResetEmail(data: PasswordResetEmailData) {
    const mailOptions = {
      to: data.to,
      subject: "Password Reset Request",
      template_id: this.templateIds.PASSWORD_RESET,
      template_data: {
        product_name: "RelayCat",
        reset_url: data.resetLink,
      },
    };
    return await this.sendMail(mailOptions);
  }
}
export const mailService = new MailService(
  process.env.SMTP2GO_API_KEY as string,
  process.env.VERIFIED_SENDER_EMAIL as string,
  process.env.VERIFIED_SUPPORT_EMAIL as string,
  process.env.VERIFIED_SENDER_NAME as string,
);

// async function test() {
//   const to = ["zjunaidshaikhz@gmail.com"];
//   await mailService.sendWelcomeEmail({
//     to,
//     username: "Junaid",
//     actionUrl: "https://relaycat.zjunaidz.me/channels/me",
//     loginUrl: "https://relaycat.zjunaidz.me/login",
//     guideUrl: "https://relaycat.zjunaidz.me/guide",
//     supportEmail: process.env.VERIFIED_SUPPORT_EMAIL as string,
//     senderName: process.env.VERIFIED_SENDER_NAME as string,
//   });
//   await Bun.sleep(2000);
//   await mailService.sendVerificationEmail({
//     to,
//     verificationLink:
//       "https://relaycat.zjunaidz.me/verify-email?token=some-verification-token",
//   });
//   await Bun.sleep(2000);
//   await mailService.sendPasswordResetEmail({
//     to,
//     resetLink:
//       "https://relaycat.zjunaidz.me/reset-password?token=some-reset-token",
//   });
// }

// test();
