/* 
    Connection with the database is intialized in this file.
    For developement purposes, credentials are not not hidded.
    This is not done in a production environment.
*/

const {Pool} = require('pg')

// In production environment, these credentials are imported from a
// .env file or some other file so as not to expose the credentials
// to everyone with the access to the code.
const pool = new Pool({
    user:'postgres',
    host:'localhost',
    database:'homejam_assessment',
    password : 'rachit123'
})

// This 'pool' variable will be used to query the sql.
// Queries are not directly done by controllers, but by 
// services in the services directory.
module.exports = {pool}