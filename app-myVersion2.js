const express = require('express'),
    mongoose = require('mongoose'),
    bcryptjs = require('bcryptjs'),
    bodyParser = require('body-parser'),
    app = express(),
    jsonParser = bodyParser.urlencoded({ extended: false });

mongoose.connect("mongodb://localhost:27017/sylvestre", function(err) {
    console.log((err) ? err : 'Connection au mongo correct')
})

var userSchema = mongoose.Schema({
    firstName: String,
    lastname: String,
    email: String,
    password: String,
    avatar: String,
    status: { type: Number, default: 1 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
})
var userModel = mongoose.model('Users', userSchema);

var messageSchema = mongoose.Schema({
    message: String,
    user: userSchema,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
})
var messageModel = mongoose.model('Message', messageSchema);

var messagerieSchema = mongoose.Schema({
    sender: userSchema,
    receiver: userSchema,
    message: Array,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
})
var messagerieModel = mongoose.model('Messagerie', messagerieSchema);


var user = { firstName: "Sylvestre", lastname: "Mike", email: "mike.sylvestre@lyknowledge.io", password: "toto", avatar: "toto.png", status: 1 } // Element de Test


app.get('/', function(req, res) { //pour affiche rnotre page index.html
    res.sendFile(__dirname + '/index.html')
})

app.get('/add-user', function(req, res) { // sert à afficher un formulaire pour ajouter un utilisateur
    res.sendFile(__dirname + '/add-user.html')
})

app.get('/user', function(req, res) { // sert à afficher tous les utilisateurs 
    userModel.find({}, function(err, data) {
        if (err) {
            res.status(501)
            return res.json({
                error: true,
                httpCode: 501,
                messageError: err
            })
        }
        if (data == null) {
            res.status(204)
            return res.json({
                error: false,
                httpCode: 204,
                messageError: "No user found"
            })
        }
        res.status(200)
        return res.json(data)
    })
})

app.get('/user/:id', function(req, res) {
    console.log(req.params.id)
    userModel.findOne({ id: req.body.id }, function(err, data) {
        if (err) {
            res.status(501);
            return res.end(JSON.parse({
                error: true,
                httpCode: 501,
                messageError: err
            }))
        } else {
            if (data != null) {
                res.status(200);
                bcryptjs.compare(req.body.password, data.password, function(err, data) {
                    if (err) {
                        return res.json({
                            error: false,
                            httpCode: 200,
                            user: data
                        })
                    } else {
                        res.status(402);
                        return res.json({
                            error: true,
                            httpCode: 402,
                            messageError: "User not found"
                        })
                    }
                });
            } else {
                res.status(402);
                return res.end(JSON.parse({
                    error: true,
                    httpCode: 402,
                    messageError: "User not found"
                }))
            }
        }
    })
})

app.post('/user', jsonParser, function(req, res) { // pour ajouter => register 
    userModel.findOne({ email: req.body.email }, function(err, data) {
        if (err) {
            res.status(501);
            return res.json({
                error: true,
                httpCode: 501,
                messageError: err
            })
        }
        if (data != null) {
            res.status(203);
            return res.json({
                error: true,
                httpCode: 203,
                messageError: "Mail already exists"
            })
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        bcryptjs.genSalt(10, (err, salt) => {
            bcryptjs.hash(req.body.password, salt, (err, passwordCrypt) => {
                var myUser = {
                    firstName: req.body.firstName,
                    lastname: req.body.lastname,
                    email: req.body.email,
                    password: passwordCrypt,
                    avatar: "toto.png"
                }
                var newUser = new userModel(myUser);
                newUser.save(function() {
                    res.status(201);
                    return res.json({
                        error: false,
                        httpCode: 201,
                        messageError: newUser
                    })
                    console.log("User register")
                })
            })
        })
    })
})

app.post('/login', jsonParser, function(req, res) { // pour se connecter 
    userModel.findOne({ email: req.body.email }, function(err, data) {
        if (err) {
            res.status(501);
            return res.end(JSON.parse({
                error: true,
                httpCode: 501,
                messageError: err
            }))
        } else {
            if (data != null) {
                res.status(200);
                bcryptjs.compare(req.body.password, data.password, function(err, reponse) {
                    if (reponse) {
                        return res.json({
                            error: false,
                            httpCode: 200,
                            messageError: data
                        })
                    } else {
                        res.status(402);
                        return res.json({
                            error: true,
                            httpCode: 402,
                            messageError: "User not found"
                        })
                    }
                });
            } else {
                res.status(402);
                return res.end(JSON.parse({
                    error: true,
                    httpCode: 402,
                    messageError: "User not found"
                }))
            }
        }
    })
})

app.listen(8080, function() {
    console.log('Example app listening on port 8080!')
})