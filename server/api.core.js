// AWS API Variables
const fs = require('fs');
var configData = JSON.parse(fs.readFileSync('./aws-exports.json'));

// API Application Variables
const express = require('express');
const cors = require('cors')
const uuid = require('uuid');

const app = express();
const port = configData.aws_api_port;
app.use(cors());
app.use(express.json())

// API Protection
var cookieParser = require('cookie-parser')
var csrf = require('csurf')
var bodyParser = require('body-parser')
const csrfProtection = csrf({
  cookie: true,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(csrfProtection);



// AWS Variables
var AWS = require('aws-sdk');
AWS.config.update({region: configData.aws_region});

var rds = new AWS.RDS();
var cloudwatch = new AWS.CloudWatch();
var cloudwatchlogs = new AWS.CloudWatchLogs();


// Security Variables
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
var jwkToPem = require('jwk-to-pem');
var request = require('request');
var secretKey =  crypto.randomBytes(32).toString('hex')
var pems;
var issCognitoIdp = "https://cognito-idp." + configData.aws_region + ".amazonaws.com/" + configData.aws_cognito_user_pool_id;
        

// Mysql Variables
const mysql = require('mysql')
var db=[];


// Postgresql Variables
const postgresql = require('pg').Pool


// Startup - Download PEMs Keys
gatherPemKeys(issCognitoIdp);


//--#################################################################################################### 
//   ---------------------------------------- SECURITY
//--#################################################################################################### 


//-- Generate new standard token
function generateToken(tokenData){
    const token = jwt.sign(tokenData, secretKey, { expiresIn: 60 * 60 * configData.aws_token_expiration });
    return token ;
};


//-- Verify standard token
const verifyToken = (token) => {

    try {
        const decoded = jwt.verify(token, secretKey);
        return {isValid : true, session_id: decoded.session_id};
    }
    catch (ex) { 
        return {isValid : false, session_id: ""};
    }

};


//-- Gather PEMs keys from Cognito
function gatherPemKeys(iss)
{

    if (!pems) {
        //Download the JWKs and save it as PEM
        return new Promise((resolve, reject) => {
                    request({
                       url: iss + '/.well-known/jwks.json',
                       json: true
                     }, function (error, response, body) {
                         
                        if (!error && response.statusCode === 200) {
                            pems = {};
                            var keys = body['keys'];
                            for(var i = 0; i < keys.length; i++) {
                                //Convert each key to PEM
                                var key_id = keys[i].kid;
                                var modulus = keys[i].n;
                                var exponent = keys[i].e;
                                var key_type = keys[i].kty;
                                var jwk = { kty: key_type, n: modulus, e: exponent};
                                var pem = jwkToPem(jwk);
                                pems[key_id] = pem;
                            }
                        } else {
                            //Unable to download JWKs, fail the call
                            console.log("error");
                        }
                        
                        resolve(body);
                        
                    });
        });
        
        } 
    
    
}


//-- Validate Cognito Token
function verifyTokenCognito(token) {

   try {
        //Fail if the token is not jwt
        var decodedJwt = jwt.decode(token, {complete: true});
        if (!decodedJwt) {
            console.log("Not a valid JWT token");
            return {isValid : false, session_id: ""};
        }
        
        
        if (decodedJwt.payload.iss != issCognitoIdp) {
            console.log("invalid issuer");
            return {isValid : false, session_id: ""};
        }
        
        //Reject the jwt if it's not an 'Access Token'
        if (decodedJwt.payload.token_use != 'access') {
            console.log("Not an access token");
            return {isValid : false, session_id: ""};
        }
    
        //Get the kid from the token and retrieve corresponding PEM
        var kid = decodedJwt.header.kid;
        var pem = pems[kid];
        if (!pem) {
            console.log('Invalid access token');
            return {isValid : false, session_id: ""};
        }

        const decoded = jwt.verify(token, pem, { issuer: issCognitoIdp });
        return {isValid : true, session_id: ""};
    }
    catch (ex) { 
        console.log("Unauthorized Token");
        return {isValid : false, session_id: ""};
    }
    
};



//-- Authenticate User Database 
app.post("/api/security/rds/auth/", csrfProtection, (req,res)=>{
    
    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});

    // API Call
    var params = req.body.params;
    try {
        
        switch(params.engine)
        {
            //-- MYSQL CONNECTION
            case 'mysql':
            case 'mariadb':   
            case 'aurora-mysql':
                    var dbconnection= mysql.createConnection({
                    host: params.host,
                    user: params.username,
                    password: params.password,
                    port: params.port
                    })
                
                    dbconnection.connect(function(err) {
                      if (err) {
                        res.status(200).send( {"result":"auth0", "session_id": 0});
                      } else {
                        dbconnection.end();
                        var session_id=uuid.v4();
                        mysqlOpenConnection(session_id,params.host,params.port,params.username,params.password);
                        
                        var token = generateToken({ session_id: session_id});
                        //res.render('login', { csrfToken: req.csrfToken() });
                        res.status(200).send( {"result":"auth1", "session_id": session_id, "session_token": token });
                      }
                      
                    });
                    
                    break;
                    
            //-- POSTGRESQL CONNECTION
            case 'postgres':
            case 'aurora-postgresql':
                    
                    var dbconnection = new postgresql({
                      user: params.username,
                      host: params.host,
                      database: 'postgres',
                      password: params.password,
                      port: params.port,
                      max: 1,
                    })
                    dbconnection.connect(function(err) {
                      if (err) {
                        res.status(200).send( {"result":"auth0", "session_id": 0});
                      } else {
                        dbconnection.end();
                        var session_id=uuid.v4();
                        postgresqlOpenConnection(session_id,params.host,params.port,params.username,params.password);
                        
                        var token = generateToken({ session_id: session_id});
                        res.status(200).send( {"result":"auth1", "session_id": session_id, "session_token": token});
                      }
                      
                    });
                    
                    break;
  
        }
        


    } catch(error) {
        console.log(error)
        res.status(200).send({"result":"auth0"});
                
    }
    
    
});


