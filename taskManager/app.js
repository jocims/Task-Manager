/**
 * Manage Database 
 */
const express = require('express');
const app = express();
const { mongoose } = require('./db/mongoose');
const bodyParser = require('body-parser');
const { Tasks, Task } = require('./db/models');
const jwt = require('jsonwebtoken');
const { Student } = require('./db/models/student.model');
app.use(bodyParser.json());

// Manages CORS
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-refresh-token, _id, name");
    res.header(
        'Access-Control-Expose-Headers',
        'x-access-token, x-refresh-token'
    );
    next();
});

//Validate JWT Token
let authenticate = (req, res, next) => {
    let token = req.header('x-access-token');
    // verify the JWT
    jwt.verify(token, Student.getJWTSecret(), (err, decoded) => {
        if (err) {
            res.status(401).send(err);
        } else { //Valid
            req.student_id = decoded._id;
            next();
        }
    });
}
//Create Tasks
app.post('/tasks', authenticate, (req, res) => {
    let title = req.body.title;
    let newTasks = new Tasks({
        title,
        _studentId: req.student_id
    });
    newTasks.save().then((listDoc) => {
        res.send(listDoc);
    })
});

//Update List 
app.patch('/tasks/:id', authenticate, (req, res) => {
    Tasks.findOneAndUpdate({ _id: req.params.id, _studentId: req.student_id }, {
        $set: req.body
    }).then(() => {
        res.send({ 'message': 'updated successfully'});
    });
});

//Delete Tasks
app.delete('/tasks/:id', authenticate, (req, res) => {
    // We want to delete the specified list (document with id in the URL)
    Tasks.findOneAndRemove({
        _id: req.params.id,
        _studentId: req.student_id
    }).then((removedListDoc) => {
        res.send(removedListDoc);
        
        deleteTasksFromList(removedListDoc._id);
    })
});

// Validate Session
let verifySession = (req, res, next) => {
    let refreshToken = req.header('x-refresh-token');
    let _id = req.header('_id');
    Student.findByIdAndToken(_id, refreshToken).then((student) => {
        if (!student) { //Student not found 
            return Promise.reject({
                'error': 'Student not found. Make sure that the refresh token and student id are correct'
            });
        }

        req.student_id = student._id;
        req.studentObject = student;
        req.refreshToken = refreshToken;

        let isSessionValid = false;

        student.sessions.forEach((session) => {
            if (session.token === refreshToken) {
                // check if the session has expired
                if (Student.hasRefreshTokenExpired(session.expiresAt) === false) {
                    // refresh token has not expired
                    isSessionValid = true;
                }
            }
        });

        if (isSessionValid) {
            // the session is VALID - call next() to continue with processing this web request
            next();
        } else {
            // the session is not valid
            return Promise.reject({
                'error': 'Refresh token has expired or the session is invalid'
            })
        }

    }).catch((e) => {
        res.status(401).send(e);
    })
}

//Display all tasks
app.get('/tasks', authenticate, (req, res) => {
    // We want to return an array of all the tasks that belong to the authenticated student 
    Tasks.find({
        _studentId: req.student_id
    }).then((tasks) => {
        res.send(tasks);
    }).catch((e) => {
        res.send(e);
    });
})


//Get Student Id Information 
app.get('/student/:id', authenticate, (req, res) => {
    Student.find({
        _studentId: req.params.student_id
    }).then((student) => {
        res.send(student);
    })
});

//Get all the taks from a lsit 
app.get('/tasks/:tasksId/tasks', authenticate, (req, res) => {
    Task.find({
        _tasksId: req.params.tasksId
    }).then((tasks) => {
        res.send(tasks);
    })
});

