const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');
const mysql = require('mysql2/promise'); // Import MySQL library for connection

const app = express();
const port = 3000;

// Use environment variables for database connection
const DB_HOST = process.env.DB_HOSTNAME || 'localhost';
const DB_USER = 'admin';
const DB_PASSWORD = 'adminadmin';
const DB_NAME = 'cloud_services_app';

// Function to create the database if it doesn't exist
async function createDatabase() {
    const connection = await mysql.createConnection({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME}`);
    await connection.end();
}

// Call the function to create the database
createDatabase().then(() => {
    // Set up MySQL connection using Sequelize
    const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
        host: DB_HOST,
        dialect: 'mysql'
    });

    // Define the Service model
    const Service = sequelize.define('Service', {
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        compute: {
            type: DataTypes.JSON,
            allowNull: false
        },
        storage: {
            type: DataTypes.STRING,
            allowNull: false
        },
        network: {
            type: DataTypes.STRING,
            allowNull: false
        },
        general: {
            type: DataTypes.JSON,
            allowNull: false
        }
    });

    // Sync the database (create table if it doesn't exist)
    sequelize.sync();

    app.use(bodyParser.json());
    app.use(cors({
        origin: '*'
    }));

    app.get('/api/services', async (req, res) => {
        const services = await Service.findAll();
        res.json(services);
    });

    app.get('/health', (req, res) => {
        res.status(200).send('OK');
    });

    app.post('/api/services', async (req, res) => {
        const { username, compute, storage, network, general } = req.body;
        const service = await Service.create({ username, compute, storage, network, general });
        const services = await Service.findAll();
        res.json(services);
    });

    app.delete('/api/services/:id', async (req, res) => {
        const { id } = req.params;
        await Service.destroy({ where: { id } });
        const services = await Service.findAll();
        res.json(services);
    });

    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}).catch(error => {
    console.error('Failed to create database:', error);
});
