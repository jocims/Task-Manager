/**
 * Tasks Schema  - Model 
 */
const mongoose = require('mongoose');

const TasksSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    // with auth
    _studentId: {
        type: mongoose.Types.ObjectId,
        required: true
    }

})

const Tasks = mongoose.model('Tasks', TasksSchema);

module.exports = { Tasks }