//-- Database Disconnection
app.get("/api/security/rds/disconnect/", (req,res)=>{

    // Token Validation
    var standardToken = verifyToken(req.headers['x-token']);
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (standardToken.isValid === false || cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });


    // API Call
    
    try {
        
        switch(req.query.engine)
        {
            case 'mysql':
            case 'aurora-mysql':
                console.log("API MYSQL Disconnection - SessionID : " + req.query.session_id)
                db[req.query.session_id].end();
                delete db[req.query.session_id];
                res.status(200).send( {"result":"disconnected", "session_id": req.query.session_id});
                break;
                
            case 'postgres':
            case 'aurora-postgresql':
                console.log("API POSTGRESQL Disconnection - SessionID : " + req.query.session_id)
                db[req.query.session_id].end();
                delete db[req.query.session_id];
                res.status(200).send( {"result":"disconnected", "session_id": req.query.session_id});
                break;
            
            case 'mariadb':
                console.log("API MARIADB Disconnection - SessionID : " + req.query.session_id)
                db[req.query.session_id].end();
                delete db[req.query.session_id];
                res.status(200).send( {"result":"disconnected", "session_id": req.query.session_id});
                break;

        }
        
    
    }
    
    catch(error) {

        res.status(200).send( {"result":"failed", "session_id": req.query.session_id});
        console.log(error)
        
    }
    
});



//--#################################################################################################### 
//   ---------------------------------------- POSTGRESQL
//--#################################################################################################### 

// POSTGRESQL : Create Connection
function postgresqlOpenConnection(session_id,host,port,user,password){
    
    db[session_id]  = new postgresql({
            host: host,
            user: user,
            password: password,
            database: "postgres",
            port: port,
            max: 2,
    })
    
    console.log("Postgresql Connection opened for session_id" + session_id);
    
    
}


// POSTGRESQL : API Execute SQL Query
app.get("/api/postgres/sql/", (req,res)=>{

    // Token Validation
    var standardToken = verifyToken(req.headers['x-token']);
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (standardToken.isValid === false || cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });


    // API Call
    var params = req.query;
    
    try {
        
        db[standardToken.session_id].query(params.sql_statement, (err,result)=>{
                        if(err) {
                            console.log(err)
                            res.status(404).send(err);
                        } 
                        else {
                            res.status(200).send(result);
                        }

                }
            );   


    } catch(error) {
        console.log(error)
                
    }

});




//--#################################################################################################### 
//   ---------------------------------------- MYSQL
//--#################################################################################################### 


// MYSQL : Create Connection
function mysqlOpenConnection(session_id,host,port,user,password){

    db[session_id]  = mysql.createPool({
            host: host,
            user: user,
            password: password,
            database: "",
            acquireTimeout: 3000,
            port: port,
            connectionLimit:2
    })

    console.log("Mysql Connection opened for session_id" + session_id);

}




