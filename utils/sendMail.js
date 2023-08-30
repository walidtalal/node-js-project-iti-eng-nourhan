import { createTransport } from "nodemailer";

// const getEmailTemplate = (user) => `
//   <table border="0" cellpadding="0" cellspacing="0" width="100%" style="padding: 30px; background-color: #eceff1">
//     ...
//     <a href="${SERVER_URL}:${SERVER_PORT}/verify/${user.id}" target="_blank">Confirm your email</a>
//     ...
//     <a href="${SERVER_URL}:${SERVER_PORT}/verify/${user.id}" target="_blank">${SERVER_URL}:${SERVER_PORT}/verify/${user.id}</a>
//     ...
//   </table>
// `;

const getEmailTemplate = (user) => `
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="padding: 30px; background-color: #eceff1">
    <tr>
      <td align="center" bgcolor="#ffffff" style="padding: 40px 0 30px 0;">
        <img src="${LOGO_URL}" alt="Company Logo" width="150" style="display: block;" />
      </td>
    </tr>
    <tr>
      <td bgcolor="#ffffff" style="padding: 40px;">
        <h2 style="margin: 0; font-size: 24px; color: #333333;">Hello ${user.name},</h2>
        <p style="margin-top: 20px; font-size: 16px; color: #666666;">Thank you for signing up with us. Please verify your email address by clicking the button below:</p>
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td align="center" bgcolor="#ffffff" style="padding: 20px;">
              <a href="http://localhost:8080/verify/${user.id}" target="_blank" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 16px;">Confirm your email</a>
            </td>
          </tr>
        </table>
        <p style="margin-top: 20px; font-size: 16px; color: #666666;">If the button above doesn't work, you can also copy and paste the following link into your browser:</p>
        <p style="margin-top: 10px; font-size: 16px; color: #666666;"><a href="http://localhost:8080/verify/${user.id}" target="_blank">http://localhost:8080/verify/${user.id}</a></p>
        <p style="margin-top: 20px; font-size: 16px; color: #666666;">Thank you for choosing our service!</p>
      </td>
    </tr>
    <tr>
      <td bgcolor="#f5f5f5" align="center" style="padding: 20px;">
        <p style="margin: 0; font-size: 14px; color: #999999;">If you have any questions, please contact us at <a href="mailto:fakeaccount@gmail.com" style="color: #007bff; text-decoration: none;">fakeaccount@gmail.com</a></p>
      </td>
    </tr>
  </table>
`;

const sendEmail = async (user) => {
    try {
        const transporter = createTransport({
            service: "gmail",
            auth: {
                user: "fakeaccount@gmail.com",
                pass: "anypass",
            },
        });

        const info = await transporter.sendMail({
            from: 'NODEJS project" <fakemail@gmail.com>',
            to: user.email,
            subject: `${user.name} - Verify your account to NODEJS project`,
            html: getEmailTemplate(user),
        });

        console.log("Message sent: %s", info.messageId);
    } catch (error) {
        console.log(error);
    }
};

export default sendEmail;
