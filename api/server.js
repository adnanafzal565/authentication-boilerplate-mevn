// include express framework
const express = require("express")
 
// create an instance of it
const app = express()
 
// create http server from express instance
const http = require("http").createServer(app)
 
// database module
const mongodb = require("mongodb")
 
// client used to connect with database
const MongoClient = mongodb.MongoClient
 
// each Mongo document's unique ID
const ObjectId = mongodb.ObjectId

// Add headers before the routes are defined
app.use(function (req, res, next) {
 
    // Website you wish to allow to connect
    res.setHeader("Access-Control-Allow-Origin", "*")
 
    // Request methods you wish to allow
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE")
 
    // Request headers you wish to allow
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type,Authorization")
 
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader("Access-Control-Allow-Credentials", true)
 
    // Pass to next layer of middleware
    next()
})

// module required for parsing FormData values
const expressFormidable = require("express-formidable")
 
// setting the middleware
app.use(expressFormidable())

const bcryptjs = require("bcryptjs")

// JWT used for authentication
const jwt = require("jsonwebtoken")
// secret JWT key
global.jwtSecret = "jwtSecret1234567890"

const auth = require("./modules/auth")

const nodemailer = require("nodemailer")
const nodemailerFrom = "support@adnan-tech.com"
const transport = nodemailer.createTransport({
    host: "",
    port: 465,
    secure: true,
    auth: {
        user: nodemailerFrom,
        pass: ""
    }
})

const port = (process.env.PORT || 3000)
 
