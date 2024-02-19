import { check, param, validationResult } from 'express-validator'
import {Precio, Categoria, Usuario, Propiedad} from '../models/index.js'
import jwt from 'jsonwebtoken';
import { generarJWT, generarId } from '../helpers/tokens.js'
import { emailRegistro, emailOlvidePassword } from '../helpers/emails.js'
import bcrypt from 'bcrypt'

import protegerRuta from '../middleware/protegerRuta.js';


const admin = (req, res) => {

    res.render('propiedades/admin', {
        paguina: 'Mis Propiedades'
    })
}


//formulario para crear propiedad
const crear = async (req, res) => {
    // consultar modelos de precios y categorias
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])

    res.render('propiedades/crear', {
        paguina: 'Crear Propiedades',
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: {}
    })
}

//formulario para guardar propiedad
const guardar = async (req, res) => {
    
    // Validacion
    let resultado = validationResult(req)

    if(!resultado.isEmpty()) {
        //consultar modelo de precios y categorias
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ])

        return res.render('propiedades/crear', {
            paguina: 'Crear Propiedades',
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body
        })
    }


    // crear un registro
    const {titulo, descripcion, habitaciones, estacionamiento, wc, calle, lat, lng, precio: precioId, categoria: categoriaId} = req.body
    const {id: usuarioId } = req.usuario
    try {
        const propiedadGuardado = await Propiedad.create({
            titulo,
            descripcion,
            habitaciones,
            estacionamiento,
            wc,
            calle,
            lat,
            lng,
            precioId,
            categoriaId,
            usuarioId,
            imagen: ''


        })

        const { id } = propiedadGuardado
        res.redirect(`/propiedades/agregar-imagen/${id}`)

    } catch (error) {
        console.log(error)
    }
    
}

const agregarImagen = async (req, res) => {
    const { id } = req.params

    //validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)
    if(!propiedad) {
        return res.redirect('/mis-propiedades')
    }

    //validar que la propiedad no este publicada
    if(propiedad.publicado) {
        return res.redirect('/mis-propiedades')
    }

    //validar que  pertenece a quien vicite
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect('/mis-propiedades')
    }


  res.render('propiedades/agregar-imagen', {
        paguina: 'Agregar magen'
        
    })

}


export {
    admin,
    crear,
    guardar,
    agregarImagen
}