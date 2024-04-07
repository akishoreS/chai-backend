class ApiError extends Error{
    constructor(
        statusCode,
        message="Something went wrong",
        errors=[],
        statck=""

    ){
        super(message)
        this.ststuaCode=statusCode
        this.data=null
        this.message = message
        this.errors= errors
        if(statck){
            this.stack=statck
        }else{
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export {ApiError}