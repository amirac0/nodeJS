 /* require = comme un import */ // là on charge le module HTTP qui permet la création d'un server ss nodeJS



 //var serv = http.createServer(function(req, res) { //ici on crée le serveur // la fonction anonyme est appelée à chaque qu'un utilisateur va sur mon site //req c'est l'utilisateur qui demande à se connecter su rnotre site
 // affiche le console log dans l'interface serveur et non dans lre navigateur
 // console.log(req.url); //pour récupérer le chemin dans l'url
 //res.writeHead(200, { "Content-Type": "application/json" }); // res = reponse; req = requête // c'est la def du code error // voir su google liste des codes http
 //res.end("<p><b>oui je suis là</b></p>"); // c'est comme un echo en php // écriture sur la page
 // là avec le 2 ème paramètre content type, on lui dit qu'on envoie du json 
 //     if (req.url == "/") {
 //         res.end("yep");
 //     } else if (req.url == "/user") {
 //         res.writeHead(200, { "Content-Type": "application/json" });
 //         res.end(JSON.stringify(user));
 //     } else {
 //         res.sendFile(__dirname + '/index.html'); //dirname = dossier courant
 //     }
 // })

 // serv.listen(8080); // lancement du serveur sous un port

 const http = require('http'),
     //url = require('url'),
     express = require('express'), // c'est ce qui permet d'accéder à la route
     //mysql = require('mysql'),
     mongoose = require('mongoose'),
     bodyParser = require('body-parser'),
     app = express(),
     bcryptjs = require('bcryptjs'), //pour le cryptage du password
     jsonParser = bodyParser.urlencoded({ extended: false }); // middleware qui se déclanche avant le lancement de la function (ici, avant les fonctions liées au route pour parser les data envoyées par le client)

 /*  connexion database sql
 // var connection = mysql.createConnection({
 //     host: 'localhost',
 //     user: 'root',
 //     password: '',
 //     database: 'mydb'
 // });

 // connection.connect();
 */


 /*
  //connexion MongoDb
  //mogodb://<adresse du serveur>:<port du serveur mongodb>/<nom de la database>
 */
 mongoose.connect('mongodb://localhost:27017/kerioui', function(err) {
     var data = (err) ? err : 'Connexion au mongo avec succès';
     console.log(data);
 })

 /* création des schémas : c'est la structure de nos données. Les schémas permettent de définir les attributs données insérées 
  * { type: Date, default: Date.now } permet de définir une valeur par défaut
  */

 var userSchema = mongoose.Schema({
     // l'id est géré par mongo
     email: String,
     password: String,
     firstname: String,
     lastname: String,
     avatar: String,
     status: { type: Number, default: 1 },
     /* pour la traçabilité des données */
     createdAt: { type: Date, default: Date.now },
     updatedAt: { type: Date, default: Date.now }
 })

 var userModel = mongoose.model('Users', userSchema); // model permet la mise en relation entre les collections et les schémas

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

 var user = { email: "amira.kerioui@hotmail.fr", password: "mira", firstname: "mira", lastname: "kerioui", avatar: "mira.jpg", status: "1" };

 app.get('/', function(req, res) {
     /* création d'une instance, on a besoin de "new" */ // nouvelle instance de model avec en paramètre dans le constructeur, un objet permettant lla création d'une nouvelle entité avec les caractéristiques de l'objet inséré
     var newUser = new userModel(user); /* instancier le user */
     newUser.save(function() { // Sauvegarde de l'instance 
         console.log("User registered")
     });
     res.sendFile(__dirname + '/index.html'); //dirname = dossier courant // pour afficher la page index.html
 })

 //  app.get('/user', function(req, res) {
 //      connection.query('SELECT * FROM users', function(error, results, fields) {
 //          if (error) throw error;
 //          res.writeHead(200, { "Content-Type": "application/json" });
 //          res.end(JSON.stringify(results));
 //          console.log('The solution is: ', results[0]._id); //[0]._id pour récupérer l'id du premier utilisateur 
 //      });
 //  })

 app.get('/user', function(req, res) {
     res.sendFile(__dirname + '/add-users.html'); //pour afficher la page addUser.html
 })
 app.post('/user', jsonParser, function(req, res) {
     userModel.findOne({ email: req.body.email }, function(err, data) {
         if (err) {
             return res.json({
                 error: true,
                 httpCode: 502,
                 messageErro: err
             })
         }
         if (data != null) {
             return res.json({
                 error: true,
                 httpCode: 402,
                 messageErro: "Mail already exists"
             })
         }

         res.writeHead(200, { "Content-Type": "application/json" });
         //user._id = 2;
         bcryptjs.genSalt(10, (err, salt) => { // promesse asynchrone qui permet de créer le salt (grain de sel) qui permet le cryptage du password
             bcryptjs.hash(req.body.password, salt, (err, passwordCrypt) => { //cryptage du password avec le salt
                 var myUser = { email: req.body.email, password: passwordCrypt, firstname: req.body.firstname, lastname: req.body.lastname, avatar: req.body.avatar };
                 var newUser = new userModel(myUser); /* initialisation d'un objer user */
                 newUser.save(function() {
                     console.log("User registered2")
                 });
                 console.log(req.body.passwordCrypt);
                 res.end(JSON.stringify(myUser));
                 //var dataBrut = url.parse(req.url).query; // dans req.url, toutes les data sont envoyés
                 //console.log(dataBrut);
             })
         })
     })
 })

 app.post('/login', jsonParser, function(req, res) {
     res.writeHead(200, { "Content-Type": "application/json" });
     //userModel.find()({email: req.body.email},function(){}) - recherche d'un ensemble d'utilisateurs ayant la même adresse mail req.body.email

     userModel.findOne({ email: req.body.email }, function(err, data) { // recherche d'un seul utilisateur utilisant le mail req-body-email
         if (err) {
             return res.end(JSON.parse({
                 error: true,
                 httpCode: 502,
                 messageError: err
             }))
         } else {
             if (data != null) {
                 console.log("it's ok")
             } else {
                 return res.end(JSON.parse({
                     error: true,
                     httpCode: 402,
                     messageError: "no user using this email"
                 }))
             }
         }
     })
 })

 app.delete('/user', function(req, res) {
     res.writeHead(200, { "Content-Type": "application/json" });
     res.end(JSON.stringify({}));
 })

 app.listen(8080, function() {
     console.log('Example app listening on port 8080!')
 })