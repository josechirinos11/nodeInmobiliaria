import express from "express"
import {
    formularioLogin,
    formularioRegistro,
    registrar, confirmar,
    formularioOlvidePassword,
    resetPassword,
    comprobarToken,
    nuevoPassword,
    autenticar
} from '../controllers/usuarioControllers.js'


const router = express.Router()



router.get('/login', formularioLogin)
router.post('/login', autenticar)

router.get('/registro', formularioRegistro)
router.post('/registro', registrar)

router.get('/confirmar/:token', confirmar)

router.get('/olvide-Password', formularioOlvidePassword)
router.post('/olvide-Password', resetPassword)

//almacenar nuevo password
router.get('/olvide-Password/:token', comprobarToken)
router.post('/olvide-Password/:token', nuevoPassword)



export default router