
module.exports = (message, status) =>  {
  if(status === 0) {
    console.log(message);
    process.exit(0);
  } else {
    console.error( message.stack ? message.stack : String(message));
    process.exit(1);
  }
};
