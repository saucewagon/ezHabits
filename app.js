const express = require('express');
const bodyParser = require("body-parser");
const path = require('path');
const Joi = require('joi');

const db = require("./db");
const collection = "todo";
const app = express();

const schema = Joi.object().keys({
    todo : Joi.string().required()
}); 
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/getTodos', (req, res) => {
    //res.sendFile(path.join(__dirname, 'index.html'));
    db.getDB().collection(collection).find({}).toArray((err,documents) => {
        if (err)
            console.log(err);
        else{
            console.log(documents);
            res.json(documents);
        }
    });
});

// the server is receiving a request to update a record
app.put('/:id', (req, res) => {
    const todoID = req.params.id;
    const userInput = req.body;

    db.getDB().collection(collection).findOneAndUpdate({_id : db.getPrimaryKey(todoID)}, {$set : {todo : userInput.todo}}, {returnOriginal : false} , (err, result) => {
        if (err)
            console.log(err);
        else
            res.json(result);
    });
}); //id is the primary key of the document

// post the todo that we want to insert into the db
// insert a new thing in the db
// returns the result, and the inserted document
app.post('/',(req,res,next)=>{
    // Document to be inserted
    const userInput = req.body;

    // Validate document
    // If document is invalid pass to error middleware
    // else insert document within todo collection
    Joi.validate(userInput,schema,(err,result)=>{
        if(err){
            const error = new Error("Invalid Input");
            error.status = 400;
            next(error);
        }
        else{
            db.getDB().collection(collection).insertOne(userInput,(err,result)=>{
                if(err){
                    const error = new Error("Failed to insert Todo Document");
                    error.status = 400;
                    next(error);
                }
                else
                    res.json({result : result, document : result.ops[0],msg : "Successfully inserted Todo!!!",error : null});
            });
        }
    })    
});

//send a req to the server to delete something from the db
app.delete('/:id', (req, res) => {
    const todoID = req.params.id;

    db.getDB().collection(collection).findOneAndDelete({_id : db.getPrimaryKey(todoID)}, (err, result) => {
        if (err)
            console.log(err);
        else
            res.json(result);
    });
});

app.use((err,req,res,next)=>{
    res.status(err.status).json({
        error : {
            message : err.message
        }
    });
})

db.connect((err) => {
    if (err){
        console.log("unable to connect to database")
        process.exit(1);
    }
    else{
        app.listen(3000,() => {
            console.log('connected to database, app listening');
        });
    }
       
})