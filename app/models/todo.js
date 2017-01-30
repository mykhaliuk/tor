let mongoose = require('mongoose');

let todoSchema = mongoose.Schema({
    user_id: String,
    content: String,
    updated_at: Date
});

module.exports = mongoose.model('Todo', todoSchema);