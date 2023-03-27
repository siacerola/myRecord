
const responseUpdate = (
    statusCode,
    result,
    message,
    res
) => {
    res.status(statusCode).json({
        result: result,
        message: message,
        statusCode:statusCode
    })
}

const responseTransactionList = (
    statusCode,
    data,
    count,
    message,
    res
) => {
    res.status(statusCode).json({
        transactionList: data,
        totalData:count,
        message: message,
        statusCode: statusCode
    })
}


module.exports = {
    responeUpdate: responseUpdate,
    responseTransactionList:responseTransactionList
}