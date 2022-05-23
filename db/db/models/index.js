/**
 * Import all models 
 */

const { Tasks } = require('./tasks.model');
const { Task } = require('./task.model');
const { Student } = require('./student.model');


module.exports = {
    Tasks,
    Task,
    Student
}