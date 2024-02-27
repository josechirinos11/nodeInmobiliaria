import {unlink} from 'node:fs/promises'
import { check, param, validationResult } from 'express-validator'
import {Precio, Categoria, Usuario, Propiedad} from '../models/index.js'
import jwt from 'jsonwebtoken';
import { generarJWT, generarId } from '../helpers/tokens.js'
import { emailRegistro, emailOlvidePassword } from '../helpers/emails.js'
import bcrypt from 'bcrypt'

import protegerRuta from '../middleware/protegerRuta.js';


const admin = async(req, res) => {
    const { id } = req.usuario
    console.log('el ID del usuario es.......   ',id)

    const propiedades = await Propiedad.findAll({
        where: {
            usuarioId : id
        },
        include: [
            { model: Categoria, as: 'categoria' },
            { model: Precio, as: 'precio' }
        ]
    })

    res.render('propiedades/admin', {
        paguina: 'Mis Propiedades',
        propiedades,
        csrfToken: req.csrfToken(),
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

const agregarImagen = async (req, res, next) => {
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
        paguina: `Agregar imagen: ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        propiedad
        
    })

}


const almacenarImagen = async (req, res, next) => {
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



    try {
       // console.log(req.file)
        //almacenar imagen y úblicarla
        propiedad.imagen = req.file.filename
        propiedad.publicado = 1 
       // console.log(propiedad)
        await propiedad.save()

        next()
    } catch (error) {
        console.log(error)
    }


}

const editar = async (req, res) => {
    const {id} = req.params

    //validaciones para verificar que exista la propiedad
    const propiedad = await Propiedad.findByPk(id)
    if(!propiedad) {
        return res.redirect('/mis-propiedades')
    }
    // validar que quien ve la url es quien es de su propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect('/mis-propiedades')
    }




 console.log('editando')
     // consultar modelos de precios y categorias
     const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])

    res.render('propiedades/editar', {
        paguina: `Editar Propiedades: ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: propiedad
    })
}


const guardarCambios = async (req, res) => {
    //verificar la validacion
    
    // Validacion
    let resultado = validationResult(req)

    if(!resultado.isEmpty()) {
        //consultar modelo de precios y categorias
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ])



        return res.render('propiedades/editar', {
            paguina: 'Editar Propiedades',
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body
        })
        
        
        
        
    }
 
    const {id} = req.params

    //validaciones para verificar que exista la propiedad
    const propiedad = await Propiedad.findByPk(id)
    if(!propiedad) {
        return res.redirect('/mis-propiedades')
    }
    // validar que quien ve la url es quien es de su propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect('/mis-propiedades')
    }

    // reescribir el objeto y actualizarlo

    try {
        const {titulo, descripcion, habitaciones, estacionamiento, wc, calle, lat, lng, precio: precioId, categoria: categoriaId} = req.body
        propiedad.set({
            titulo,
            descripcion,
            habitaciones,
            estacionamiento,
            wc,
            calle,
            lat,
            lng,
            precioId,
            categoriaId
        })
        await propiedad.save()
        res.redirect('/mis-propiedades')

    } catch (error) {
        console.log(error)
    }


    
}

const eliminar = async(req, res) => {
    const { id } = req.params
    console.log('elimando propiedad.......   ',id)
//validaciones para verificar que exista la propiedad
const propiedad = await Propiedad.findByPk(id)
if(!propiedad) {
    return res.redirect('/mis-propiedades')
}
    // validar que quien ve la url es quien es de su propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString()) {
        return res.redirect('/mis-propiedades')
    }

    //elimanar imagen

    await unlink(`public/uploads/${propiedad.imagen}`)

    //eliminar propiedad
    await propiedad.destroy()
    res.redirect('/mis-propiedades')



}


export {
    admin,
    crear,
    guardar,
    agregarImagen,
    almacenarImagen,
    editar,
    guardarCambios,
    eliminar
}