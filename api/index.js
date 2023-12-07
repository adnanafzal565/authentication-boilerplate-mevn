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
app.use(expressFormidable({
    multiples: true
}))
app.use("/public", express.static(__dirname + "/public"))
app.use("/uploads", express.static(__dirname + "/uploads"))
app.set("view engine", "ejs")

const fs = require("fs")
const bcryptjs = require("bcryptjs")

// JWT used for authentication
const jwt = require("jsonwebtoken")
// secret JWT key
global.jwtSecret = "jwtSecret1234567890"
global.mainURL = "http://localhost:3000"
global.connectionString = "mongodb://localhost:27017"

const auth = require("./modules/auth")

const nodemailer = require("nodemailer")
global.nodemailerFrom = "support@adnan-tech.com"
global.transport = nodemailer.createTransport({
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
    MongoClient.connect(connectionString, function (error, client) {
        if (error) {
            console.error(error)
            return
        }
 
        // database name
        global.db = client.db("boilerplate_auth")
        console.log("Database connected")

        app.post("/change-password", auth, async function (request, result) {
            const user = request.user
            const password = request.fields.password
            const newPassword = request.fields.newPassword
            const confirmPassword = request.fields.confirmPassword

            if (!password || !newPassword || !confirmPassword) {
                result.json({
                    status: "error",
                    message: "Please fill all fields."
                })

                return
            }

            if (newPassword != confirmPassword) {
                result.json({
                    status: "error",
                    message: "Password mis-match."
                })

                return
            }

            // check if password is correct
            const isVerify = await bcryptjs.compareSync(password, user.password)

            if (!isVerify) {
                result.json({
                    status: "error",
                    message: "In-correct password."
                })

                return
            }

            const salt = bcryptjs.genSaltSync(10)
            const hash = await bcryptjs.hashSync(newPassword, salt)
 
            await db.collection("users").findOneAndUpdate({
                _id: user._id
            }, {
                $set: {
                    password: hash
                }
            })

            result.json({
                status: "success",
                message: "Password has been changed."
            })
        })

        app.post("/save-profile", auth, async function (request, result) {
            const user = request.user
            const name = request.fields.name || ""

            if (!name) {
                result.json({
                    status: "error",
                    message: "Please fill all fields."
                })

                return
            }

            if (Array.isArray(request.files.profileImage)) {
                result.json({
                    status: "error",
                    message: "Only 1 file is allowed."
                })

                return
            }

            const profileImage = request.files.profileImage
            let profileImageObj = user.profileImage || {}

            // const files = []
            // if (Array.isArray(request.files.profileImage)) {
            //     for (let a = 0; a < request.files.profileImage.length; a++) {
            //         if (request.files.profileImage[a].size > 0) {
            //             files.push(request.files.profileImage[a])
            //         }
            //     }
            // } else if (request.files.profileImage.size > 0) {
            //     files.push(request.files.profileImage)
            // }

            if (profileImage?.size > 0) {

                const tempType = profileImage.type.toLowerCase()
                if (!tempType.includes("jpeg") && !tempType.includes("jpg") && !tempType.includes("png")) {
                    result.json({
                        status: "error",
                        message: "Only JPEG, JPG or PNG is allowed."
                    })
                    return
                }

                if (await fs.existsSync(profileImageObj.path))
                    await fs.unlinkSync(profileImageObj.path)

                const fileData = await fs.readFileSync(profileImage.path)
                const fileLocation = "uploads/profiles/" + (new Date().getTime()) + "-" + profileImage.name
                await fs.writeFileSync(fileLocation, fileData)
                await fs.unlinkSync(profileImage.path)

                profileImageObj = {
                    size: profileImage.size,
                    path: fileLocation,
                    name: profileImage.name,
                    type: profileImage.type
                }
            }

            await db.collection("users")
                .findOneAndUpdate({
                    _id: user._id
                }, {
                    $set: {
                        name: name,
                        profileImage: profileImageObj
                    }
                })

            result.json({
                status: "success",
                message: "Profile has been updated.",
                profileImage: profileImageObj
            })
        })

        app.post("/verify-account", async function (request, result) {
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

                // $unset: {
                //     verificationToken: ""
                // }
            })

            result.json({
                status: "success",
                message: "Account has been account. Kindly login again."
            })
        })

        app.post("/reset-password", async function (request, result) {
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

        app.post("/send-password-recovery-email", async function (request, result) {
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

        app.post("/me", auth, async function (request, result) {
            const user = request.user
         
            result.json({
                status: "success",
                message: "Data has been fetched.",
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    profileImage: user.profileImage
                }
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
                    userId: user._id.toString(),
                    time: new Date().getTime()
                }, jwtSecret, {
                    expiresIn: (60 * 60 * 24 * 30) // 30 days
                })
     
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
                        email: user.email,
                        profileImage: user.profileImage
                    }
                })
     
                return
            }
     
            result.json({
                status: "error",
                message: "Password is not correct."
            })
        })

        app.post("/register", async function (request, result) {
            const name = request.fields.name
            const email = request.fields.email
            const password = request.fields.password
            const createdAt = new Date().toUTCString()
     
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
                profileImage: {},
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

        app.get("/change-password", function (request, result) {
            result.render("change-password", {
                mainURL: mainURL
            })
        })

        app.get("/profile", function (request, result) {
            result.render("profile", {
                mainURL: mainURL
            })
        })

        app.get("/reset-password/:email", function (request, result) {
            result.render("reset-password", {
                mainURL: mainURL,
                email: request.params.email || ""
            })
        })

        app.get("/verify-email/:email", function (request, result) {
            result.render("verify-email", {
                mainURL: mainURL,
                email: request.params.email || ""
            })
        })

        app.get("/forgot-password", function (request, result) {
            result.render("forgot-password", {
                mainURL: mainURL
            })
        })

        app.get("/profile", function (request, result) {
            result.render("profile", {
                mainURL: mainURL
            })
        })

        app.get("/register", function (request, result) {
            result.render("register", {
                mainURL: mainURL
            })
        })

        app.get("/login", function (request, result) {
            result.render("login", {
                mainURL: mainURL
            })
        })

        app.get("/", function (request, result) {
            result.render("index", {
                mainURL: mainURL
            })
        })

        // app._router.stack.forEach(function(r){
        //     if (r.route){
        //         console.log({
        //             path: r.route.path,
        //             method: r.route.methods.post ? "POST" : "GET"
        //         })
        //     }
        // })
    })
 
})