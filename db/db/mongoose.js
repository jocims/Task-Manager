/**
 * CONNECT TO DATABASE - MONGOOSE 
 */
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TaskManager', { useNewUrlParser: true }).then(() => {
    console.log("Connected to database sucessfully :)");
    
}).catch((e) => {
    console.log("Error connecting to Database");
    console.log(e);
});

module.exports = {
    mongoose
};