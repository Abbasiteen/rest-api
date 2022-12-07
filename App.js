const express = require("express")
const connection = require("./Connection")
const uuid = require("uuid")
const fileUpload = require('express-fileupload')
const cors = require("cors")
const fs = require('fs')
const jwt = require('jsonwebtoken')
const app = express()
const ACCESS_TOKEN_SECRET = `820e8bac8fcecb3d019e7b2e56bf69604fd78cef02f790405a7992625f21929831c97cf61b4120a0251760ab27a5e3923c54a83a84e1a86688ce6
3c1a612b6fc`
const REFRESH_TOKEN_SECRET = `b89204d6b54797dd96ca054e1cda5b15dc0db6f9b258fc8481ef10743a3da532f4b1d70daca854582e0ff6246a9f05833ba4b4c74a520ddd788e7
754984e6535`

app.use(fileUpload())
app.use(cors())
app.use(express.static("images"))

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"]
  const token = authHeader.split(' ')[1]
  if (token == null) return res.status(401).send("Problem with the token")

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      res.status(403).send("Error")
    }
    req.user = user
    next()
  })
}

app.post('/login', (req, res) => {
  const reqUsername = req.body.username
  const accessToken = jwt.sign(reqUsername, ACCESS_TOKEN_SECRET)
  var productGet = "SELECT * FROM users"
  connection.query(productGet, (err, result) => {
    var abbas=false
    result.map(item => {
      if(item.username == reqUsername) {
    abbas=true
      }

    })
   if(abbas){
    res.status(200).send(accessToken)
   }else{
    res.status(503).send("qo`chqorvoy")
   }

  })
})


app.get("/product", (req, res) => {
  var productGet = "SELECT * FROM product"
  connection.query(productGet, (err, result) => {
    if (!err) {
      res.status(200).send(result)
    } else {
      res.status(400).send("Product was not get")
    }
  })
})

app.post("/product",authenticateToken, (req, res) => {
  var productName = req.body.name
  var count = req.body.count
  var price = req.body.price
  var fullId = uuid.v4()
  const file = req.files.image
  const fileName = + Date.now() + file.name
  file.mv(`${__dirname}/images/${fileName}`)
  connection.query("INSERT INTO product values(?, ?, ?, ?, ?)", [fullId, productName, price, count, fileName], (err, result) => {
    if (!err) {
      res.status(201).send("Product Added Successfully")
    } else {
      res.status(400).send("Product was not added")
    }
  })
})

app.delete("/product/:id",authenticateToken,  (req, res) => {
  const id = req.params.id
  var productGet = "SELECT * FROM product"
  connection.query(productGet, (err, result) => {
    result.map(item => {
      if (id == item.full_id) {
        fs.unlinkSync(`images/${item.img}`)
      }
    })
  })
  connection.query("DELETE FROM product WHERE full_id=?", [id], (err, result) => {

    if (!err) {
      if (result.affectedRows == 0) {
        res.status(404).send('Product id does not found')
      }
      res.status(200).send("Product Delete Successfully")
    } else {
      res.status(500).send(err)
    }
  })
})

app.put("/product/:id",authenticateToken, (req, res) => {
  const id = req.params.id
  const product = req.body
  const imgFile = req.files
  let newImg
  const imgRender = Date.now() + req.files.image.name
  var productGet = "SELECT * FROM product"
  connection.query(productGet, (err, result) => {
    result.map(item => {
      if (id == item.full_id) {
        if (imgFile == null) {
          newImg = item.img
        } else {
          fs.unlinkSync(`images/${item.img}`)
          newImg = imgRender
          req.files.image.mv(`${__dirname}/images/${imgRender}`)
        }
        connection.query("UPDATE product SET name=?, price=?, count=?, img=? WHERE full_id=?", [product.name, product.price, product.count, newImg, id], (err, result) => {
          if (!err) {
            if (result.affectedRows == 0) {
              res.status(404).send('Product is does not found')
            }
            res.status(200).send("Product Updated Successfully")
          } else {
            res.status(500).send(err)
          }
        })
      }
    })
  })


})



app.listen(5000, (err) => {
  if (!err) {
    console.log("The Server is Running");
  }
})
