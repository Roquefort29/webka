const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const ejs = require('ejs');
const UsersSchema = require('./models/Users');
const ItemSchema = require('./models/Item')
const CartSchema = require('./models/Carts')
const CategoriesSchema = require('./models/Categories')
const HistorySchema = require('./models/Histories')
const cookieParser = require('cookie-parser');
const path = require("path");


const app = express();

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(bodyParser.json());
app.use(express.static('static'))
app.use(bodyParser.urlencoded({ extended: true}))
app.use(cookieParser())


const db = mongoose.connection;

db.on('error',()=>console.log("Error to connection"));
db.once('open',()=>console.log("Connected to Database"));

mongoose.connect('mongodb+srv://roquefort:SuperSyr29@cluster0.wsvfe.mongodb.net/?retryWrites=true&w=majority',{
    useNewUrlParser:true,
    useUnifiedTopology: true
});


app.get("/", function (req,res){
    return res.redirect('/main')
})

app.get('/login', (req, res) => {
    res.render('login', {user: req.cookies.user});
})

app.post('/login', async (req, res) => {
    let username = req.body.name;
    let password = req.body.password;
    let user = await UsersSchema.findOne({username: username, password:password}).lean()

    if (user === null) {
        return res.send("Username or password is wrong")
    }

    res.cookie("user", user)

    return res.redirect('/profile')
})

app.get('/register', (req,res) => {
    res.render('register', {user: req.cookies.user})
})

