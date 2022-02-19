//Socket
const express = require("express")
const app = express()
const moment = require("moment")

//Modulos
const formatoMensaje = require("./utils/mensajes")
const formatoProducto = require("./utils/formatoProd")

/// OPTIONS KNEX
const {optionsMDB, optionsSqlite} = require("./options/options")
const ContenedorDB = require("./utils/ContenedorDB")

//Socket
const {Server: HttpServer} = require("http")
const {Server: IOServer} = require("socket.io")

const httpServer = new HttpServer(app)
const io = new IOServer(httpServer)
const port = 3000
const path = require("path")
//handlebars
const {engine} = require("express-handlebars")

// Codificacion
app.use(express.json())
app.use(express.urlencoded({extended: true}))

///Configuracion Handlebars
app.engine(
   ".hbs",
   engine({
      extname: ".hbs", //extension
      defaultLayout: "main",
      layoutsDir: path.join(app.get("views"), "layouts"),
      partialsDir: path.join(app.get("views"), "partials"),
   })
)
//espacio Publico del servidor
app.use(express.static("./public"))
/// se establece el directorio
app.set("views", path.join(__dirname, "views"))
///se establece el motor
app.set("view engine", "hbs")

/// HOME

app.get("/", (req, res) => {
   res.redirect("/home")
})
///HOME
app.get("/home", (req, res) => {
   res.render("index", {
      title: "Proyecto Web Sockets",
      path: "/",
      link: "Salir",
      desconectado: false,
   })
   /* username = req.query.username
    console.log('prueba', username) */
})
////////***** PRODUCTS */
let listaProductos /*  [
   formatoProducto(
      "Sneakers 1",
      3200,
      "https://images.unsplash.com/photo-1605856302642-bdf3d79c4f4f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTd8fHNuZWFrZXJ8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60"
   ),
   formatoProducto(
      "Sneakers 2",
      3200,
      "https://images.unsplash.com/photo-1605856302642-bdf3d79c4f4f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTd8fHNuZWFrZXJ8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60"
   ),
] */
const productsDB = new ContenedorDB(optionsMDB, "productos")
//productsDB.insertData(listaProductos)

const getProd = async () => {
   try {
      const data = await productsDB.getAll()
      listaProductos = data
      //console.log("l85", listaProductos)
      return listaProductos
   } catch (error) {}
}
getProd()

//Creamos la CHATDB
const chatDB = new ContenedorDB(optionsSqlite, "mensajes")
//chatDB.createTable()

let mensajes
const getData = async () => {
   try {
      const data = await chatDB.getAll()
      mensajes = data

      //console.log("80", mensajes)
      return mensajes
   } catch (error) {}
}
///
getData()
chatDB.deleteData()
//chatDB.deleteByID()
io.on("connection", async (socket) => {
   //

   console.log(`El cliente con el IP ${socket.handshake.address} se ha conectado`)

   const botData = formatoMensaje("Bot", `¡Bienvenido al Chat!`, socket.id)
   await chatDB.insertData(botData)
   await getData()

   socket.emit("mensajes", mensajes)
   //console.log("95", mensajes)
   //productos
   socket.emit("loadProducts", listaProductos)

   socket.on("chatMessage", async (msg) => {
      const mensaje = formatoMensaje(msg.username, msg.text, socket.id)
      await chatDB.insertData(mensaje)
      await getData()
      io.sockets.emit("mensajes", mensajes)
   })
   socket.on("typing", (data) => {
      //console.log(data)
      socket.broadcast.emit("typing", data)
   })

   /// Socket New Product‹

   socket.on("newProduct", async (product) => {
      //console.log(product)
      const newProd = await formatoProducto(product.name, product.price, product.image)
      await productsDB.insertData(newProd)

      //console.log(newProd)
      io.emit("newProduct", newProd)
   })
   socket.on("deleteProduct", async (id) => {
      console.log(id)
      await productsDB.deleteProduct(id)
      listaProductos = await listaProductos.filter((p) => p.id != id)

      //console.log(listaProductos)
      io.emit("loadProducts", listaProductos)
   })

   socket.on("getProduct", (id) => {
      const product = listaProductos.find((p) => p.id == id)
      //console.log(product)
      socket.emit("selectedProduct", product)
   })

   socket.on("updateData", async (data) => {
      console.log(data)
      await productsDB.updateData(
         data.id,
         data.name,
         data.price,
         data.image,
         moment().format("h:mm a")
      )
      await getProd()
      io.emit("loadProducts", listaProductos)
   })

   //El usuario se desconectó

   socket.on("disconnect", async () => {
      await chatDB.deleteByID(socket.id)
      const msg = formatoMensaje("Bot", `Un usuario ha abandonado el Chat.`, socket.id)
      await getData()
      console.log("salida", msg)
      io.sockets.emit("mensajes", mensajes)
   })
})

//server
httpServer
   .listen(port, () => {
      console.log(`listening at http://localhost:${port}`)
   })
   .on("error", (error) => console.log(`Error en servidor ${error}`))
