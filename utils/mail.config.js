const nodemailer = require('nodemailer');

const mail = {
    user: 'mefa9701@gmail.com',
    pass: 'holaK123!'
}

let transporter = nodemailer.createTransport({
    host: "localhost",
    port: 3000,
    tls: {
        rejectUnauthorized: false
    },
    secure: false, // true for 465, false for other ports
    auth: {
      user: mail.user, // generated ethereal user
      pass: mail.pass, // generated ethereal password
    },
  });

  const sendEmail = async (email, subject, html) => {
    try {
        
        await transporter.sendMail({
            from: `Maria <${ mail.user }>`, // sender address
            to: email, // list of receivers
            subject: "Validar Correo", // Subject line
            text: "Hola estoy haciendo una prueba", // plain text body
            html, // html body
        });

    } catch (error) {
        console.log('Algo no va bien con el email', error);
    }
  }

  const obtenerDatos = (name, token) => {
      return `       
        <div>
            <h2>Hola ${ name }</h2>
            <p>Para confirmar tu cuenta, ingresa al siguiente enlace</p>
            <a
                href="http://localhost:4000/api/user/confirm/${ token }"
                target="_blank"
            >Confirmar Cuenta</a>
        </div>
      `;
  }

  module.exports = {
    sendEmail,
    obtenerDatos
  }