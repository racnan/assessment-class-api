const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const {
    pool
} = require('../db_setup')

const createStudent = async (firstname, lastname, email, password) => {

    // hash the password before storing it
    password = await bcrypt.hash(password, 8)

    const id = await pool.query(
        "INSERT INTO student (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING student_id",
        [firstname, lastname, email, password])

    // generate the jwt token for authorization.
    // also, assigns the role "student" to the token,
    // so the user cannot access "teacher" resources
    // with this token
    const token = jwt.sign({
        "id": id.rows[0].student_id.toString(),
        "role": "student"
    }, "homejam-secret-key")

    return token

}

const signInStudent = async (email, password) => {

    const user = await pool.query(
        "SELECT password,student_id FROM student WHERE email = $1",
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
    // also, assigns the role "student" to the token,
    // so the user cannot access "teacher" resources
    // with this token
    const token = jwt.sign({
        "id": user.rows[0].student_id.toString(),
        "role": "student"
    }, "homejam-secret-key")

    // if email and password matches successfully
    return token

}

module.exports = {
    createStudent,
    signInStudent,
}