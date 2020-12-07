const express = require('express');
const app = express();
var bodyParser  = require('body-parser');
require("./mockdata")

const PORT = 4000;
let admins = [
    {"id" : 1,"username" : "swarnkarvijay" ,"name" : "Vijay K. Swarnkar", "password" : "123456","role" : "Creator Of the application"},
    {"id" : 2,"username" : "dummyName" ,"name" : "Dummy d. dummy", "password" : "123456","role" : "Has not done anything"},
]
let employees = global.mockdata;

let departments = [
    {id:1,name:"Tech"},
    {id:2,name:"finance"},
    {id:3,name:"Hr"}
]

let projects = [
    {id:1,name:"gineo"},
    {id:2,name:"connx"},
    {id:3,name:"LMS"}
]

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*,Content-Type,source');
    next();
}

app.use(allowCrossDomain);
app.use(bodyParser.urlencoded({'extended': 'true'}));// parse application/x-www-form-urlencoded
app.use(bodyParser.json({limit: '50mb'}));// parse application/json
app.use(bodyParser.json({type: 'application/x-www-form-urlencoded'}));

app.use((req,res,next) => {
    console.log("req.originalUrl------------------>",req.originalUrl);
    console.log("req.method------------------>",req.method);

    next();
})

const authentication = (req,res,next) => {
    console.log("req.headers-------------------------->",req.headers);
    if(!req.headers || !req.headers.authorization || !req.headers.authorization.split("||").length ||
    !admins.find(x => x.id == req.headers.authorization.split("||")[0] && x.name == 
    req.headers.authorization.split("||")[1])){
        res.send({
            success: false,
            data: {},
            message: "Invalid user",
            code : 400
        })
    }else{
        next();
    }
}

app.get('/ping',(req,res)=> {
    res.send({
        success: true,
        data: {},
        message: "pong",
        code : 200
    })
});

app.post('/api/auth/signin',(req,res) => {
    let userName = req.body.username;
    let password = req.body.password;
    let user = admins.find(x => x.username == userName && x.password == password);
    if(user){
        res.send({
            success: true,
            data:{
                isValidUser: true,
                accessToken: `${user.id}||${user.name}`,
                userInfo: user
            },
            message: "Successfully logged in",
            code: 200
        })
    }else{
        res.send({
            success: false,
            data:{ 
                isValidUser: false
            },
            message: "Invalid User",
            code: 400
        })
    }
});

app.get('/api/users',authentication,(req,res) => {
    let response =  employees.map(x => {
        return {
            id: x.id,
            name: x.name,
            company: x.company,
            department: x.department,
            designation: x.designation
        }
    });
    console.log("response------------>",{
        success: true,
        data:response,
        message: "Successfully fetched data",
        code: 200
    } )
    res.send({
        success: true,
        data:response,
        message: "Successfully fetched data",
        code: 200
    })
});

app.get('/departments',authentication,(req,res) => {
    let response =  departments.map(x => {
        return {
            id: x.id,
            name: x.name
        }
    });
    res.send({
        success: true,
        data:response,
        message: "Successfully fetched data",
        code: 200
    })
});

app.get('/projects',authentication,(req,res) => {
    let response =  projects.map(x => {
        return {
            id: x.id,
            name: x.name
        }
    });
    res.send({
        success: true,
        data:response,
        message: "Successfully fetched data",
        code: 200
    })
});

app.get('/employees/:id',authentication,(req,res) => {
    let user = employees.find(x => x.id == req.params.id);
    let response =  user ? user : {};
    res.send({
        success: true,
        data:response,
        message: "Successfully fetched data",
        code: 200
    })
});

app.delete('/employees/:id',authentication,(req,res) => {
    let index = null;
    let user = employees.find((x,indexNumber) => {
        if(x.id == req.params.id){
            index = indexNumber;
        }
    });
    if(index >= 0){
        employees.splice(index,1); 
    }
    res.send({
        success: true,
        data:{},
        message: "Successfully deleted",
        code: 200
    })
});

app.put('/api/user/:id',authentication,(req,res) => {
    let index = -1;
    employees.find((x,indexNumber) => {
        if(x.id == +req.params.id){
            index = indexNumber;
        }
    });
    if(index >= 0){
        employees[index] = req.body.user; 
    }
    res.send({
        success: true,
        data:{},
        message: "Successfully updated",
        code: 200
    })
});

app.post('/api/user',authentication,(req,res) => {
    req.body.user.id = employees.length + 1 
    employees.push(req.body.user);
    res.send({
        success: true,
        data:{},
        message: "Successfully added",
        code: 200
    })
});



app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));