// MYSQL : API Execute SQL Query
app.get("/api/mysql/sql/", (req,res)=>{

    // Token Validation
    var standardToken = verifyToken(req.headers['x-token']);
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (standardToken.isValid === false || cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });

    // API Call
    var params = req.query;

    try {
        
        db[standardToken.session_id].query(params.sql_statement, (err,result)=>{
                        if(err) {
                            console.log(err)
                            res.status(404).send(err);
                        } 
                        else
                        {
                            res.status(200).send(result);
                         }
                        
                }
            );   

           
    } catch(error) {
        console.log(error)
                
    }

});




//--#################################################################################################### 
//   ---------------------------------------- AWS
//--#################################################################################################### 


// AWS : List Instances - by Region
app.get("/api/aws/rds/instance/region/list/", (req,res)=>{
   
    // Token Validation
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);
    
    if (cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid"});

    // API Call
    var rds_region = new AWS.RDS({region: configData.aws_region});
    
    var params = {
        MaxRecords: 100
    };

    try {
        rds_region.describeDBInstances(params, function(err, data) {
            if (err) 
                console.log(err, err.stack); // an error occurred
            res.status(200).send({ csrfToken: req.csrfToken(), data:data });
        });

    } catch(error) {
        console.log(error)
                
    }

});






// AWS : Cloudwatch Information
app.get("/api/aws/clw/query/", (req,res)=>{
    
    var standardToken = verifyToken(req.headers['x-token']);
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (standardToken.isValid === false || cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });

    try {
            
            var params = req.query;
            
            params.MetricDataQueries.forEach(function(metric) {
                                metric.MetricStat.Metric.Dimensions[0]={ Name: metric.MetricStat.Metric.Dimensions[0]['[Name]'], Value: metric.MetricStat.Metric.Dimensions[0]['[Value]']};
                     
            })
                        
            cloudwatch.getMetricData(params, function(err, data) {
                if (err) 
                    console.log(err, err.stack); // an error occurred
                res.status(200).send(data);
            });
            
    
                   
    } catch(error) {
            console.log(error)
                    
    }
    

});


// AWS : Cloudwatch Information
app.get("/api/aws/clw/region/query/", (req,res)=>{

    var standardToken = verifyToken(req.headers['x-token']);
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (standardToken.isValid === false || cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });

    try {
        
        var params = req.query;
        var cloudwatch_region = new AWS.CloudWatch({region: configData.aws_region, apiVersion: '2010-08-01'});
        params.MetricDataQueries.forEach(function(metric) {
                
                for(i_dimension=0; i_dimension <  metric.MetricStat.Metric.Dimensions.length; i_dimension++) {
                    metric.MetricStat.Metric.Dimensions[i_dimension]={ Name: metric.MetricStat.Metric.Dimensions[i_dimension]['[Name]'], Value: metric.MetricStat.Metric.Dimensions[i_dimension]['[Value]']};
                }          
        })
                    
        cloudwatch_region.getMetricData(params, function(err, data) {
            if (err) 
                console.log(err, err.stack); // an error occurred
            res.status(200).send(data);
        });
        

               
    } catch(error) {
        console.log(error)
                
    }


});


// AWS : Cloudwatch Information
app.get("/api/aws/clw/region/logs/", (req,res)=>{
    
    var standardToken = verifyToken(req.headers['x-token']);
    var cognitoToken = verifyTokenCognito(req.headers['x-token-cognito']);

    if (standardToken.isValid === false || cognitoToken.isValid === false)
        return res.status(511).send({ data: [], message : "Token is invalid. StandardToken : " + String(standardToken.isValid) + ", CognitoToken : " + String(cognitoToken.isValid) });

    
    try {
        
        var params = req.query;
        var params_logs = {
          logStreamName: params.resource_id,
          limit: '1',
          logGroupName: 'RDSOSMetrics',
          startFromHead: false
        };
    
        cloudwatchlogs.getLogEvents(params_logs, function(err, data) {
          if (err) 
            console.log(err, err.stack); // an error occurred
          else   {
              res.status(200).send(data);
            
            }
        });
            
            

  

    } catch(error) {
        console.log(error)
                
    }


});



//--#################################################################################################### 
//   ---------------------------------------- MAIN API CORE
//--#################################################################################################### 


app.listen(port, ()=>{
    console.log(`Server is running on ${port}`)
})