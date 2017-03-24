module.exports = (message, status) =>  {
  if(status === 0) {
    console.log(message);
  } else {
    console.error( message.stack ? message.stack : String(message));
  }
};
