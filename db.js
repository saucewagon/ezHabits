const MongoClient = require("mongodb").MongoClient;
const ObjectID = require('mongodb').ObjectID;
// name of our database
const dbname = "crud_mongodb";
// location of where our mongoDB database is located
const url = "mongodb://localhost:27017";
// Options for mongoDB
const mongodbOptions = {useNewUrlParser : true};

const state = {
    db: null
};

const connect = (cb) =>  {
    if (state.db)
        cb();
    else{
        MongoClient.connect(url, mongodbOptions, (err, client) => {
            if (err)
                cb(err);
            else{
                state.db = client.db(dbname);
                cb();
            }
        });
    }
}

const getPrimaryKey = (_id) => {
    return ObjectID(_id);
}

const getDB = ()=>{
    return state.db;
}

module.exports = {getDB, connect, getPrimaryKey};