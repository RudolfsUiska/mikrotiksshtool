var Client = require('ssh2').Client;
var express=require('express');
var app=express();
var fs = require('fs');
var bodyParser = require("body-parser");
WebPort= 3005;
idcount = 0;
app.use(bodyParser.urlencoded({ extended: false }))
routerlist = [];


app.get('/',function(req,res){                           // Main Index Hosts
   res.sendFile(__dirname +'/index.html');
});
app.get('/JSON',function(req,res){                 // JSON Dump, fix to, ka paroles ir planetext
   res.send(routerlist);
});
app.get('/semanticmin.js',function(req,res){          //js failu hostings 
   res.sendFile(__dirname+'/semantic.min.js');
});
app.get('/mass_add',function(req,res){          //Mass add HTML
   res.sendFile(__dirname+'/mass_add.html');
});
app.get('/icons.svg',function(req,res){            
   res.sendFile(__dirname+'/icons.svg');              //ikonu hostings
});
app.get('/icons.eot',function(req,res){
   res.sendFile(__dirname+'/icons.eot');        //ikonu hostings
});
app.get('/icons.tff',function(req,res){
   res.sendFile(__dirname+'/icons.tff');        //ikonu hostings
});
app.get('/icons.woff',function(req,res){
   res.sendFile(__dirname+'/icons.woff');          //ikonu hostings
});
app.get('/icons.woff2',function(req,res){
   res.sendFile(__dirname+'/icons.woff2');            //ikonu hostings
});
app.get('/jquery.js',function(req,res){
   res.sendFile(__dirname+'/jquery-3.1.1.min.js');                   //JQuery hostings
});
app.get('/semanticmin.css',function(req,res){
   res.sendFile(__dirname+'/semantic.min.css');                      //css hostings
});
app.post('/submit-router', function (req, res) {
   opush = {};
   IsSucceeded = false;
   numberonlist = -1;
   opush = {IP: req.body.IP,                                        //Put data from Submit into a object
      User: req.body.User,
      Password: req.body.Password,
      Port: req.body.Port,
    }; 
   if(typeof opush.IP !== 'undefined'&& typeof opush.User !== 'undefined'&&typeof opush.Password !== 'undefined'&&typeof opush.Port !== 'undefined'){
      if(IPValidator(opush.IP)>=0&&UserValidator(opush.User)>0&&PasswordValidator(opush.Password)>0&&PortValidator(opush.Port)>=0){
            //checks if data in object is correct.
         opush.Port = PortValidator(opush.Port); //makes sure the port is sanitized
         numberonlist = RouterListADD(opush)-1;
         IsSucceeded = true ; 
      }
   }

   console.log(IsSucceeded);
   res.sendFile(__dirname +'/index.html');                             //Show confirmation of added router
});

app.post('/mass-submit-router',function(req,res){
   succeeded_list = []; //list of ids of succeeded imports
   succeeded_count = 0; //count of succeeded imports
   try {
      MassOBJ=JSON.parse(req.body.MassAddData);                   //creates MassOBJ Object and stores Submited data in it
      for(i=0; i<MassOBJ.length;i++){
         IsCurrentSucseeded=false;
         MassPushObj={}
         if(typeof MassOBJ[i].IP !== 'undefined'&& typeof MassOBJ[i].User !== 'undefined'&&typeof MassOBJ[i].Password !== 'undefined'&&typeof MassOBJ[i].Port !== 'undefined'){
            if(IPValidator(MassOBJ[i].IP)>=0&&UserValidator(MassOBJ[i].User)>0&&PasswordValidator(MassOBJ[i].Password)>0&&PortValidator(MassOBJ[i].Port)>=0){
               MassPushObj = {            // checks if submit data is valid and puts it into Mass push object if it is valid
                  IP: MassOBJ[i].IP,
                  User: MassOBJ[i].User,
                  Password: MassOBJ[i].Password,
                  Port: PortValidator(MassOBJ[i].Port)
               }
               IsCurrentSucseeded=true;
               succeeded_list[succeeded_count] = RouterListADD(MassPushObj)-1;
               succeeded_count++;
            }

         }
         console.log(MassOBJ[i]);
         console.log("Tas bija"+ i + "Un tas ir"+ IsCurrentSucseeded);
      }
   } catch (error) {
      console.log("Error at Mass Router submt:");
      console.log(error);
      console.log("End of error");
   }
   res.sendFile(__dirname +'/index.html');                  //show confirmation of added stuff
});

