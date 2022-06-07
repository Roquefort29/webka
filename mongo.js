const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const ejs = require('ejs');
const UsersSchema = require('./models/Users');
const AdminSchema = require('./models/Admins')
const ItemSchema = require('./models/Item')
const CartSchema = require('./models/Cartts')
const CategoriesSchema = require('./models/Categories')
const cookieParser = require('cookie-parser');
const path = require("path");


const app = express();

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(bodyParser.json());
app.use(express.static('static'))
app.use(bodyParser.urlencoded({ extended: true}))
app.use(cookieParser())


app.get('/add_item', (req, res) => {
    res.sendFile(__dirname + '/html/add_item.html')
});

mongoose.connect('mongodb+srv://roquefort:SuperSyr29@cluster0.wsvfe.mongodb.net/?retryWrites=true&w=majority',{
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

app.get('/admins_item', async (req,res) => {
    let items = await ItemSchema.find().lean();
    res.render('admins_item', {item: items})
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
    await UsersSchema.deleteOne({username: username})
    return res.redirect('/admins')
})

app.get('/delete_item/:title', async (req,res) =>{
    let title = req.params.title;
    await ItemSchema.deleteOne({title: title})
    return res.redirect('/admins_item')
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
app.get('/add_item', async (req,res) => {
    res.sendFile(__dirname + '/html/add_item.html')
})

app.post('/add_item', async (req, res) => {

    let title = req.body.title;
    let path_to_image = req.body.path_to_image;
    let price = req.body.price;
    let category = req.body.category;

    let category_id = await CategoriesSchema.findOne({name: category}).lean();
    let item = {
        "title": title,
        "image": path_to_image,
        "price": price,
        "category": category_id.id
    }

    await ItemSchema.create(item);

    return res.redirect('/admins_item')
})

app.get('/add_to_cart', async (req, res) => {
    let item_id = req.query.item_id;
    let userLogin = req.cookies.user.username;
    console.log(item_id)

    await CartSchema.create({username: userLogin, item_id: item_id}).then()
    return res.redirect('back')
})

app.get('/bags', async (req, res) => {
    let items = await ItemSchema.find({category: 5}).lean();
    res.render('bags', {items: items})
})

app.get('/profile', async (req, res) => {
    res.render('profile', {user: req.cookies.user})
})

app.get('/manga', async (req, res) => {
    let items = await ItemSchema.find({category: 2}).lean();
    res.render('manga', {items: items})
})

app.get('/reports', (req,res) => {
    res.sendFile( __dirname + '/html/reports.html')
})

app.get('/pillow', async (req, res) => {
    let items = await ItemSchema.find({category: 3}).lean();
    res.render('pillow', {items: items})
})

app.get('/futbolka', async (req, res) => {
    let items = await ItemSchema.find({category: 4}).lean();
    res.render('t-shirts', {items: items})
})

app.get('/figure', async (req, res) => {
    let items = await ItemSchema.find({category: 1}).lean();
    res.render('figure', {items: items})
})

app.get('/main', (req,res) => {
    res.render('main');
})

app.get('/carts', async (req, res) => {
    let items = await CartSchema.find({username: req.cookies.user.username}).lean()
    let a = []

    for(var i = 0; i < items[0].item_id.length; i++){
        let b = await ItemSchema.find({_id:items[0].item_id[i]})
        a.push(b[0])
    }
    console.log(a)
    res.render('carttss', {items: a})
})

app.get("/", function (req,res){
    res.set({
        "Allow-access-Allow-Origin": '*'
    })
    return res.redirect('/register')
})

app.listen(process.env.PORT || 2929, function () {
    console.log("Server Started");
})