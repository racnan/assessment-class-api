const jwt = require("jsonwebtoken")

const teacherAuth = (req, res, next) => {

    try {

        const token = req.cookies.jwt

        const decoded = jwt.verify(token, "homejam-secret-key")

        if (decoded.role === "teacher") {
            // if the role is "teacher" 

            // pass the teacher_id from the JWT
            res.locals.id = decoded.id
            return next()

        } else {

            // if the role is not "teacher", respond with 401
            res.status(401).send()

        }

    } catch (e) {

        // on error
        res.status(400).send()

    }

}

module.exports = teacherAuth