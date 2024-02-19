import { Sequelize } from "sequelize";
import dotenv from 'dotenv';
dotenv.config({path: '.env'});

const db = new Sequelize(process.env.DB_NOMBRE, process.env.DB_USUARIO, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: 3306,
    dialect: 'mysql',
    define: {
        timestamps: true
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    //operatorsAliases: false
});

export default db