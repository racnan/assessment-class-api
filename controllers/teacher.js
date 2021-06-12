const express = require('express')

const {
    createTeacher,
    signInTeacher,
    deleteAccount,
    createClass,
    deleteClass,
    addStudent,
    removeStudent,
    getStudents
} = require('../services/teacher')

const auth = require('../middleware/auth')

const router = new express.Router()

router.post('/teacher/signup', async (req, res) => {

    try {

        // gets the jwt token after creating the user
        const token = await createTeacher(
            req.body.firstname,
            req.body.lastname,
            req.body.email,
            req.body.password)

        // sets the jwt token as cookie and responds with 201 status.
        // We can also send a redirect request from here    
        res.cookie("jwt", token).status(201).send()

    } catch (e) {

        // if email is already taken,
        // postgres responds with error code 23505
        if (e.code === '23505') {
            return res.status(409).send()
        }

        console.log(e)

        // for any other error
        res.status(400).send()

    }
})

router.post('/teacher/signin', async (req, res) => {

    try {

        const token = await signInTeacher(
            req.body.email,
            req.body.password)

        // token is null when email id is not found or password is incorrect
        if (token == null) {

            return res.status(401).send()
        }

        // when password is correct
        res.cookie("jwt", token).status(200).send()

    } catch (e) {

        // for any error
        console.log(e)

        res.status(400).send()

    }
})

router.delete('/teacher', auth, async (req, res) => {

    try {

        // extract the teacher id passed by the auth middleware
        const teacherID = res.locals.id

        await deleteAccount(teacherID)

        res.status(200).send()

    } catch (e) {

        // for any error
        console.log(e)

        res.status(400).send()
    }
})

router.post('/teacher/create', auth, async (req, res) => {

    try {

        // extract the teacher id passed by the auth middleware
        const teacherID = res.locals.id

        await createClass(teacherID, req.body.subject)

        // when the class was created successfully 
        res.status(201).send()

    } catch (e) {
        console.log(e)
        // if any error
        res.status(400).send()

    }
})

router.delete('/teacher/:classid', auth, async (req, res) => {

    try {

        // take the class id from query params
        const classID = req.params.classid

        // extract the teacher id passed by the auth middleware
        const teacherID = res.locals.id

        const rowsAffected = await deleteClass(classID, teacherID)

        if (rowsAffected === 0) {

            // case when no such class was found for the teacher
            return res.status(406).send()
        }

        res.status(200).send()

    } catch (e) {

        console.log(e)
        // if any error
        res.status(400).send()

    }

})

router.post('/teacher/:classid/:studentid', auth, async (req, res) => {

    try {

        // take the class id from query params
        const classID = req.params.classid

        // take the student id from query params
        const studentID = req.params.studentid

        // extract the teacher id passed by the auth middleware
        const teacherID = res.locals.id

        const isValid = await addStudent(classID, studentID, teacherID)

        // if the teacher has no such class associated with her/him
        if (!isValid) {
            return res.status(406).send()
        }

        res.status(200).send()

    } catch (e) {

        console.log(e)
        // if any error
        res.status(400).send()
    }
})

router.delete('/teacher/:classid/:studentid', auth, async (req, res) => {

    try {

        // take the class id from query params
        const classID = req.params.classid

        // take the student id from query params
        const studentID = req.params.studentid

        // extract the teacher id passed by the auth middleware
        const teacherID = res.locals.id

        const isValid = await removeStudent(classID, studentID, teacherID)

        // if the teacher has no such class associated with her/him
        // or student is not enrolled in this class
        if (!isValid) {

            return res.status(406).send()
        }

        res.status(200).send()


    } catch (e) {

        console.log(e)
        // if any error
        res.status(400).send()
    }
})

router.get("/teacher/:classid", auth, async (req, res) => {

    try {

        // take the class id from query params
        const classID = req.params.classid

        // extract the teacher id passed by the auth middleware
        const teacherID = res.locals.id

        const details = await getStudents(classID, teacherID)

        // if the teacher has no such class associated with her/him
        if (details === null) {

            return res.status(406).send()
        }

        res.status(200).json(details)

    } catch (e) {

        console.log(e)
        // if any error
        res.status(400).send()

    }

})


module.exports = router