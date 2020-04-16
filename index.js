var Client = require('ssh2').Client;
var express=require('express');
var app=express();
var fs = require('fs');
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }))
routerlist = [];
app.get('/',function(req,res){
   res.sendFile(__dirname +'/index.html');
});
app.get('/JSON',function(req,res){
   res.send(routerlist);
});
app.get('/semanticmin.js',function(req,res){
   res.sendFile(__dirname+'/semantic.min.js');
});
app.get('/jquery.js',function(req,res){
   res.sendFile(__dirname+'/jquery-3.1.1.min.js');
});
app.get('/semanticmin.css',function(req,res){
   res.sendFile(__dirname+'/semantic.min.css');
});
app.post('/submit-router', function (req, res) {

   opush = {IP: req.body.IP,
      User: req.body.User,
      Password: req.body.Password,
      Port: req.body.Port}; 
   test = testifAlive(opush); 
   console.log(test);
   routerlist.push(opush);
   res.sendFile(__dirname +'/index.html');

});

process.on('uncaughtException', function (err) {        //probably fix
   console.log('Caught exception: ' + err);
 });

app.put('/update-data', function (req, res) {
   res.send('PUT Request');//todo
});

app.delete('/delete-data', function (req, res) {
   res.send('DELETE Request');//todo
});


 var server=app.listen(3005,function() {});

 function testifAlive(obj) {
   Stringlist=[];
   var conn = new Client();
   conn.on('ready', function() {
   console.log('Client :: ready')
   conn.exec('export', function(err, stream) {
      if (err) throw err;
   stream.on('close', function(code, signal) {
   console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
   conn.end();
    }).on('data', function(data) {
       Stringlist.push(data.toString('utf8'));       
    }).stderr.on('data', function(data) {
       console.log('STDERR: ' + data);
      });
     });
    }).connect({
      host: obj.IP,
      port: obj.Port,
      username: obj.User,
      password: obj.Password
    });
    setTimeout(function obj(){return Stringlist; },3000)
    
 }