// Create a new task in a specific list
 app.post('/tasks/:tasksId/tasks', authenticate, (req, res) => {
    Tasks.findOne({
        _tasksId: req.params.tasksId,
        _studentId: req.student_id
    }).then((list) => {
        if (list) {
            return true;
        }
        return false;
    }).then((canCreateTask) => {
        if (canCreateTask) {
            let newTask = new Task({
                title: req.body.title,
                _tasksId: req.params.tasksId,
                deadline: req.body.deadline,
                student: req.body.student,
            });
            newTask.save().then((newTaskDoc) => {
                res.send(newTaskDoc);
            })
        } else {
            res.sendStatus(404);
        }
    })
})


 //Update an existing task
app.patch('/tasks/:tasksId/tasks/:taskId', authenticate, (req, res) => {
    Tasks.findOne({
        _tasksId: req.params.tasksId,
        _studentId: req.student_id
    }).then((list) => {
        if (list) {
            return true;
        }

        // else - the list object is undefined
        return false;
    }).then((canUpdateTasks) => {
        if (canUpdateTasks) {
            // the currently authenticated studebt can update tasks
            Task.findOneAndUpdate({
                _id: req.params.taskId,
                _tasksId: req.params.tasksId
            }, {
                    $set: req.body
                }
            ).then(() => {
                res.send({ message: 'Updated successfully.' })
            })
        } else {
            res.sendStatus(404);
        }
    })
});

 //Purpose: Delete a task 
app.delete('/tasks/:tasksId/tasks/:taskId', authenticate, (req, res) => {
    Tasks.findOne({
        _tasksId: req.params.tasksId,
        _studentId: req.student_id
    }).then((list) => {
        if (list) {
            return true;
        }
        return false;
    }).then((canDeleteTasks) => {
        
        if (canDeleteTasks) {
            Task.findOneAndRemove({
                _id: req.params.taskId,
                _tasksId: req.params.tasksId
            }).then((removedTaskDoc) => {
                res.send(removedTaskDoc);
            })
        } else {
            res.sendStatus(404);
        }
    });
});


 // Sign up
app.post('/student', (req, res) => {

    let body = req.body;
    let newStudent = new Student(body);
    newStudent.save().then(() => {
        return newStudent.createSession();
    }).then((refreshToken) => {
        // Session created successfully - refreshToken returned.
        // now we geneate an access auth token for the Student
        return newStudent.generateAccessAuthToken().then((accessToken) => {
            // access auth token generated successfully, now we return an object containing the auth tokens
            return { accessToken, refreshToken }
        });
    }).then((authTokens) => {
        // Now we construct and send the response to the Student with their auth tokens in the header and the Student object in the body
        res
            .header('x-refresh-token', authTokens.refreshToken)
            .header('x-access-token', authTokens.accessToken)
            .send(newStudent);
    }).catch((e) => {
        res.status(400).send(e);
    })
})

//Login
app.post('/student/login', (req, res) => {
   //Request email and password only 
    let email = req.body.email;
    let password = req.body.password;

    Student.findByCredentials(email, password).then((student) => {
        return student.createSession().then((refreshToken) => {
            // Session created successfully - refreshToken returned.
            // now we geneate an access auth token for the Student

            return student.generateAccessAuthToken().then((accessToken) => {
                // access auth token generated successfully, now we return an object containing the auth tokens
                return { accessToken, refreshToken }
            });
        }).then((authTokens) => {
            // Now we construct and send the response to the Student with their auth tokens in the header and the Student object in the body
            res
                .header('x-refresh-token', authTokens.refreshToken)
                .header('x-access-token', authTokens.accessToken)
                .send(student);
        })
    }).catch((e) => {
        res.status(400).send(e);
    });
})

//Generate tokes
app.get('/student/me/access-token', verifySession, (req, res) => {
    req.studentObject.generateAccessAuthToken().then((accessToken) => {
        res.header('x-access-token', accessToken).send({ accessToken });
    }).catch((e) => {
        res.status(400).send(e);
    });
})

let deleteTasksFromList = (_tasksId) => {
    Task.deleteMany({
        _tasksId
    }).then(() => {
        console.log("Tasks from " + _tasksId + " were deleted!");
    })
}


app.listen(3000, () => {
    console.log("Server running at port 3000");
})