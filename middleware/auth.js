const jwt = require("jsonwebtoken")

const auth = (req, res, next) => {

    try {

        // Constant 'role' will get the value 'teacher' or 'student' from the route
        // this will be compared with 'role' in token of the user.
        // If they don't match, request is responded with a 401.
        // This prevents students to access teacher's resources and 
        // teacher to access student's resources.
        const role = req.route.path.split('/')[1]

        const token = req.cookies.jwt

        const decoded = jwt.verify(token, "homejam-secret-key")

        if (decoded.role === role) {
            // if the role matches

            // pass the id from the JWT to the router
            res.locals.id = decoded.id
            return next()

        } else {

            // if the role doesn't match, respond with 401
            res.status(401).send()

        }

    } catch (e) {

        // on error
        res.status(400).send()

    }

}

module.exports = auth