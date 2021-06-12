const express = require('express')

const {
    createStudent,
    signInStudent,
    enroll,
    getAllClasses,
    leaveClass
} = require('../services/student')

const auth = require('../middleware/auth')

const router = new express.Router()

router.post('/student/signup', async (req, res) => {

    try {

        // gets the jwt token after creating the user
        const token = await createStudent(
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

router.post('/student/signin', async (req, res) => {

    try {

        const token = await signInStudent(
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

router.post('/student/enroll/:classid', auth, async (req, res) => {

    try {

        // take the class id from query params
        const classID = req.params.classid

        // extract the student id passed by the auth middleware
        const studentID = res.locals.id

        await enroll(classID, studentID)

        // if no errors
        res.status(201).send()

    } catch (e) {

        // for any error
        console.log(e)

        res.status(400).send()

    }

})

router.get("/student/classes", auth, async (req, res) => {

    try {

        // extract the student id passed by the auth middleware
        const studentID = res.locals.id

        const details = await getAllClasses(studentID)

        res.status(200).json(details)


    } catch (e) {

        // for any  error
        console.log(e)

        res.status(400).send()

    }

})

router.delete("/student/:classid", auth, async (req, res) => {

    try {

        // take the class id from query params
        const classID = req.params.classid

        // extract the student id passed by the auth middleware
        const studentID = res.locals.id

        const rowsAffected = await leaveClass(classID, studentID)

        if (rowsAffected === 0 ) {

            // if user is not associated with this class
            return res.status(406).send()
        }

        res.status(200).send()

    } catch (e) {

        // for any  error
        console.log(e)

        res.status(400).send()

    }

})

module.exports = router