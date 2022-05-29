const mongoose = require('mongoose')

const CategoriesSchema = new mongoose.Schema({
    id: {type: Number, required: true},
    name: {type: String, required: true}
}, {collection: 'categories'})

const model = mongoose.model('CategoriesSchema', CategoriesSchema)

module.exports = model;