app.get('/logout', (req, res) => {
    res.clearCookie('user');
    return res.redirect('/login');
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

app.get('/profile', async (req, res) => {
    if (req.cookies.user === undefined) return res.redirect('/login');
    res.render('profile', {user: req.cookies.user})
})

app.get('/main', (req,res) => {
    res.render('main', {user: req.cookies.user});
})

app.get('/figure', async (req, res) => {
    let items = await ItemSchema.find({category: 1}).lean();
    res.render('item_page', {user: req.cookies.user, items: items})
})

app.get('/manga', async (req, res) => {
    let items = await ItemSchema.find({category: 2}).lean();
    res.render('item_page', {user: req.cookies.user, items: items})
})

app.get('/pillow', async (req, res) => {
    let items = await ItemSchema.find({category: 3}).lean();
    res.render('item_page', {user: req.cookies.user, items: items})
})

app.get('/futbolka', async (req, res) => {
    let items = await ItemSchema.find({category: 4}).lean();
    res.render('item_page', {user: req.cookies.user, items: items})
})

app.get('/bags', async (req, res) => {
    let items = await ItemSchema.find({category: 5}).lean();
    res.render('item_page', {user: req.cookies.user, items: items})
})


app.get('/users', async (req, res) => {
    if (req.cookies.user === undefined) return res.redirect('/main');

    if(!req.cookies.user.is_admin) return res.redirect('/main');

    let users = await UsersSchema.find().lean();
    res.render('users', {user: req.cookies.user, users: users})
})

app.get('/sort_by_username', async (req, res) => {
    if (req.cookies.user === undefined) return res.redirect('/main');

    if(!req.cookies.user.is_admin) return res.redirect('/main');

    let users = await UsersSchema.find().sort({username: 'asc'}).lean();
    res.render('users', {user: req.cookies.user, users: users})
})

app.get('/sort_by_email', async (req, res) => {
    if (req.cookies.user === undefined) return res.redirect('/main');

    if(!req.cookies.user.is_admin) return res.redirect('/main');

    let users = await UsersSchema.find().sort({email: 'asc'}).lean();
    res.render('users', {user: req.cookies.user, users: users})
})

app.get('/edit_user/:username', async (req, res) => {
    let username = req.params.username;
    let edited_user = await UsersSchema.findOne({username:username}).lean()
    return res.render('edit', {user: req.cookies.user, edited_user: edited_user})
})

app.post('/edit_user/:username', async(req, res) => {
    let username = req.params.username;

    let new_username = req.body.name;
    let new_email = req.body.email;

    await UsersSchema.updateOne({username: username}, {username: new_username, email: new_email});

    return res.redirect('/users')
})

app.get('/delete_user/:username', async (req, res) => {
    let username = req.params.username;
    await UsersSchema.deleteOne({username: username})
    return res.redirect('/users')
})

app.get('/items', async (req, res) => {
    if (req.cookies.user === undefined) return res.redirect('/main');

    if(!req.cookies.user.is_admin) return res.redirect('/main');

    let items = await ItemSchema.find().lean();
    res.render('items', {user: req.cookies.user, items: items})
})

app.get('/delete_item/:title', async (req,res) =>{
    let title = req.params.title;
    await ItemSchema.deleteOne({title: title})
    return res.redirect('/items')
})

app.get('/add_to_cart', async (req, res) => {
    let item_id = req.query.item_id;
    let user = req.cookies.user

    let user_items = await CartSchema.findOne({username: user.username}).lean()

    if (user_items === null) {
        await CartSchema.create({username: user.username, items: [item_id]})
    } else {
        user_items.items.push(item_id)
        await CartSchema.updateOne({username: user.username}, {items: user_items.items})
    }

    return res.redirect('back')
})

app.get('/carts', async (req, res) => {
    if (req.cookies.user === undefined) return res.redirect('/main');

    let user_items = await CartSchema.findOne({username: req.cookies.user.username}).lean()

    let items = {}
    if (user_items !== null) items = await init_items(user_items.items)

    let total = 0;
    Object.keys(items).forEach(function (key) {
        total += items[key].total;
    })

    res.render('carts', {user: req.cookies.user, items: items, total: total})
})

app.get('/delete_from_cart', async (req, res) => {
    let item_id = req.query.item_id
    let user = req.cookies.user
    let user_items = await CartSchema.findOne({username: user.username}).lean()

    let index = user_items.items.indexOf(item_id);
    if (index > -1) {
        user_items.items.splice(index, 1); // 2nd parameter means remove one item only
    }

    await CartSchema.updateOne({username: user.username}, {items: user_items.items})

    return res.redirect('back')
})

app.get('/order', (req, res) => {
    res.render('order', {user: req.cookies.user})
})

app.get('/ordered', async (req, res) => {
    let user = req.cookies.user
    let user_items = await CartSchema.findOne({username: user.username})
    await HistorySchema.create({username: user.username, items: user_items.items})
    await CartSchema.deleteOne({username: req.cookies.user.username })



    return res.redirect('/main')
})

app.get('/history', async (req, res) => {
    let user = req.cookies.user
    let history = await HistorySchema.find({username: user.username}).lean()

    let tmp = []
    for (let i = 0; i < history.length; i++) {
        let x = {items: await init_items(history[i].items)}
        x.date = history[i].date
        x.total = 0;
        Object.keys(x.items).forEach(function (key) {
            x.total += x.items[key].total;
        })
        tmp.push(x)
    }

    res.render('history', {user: user, history: tmp})
})



async function init_items(user_items) {
    let items = {}

    if (user_items !== undefined) {
        for (let i = 0; i < user_items.length; i++) {
            if (items[user_items[i]] === undefined) {
                items[user_items[i]] = {count: 0};
                items[user_items[i]].item = await ItemSchema.findOne({_id: user_items[i]})
            }
            items[user_items[i]].count++;
            items[user_items[i]].total = items[user_items[i]].item.price * items[user_items[i]].count;
        }
    }

    return items;
}

app.get('/add_user', (req, res)=>{
    res.render('add_user', {user: req.cookies.user})
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

    return res.redirect('/users');
})

app.get('/add_item', async (req,res) => {
    res.render('add_item', {user: req.cookies.user})
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

app.listen(process.env.PORT || 2929, function () {
    console.log("Server Started");
})