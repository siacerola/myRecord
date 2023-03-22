const response = (
    statusCode,
    message,
    res
) => {
    res.status(statusCode).json({
        data: data,
        message: message,
        statusCode: statusCode
    })
}

module.exports = response

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

module.exports = responseTransactionList