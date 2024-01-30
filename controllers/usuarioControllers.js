import { check, param, validationResult } from 'express-validator'
import Usuario from '../models/Usuario.js'
import jwt from 'jsonwebtoken';
import { generarJWT, generarId } from '../helpers/tokens.js'
import { emailRegistro, emailOlvidePassword } from '../helpers/emails.js'
import bcrypt from 'bcrypt'




const formularioLogin = (req, res) => {
    res.render('auth/login', {
        paguina: "LOGIN",
        csrfToken: req.csrfToken(),
    })
}

const formularioRegistro = (req, res) => {

    res.render('auth/registro', {
        paguina: 'Crear Cuenta',
        csrfToken: req.csrfToken()
    })
}

const registrar = async (req, res) => {
    //validar
    await check('nombre').notEmpty().withMessage('El nombre es necesario').run(req)
    await check('email').isEmail().withMessage('Escribir email correcto').run(req)
    await check('password').isLength({ min: 2 }).withMessage('Minimo 2 caracteres para el password').run(req)
    await check('repetir_password').equals(req.body.password).withMessage('Los password no son iguales').run(req)

    let resultado = validationResult(req)

    //verify that the user is empty
    if (!resultado.isEmpty()) {
        //Error

        return res.render('auth/registro', {
            paguina: 'Crear Cuenta',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email,
                password: req.body.password,
                repetir_password: req.body.repetir_password
            }
        })

    }
    //extraer datos
    const { nombre, email, password } = req.body

    //verificar si existe el email
    try {
        const usuarioExistente = await Usuario.findOne({ where: { email } })
        if (usuarioExistente) {
            return res.render('auth/registro', {
                paguina: 'Crear Cuenta',
                csrfToken: req.csrfToken(),
                errores: resultado.array(),
                usuario: {
                    nombre,
                    email,
                    password,
                    repetir_password: req.body.repetir_password
                },
                mensaje: 'El correo ya existe'
            })
        }
    } catch (error) {
        console.log(error)
    }

    // almacenar usuario
    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        token: generarId()
    })

    // enviar email de confirmacion
    emailRegistro({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    })

    console.log('Registrando............')


    //mostrar mensaje de confirmacion
    return res.render('templates/mensaje', {
        paguina: 'Cuenta creada correctamente',
        errores: resultado.array(),
        csrfToken: req.csrfToken(),
        mensaje: 'Hemos enviado un Email de confirmacion, preciona en el enace'
    })



}

//funtion to check an acount
const confirmar = async (req, res) => {
    const { token } = req.params
    console.log('desde verificando correo')
    // check if token is valid
    const usuario = await Usuario.findOne({ where: { token } })
    if (!usuario) {
        return res.render('auth/confirmar-cuenta', {
            paguina: 'Error al confirmar tu cuenta',
            mensaje: 'Hemos enviado un Email de confirmacion, pero ocurrio un error al confirmar email',
            error: true
        })
    }

    //confirmar cuenta
    usuario.token = null
    usuario.confirmado = true
    await usuario.save()

    res.render('auth/confirmar-cuenta', {
        paguina: 'CUENTA CONFIRMADA',
        mensaje: 'Hemos confirmado tu CUENTA',
        csrfToken: req.csrfToken()
    })


}


const formularioOlvidePassword = (req, res) => {
    res.render('auth/olvide-Password', {
        paguina: 'Recuperar Clave',
        csrfToken: req.csrfToken(),
    })
}

const resetPassword = async (req, res) => {
    //validar

    await check('email').isEmail().withMessage('Escribir email correcto').run(req)


    let resultado = validationResult(req)

    //verify that the user is empty
    if (!resultado.isEmpty()) {
        //Error

        return res.render('auth/olvide-Password', {
            paguina: 'Recuperar Clave',
            csrfToken: req.csrfToken(),
            errores: resultado.array()

        })

    }
    // Buscar el usuario
    const { email } = req.body

    //verificar si existe el email

    const usuarioExistente = await Usuario.findOne({ where: { email } })
    if (!usuarioExistente) {
        return res.render('auth/olvide-Password', {
            paguina: 'Recuperar Clave',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'El email no pertenece a ningun usuario' }]

        })

    }

    // generar un token
    usuarioExistente.token = generarId()
    await usuarioExistente.save()
    // Enviar un email
    emailOlvidePassword({
        email: usuarioExistente.email,
        nombre: usuarioExistente.nombre,
        token: usuarioExistente.token
    })

    // renderizar un mensaje

    res.render('templates/mensaje', {
        paguina: 'Reestablece el password',
        errores: resultado.array(),
        csrfToken: req.csrfToken(),
        mensaje: 'Hemos enviado un Email para seguir las intrucciones'
    })

}


