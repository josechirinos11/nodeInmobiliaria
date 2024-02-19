import express from "express"
import { body, check, param, validationResult } from 'express-validator'
import {
    admin,
    crear,
    guardar,
    agregarImagen
} from '../controllers/propiedadControllers.js'
import protegerRuta from "../middleware/protegerRuta.js"

const router = express.Router()


//router.get('/login', formularioLogin)
//router.post('/login', autenticar)

router.get('/mis-propiedades', protegerRuta, admin)
router.get('/propiedades/crear', protegerRuta, crear)
router.post('/propiedades/crear', protegerRuta,
    body('titulo').notEmpty().withMessage('El titulo del Anuncio es Oblogatorio'),
    body('descripcion').notEmpty().withMessage('La descripcion del Anuncio es Oblogatorio').isLength({max:20}).withMessage('La descripcion es muy larga maximo 20 caracteres'),
    body('categoria').isNumeric().withMessage('Slecciona una categoria'),
    body('precio').isNumeric().withMessage('Colocale precio del Anuncio'),
    body('habitaciones').isNumeric().withMessage('Slecciona numero habitaciones del Anuncio'),
    body('estacionamiento').isNumeric().withMessage('Slecciona numero estacionamiento'),
    body('wc').isNumeric().withMessage('Slecciona numero wc'),
    body('calle').notEmpty().withMessage('ubica la propiedad en el mapa'),
    
    guardar
)


router.get('/propiedades/agregar-imagen/:id', protegerRuta, agregarImagen)




export default router