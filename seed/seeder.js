import { exit } from 'node:process'
import categorias from "./Categoria.js";
import db from "../config/db.js";
import precios from './Precio.js';

import { Categoria, Precio } from '../models/index.js';



function ejemploPromiseAll() {
    Promise.all([funcionAsincrona1(), funcionAsincrona2()])
        .then(resultados => {
            const resultado1 = resultados[0];
            const resultado2 = resultados[1];
            console.log('Resultado 1:', resultado1);
            console.log('Resultado 2:', resultado2);
        })
        .catch(error => {
            console.error('Hubo un error:', error);
        });
}


const importDatos = async () => {



    try {

        // autenticar
        await db.authenticate()

        //generar las columnas
        await db.sync()

        // insertamos los datos
        await Categoria.bulkCreate(categorias)
        await Precio.bulkCreate(precios)
        // usando promiseall

        // await Promise.all([
        //     Categoria.bulkCreate(categorias),
        //     Precio.bulkCreate(precios)
        // ])





        console.log('Datos correctamente insertados')
        exit()


    } catch (error) {
        console.log(error)
        process.exit(1)
    }

}


const eliminarDatos = async () => {

    try {

        // usando promise
        await Promise.all([
            Categoria.destroy({where: {}, TRUNCATE: true}),
            Precio.destroy({where: {}, TRUNCATE: true}),
            db.sync({force:true})
        ])
        // usando solo await

        // await db.sync({force: true})

        console.log('datos eliminados')
        exit()


    } catch (error) {
        console.log(error)
        exit(1)
    }



}





if (process.argv[2] === "-i") {
    importDatos()
}


if (process.argv[2] === "-e") {
    eliminarDatos()
}