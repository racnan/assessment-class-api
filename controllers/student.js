const express = require('express')

// import necessary functions from ./services/student
const {
    createStudent,
    signInStudent,
    deleteAccount,
    enroll,
    getAllClasses,
    leaveClass
} = require('../services/student')

const auth = require('../middleware/auth')

const router = new express.Router()

// STUDENT SIGNUP ROUTER
// POST /student/signup
// REQUEST
    /* example,
        {
            firstname: "Rachit",
            lastname: "Naithani",
            email: "rachitnaithani@gmail.com",
            password: "rachit123"
        }
    */
// RESPONSE
    /* 
        201 - account created
        409 - email already exists
        400 - error
    */
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


// STUDENT SIGNIN ROUTER
// POST /student/signin
// REQUEST
    /* example,
        {
            email: "rachitnaithani@gmail.com",
            password: "rachit123"
        }
    */
// RESPONSE
    /* 
        200 - accepted
        401 - emailID and password doesn't match
        400 - error
    */
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

// STUDENT DELETE ACCOUNT ROUTER
// DELETE /student
// RESPONSE
    /* 
        200 - account deleted
        400 - error
    */
router.delete('/student', auth, async (req, res) => {

    try {

        // extract the student id passed by the auth middleware
        const studentID = res.locals.id

        await deleteAccount(studentID)

        res.status(200).send()

    } catch (e) {

        // for any error
        console.log(e)

        res.status(400).send()
    }
})

// STUDENT ENROLL IN CLASS ROUTER
// POST /student/enroll/:classid
// RESPONSE
    /* 
        201 - enrollment successfull
        400 - error
    */
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

// STUDENT GET ALL CLASSES ROUTER
// GET /student/classes
// RESPONSE
    /* 
        200 - account deleted
            {
                [
                    {
                        subject_name: "maths101",
                        fist_name: "Rachit", --teacher's name
                        last_name: "Naithani"
                    },
                    {
                        subject_name: "chemistry101",
                        fist_name: "Rachit",
                        last_name: "Naithani"
                    }
                ]
            }
        400 - error
    */
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

// STUDENT LEAVE CLASS ROUTER
// DELETE /student/:classid
// RESPONSE
    /* 
        200 - class left successfully
        406 - no such class found
        400 - error
    */
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