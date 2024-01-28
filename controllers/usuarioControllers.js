import {check, param, validationResult} from 'express-validator'
import Usuario from '../models/Usuario.js'
import {generarId} from '../helpers/tokens.js'
import { emailRegistro } from '../helpers/emails.js'



const formularioLogin = (req, res) => {
    res.render('auth/login', {
        paguina: "LOGIN"
    })
}

const formularioRegistro = (req, res) => {
    
    res.render('auth/registro', {
        paguina: 'Crear Cuenta',
        csrfToken : req.csrfToken()
    })
}

const registrar = async(req,res) => {
    //validar
    await check('nombre').notEmpty().withMessage('El nombre es necesario').run(req)
    await check('email').isEmail().withMessage('Escribir email correcto').run(req)
    await check('password').isLength({ min: 2 }).withMessage('Minimo 2 caracteres para el password').run(req)
    await check('repetir_password').equals(req.body.password).withMessage('Los password no son iguales').run(req)

    let resultado = validationResult(req)

    //verify that the user is empty
    if(!resultado.isEmpty()) {
        //Error
   
        return res.render('auth/registro', {
            paguina: 'Crear Cuenta',
            csrfToken : req.csrfToken(),
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
    const {nombre, email, password} = req.body

    //verificar si existe el email
    try {
        const usuarioExistente = await Usuario.findOne({where: {email}})
        if (usuarioExistente) {
            return res.render('auth/registro', {
                paguina: 'Crear Cuenta',
                csrfToken : req.csrfToken(),
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
        csrfToken : req.csrfToken(),
        mensaje: 'Hemos enviado un Email de confirmacion, preciona en el enace'
    })
    

}

    //funtion to check an acount
    const confirmar = async (req, res) => {
        const {token} = req.params
        console.log('desde verificando correo')
        // check if token is valid
        const usuario = await Usuario.findOne({where: {token}})
        if(!usuario) {
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
            csrfToken : req.csrfToken()
        })

        
    }


const formularioOlvidePassword = (req, res) => {
    res.render('auth/olvide-Password', {
        paguina: 'Recuperar Clave'
    })
}

export {
    formularioLogin,
    formularioRegistro,
    registrar,
    confirmar,
    formularioOlvidePassword
}