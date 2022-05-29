const mongoose = require('mongoose')

const ItemSchema = new mongoose.Schema({
    title: {type: String, required: true},
    image: {type: String, required: true},
    price: {type: Number, required: true},
    category: {type: Number, required: true}
}, {collection: 'item'})

const model = mongoose.model('ItemSchema', ItemSchema)

module.exports = model;