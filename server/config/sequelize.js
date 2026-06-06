import { Sequelize } from 'sequelize';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const host = process.env.DB_HOST || '127.0.0.1';
const port = parseInt(process.env.DB_PORT || '3306', 10);
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || '';
const database = process.env.DB_NAME || 'vendorbridge_db';

// Ensure the database exists
const ensureDatabaseExists = async () => {
  try {
    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    await connection.end();
    console.log(`Database "${database}" checked/created successfully.`);
  } catch (error) {
    console.error('Error ensuring database exists:', error.message);
  }
};

await ensureDatabaseExists();

const sequelize = new Sequelize(database, user, password, {
  host,
  port,
  dialect: 'mysql',
  logging: false, // Set to console.log for debugging
  define: {
    timestamps: true, // adds createdAt and updatedAt fields
  },
});

export default sequelize;