// start the server at port 3000 (for local) or for hosting server port
http.listen(port, function () {
    console.log("Server has been started at: " + port)
 
    // connect with database
    MongoClient.connect("mongodb://localhost:27017", function (error, client) {
        if (error) {
            console.error(error)
            return
        }
 
        // database name
        global.db = client.db("boilerplate_auth")
        console.log("Database connected")

        app.post("/verifyAccount", async function (request, result) {
            const email = request.fields.email
            const code = request.fields.code

            if (!email || !code) {
                result.json({
                    status: "error",
                    message: "Please fill all fields."
                })

                return
            }
         
            // update JWT of user in database
            const user = await db.collection("users").findOne({
                $and: [{
                    email: email
                }, {
                    verificationToken: parseInt(code)
                }]
            })

            if (user == null) {
                result.json({
                    status: "error",
                    message: "Invalid email code."
                })

                return
            }

            await db.collection("users").findOneAndUpdate({
                _id: user._id
            }, {
                $set: {
                    isVerified: true
                },

                $unset: {
                    verificationToken: ""
                }
            })

            result.json({
                status: "success",
                message: "Account has been account. Kindly login again."
            })
        })

        app.post("/resetPassword", async function (request, result) {
            const email = request.fields.email
            const code = request.fields.code
            const password = request.fields.password

            if (!email || !code || !password) {
                result.json({
                    status: "error",
                    message: "Please fill all fields."
                })

                return
            }
         
            // update JWT of user in database
            const user = await db.collection("users").findOne({
                $and: [{
                    email: email
                }, {
                    code: parseInt(code)
                }]
            })

            if (user == null) {
                result.json({
                    status: "error",
                    message: "Invalid email code."
                })

                return
            }

            const salt = bcryptjs.genSaltSync(10)
            const hash = await bcryptjs.hashSync(password, salt)

            await db.collection("users").findOneAndUpdate({
                _id: user._id
            }, {
                $set: {
                    password: hash
                },

                $unset: {
                    code: ""
                }
            })

            result.json({
                status: "success",
                message: "Password has been changed."
            })
        })

        app.post("/sendPasswordRecoveryEmail", async function (request, result) {
            const email = request.fields.email

            if (!email) {
                result.json({
                    status: "error",
                    message: "Please fill all fields."
                })

                return
            }
         
            // update JWT of user in database
            const user = await db.collection("users").findOne({
                email: email
            })

            if (user == null) {
                result.json({
                    status: "error",
                    message: "Email does not exists."
                })

                return
            }

            const minimum = 0
            const maximum = 999999
            const randomNumber = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum

            await db.collection("users").findOneAndUpdate({
                _id: user._id
            }, {
                $set: {
                    code: randomNumber
                }
            })

            const emailHtml = "Your password reset code is: <b style='font-size: 30px;'>" + randomNumber + "</b>."
            const emailPlain = "Your password reset code is: " + randomNumber + "."

            transport.sendMail({
                from: nodemailerFrom,
                to: email,
                subject: "Password reset code",
                text: emailPlain,
                html: emailHtml
            }, function (error, info) {
                console.log("Mail sent: ", info)
            })
         
            result.json({
                status: "success",
                message: "A verification code has been sent on your email address."
            })
        })

        // route for logout request
        app.post("/logout", auth, async function (request, result) {
            const user = request.user
         
            // update JWT of user in database
            await db.collection("users").findOneAndUpdate({
                _id: user._id
            }, {
                $set: {
                    accessToken: ""
                }
            })
         
            result.json({
                status: "success",
                message: "Logout successfully."
            })
        })

        app.post("/getUser", auth, async function (request, result) {
            const user = request.user
         
            result.json({
                status: "success",
                message: "Data has been fetched.",
                user: user
            })
        })

        // route for login requests
        app.post("/login", async function (request, result) {
         
            // get values from login form
            const email = request.fields.email
            const password = request.fields.password

            if (!email || !password) {
                result.json({
                    status: "error",
                    message: "Please fill all fields."
                })

                return
            }
         
            // check if email exists
            const user = await db.collection("users").findOne({
                email: email
            })
         
            if (user == null) {
                result.json({
                    status: "error",
                    message: "Email does not exists."
                })

                return
            }

            if (!user.isVerified) {
                result.json({
                    status: "verificationRequired",
                    message: "Please verify your email first."
                })

                return
            }

            // check if password is correct
            const isVerify = await bcryptjs.compareSync(password, user.password)

            if (isVerify) {
         
                // generate JWT of user
                const accessToken = jwt.sign({
                    userId: user._id.toString()
                }, jwtSecret)
     
                // update JWT of user in database
                await db.collection("users").findOneAndUpdate({
                    email: email
                }, {
                    $set: {
                        accessToken: accessToken
                    }
                })
     
                result.json({
                    status: "success",
                    message: "Login successfully.",
                    accessToken: accessToken,
                    user: {
                        _id: user._id,
                        name: user.name,
                        email: user.email
                    }
                })
     
                return
            }
     
            result.json({
                status: "error",
                message: "Password is not correct."
            })
        })

        app.post("/registration", async function (request, result) {
            const name = request.fields.name
            const email = request.fields.email
            const password = request.fields.password
            const createdAt = new Date().getTime()
     
            if (!name || !email || !password) {
                result.json({
                    status: "error",
                    message: "Please enter all values."
                })

                return
            }
     
            // check if email already exists
            const user = await db.collection("users").findOne({
                email: email
            })
     
            if (user != null) {
                result.json({
                    status: "error",
                    message: "Email already exists."
                })

                return
            }

            const salt = bcryptjs.genSaltSync(10)
            const hash = await bcryptjs.hashSync(password, salt)

            const minimum = 0
            const maximum = 999999
            const verificationToken = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum
            
            // insert in database
            await db.collection("users").insertOne({
                name: name,
                email: email,
                password: hash,
                accessToken: "",
                verificationToken: verificationToken,
                isVerified: false,
                createdAt: createdAt
            })

            const emailHtml = "Your email verification code is: <b style='font-size: 30px;'>" + verificationToken + "</b>."
            const emailPlain = "Your email verification code is: " + verificationToken + "."

            transport.sendMail({
                from: nodemailerFrom,
                to: email,
                subject: "Email verification",
                text: emailPlain,
                html: emailHtml
            }, function (error, info) {
                console.log("Email sent: ", info)
            })
 
            result.json({
                status: "success",
                message: "Please enter the verification code sent on your email address."
            })
        })
    })
 
})