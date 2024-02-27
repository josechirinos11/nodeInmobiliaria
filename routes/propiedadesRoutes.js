import express from "express"
import { body, check, param, validationResult } from 'express-validator'
import {
    admin,
    crear,
    guardar,
    agregarImagen,
    almacenarImagen,
    editar,
    guardarCambios,
    eliminar
} from '../controllers/propiedadControllers.js'
import protegerRuta from "../middleware/protegerRuta.js"
import upload from "../middleware/subirImagen.js"



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

router.post('/propiedades/agregar-imagen/:id',
    protegerRuta,
    upload.single('imagen'),
    almacenarImagen
    )

router.get('/propiedades/editar/:id',
protegerRuta,
editar
)
router.post('/propiedades/editar/:id', protegerRuta,
    body('titulo').notEmpty().withMessage('El titulo del Anuncio es Oblogatorio'),
    body('descripcion').notEmpty().withMessage('La descripcion del Anuncio es Oblogatorio').isLength({max:20}).withMessage('La descripcion es muy larga maximo 20 caracteres'),
    body('categoria').isNumeric().withMessage('Slecciona una categoria'),
    body('precio').isNumeric().withMessage('Colocale precio del Anuncio'),
    body('habitaciones').isNumeric().withMessage('Slecciona numero habitaciones del Anuncio'),
    body('estacionamiento').isNumeric().withMessage('Slecciona numero estacionamiento'),
    body('wc').isNumeric().withMessage('Slecciona numero wc'),
    body('calle').notEmpty().withMessage('ubica la propiedad en el mapa'),
    guardarCambios
)
router.post('/propiedades/eliminar/:id', 
protegerRuta,
eliminar
)


export default router