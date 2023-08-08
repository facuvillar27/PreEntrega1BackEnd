const express = require('express')
const router = express.Router()
const fs = require('fs').promises

const products = []
let productId = 1

async function writeFile() {
    const data = JSON.stringify(products)
  
    try {
      await fs.writeFile('products.json', data)
      console.log('Archivo actualizado correctamente')
    } catch (error) {
      console.log('Error al escribir el archivo')
    }
}

async function loadProducts() {
    try {
      const data = await fs.readFile('products.json')
      const parsedData = JSON.parse(data)
      products.push(...parsedData)
      const maxId = Math.max(...products.map((product) => product.id))
      productId = maxId + 1
      console.log('Productos cargados correctamente')
    } catch (error) {
      console.log('Error al cargar los productos')
    }
  }
  
  // Llamar a la función loadProducts al iniciar el servidor
  loadProducts()

// Endpoints

router.get("/api/products", (req,res) => {
    res.json({ products })
})

router.get("/api/products/:pid", (req,res) => {
    const pid = parseInt(req.params.pid)

    const product = products.find((product) => product.id === pid)

    if (!product) {
        return res.status(404).json({ error: "Producto no encontrado."})
    }

    return res.json(product)
})

router.post("/api/products", (req,res) => {
    const newProduct = {
        id: productId,
        ...req.body
    }
    productId++
    products.push(newProduct)
    writeFile()
    res.json({ message: "Producto agregado correctamente." })
})

function generateUniqueId() {
    return Date.now().toString()
}

router.put("/api/products/:pid", (req,res) => {
    const pid = parseInt(req.params.pid)
    const updateFields = req.body

    if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ error: "Debe proporcionar al menos un campo para actualizar."})
    }

    const product = products.find((product) => product.id === pid)

    if (!product) {
        return res.status(404).json({ error: "Producto no encontrado."})
    }
    
    Object.assign(product, updateFields)

    writeFile()
    
    return res.json(product)
})

router.delete("/api/products/:pid", (req,res) => {
    const pid = parseInt(req.params.pid)

    const productIndex= products.findIndex((product) => product.id === pid)

    if (productIndex === -1) {
        return res.status(404).json({ error: "Producto no encontrado."})
    }

    const deletedProduct = products.splice(productIndex, 1)

    writeFile()

    return res.json(deletedProduct[0])
})

module.exports = router