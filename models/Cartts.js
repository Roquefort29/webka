const mongoose = require('mongoose')

const CartSchema = new mongoose.Schema({
    username: {type: String, required: true},
    item_id: {type: Number, required: true}
}, {collection: 'cart'})

const model = mongoose.model('CartSchema', CartSchema)

module.exports = model;
