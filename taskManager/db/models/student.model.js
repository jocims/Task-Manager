/**
 * Student Schema  - Model 
 */
const mongoose = require('mongoose');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');


// JWT Secret
const jwtSecret = "51778657246321226641fsdklafjasdkljfsklfjd7148924065";

const StudentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    surname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    sessions: [{
        token: {
            type: String,
            required: true
        },
        expiresAt: {
            type: Number,
            required: true
        }
    }]
});

//Json Schema
StudentSchema.methods.toJSON = function () {
    const student = this;
    const studentObject = student.toObject();
    return _.omit(studentObject, ['password', 'sessions']);
}

StudentSchema.methods.generateAccessAuthToken = function () {
    const student = this;
    return new Promise((resolve, reject) => {
        // Create the JSON Web Token and return that
        jwt.sign({ _id: student._id.toHexString() }, jwtSecret, { expiresIn: "15m" }, (err, token) => {
            if (!err) {
                resolve(token);
            } else {
                // there is an error
                reject();
            }
        })
    })
}

// This method simply generates a 64byte hex string - it doesn't save it to the database. saveSessionToDatabase() does that.
StudentSchema.methods.generateRefreshAuthToken = function () {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(64, (err, buf) => {
            if (!err) {
                // no error
                let token = buf.toString('hex');

                return resolve(token);
            }
        })
    })
}

//Return fresh token when saved to DB sucessfully
StudentSchema.methods.createSession = function () {
    let student = this;
    return student.generateRefreshAuthToken().then((refreshToken) => {
        return saveSessionToDatabase(student, refreshToken);
    }).then((refreshToken) => {
        return refreshToken;
    }).catch((e) => {
        return Promise.reject('Failed to save session to database.\n' + e);
    })
}

//JWT
StudentSchema.statics.getJWTSecret = () => {
    return jwtSecret;
}

// finds user by id and token   
 // used in auth middleware (verifySession)
 StudentSchema.statics.findByIdAndToken = function (_id, token) {

    const Student = this;

    return Student.findOne({
        _id,
        'sessions.token': token
    });
}


StudentSchema.statics.findByCredentials = function (email, password) {
    let Student = this;
    return Student.findOne({ email }).then((student) => {
        if (!student) return Promise.reject();

        return new Promise((resolve, reject) => {
            bcrypt.compare(password, student.password, (err, res) => {
                if (res) {
                    resolve(student);
                }
                else {
                    reject();
                }
            })
        })
    })
}

StudentSchema.statics.hasRefreshTokenExpired = (expiresAt) => {
    let secondsSinceEpoch = Date.now() / 1000;
    if (expiresAt > secondsSinceEpoch) {
        // hasn't expired
        return false;
    } else {
        // has expired
        return true;
    }
}

//Salting Password
StudentSchema.pre('save', function (next) {
    let student = this;
    let costFactor = 10;

    if (student.isModified('password')) {
        // if the password field has been edited/changed then run this code. Generate salt and hash password
        bcrypt.genSalt(costFactor, (err, salt) => {
            bcrypt.hash(student.password, salt, (err, hash) => {
                student.password = hash;
                next();
            })
        })
    } else {
        next();
    }
});

let saveSessionToDatabase = (student, refreshToken) => {
    // Save session to database
    return new Promise((resolve, reject) => {
        let expiresAt = generateRefreshTokenExpiryTime();

        student.sessions.push({ 'token': refreshToken, expiresAt });

        student.save().then(() => {
            // saved session successfully
            return resolve(refreshToken);
        }).catch((e) => {
            reject(e);
        });
    })
}

let generateRefreshTokenExpiryTime = () => {
    let daysUntilExpire = "10";
    let secondsUntilExpire = ((daysUntilExpire * 24) * 60) * 60;
    return ((Date.now() / 1000) + secondsUntilExpire);
}

const Student = mongoose.model('Student', StudentSchema);

module.exports = { Student }