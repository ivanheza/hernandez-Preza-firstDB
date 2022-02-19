const socket = io()
///Constantes

const productList = document.querySelector("#productList")
const productForm = document.querySelector("#productForm")
const chatForm = document.querySelector("#chat-form")
const chatMessages = document.querySelector("#chat-mensajes")
const inputChat = document.querySelector("#inputChat")
const btnSubmit = document.getElementById("botonProductos")
const mailUser = document.querySelector("#email")
const typing = document.querySelector("#actions")
let savedID = ""
//Event Listener Productos
productForm.addEventListener("submit", (e) => {
   e.preventDefault()
   if (savedID) {
      let producto = {
         name: e.target.elements.nombre.value,
         price: e.target.elements.precio.value,
         image: e.target.elements.image.value,
      }
      upadateProduct(savedID, producto.name, producto.price, producto.image)
      window.location.reload()
   } else {
      let producto = {
         name: e.target.elements.nombre.value,
         price: e.target.elements.precio.value,
         image: e.target.elements.image.value,
      }

      //Emit
      e.target.elements.nombre.value = ""
      e.target.elements.precio.value = ""
      e.target.elements.image.value = ""
      e.target.elements.nombre.focus()
      socket.emit("newProduct", producto)
   }
})

//Event Listener Chat

chatForm.addEventListener("submit", (e) => {
   //console.log("prueba" + input.value)
   e.preventDefault()
   message = {
      username: e.target.elements.email.value,
      text: e.target.elements.inputChat.value,
   }

   //console.log(message);
   if (message.username.length == 0 || message.text.length == 0) {
      alert("No Puedes dejar los campos Vacios")

      e.target.elements.inputChat.focus()
   } else {
      socket.emit("chatMessage", message)

      e.target.elements.inputChat.value = ""
      e.target.elements.inputChat.focus()

      return false
   }
})

inputChat.addEventListener("keypress", () => {
   socket.emit("typing", mailUser.value)
})
///SOCKETS

///

socket.on("mensajes", (data) => {
   typing.innerHTML = ""
   //console.log(data)
   renderChat(data)
})

socket.on("typing", (data) => {
   //console.log(data)
   typing.innerHTML = `<p class="text-muted m-0 p-0">${data} está escribiendo...</p>`
})

socket.on("loadProducts", (data) => {
   //console.log(data);
   renderProducts(data)
})
socket.on("newProduct", (product) => {
   //console.log(product)
   appendProduct(product)
})

const upadateProduct = (id, name, price, image, time) => {
   socket.emit("updateData", {
      id,
      name,
      price,
      image,
   })
}
socket.on("selectedProduct", (product) => {
   console.log(product)
   const name = document.getElementById("nombre")
   const price = document.getElementById("precio")
   const image = document.getElementById("image")
   //console.log(price.value)
   name.value = product.name
   price.value = product.price
   image.value = product.image

   savedID = product.id
})
///RENDER DOM

const renderChat = (data) => {
   //console.log(data)

   const html = data
      .map((m) => {
         return `<div class="mensaje">
           <p id="datos" class="opacity-75 badge bg-secondary mb-1">
                       ${m.usuario}<span class="mx-3 text-dark badge bg-warning">${m.time}</span>
                             </p>
                             <p class="lead">${m.mensaje}</p>
         </div>`
      })
      .join("")

   chatMessages.innerHTML = html
   chatMessages.scrollTop = chatMessages.scrollHeight
}

// DOM PRODUCTS
const renderProducts = (products) => {
   productList.innerHTML = ""
   //console.log(products)
   products.map((p) => productList.append(renderProduct(p)))
}

const renderProduct = (product) => {
   //console.log(product)
   const div = document.createElement("div")
   div.innerHTML = `
                    <div class="card card-boy rounded-0 mb-2 shadow ">
                    <div class="d-flex align-items-center justify-content-between p-2">
                    <img src="${product.image}" width="50" alt="" />
                    <h1 class="card-title">${product.name}</h1>
                    <h4>$ ${product.price}</h4>
                       <div>
                       <button class="btn btn-danger delete" data-id="${product.id}">X</button>
                       <button class="btn btn-success update" data-id="${product.id}">update</button>
                       </div>
                    </div>
                    </div>
                    `
   const btnDelete = div.querySelector(".delete")
   const btnUpdate = div.querySelector(".update")

   btnDelete.addEventListener("click", () => {
      //console.log("consola desde boton delete", btnDelete.dataset.id)
      deleteProduct(btnDelete.dataset.id)
   })
   btnUpdate.addEventListener("click", () => {
      //console.log("consola desde boton update", btnDelete.dataset.id)
      getProduct(btnDelete.dataset.id)
      btnSubmit.classList.add("btn-danger")
      btnSubmit.innerText = "Actualizar"
   })

   //console.log(btnDelete)
   return div
}
const appendProduct = (product) => {
   //console.log(product)
   productList.append(renderProduct(product))
}

const deleteProduct = (id) => {
   console.log(id)
   socket.emit("deleteProduct", id)
}

const getProduct = (id) => {
   socket.emit("getProduct", id)
}
