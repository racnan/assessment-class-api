const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const {
    pool
} = require('../db_setup')

const createTeacher = async (firstname, lastname, email, password) => {

    // hash the password before storing it
    password = await bcrypt.hash(password, 8)

    const id = await pool.query(
        `INSERT INTO teacher (first_name, last_name, email, password) 
        VALUES ($1, $2, $3, $4) RETURNING teacher_id`,
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
        `SELECT password,teacher_id FROM teacher WHERE email = $1`,
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

const deleteAccount = async (teacherID) => {

    await pool.query(
        `DELETE FROM teacher WHERE teacher_id = $1`,
        [teacherID])

}

const createClass = async (teacher_id, subject) => {

    await pool.query(
        `INSERT INTO class (fk_teacher_id, subject_name) VALUES ($1, $2)`,
        [teacher_id, subject])

}

const deleteClass = async (classID, teacherID) => {

    const details = await pool.query(
        `DELETE FROM class WHERE class_id = $1 AND fk_teacher_id = $2`,
        [classID, teacherID])

    return details.rowCount
}

const addStudent = async (classID, studentID, teacherID) => {

    // to check if the class is associated with the teacher 
    const isClass = await pool.query(
        `SELECT * FROM class 
        WHERE class_id = $1 AND fk_teacher_id = $2 `,
        [classID, teacherID])

    // if no such class associated with the teacher is found
    if (isClass.rowCount === 0) {

        return false
    }

    await pool.query(
        `INSERT INTO class_student (fk_class_id, fk_student_id)
        VALUES ($1, $2)`,
        [classID, studentID])

    return true
}

const getStudents = async (classID, teacherID) => {

    // to check if the class is associated with the teacher 
    const isClass = await pool.query(
        `SELECT * FROM class 
        WHERE class_id = $1 AND fk_teacher_id = $2 `,
        [classID, teacherID])

    // if no such class associated with the teacher is found
    if (isClass.rowCount === 0) {

        return null
    }

    const details = await pool.query(
        `SELECT student.first_name, student.last_name FROM class
        JOIN class_student
        ON class.class_id = class_student.fk_class_id
        JOIN student
        ON student.student_id = class_student.fk_student_id
        WHERE class_student.fk_class_id = $1`,
        [classID])

    return details.rows
} 

const removeStudent = async (classID, studentID, teacherID) => {

    // to check if the class is associated with the teacher 
    const isClass = await pool.query(
        `SELECT * FROM class 
        WHERE class_id = $1 AND fk_teacher_id = $2 `,
        [classID, teacherID])

    // if no such class associated with the teacher is found
    if (isClass.rowCount === 0) {

        return false
    }

    const rowsAffected = await pool.query(
        `DELETE FROM class_student WHERE 
        fk_class_id = $1 AND fk_student_id = $2)`,
        [classID, studentID])

    // if the student was not enrolled in that class
    if (rowsAffected === 0) {

        return false
    }

    return true
}

module.exports = {
    createTeacher,
    signInTeacher,
    deleteAccount,
    createClass,
    deleteClass,
    addStudent,
    removeStudent,
    getStudents
}