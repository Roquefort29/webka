const mongoose = require('mongoose')

const HistorySchema = new mongoose.Schema({
    username: {type: String, required: true},
    items: {type: Array, required: true},
    date: {type: Date, required: true, default: Date.now()}
}, {collection: 'histories'})

const model = mongoose.model('HistorySchema', HistorySchema)

module.exports = model;