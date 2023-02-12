const {DataSource} = require("typeorm");
require('dotenv').config();

const connection = process.env.DB_CONNECTION
const host = process.env.DB_HOST
const port = process.env.DB_PORT
const username = process.env.DB_USER
const password = process.env.DB_PASS
const database = process.env.DB_NAME

const dataSource = new DataSource({
    type: connection,
    host: host,
    port: port,
    username: username,
    password: password,
    database: database,

    entities: [require("../models/user.entity"), require("../models/client.entity")],
    migrations: ['./helpers/migrations/*.js'],
    synchronize: false
})

const initDataSource = () => {
    dataSource.initialize()
        .then(() => {
            console.log("Create data source successfully!");
        })
        .catch((error) => {
            console.log("Fail to create data source!")
        });
}

module.exports = {
    initDataSource,
    dataSource
};