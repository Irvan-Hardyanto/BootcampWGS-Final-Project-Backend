const Transport = require('winston-transport');
const util = require('util');
const log = require('../models').log;

module.exports = class CustomTransport extends Transport {
  constructor(opts) {
    super(opts);
    //
    // Consume any custom options here. e.g.:
    // - Connection information for databases
    // - Authentication information for APIs (e.g. loggly, papertrail,
    //   logentries, etc.).
    //
    this.writeToDatabase = this.writeToDatabase.bind(this);
  }

  writeToDatabase(text){
  	const fields = text.split(" ");
  	const timestamp= fields[0]
    let userId = fields[1];
    let role=fields[2];
  	const sourceIP = fields[3];
  	const method =fields[4];
  	const url = fields[5];
  	const statusCode = fields[6];
  	const responseTime = fields[7];
  	const totalTime = fields[8];
  	
    if(userId=='-'){
      userId=null;
    }
    if(role=='-'){
      role=null;
    }
    log.create({
      userId,
      timestamp,
      role,
      sourceIP,
      method,
      url,
      statusCode,
      responseTime,
      totalTime
    }).then(succ=>{

    }).catch(err=>{
      console.log('an error has occured while logging');
      console.log('error is: '+err);
    })
  }

  log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    // Perform the writing to the remote service
    // console.log('info.message: '+JSON.stringify(info.message));
    this.writeToDatabase(info.message);

    //gak boleh kehapus!!!
    callback();
  }
}