const moment = require("moment")

const formatoProducto = (name, price, image) => {
   return {
      name: name,
      price: price,
      image: image,
      time: moment().format("h:mm a"),
   }
}

module.exports = formatoProducto
