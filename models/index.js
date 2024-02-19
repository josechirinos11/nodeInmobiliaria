import Propiedad from './Propiedad.js'
import Precio from './Precio.js'
import Categoria from './Categoria.js'
import Usuario from './Usuario.js'


//  Precio.hasOne(Propiedad)


// crea la relacion automatica precioId en la tabla de propiedades
// si lo deseas manual y colocarle el nombre seria asi:
//  Propiedad.belongsTo(Precio, { foreignkey: 'precioId' })
Propiedad.belongsTo(Precio, { foreignkey: 'precioId' })
Propiedad.belongsTo(Categoria, { foreignkey: 'categoriaId' })
Propiedad.belongsTo(Usuario, { foreignkey: 'usuarioId' })

export {
    Propiedad,
    Precio,
    Categoria,
    Usuario
}