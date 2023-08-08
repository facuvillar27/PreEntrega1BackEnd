const express = require('express')
const router = express.Router()
const fs = require('fs').promises

const carts = []
let cartId = 1
let quantity = 1

async function writeFile() {
    const data = JSON.stringify(carts)
  
    try {
      await fs.writeFile('carts.json', data)
      console.log('Archivo actualizado correctamente')
    } catch (error) {
      console.log('Error al escribir el archivo')
    }
}

async function loadProducts() {
    try {
      const data = await fs.readFile('carts.json')
      const parsedData = JSON.parse(data)
      carts.push(...parsedData)
      const maxId = Math.max(...carts.map((cart) => cart.id))
      cartId = maxId + 1
      console.log('Productos cargados correctamente')
    } catch (error) {
      console.log('Error al cargar los productos')
    }
  }

  loadProducts()

router.post("/api/carts", (req,res) => {

    const newCart = {
        id: cartId,
        products: []
    }
    cartId++
    carts.push(newCart)
    writeFile()
    res.json({ message: "Carrito agregado correctamente." })
})

router.get("/api/carts/:cid", (req,res) => {
    const cid = parseInt(req.params.cid)

    const cart = carts.find((cart) => cart.id === cid)

    if (!cart) {
        return res.status(404).json({ error: "Carrito no encontrado."})
    }

    return res.json(cart)
})

router.post("/api/carts/:cid/product/:pid", (req,res) => {
    

    const pid = parseInt(req.params.pid)
    const cid = parseInt(req.params.cid)

    const cart = carts.find((cart) => cart.id === cid)

    if (!cart) {
        return res.status(404).json({ error: "Carrito no encontrado."})
    }

    const existingProduct = cart.products.find((product) => product.product === pid);

    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      const newProduct = {
        product: pid,
        quantity: 1,
      };
      cart.products.push(newProduct);
    }

    writeFile()
    
    res.json({ message: "Producto agregado correctamente." })
})

module.exports = router