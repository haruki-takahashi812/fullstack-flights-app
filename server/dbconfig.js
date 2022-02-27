const mysql = require("mysql")

const con = mysql.createConnection({
	host: "ilzyz0heng1bygi8.chr7pe7iynqr.eu-west-1.rds.amazonaws.com",
	user: "b9jpby82wilwniqu",
	password: "ju4hb7bxpqyhh1r9",
	database: "pen9wul9poexzzxt"
})

con.connect(err => {
	if (err) {
		return console.log(err)
	}
	console.log("connected to mysql server")
})

function SQL(q) {
	return new Promise((resolve, reject) => {
		con.query(q, (err, results) => {
			if (err) {
				reject(err)
			} else {
				resolve(results)
			}
		})
	})
}

module.exports = SQL