import nodemailer from "nodemailer";
import path from "path";
import ejs from "ejs";
import dotenv from "dotenv";
dotenv.config();


interface MailProps {
  receiver: string;
  subject: string;
  emailData: {};
  template: string;
}

console.log(process.env.notification_email);
const nodeMail = nodemailer.createTransport({
  service: "gmail",
  auth: {
    // user: "benagu477@gmail.com",
    //pass: "rgve xodw pfcf csgj"
    user: process.env.notification_email,
    pass: process.env.google_app_password
  }
});


//jjdjj
const sendMail = async (data: MailProps) => {
  const emailTemplatePath = path.join(
    path.resolve(__dirname, "../../"),
    "views",
    data.template
  );
  const htmltoSend = await ejs.renderFile(emailTemplatePath, {
    data: data.emailData
  });
  
  return nodeMail.sendMail({
    sender: process.env.notification_email,
    to: data.receiver,
    subject: data.subject,
    html: htmltoSend
  });
};

export default sendMail;
