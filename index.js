
import express from 'express'
import csrf from 'csurf'
import cookieParser from 'cookie-parser'
import usuarioRoutes from './routes/usuarioRoutes.js'
import propiedadesRoutes from './routes/propiedadesRoutes.js'
import db from './config/db.js'


//crear la app
const app = express()

//habilitar lectura desde formularios
app.use(express.urlencoded({extended: true}))

//habilitar cookie parser
app.use( cookieParser() )

//habilitar crsrf
app.use(csrf({cookie: true}))

//conexion con la base de datos
try {
    await db.authenticate()
    db.sync()
    console.log('conectado a la base de datos')
} catch (error) {
    console.log(error)
}



// habilitar pug
app.set('view engine', 'pug')
app.set('views', './views')

// carpeta publica
app.use(express.static('public'))



//rutas
app.use('/auth', usuarioRoutes)
app.use('/', propiedadesRoutes)




//definir un puerto y arrancar el proyecto
const port =process.env.PORT || 3000
app.listen(port, () => {
    console.log(`el servidor esta funcionando puerto ${port}`)
})