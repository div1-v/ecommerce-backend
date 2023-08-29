class ResponseHandler {
  constructor( statusCode, message, messageCode, data,res) {

      this.statusCode = statusCode;
      this.message=message,
      this.messageCode = messageCode,
      this.data = data,
      this.res=res
  }

  getResponse() {
    console.log(this.res);
    return this.res.status(this.statusCode).json({
      meta: {
        status: true,
        message: this.message,
        message_code: this.messageCode,
        status_code: this.statusCode,
      },
      data: this.data
    })
  }
}

module.exports = ResponseHandler;
