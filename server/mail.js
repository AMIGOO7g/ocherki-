'use strict';
/* Sends the sign-in code. With SMTP settings in the environment the letter
 * goes through that mailbox (Яндекс 360, Mail.ru для бизнеса, Unisender Go
 * SMTP…); with OCHERKI_MAIL=console the code is only printed to the server
 * log, for trying the server locally. */

let transport = null;

function smtp() {
  if (transport) return transport;
  const nodemailer = require('nodemailer');
  transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: Number(process.env.SMTP_PORT || 465) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  return transport;
}

async function sendCode(email, code) {
  if (process.env.OCHERKI_MAIL === 'console') { console.log(`Код для ${email}: ${code}`); return; }
  if (!process.env.SMTP_HOST) throw new Error('SMTP_HOST is not set');
  const spaced = `${code.slice(0, 3)} ${code.slice(3)}`;
  await smtp().sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: email,
    subject: `Код для входа в «Очерки жизни»: ${spaced}`,
    text: `Ваш код для входа: ${spaced}\n\nВведите его на странице входа. Код действует 10 минут.\nЕсли вы не входили в «Очерки жизни», просто удалите это письмо.`,
    html: `<div style="font-family:Georgia,serif;font-size:18px;color:#2b2622;line-height:1.5">
      <p>Ваш код для входа в «Очерки жизни»:</p>
      <p style="font-size:34px;letter-spacing:.18em;margin:18px 0"><b>${spaced}</b></p>
      <p>Введите его на странице входа. Код действует 10 минут.</p>
      <p style="color:#8a8175;font-size:15px">Если вы не входили в «Очерки жизни», просто удалите это письмо.</p></div>`
  });
}

module.exports = { sendCode };
