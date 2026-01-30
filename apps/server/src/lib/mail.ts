import { logger } from "./logger";
import sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

const SENDGRID_VERIFIED_SENDER = process.env.SENDGRID_VERIFIED_SENDER as string;
// sgMail.setDataResidency('eu');
// uncomment the above line if you are sending mail using a regional EU subuser
export function sendPasswordResetEmail(user: { email: string }, url: string) {
  const msg = {
    to: user.email,
    from: SENDGRID_VERIFIED_SENDER,
    subject: "Reset Password Request - Relaycat",
    text: `You requested a password reset. Click the link to reset your password: ${url}`,
    html: `<strong>You requested a password reset. Click the link to reset your password: <a href="${url}">${url}</a></strong>`,
  };
  sgMail
    .send(msg)
    .then(() => {
      logger.info({ user, url }, "Sent email for password reset successfully");
      console.log("Email sent");
    })
    .catch((error: unknown) => {
      logger.error(
        { user, url, error },
        "Error sending email for password reset",
      );
      console.error(error);
    });
}
export function sendVerificationEmail(user: { email: string }, url: string) {
  const msg = {
    to: user.email,
    from: SENDGRID_VERIFIED_SENDER,
    subject: "Email Verification - Relaycat",
    text: `Please verify your email by clicking the following link: ${url}`,
    html: `<strong>Please verify your email by clicking the following link: <a href="${url}">${url}</a></strong>`,
  };
  sgMail
    .send(msg)
    .then(() => {
      logger.info({ user, url }, "Sent email for verification successfully");
      console.log("Email sent");
    })
    .catch((error: unknown) => {
      logger.error(
        { user, url, error },
        "Error sending email for verification",
      );
      console.error(error);
    });
}

export function sendWelcomeEmail(user: { email: string; name: string }) {
  const msg = {
    to: user.email,
    from: SENDGRID_VERIFIED_SENDER,
    subject: `Welcome to Relaycat, ${user.name}!`,
    text: `Welcome to Relaycat! We're excited to have you on board.`,
    html: `<strong>Welcome to Relaycat! We're excited to have you on board.</strong>`,
  };
  sgMail
    .send(msg)
    .then(() => {
      logger.info({ user }, "Sent welcome email successfully");
      console.log("Email sent");
    })
    .catch((error: unknown) => {
      logger.error({ user, error }, "Error sending welcome email");
      console.error(error);
    });
}
