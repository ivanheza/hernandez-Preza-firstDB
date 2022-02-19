const optionsSqlite = {
   client: "sqlite3",
   connection: {
      filename: `${__dirname}/db/myChatDB.sqlite`,
   },
   useNullAsDefault: true,
}
const optionsMDB = {
   client: "mysql",
   connection: {
      host: "192.168.64.2",
      user: "root",
      password: "",
      database: "eCommerce",
   },
}
module.exports = {
   optionsSqlite,
   optionsMDB,
}
