// test-smtp.js
require('dotenv').config();
const nodemailer = require('nodemailer');

(async () => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    console.log('Verifiziere SMTP…');
    await transporter.verify();
    console.log('OK: SMTP erreichbar & Login gültig');
})();
