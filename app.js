const express = require('express')
const bodyParser = require('body-parser')
const _=require('lodash')

const { toArray } = require('lodash')
const app = express()
const db = require(`${__dirname}/connection`)

// const responseTransactionList = require('./response')
const response = require('./response')


app.use(
    bodyParser.json()
)


// login page
app.get("/login", (req, res) => {
    
})


// home page
app.get("/", (req, res) => {
    
})


app.route("/user")
    // get all user
    .get((req, res) => {
        db.query(`SELECT user_app.user_name, role.role_name, active.active_name
        FROM user_app
        INNER JOIN role ON user_app.fk_id_role = role.id_role
        INNER JOIN active ON user_app.fk_id_active = active.id_active`, (err, row, ield) => {
            if (err) throw err
            else response(
                200,
                row,
                "get all user",
                res
            )
        })
    })


app.route("/user/:user_name")
    .get((req, res) => {
        const userName = _.lowerCase(req.params.user_name)
        // console.log(userName);
        
        // get user by name
        db.query(`
        SELECT user_app.user_name, role.role_name, active.active_name
        FROM user_app
        INNER JOIN role ON user_app.fk_id_role = role.id_role
        INNER JOIN active ON user_app.fk_id_active = active.id_active
        WHERE user_app.user_name='${userName}'`, (err,row,ield)=> {
            if (err) throw err
            else res.send(row)
        })
    })

    // update replace data by name
    .put((req, res) => {
        const userName = _.lowerCase(req.params.user_name)
        const newPassword =req.body.newPassword
        // change password
        connection.query(`
        UPDATE user_app
        SET user_app.user_password='${newPassword}'
        WHERE user_app.user_name='${userName}'
        `, (err, row, ield) => {
            if (err) throw err
            else res.send(`password ${userName} berhasil diganti`)
        })
    })
    
    // delete user by name
    .delete((req, res) => {
        const userName = _.lowerCase(req.params.user_name)
        db.query(`
        DELETE FROM user_app
        WHERE user_app.user_name='${userName}'`, (err, row, ield) => {
            if (err) throw err
            else res.send(`${userName} telah berhasil dihapus`)
        })
    })


app.route("/role")
    // get all role user
    .get((req, res) => {
        db.query(`SELECT * FROM role`, (err, row, ield) => {
            if (err) throw err
            else res.send(row)
        })
    })


app.route("/item")
    // get all item
    .get((req, res) => {
        db.query(`SELECT * FROM item`, (err, row, ield) => {
            if (err) throw err
            else res.send(row)
        })
    })

app.route("/item/:item_name")
    // get spesiik item
    .get((req, res) => {
        const itemName = _.lowerCase(req.params.item_name)
        db.query(`SELECT * FROM item
        WHERE item_name LIKE '%${itemName}%'`, (err, row, ield) => {
            if (err) throw err
            else {
                response(
                    200,
                    row,
                    `select all item like ${itemName}`,
                    res
                )
            }
        })
    })
    .put((req, res) => {
        const itemName = _.lowerCase(req.params.item_name)
        const newItemName = _.lowerCase(req.body.newItemName)
        db.query(`UPDATE item
        SET item_name = '${newItemName}'
        WHERE item_name LIKE '%${itemName}%'`, (err, row, ield) => {
            if (err) throw err
            else {
                db.query(`SELECT * FROM item
                WHERE item_name LIKE '%${newItemName}%'`, (err, row, ield) => {
                    if (err) throw err
                    else
                    response(
                        200,
                        row,
                        `item ${itemName} successully changed`,
                        res
                    )
                })
            }
        })
    })

