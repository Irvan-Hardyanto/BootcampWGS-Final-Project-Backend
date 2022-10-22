/*
Dikutip dari: https://lioncoding.com/logging-in-express-js-using-winston-and-morgan/
*/

const morgan = require("morgan");
const logger = require("../utils/logger");

const stream = {
  // Use the http severity
  write: (message) => logger.http(message),
};

const skip = () => {
  const env = process.env.NODE_ENV || "development";
  return env !== "development";
};

morgan.token('user-id',(req,res)=>{
  if(req.headers['user-id']){
    return req.headers['user-id'];
  }else{
    return '-';
  }
})

morgan.token('user-role',(req,res)=>{
  if(req.headers['user-role']){
    return req.headers['user-role'];
  }else{
    return '-';
  }
})

const morganMiddleware = morgan(
  // Define message format string (this is the default one).
  // The message format is made from tokens, and each token is
  // defined inside the Morgan library.
  // You can create your custom token to show what do you want from a request.
  ":date[iso] :user-id :user-role :remote-addr :method :url :status :response-time :total-time",
  // Options: in this case, I overwrote the stream and the skip logic.
  // See the methods above.
  { stream, skip }
);

module.exports = morganMiddleware;


// const db=require("../models");
// const { log: Log} = db;

// //kalo pake logger buatan sendiri-> susah dapetin statuscode sama response time nya
// const saveLogToDB = (req,res,next)=>{
// 	console.log('A request is received!')
// 	console.log('method is: '+req.method);
// 	console.log('source IP addres is:'+req.ip)
// 	console.log('request url is: '+req.originalUrl)
// 	res.on('finish',()=>{
// 		console.log('status code for this request is: '+res.status)
// 	})
// 	next();
// }

// module.exports={saveLogToDB};