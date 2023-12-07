const jwt = require("jsonwebtoken")

const mongodb = require("mongodb")
const ObjectId = mongodb.ObjectId
 
module.exports = async function (request, result, next) {
    try {
        const accessToken = request.headers.authorization.split(" ")[1]
        const decoded = jwt.verify(accessToken, jwtSecret)
        const userId = decoded.userId
 
        const user = await db.collection("users").findOne({
            accessToken: accessToken
        })
 
        if (user == null) {
            result.json({
                status: "error",
                message: "User has been logged out."
            })

            return
        }
 
        request.user = user
        next()
    } catch (exp) {
        result.json({
            status: "error",
            message: "User has been logged out."
        })
    }
}