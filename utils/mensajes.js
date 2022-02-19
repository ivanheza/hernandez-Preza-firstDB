const moment = require("moment")

const formatoMensaje = (usuario, mensaje, msgSock) => {
   return {
      usuario,
      mensaje,
      msgSock,
      time: moment().format("h:mm a"),
   }
}

module.exports = formatoMensaje
