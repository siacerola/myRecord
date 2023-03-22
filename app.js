const express = require('express')
const bodyParser = require('body-parser')
const _=require('lodash')
const responseTransactionList = require('./response')
const app = express()
const db = require(`${__dirname}/connection`)
const response = require(`${__dirname}/response`)

app.use(
    bodyParser.urlencoded({extended:true})
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
        SELECT transaksi.id_transaksi AS idTransaction,
        user_app.user_name AS createBy, 
        transaksi.created_date AS createdDate,
        transaksi.nomor_transaksi AS numberTransaction, 
        transaksi.nomor_so AS numberSO,
        status.status_name AS statusTransaction,
        transaksi.total_pembelian AS totalAmount
        FROM transaksi
        INNER JOIN user_app ON transaksi.fk_id_user = user_app.id_user
        INNER JOIN status ON transaksi.fk_id_status = status.id_status`, (err,transactionList,ield) => {
            if (err) throw err
            else {
                db.query(`SELECT COUNT(id_transaksi) AS totalTransaction
                FROM transaksi`, (err, totalData, ield) => {
                    if (err) throw err
                    else
                    responseTransactionList(
                        200,
                        transactionList,
                        totalData,
                        `success`,
                        res
                    )
                })
            }
        })
    })


app.route("/transaction/:id_transaction")
    .get((req, res) => {
        const idTransaction=req.params.id_transaction
        db.query(`SELECT item.item_name,
        item_transaksi.deskripsi_item,
        item_transaksi.qty,
        item_transaksi.harga_satuan
        FROM item_transaksi
        INNER JOIN item ON item_transaksi.fk_id_item = item.id_item
        WHERE fk_id_transaksi =${idTransaction}`, (err, row, ield) => {
            if (err) throw err
            else res.send(row)
        })
    })



app.listen(3000, () => {
    console.log("server listening on port 3000");
})