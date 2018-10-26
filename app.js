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

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html')
})

app.get('/add-user', function(req, res) {
    res.sendFile(__dirname + '/add-user.html')
})

app.get('/user', function(req, res) {
    userModel.find({}, function(err, data) {
        return (err) ? sendJson(res, 501, err) : (data == null) ? sendJson(res, 204, "No user found") : sendJson(res, 200, data);
    })
})

app.get('/user/:id', function(req, res) {
    userModel.findOne({ _id: req.params.id }, function(err, data) {
        return (err) ? sendJson(res, 501, err) : (data != null) ? sendJson(res, 200, data) : sendJson(res, 402, "No user found");
    })
})

app.post('/user', jsonParser, function(req, res) {
    userModel.findOne({ email: req.body.email }, function(err, data) {
        var err = (err) ? sendJson(res, 501, err) : (data != null) ? sendJson(res, 203, "User already exists") : false;
        if (err === false)
            bcryptjs.genSalt(10, (err, salt) => {
                bcryptjs.hash(req.body.password, salt, (err, passwordCrypt) => {
                    new userModel({ firstName: req.body.firstName, lastname: req.body.lastname, email: req.body.email, password: passwordCrypt, avatar: "toto.png" }).save(sendJson(res, 201, "User created"))
                })
            })
        else
            return err;
    })
})

app.put('/user', jsonParser, function(req, res) {
    userModel.updateOne({ _id: req.body.id }, ElemUpdate(req.body), function(err) {
        return (err || req.body.id === undefined) ? sendJson(res, 502, err) : sendJson(res, 200, "User updated")
    })
})

app.post('/login', jsonParser, function(req, res) {
    userModel.findOne({ email: req.body.email }, function(err, data) {
        var error = (err) ? sendJson(res, 501, err) : (data === null) ? sendJson(res, 402, "No user found") : false;
        if (error)
            bcryptjs.compare(req.body.password, data.password, function(err, reponse) {
                (reponse) ? sendJson(res, 402, "No user found"): sendJson(res, 200, data)
            })
        return error
    })
})

app.delete('/user', function(req, res) {
    userModel.deleteMany({}, function(err) {
        return (err) ? sendJson(res, 502, err) : sendJson(res, 200, "All users have been removed")
    })
})

app.delete('/user/:id', function(req, res) {
    userModel.findByIdAndDelete({ _id: req.params.id }, function(err, data) {
        return (err) ? sendJson(res, 501, err) : (data == null) ? sendJson(res, 402, "No user found") : sendJson(res, 200, "User deleted");
    })
})

/**
 * sendJson -
 * @param res {Object}
 * @param code {integer}
 * @param data {Any}
 * return res
 */

function sendJson(res, code = 200, data = "") {
    res.status(code)
    if (code === 200 || code === 201) {
        return res.json({
            error: false,
            httpCode: code,
            users: data
        })
    }
    return res.json({
        error: true,
        httpCode: code,
        messageError: data
    })
}

function userUpdate(data, key = ["firstName", "lastname", "password", "avatar"]) {
    var user = Object.create(null);
    for (let i = 0; i < key.length; i++)
        if (Object.prototype.hasOwnProperty.call(data, key[i])) // la méthode hasOwnProperty va e permettre de voir si les keys existent dans mon objet key7
            user[key[i]] = data[key[i]];
    user.updatedAt = new Date();
    return user;
}

app.listen(8080, function() {
    console.log('Example app listening on port 8080!')
})