process.on('uncaughtException', function (err) {        //errprint
   console.log('Caught exception: ' + err);
 });     

app.put('/update-data', function (req, res) {
   res.send('PUT Request');                                             //todo      
});

app.delete('/delete-data', function (req, res) {
   res.send('DELETE Request');                                          //todo
});


 var server=app.listen(WebPort,function() {});

 function testifAlive(obj) {                                                  //Connects via ssh executes export
   Stringlist=[];                                                             //and saves output to Stringlist
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
      feeder(data.toString('utf8'));
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

 }
 function IPValidator(IP) {   //Checks if IP is valid, will return -1 when undefined null or empty, 0 when it could be a possible domain name, 4 if IPV4 or 6 when IPV6 
   flag = -1;                          
  if(IP !== null && IP !== "" && IP!== undefined){
     if(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(IP)){
        flag = 4;            //checks if IP is IPV4
     }
     if(isIPv6(IP)){
        flag = 6;            //checks if IP IS IPV6
     }
     if(flag === -1){        //possibly still could be a domain name 
        flag = 0
     }
  }
  return flag;
}
function isIPv6(value)
{
  // See https://blogs.msdn.microsoft.com/oldnewthing/20060522-08/?p=31113 and
  // https://4sysops.com/archives/ipv6-tutorial-part-4-ipv6-address-syntax/
  const components = value.split(":");
  if (components.length < 2 || components.length > 8)
    return false;
  if (components[0] !== "" || components[1] !== "")
  {
    // Address does not begin with a zero compression ("::")
    if (!components[0].match(/^[\da-f]{1,4}/i))
    {
      // Component must contain 1-4 hex characters
      return false;
    }
  }

  let numberOfZeroCompressions = 0;
  for (let i = 1; i < components.length; ++i)
  {
    if (components[i] === "")
    {
      // We're inside a zero compression ("::")
      ++numberOfZeroCompressions;
      if (numberOfZeroCompressions > 1)
      {
        // Zero compression can only occur once in an address
        return false;
      }
      continue;
    }
    if (!components[i].match(/^[\da-f]{1,4}/i))
    {
      // Component must contain 1-4 hex characters
      return false;
    }
  }
  return true;
}  

 function UserValidator(User) {
   flag = -1;
   if( User !== undefined && User !== null && User !== ""){
      flag = 1;
   }
   return flag;
}
function PasswordValidator(Password) {    //checks if password contains anything, returns 1 if not empty, -1 if empty
   flag = -1;
   if(Password !== undefined && Password !== null && Password !== ""){
      flag = 1;
   }                                               
   return flag;
}
function PortValidator(Port){    //checks if port is valid, returns port number if valid, returns -1 if no
   regex = /[^0-9]/;
   flag = -1;
   try {
      Parsed_port = -1;
      Parsed_port = parseInt(Port, 10);
      if(Parsed_port>=0&&Parsed_port<=65535&&regex.test(Port)===false){
         return Parsed_port;
      }
   } catch (error) {
      
   }
   return flag;
}
function RouterListADD(obj){
   obj.uid = idcount;
   routerlist.push(obj);
   idcount ++;
   return idcount;
}
function RouterListRemove(uid){
   for(i=0;i<routerlist.length;i++){
      if(typeof routerlist[i].uid!== 'undefined'){
         if(uid===routerlist[i].uid){
            delete routerlist[i];
         }
      }else{
         console.log("Routerlist object nr: "+i+" doesn't appear to have a uid associated with it" )
      }
   }
}
function RouterListModify(obj){
   if (typeof obj.uid !== 'undefined'){
      if (typeof obj.IP!== 'undefined' ||typeof obj.User!== 'undefined' || typeof obj.Password!== 'undefined'|| typeof obj.Port !== 'undefined'){
         for(i=0;i<routerlist.length;i++){
         
          }
      }else{
         console.log("No modification set, no modification of element: " +obj.uid+ " neccesary");
         //No parameters set, no modification neccesary
      }
   }else{
      //wrong request, handle this
   }
   

}
 function feeder(obj) {
   console.log("     HELLLOWORLD     "); 
   console.log(obj);
   console.log("     HELLLOWORLD     ");
 }
