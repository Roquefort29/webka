const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const hbs = require("express-hbs");
const UsersSchema = require('./models/Users');
const AdminSchema = require('./models/Admins')
const ItemSchema = require('./models/Item')
const CategoriesSchema = require('./models/Categories')
const cookieParser = require('cookie-parser');

const app = express();

app.engine('hbs', hbs.express4({partialsDir: __dirname + '/views'}));

app.use(bodyParser.json());
app.use(express.static('static'))
app.use(bodyParser.urlencoded({ extended: true}))
app.use(cookieParser())

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

hbs.registerHelper("inc", function(value, options)
{
    return parseInt(value) + 1;
});

app.get('/add_item', (req, res) => {
    res.sendFile(__dirname + '/html/add_item.html')
});

mongoose.connect('mongodb://127.0.0.1:27017/RegForm',{
    useNewUrlParser:true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error',()=>console.log("Error to connection"));
db.once('open',()=>console.log("Connected to Database"));

app.get('/register', (req,res) => {
    res.sendFile( __dirname + '/html/register.html')
})

app.post("/register", async (req, res) => {
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;
    let password_confirm = req.body.password_confirm;

    if(password !== password_confirm){
        return res.send("Passwords didn't match");
    }

    if(await UsersSchema.findOne({email: email}).lean() !== null){
        return res.send("Email already taken")
    }

    if(await UsersSchema.findOne({username: name}).lean() !== null){
        return res.send("Username already taken")
    }

    if (password.toUpperCase() === password) {
        return res.send("Password does not contain small letters");
    }
    if(password.toLowerCase() === password){
        return res.send("Password doesn't contain capital letters")
    }

    if(password.search(".") === -1 || password.search("_") === -1){
        return res.send("Password does not contain special contains")
    }
    if(password.length < 7){
        return res.send("Password less than 7 symbols")
    }
    let data = {
        "username": name,
        "email": email,
        "city": "test",
        "password": password
    }

    await UsersSchema.create(data);

    return res.redirect('/login');
})


app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/html/login.html')
})

app.post('/login', async (req, res) => {
    let username = req.body.name;
    let password = req.body.password;
    let user = await UsersSchema.findOne({username: username, password:password}).lean()

    if (user === null) {
        return res.send("Username or password is wrong")
    }

    res.cookie("user", user)

    if(await AdminSchema.findOne({username: username}).lean() !== null){
        return res.redirect('/admins')
    }
    return res.redirect('/profile')
})

app.get('/admins', async (req, res) => {
    let users = await UsersSchema.find().lean();
    res.render('admins', {users: users})
})

app.get('/sort_by_username', async (req, res) => {
    let users = await UsersSchema.find().sort({username: 'asc'}).lean();
    res.render('admins', {users: users})
})


app.get('/sort_by_email', async (req, res) => {
    let users = await UsersSchema.find().sort({email: 'asc'}).lean();
    res.render('admins', {users: users})
})

app.get('/sort_by_city', async (req, res) => {
    let users = await UsersSchema.find().sort({city: 'asc'}).lean();
    res.render('admins', {users: users})
})

app.get('/add_user', (req, res)=>{
    res.sendFile(__dirname + '/html/add_user.html')
})

app.post('/add_user', async (req, res) => {
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;
    let password_confirm = req.body.password_confirm;

    if (password !== password_confirm) {
        return res.send("Passwords didn't match");
    }

    if (await UsersSchema.findOne({email: email}).lean() !== null) {
        return res.send("Email already taken")
    }

    if (await UsersSchema.findOne({username: name}).lean() !== null) {
        return res.send("Username already taken")
    }

    if (password.toUpperCase() === password) {
        return res.send("Password does not contain small letters");
    }
    if (password.toLowerCase() === password) {
        return res.send("Password doesn't contain capital letters")
    }

    if (password.search(".") === -1 || password.search("_") === -1) {
        return res.send("Password does not contain special contains")
    }

    if (password.length < 7) {
        return res.send("Password less than 7 symbols")
    }
    let data = {
        "username": name,
        "email": email,
        "password": password
    }

    await UsersSchema.create(data);

    return res.redirect('/admins');
})

app.get('/delete_user/:username', async (req, res) => {
    let username = req.params.username;
    console.log(username)
    await UsersSchema.deleteOne({username: username})
    return res.redirect('/admins')
})

app.get('/edit_user/:username', async (req, res) => {
    let username = req.params.username;
    let user = await UsersSchema.findOne({username:username}).lean()
    return res.render('edit', {user:user})
})

app.post('/edit_user/:username', async(req, res) => {
    let username = req.params.username;

    let new_username = req.body.name;
    let new_email = req.body.email;
    let new_city = req.body.city;

    await UsersSchema.updateOne({username: username}, {username: new_username, email: new_email, city: new_city});

    return res.redirect('/admins')
})

app.post('/add_item', async (req, res) => {

    let title = req.body.title;
    let description = req.body.description;

    let iteee = {
        "title": title,
        "description": description
    }

    await ItemSchema.create(iteee);

    return res.redirect('/admins')
})


app.get('/bags', (req,res) => {
    res.sendFile( __dirname + '/html/bags.html')
})

app.get('/profile', async (req, res) => {
    res.render('profile', {user: req.cookies.user})
})

app.get('/manga', (req,res) => {
    res.sendFile( __dirname + '/html/manga.html')
})

app.get('/reports', (req,res) => {
    res.sendFile( __dirname + '/html/reports.html')
})

app.get('/pillow', (req,res) => {
    res.sendFile( __dirname + '/html/pillow.html')
})

app.get('/futbolka', (req,res) => {
    res.sendFile( __dirname + '/html/futbolka.html')
})

app.get('/figure', async (req, res) => {
    let items = await ItemSchema.find().lean();
    res.render('figure', {items: items})
})

app.get('/main', (req,res) => {
    res.sendFile( __dirname + '/html/index.html')
})

app.get('/carts', (req,res) =>{
    res.sendFile(__dirname + '/html/cart.html')
})

app.get("/", function (req,res){
    res.set({
        "Allow-access-Allow-Origin": '*'
    })
    return res.redirect('/register')
})

app.listen(2929, function () {
    console.log("Server Started");
})