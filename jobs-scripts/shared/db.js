import mysql from 'mysql2/promise';
import dotenv from "dotenv";

dotenv.config({ path: `.env.${process.env.NODE_ENV ?? 'development'}` });

console.log(process.env.DB_HOST);
const connectionConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

export const getConnection = async () => {
    return mysql.createConnection(connectionConfig);
};