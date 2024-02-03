import Mailgen from "mailgen";
import nodemailer from "nodemailer";

/** POST: http://localhost:8080/api/registerMail 
 * @param: {
  "username" : "example123",
  "userEmail" : "admin123",
  "text" : "",
  "subject" : "",
}
*/
const registerMail = async (request, response) => {
  const { username, userEmail, text, subject } = request.body;

  let config = {
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  };

  let transporter = nodemailer.createTransport(config);

  let MailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Mailgen",
      link: "https://mailgen.js/",
    },
  });

  let email = {
    body: {
      name: username,
      intro:
        text ||
        "Welcome to Login App! We're very excited to have you on board.",
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };

  let mail = MailGenerator.generate(email);

  let message = {
    from: process.env.EMAIL,
    to: userEmail,
    subject: subject || "Signup Successful",
    html: mail,
  };

  transporter
    .sendMail(message)
    .then(() => {
      return response.status(201).json({
        message: "you should receive an email",
      });
    })
    .catch((error) => {
      return response.status(500).json({ error });
    });
};

export default registerMail;
