var Client = require('ssh2').Client;
var express=require('express');
var app=express();
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }))
var conn = new Client();
routerlist = [];
app.get('/',function(req,res){
   res.sendFile(__dirname +'/index.html');
});
app.get('/JSON',function(req,res){
   res.end(JSON.stringify(routerlist));
});
app.post('/submit-router', function (req, res) {
   opush = {IP: req.body.IP,
      login: req.body.User,
      password: req.body.Password};
   routerlist.push(opush);
   console.log(routerlist);
   res.sendFile(__dirname +'/index.html');
});



app.put('/update-data', function (req, res) {
   res.send('PUT Request');
});

app.delete('/delete-data', function (req, res) {
   res.send('DELETE Request');
});

conn.on('ready', function() {
  console.log('Client :: ready');
  conn.exec('export', function(err, stream) {
    if (err) throw err;
    stream.on('close', function(code, signal) {
      console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
      conn.end();
    }).on('data', function(data) {
      console.log('STDOUT: ' + data);
    }).stderr.on('data', function(data) {
      console.log('STDERR: ' + data);
    });
  });
}).connect({
  host: '10.0.11.155',
  port: 22,
  username: 'admin',
  password: 'kek'
});
var server=app.listen(3005,function() {});

