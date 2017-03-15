// index.js
"use strict";

var config = require('./js/config.js');


// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(config.databaseName);
var async = require("async");

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var SERVER_PORT = config.serverPort;

var port = SERVER_PORT || 8080;        // set our port

// Populating DB with sample data

// =============================================================================
db.serialize(function() {

    db.run("CREATE TABLE IF NOT EXISTS applicant (applicant_id TEXT PRIMARY KEY NOT NULL,first_name TEXT,last_name TEXT,age TEXT,sex TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS nominee (nominee_id TEXT PRIMARY KEY NOT NULL, applicant_id TEXT, first_name TEXT,last_name TEXT,age TEXT,sex TEXT,FOREIGN KEY(applicant_id) REFERENCES applicant(applicant_id))");
    db.run("CREATE TABLE IF NOT EXISTS guardian (guardian_id TEXT PRIMARY KEY NOT NULL,applicant_id TEXT, nominee_id TEXT, first_name TEXT,last_name TEXT,age TEXT,sex TEXT,FOREIGN KEY(nominee_id) REFERENCES nominee(nominee_id),FOREIGN KEY(applicant_id) REFERENCES applicant(applicant_id))");


// NOTE: If a restart is required, this part should be completely commented after database has been populated.
//     db.run("INSERT INTO applicant (applicant_id, first_name, last_name, age, sex) VALUES (?, ?, ?, ?, ?)", "a1", "Pankesh1", 'Kumar', 21, "male");
//     db.run("INSERT INTO applicant (applicant_id, first_name, last_name, age, sex) VALUES (?, ?, ?, ?, ?)", "a2", "Pankesh2", 'Kumar', 19, "male");
//     db.run("INSERT INTO applicant (applicant_id, first_name, last_name, age, sex) VALUES (?, ?, ?, ?, ?)", "a3", "Pankesh3", 'Kumar', 23, "male");
//     db.run("INSERT INTO applicant (applicant_id, first_name, last_name, age, sex) VALUES (?, ?, ?, ?, ?)", "a4", "Pankesh4", 'Kumar', 23, "male");
//
//     db.run("INSERT INTO nominee (nominee_id, applicant_id, first_name, last_name, age, sex) VALUES (?, ?, ?, ?, ?, ?)", "n1", "a1", "Nominee1", 'Kumar', 23, "male");
//     db.run("INSERT INTO nominee (nominee_id, applicant_id, first_name, last_name, age, sex) VALUES (?, ?, ?, ?, ?, ?)", "n2", "a2", "Nominee2", 'Kumar', 23, "male");
//     db.run("INSERT INTO nominee (nominee_id, applicant_id, first_name, last_name, age, sex) VALUES (?, ?, ?, ?, ?, ?)", "n3", "a3", "Nominee3", 'Kumar', 11, "male");
//     db.run("INSERT INTO nominee (nominee_id, applicant_id, first_name, last_name, age, sex) VALUES (?, ?, ?, ?, ?, ?)", "n4", "a4", "Nominee4", 'Kumar', 11, "male");
//
//     db.run("INSERT INTO nominee (nominee_id, applicant_id, first_name, last_name, age, sex) VALUES (?, ?, ?, ?, ?, ?)", "n5", "a4", "Nominee5", 'Kumar', 23, "male");
//
//     db.run("INSERT INTO guardian (guardian_id, applicant_id, nominee_id, first_name, last_name, age, sex) VALUES (?, ?, ?, ?, ?, ?, ?)", "g1", "a4", "n4", "Guardian1", 'Kumar', 23, "male");
//     db.run("INSERT INTO guardian (guardian_id, applicant_id, nominee_id, first_name, last_name, age, sex) VALUES (?, ?, ?, ?, ?, ?, ?)", "g2", "a3", "n3", "Guardian2", 'Kumar', 23, "male");
//
});


// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// Get all info related to a applicant (accessed at GET http://localhost:8080/api/getApplicantInfo)
router.get('/get/:applicant_id', function(req, res) {
    async.series({
        data: function(callback) {
            db.all("SELECT * FROM applicant where applicant_id = '" + req.params.applicant_id + "'", function(err, row){
                if(err) console.log(err);
                // responseObj.data = row;
                if (err)
                    callback(err, null);
                else {
                    callback(null, row);
                }
            });
        },
        nomineeData: function(callback){
            db.all("SELECT * FROM nominee where applicant_id = '" + req.params.applicant_id + "'", function(err, row){
                // if(err) console.log(err);
                // responseObj.nomineeData = row;
                if (err)
                    callback(err, null);
                else {
                    callback(null, row);
                }
            });
        },
        guardianData: function(callback){
            db.all("SELECT * FROM guardian where applicant_id = '" + req.params.applicant_id + "'", function(err, row){
                // if(err) console.log(err);
                // responseObj.nomineeData = row;
                if (err)
                    callback(err, null);
                else {
                    callback(null, row);
                }
            });
        }
    },function(err, data) {
        if(err){
            res.json({status: "error", msg: err, data: []});
        } else {
            res.json({status: "success", msg: null, data: data});
        }
    });
});

router.post('/add/:type', function(req, res){

    var type = req.params.type;
    var data = JSON.parse(req.body.data);
    var sql = db.prepare("INSERT INTO " + config.dataToTableMap[type].table + " " + config.dataToTableMap[type].insertTemplate);

    sql.run(Object.keys(data).map(function (key) {
        return data[key]; // creating array out of values present in object
    }), function (err) {
        if (err) {
            res.json({status: "error", msg: err});
        } else {
            res.json({status: "success", msg: "Insert Successful"});
        }
    });

    sql.finalize();
});

// REGISTERING ROUTES
// all of our routes will be prefixed with /api
app.use('/api', router);

// STARTING SERVER
// =============================================================================
app.listen(port);
console.log('Server running at port :' +  port);