// get all transaction
app.route("/transaction")
    .get((req, res) => {
        db.query(`
        SELECT transaksi.transaksi_id,
        user_app.user_name, 
        transaksi.created_date,
        transaksi.nomor_so,
        status.status_name,
        transaksi.total_pembelian
        FROM transaksi
        INNER JOIN user_app ON transaksi.fk_id_user = user_app.user_id
        INNER JOIN status ON transaksi.fk_id_status = status.status_id`, (err,transactionList,ield) => {
            if (err) throw err
            else {
                // res.send(transactionList)
                db.query(`SELECT COUNT(transaksi_id) AS totalTransaction
                FROM transaksi`, (err, totalData, ield) => {
                    if (err) throw `${err}`
                    else {
                        responseTransactionList(
                            200,
                            transactionList,
                            totalData,
                            `success get ${parseInt(JSON.stringify(totalData[0].totalTransaction))} transaction`,
                            res
                        )
                    }
                })
            }
        })
    })

    .post((req, res) => {
        const totalAmount = req.body.totalAmount
        const userId = req.body.userId
        const numberSo = req.body.numberSo
        const transactionDescription = req.body.transactionDescription

        const idItem = req.body.idItem
        const itemDeskripsi = req.body.itemDeskripsi
        const itemQty = req.body.itemQty
        const itemPrice = req.body.itemPrice

        const currentDate = new Date()
        const dd =currentDate.getDate()
        const mm =currentDate.getMonth()+1
        const yyyy =currentDate.getFullYear()

        const createdDate = `${yyyy}-${mm}-${dd}`

        db.query(`INSERT INTO transaksi
        (transaksi_id, total_pembelian, fk_id_user, nomor_so, fk_id_status, transaksi_deskripsi, created_date,updated_date)
        VALUES
        (DEFAULT, ${totalAmount}, ${userId}, '${numberSo}',1, '${transactionDescription}', '${createdDate}','${createdDate}')`, (err, transactionResult) => {
            if (err) throw err
            else {
                db.query(`SELECT * FROM transaksi 
                ORDER BY transaksi_id DESC LIMIT 1`, (err, transactionId) => {
                    if (err) throw err
                    else {
                        const newTransactionId = transactionId[0].transaksi_id
                        db.query(`INSERT INTO item_transaksi 
                        (item_transaksi_id, fk_id_item, fk_id_transaksi, deskripsi_item_transaksi, qty, harga_satuan) 
                        VALUES (DEFAULT,${idItem},${newTransactionId},'${itemDeskripsi}',${itemQty},${itemPrice})`, (err, itemTransactionResult) => {
                        if (err) throw err
                        else response.responeUpdate(
                                200,
                                itemTransactionResult,
                                `transaksi berhasil dibuat`,
                                res
                            )
                        })
                    }
                })
            }
        })
    })


app.route("/transaction/detail")
    .get((req, res) => {
        db.query(`SELECT * FROM item_transaksi`, (err, result) => {
            if (err) throw err
            else
                response.responseTransactionList(
                200,
                result,
                _,
                `successget all detail transaction`,
                res
            )
        })
    })

    .post((req, res) => {

        const idItem = req.body.idItem
        const idTransaksi = req.body.idTransaksi
        const itemDeskripsi = req.body.itemDeskripsi
        const itemQty = req.body.itemQty
        const itemPrice = req.body.itemPrice
        db.query(`INSERT INTO item_transaksi 
        (item_transaksi_id, fk_id_item, fk_id_transaksi, deskripsi_item_transaksi, qty, harga_satuan) 
        VALUES (DEFAULT,${idItem},${idTransaksi},'${itemDeskripsi}',${itemQty},${itemPrice})`, (err, result) => {
            if (err) throw err
            else response.responeUpdate(
                200,
                result,
                `item transaksi berhasil dibuat`,
                res
            )
        })
    })



app.route("/transaction/detail/:idTransaction")
    .get((req, res) => {
        const idTransaction=req.params.idTransaction
        db.query(`SELECT item.item_name,
        item_transaksi.deskripsi_item_transaksi,
        item_transaksi.qty,
        item_transaksi.harga_satuan
        FROM item_transaksi
        INNER JOIN item ON item_transaksi.fk_id_item = item.item_id
        WHERE fk_id_transaksi =${idTransaction}`, (err, row, ield) => {
            if (err) throw err
            else response.responeUpdate(
                200,
                row,
                `detail transactionID ${idTransaction} berhasil ditampilkan`,
                res
            )
        })
    })

    .put((req, res) => {
        const idTransaction = req.params.idTransaction
        
        const updateTotalAmount = req.body.updateTotalAmount
        const updateCreatedBy = req.body.updateCreatedBy
        const updateSalesNumber =req.body.updateSalesNumber
        const updateStatus = req.body.updateStatus
        
        const currentDate = new Date()
        const dd =currentDate.getDate()
        const mm =currentDate.getMonth()+1
        const yyyy =currentDate.getFullYear()

        const updatedDate = `${yyyy}-${mm}-${dd}`
        db.query(`UPDATE transaksi
        SET transaksi.total_pembelian =${updateTotalAmount},
        transaksi.fk_id_user=${updateCreatedBy},
        transaksi.nomor_so='${updateSalesNumber}',
        transaksi.fk_id_status=${updateStatus},
        transaksi.updated_date='${updatedDate}'
        WHERE transaksi.transaksi_id = ${idTransaction}`, (err, result) => {
            if (err) res.send(`put/transaction/:id = ${err}`) 
            else 
                response.responeUpdate(
                    200,
                    result,
                    `data berhasil diubah`,
                    res
                )
        })
    })



app.listen(3000, () => {
    console.log("server listening on port 3000");
})