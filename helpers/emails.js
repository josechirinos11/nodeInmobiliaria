import nodemailer from 'nodemailer'
import dotenv from 'dotenv';
dotenv.config({path: '.env'});

const emailRegistro = async (datos) => {

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      console.log('desde emailRegistro')
      console.log(datos)
      const { email, nombre, token} = datos
      //enviar email
      await transport.sendMail({
        from: 'BienesRaices.com',
        to: email,
        subject: 'Confirmacion de cuenta BienesRaices.com',
        text: 'confirma tu cuenta',
        html: `
          <p>Hola ${nombre}, Comprueba tu cuenta en BienesRaices.com</p>
          <p>Dar click al siguiente enlace
          <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 3000}/auth/confirmar/${token}">Confimar cuenta</a> </p>
          <p> ${nombre} si no creaste la cuenta ignora este mensaje</p>
        `
      })
}


export {
    emailRegistro
}