const comprobarToken = async (req, res,) => {
    const { token } = req.params

    const usuario = await Usuario.findOne({ where: { token } })

    if (!usuario) {
        return res.render('auth/confirmar-cuenta', {
            paguina: 'Reestablece tu Password',
            mensaje: 'Error al validar informacion, intenta de nuevo',
            error: true
        })
    }

    // mostrar nuevo password

    res.render('auth/nueva-password', {
        paguina: 'Reestablece tu Password',
        csrfToken: req.csrfToken()
    })


}


const nuevoPassword = async (req, res) => {

    console.log('guardando password..............')
    //validar

    await check('password').isLength({ min: 2 }).withMessage('Minimo 2 caracteres para el password').run(req)

    let resultado = validationResult(req)

    //verify that the user is empty
    if (!resultado.isEmpty()) {
        //Error

        return res.render('auth/nueva-password', {
            paguina: 'Reestablece tu Password',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),

        })

    }
    //extraer datos
    const { token } = req.params
    const { password } = req.body

    const usuario = await Usuario.findOne({ where: { token } })

    // hashear password
    const salt = await bcrypt.genSalt(10);
    // Hashear la contraseña utilizando el salt
    usuario.password = await bcrypt.hash(password, salt);
    usuario.token = null
    await usuario.save()


    console.log('cambio de pasword exitoso............')


    //mostrar mensaje de confirmacion
    return res.render('auth/confirmar-cuenta', {
        paguina: 'Password restablecida',

        mensaje: 'Se a cambiado el password exitosamente',


    })


}

const autenticar = async (req, res) => {
    console.log('autenticandete............')

    // validacion
    await check('email').isEmail().withMessage('Escribir email correcto').run(req)
    await check('password').notEmpty().withMessage('El password es obligatorio').run(req)
    let resultado = validationResult(req)


    //verify that the user is empty
    if (!resultado.isEmpty()) {
        //Error

        return res.render('auth/login', {
            paguina: 'LOGIN',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
        }
        )

    }


    //extraer datos
    const { email, password } = req.body

    //verificar si existe el email

    const usuarioExistente = await Usuario.findOne({ where: { email } })
    if (!usuarioExistente) {
        return res.render('auth/login', {
            paguina: 'LOGIN',
            csrfToken: req.csrfToken(),
            mensaje: 'Verifique Correo o Password no estan en la base de datos'
        }

        )
    }

    // verificar si la cuenta esta confirmada


    const { confirmado } = usuarioExistente
    if (!confirmado) {
        console.log('No confirmado')
        return res.render('auth/login', {
            paguina: 'LOGIN',
            csrfToken: req.csrfToken(),
            mensaje: 'No confirmado'
        }
        )

    }



    // comprobar password
    if (!usuarioExistente.verificarPassword(password)) {
        return res.render('auth/login', {
            paguina: 'LOGIN',
            csrfToken: req.csrfToken(),
            mensaje: 'el password es incorrecto'
        }
        )
    }


    // autenticar usuario

    const token = generarJWT({ id: usuarioExistente.id, nombre: usuarioExistente.nombre })
    console.log(usuarioExistente.id)
    console.log(token)

    //almacenar el token en un cookie


    // renderizamos la vista
    return res.cookie('_token', token, {
        httpOnly: true,
        // secure: true
        //samesite: true
    }).redirect('/mis-propiedades')





}


export {
    formularioLogin,
    formularioRegistro,
    registrar,
    confirmar,
    formularioOlvidePassword,
    resetPassword,
    comprobarToken,
    nuevoPassword,
    autenticar
}