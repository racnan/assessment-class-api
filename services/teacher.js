const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const {
    pool
} = require('../db_setup')

const createTeacher = async (firstname, lastname, email, password) => {

    // hash the password before storing it
    password = await bcrypt.hash(password, 8)

    const id = await pool.query(
        "INSERT INTO teacher (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING teacher_id",
        [firstname, lastname, email, password])

    // generate the jwt token for authorization.
    // also, assigns the role "teacher" to the token,
    // so the user cannot access "student" resources
    // with this token
    const token = jwt.sign({
        "id": id.rows[0].teacher_id.toString(),
        "role": "teacher"
    }, "homejam-secret-key")

    return token

}

const signInTeacher = async (email, password) => {

    const user = await pool.query(
        "SELECT password,teacher_id FROM teacher WHERE email = $1",
        [email]
    )

    // email doesn't exists 
    if (user.rows.length === 0) {
        console.log("invalid email")
        return null
    }


    // compare with the hashed password
    const isMatch = await bcrypt.compare(password, user.rows[0].password)

    // if password doesn't match
    if (!isMatch) {
        console.log("invalid password")
        return null
    }

    // generate the jwt token for authorization.
    // also, assigns the role "teacher" to the token,
    // so the user cannot access "student" resources
    // with this token
    const token = jwt.sign({
        "id": user.rows[0].teacher_id.toString(),
        "role": "teacher"
    }, "homejam-secret-key")

    // if email and password matches successfullu
    return token

}

module.exports = {
    createTeacher,
    signInTeacher
}