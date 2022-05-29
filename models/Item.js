const mongoose = require('mongoose')

const ItemSchema = new mongoose.Schema({
    title: {type: String, required: true, unique: true},
    description: {type: String, required: true}
}, {collection: 'item'})

const model = mongoose.model('ItemSchema', ItemSchema)

module.exports = model;