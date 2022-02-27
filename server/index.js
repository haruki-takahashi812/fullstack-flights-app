const exp = require("express")
const cors = require("cors")
const session = require("express-session")
const SQL = require("./dbconfig")

const app = exp()

app.use(exp.json())

app.use(cors({
	origin: "https://tamircode.github.io",
	credentials: true
}))

app.use(session({
	secret: "blah",
	name: "ts3",
	saveUninitialized: true,
	resave: false,
	cookie: { maxAge: 1000 * 60 * 60 * 24 }
}))

/*
const res = await fetch("http://localhost:1000/register", {
	method: "post",
	headers: {"content-type": "application/json"},
	body: JSON.stringify({username, password, ...}),
	credentials: "include"
})
*/
app.post("/register", async (req, res) => {
	const { username, password, first_name, last_name } = req.body

	if (!username || !password) {
		return res.status(400).send({ err: "Missing info (username, password)", code: "missing" })
	}

	try {
		await SQL(`INSERT INTO users (username, password, first_name, last_name) VALUES ("${username}", "${password}", "${first_name}", "${last_name}")`)

		return res.send({ msg: "Account created successfully." })
	} catch (err) {
		if (err.code === "ER_DUP_ENTRY") {
			return res.status(409).send({ err: "Username already taken.", code: "taken" })
		}
		console.log(err)
		return res.status(500).send({ err: err.sqlMessage, code: err.code })
	}
})

/*
const res = await fetch("http://localhost:1000/login", {
	method: "post",
	headers: {"content-type": "application/json"},
	body: JSON.stringify({username, password}),
	credentials: "include"
})
*/
app.post("/login", async (req, res) => {
	const { username, password } = req.body

	if (!username || !password) {
		return res.status(400).send({ err: "Missing info (username, password)", code: "missing" })
	}

	try {
		const query = await SQL(`SELECT * FROM users WHERE username = "${username}"`)

		if (!query.length) {
			return res.status(404).send({ err: "Username doesn't exist", code: "doesnt_exist" })
		}

		if (query[0].password != password) {
			return res.status(422).send({ err: "Wrong password", code: "wrong_pass" })
		}

		// exclude password
		let { role, date_created, first_name, last_name, followings } = query[0]

		req.session.user = { username, role, date_created, first_name, last_name, followings: JSON.parse(followings) }

		return res.send({ msg: "Logged in successfully.", username })

	} catch (err) {
		console.log(err)
		return res.status(500).send({ err: err.sqlMessage, code: err.code })
	}
})

// const res = await fetch("http://localhost:1000/loggedin", {credentials: "include"})
app.get("/loggedin", async (req, res) => {
	if (req.session.user) {
		// update user data
		try {
			let query = await SQL(`
				SELECT username, role, date_created, first_name, last_name, followings 
				FROM users WHERE username = "${req.session.user.username}"
			`)
			if (query.length) {
				query[0].followings = JSON.parse(query[0].followings)
				req.session.user = {
					...query[0]
				}
				res.send({
					loggedIn: true,
					...req.session.user
				})
			} else {
				req.session.destroy()
				res.send({ err: "user not found, destroyed session.", code: "user_not_found" })
			}
		} catch (error) {

		}
	} else {
		res.send({
			loggedIn: false,
		})
	}
})

/*
const res = await fetch("http://localhost:1000/logout", {
	method: "post",
	credentials: "include"
})
*/
app.post("/logout", (req, res) => {
	if (!req.session.user) {
		return res.status(401).send({ err: "must be logged in to proceed" })
	}
	req.session.destroy()
	res.send({ msg: "Logged out successfully." })
})

/*
const res = await fetch("http://localhost:1000/changepassword", {
	method: "post",
	headers: {"content-type": "application/json"},
	body: JSON.stringify({username, password}),
	credentials: "include"
})
*/
app.post("/changepassword", async (req, res) => {
	const { username, password } = req.body

	if (!username || !password) {
		return res.status(400).send({ err: "Missing info (username, password)", code: "missing" })
	}

	try {
		await SQL(`UPDATE users SET password = "${password}" WHERE username = "${username}";`)
		return res.send({ msg: "Changed password successfully." })
	} catch (err) {
		console.log(err)
		return res.status(500).send({ err: err.sqlMessage, code: err.code })
	}
})

// const res = await fetch(`http://localhost:1000/publicuserinfo/${username}`, {credentials: "include"})
app.get("/publicuserinfo/:username", async (req, res) => {
	const { username } = req.params
	try {
		let query = await SQL(`
			SELECT username, role, date_created, first_name, last_name, followings 
			FROM users WHERE username = "${username}"
		`)
		if (query.length) {
			query[0].followings = JSON.parse(query[0].followings)
			res.send(query[0]) // {username: "blah", role: "blah"}
		} else {
			res.send({ err: "user doesnt exist", code: "user_not_found" })
		}
	} catch (error) {
		res.status(500).send({ err: error, code: "catch_all" })
	}
})

// const res = await fetch(`http://localhost:1000/flights`, {credentials: "include"})
app.get("/flights", async (req, res) => {
	try {
		let query = await SQL(`SELECT * FROM flights`)
		if (req.session.user) {
			for (let each of query) {
				if (req.session.user.followings.includes(each.id)) {
					each.isFollowed = true;
				} else {
					each.isFollowed = false;
				}
			}
			res.send(query)
		} else {
			res.send(query)
		}
	} catch (error) {
		res.status(500).send({ err: error })
	}
})

// const res = await fetch(`http://localhost:1000/togglefollow/${username}/${flightid}`, {method: "put", credentials: "include"})
// removes/adds flight from followings array of user
app.put("/togglefollow/:username/:flightid", async (req, res) => {
	let { username, flightid } = req.params

	if (isNaN(flightid)) {
		return res.status(400).send({ err: "flightid is not a number", code: "flightid_NaN" })
	}

	flightid = parseInt(flightid)

	try {
		let query = await SQL(`
		SELECT followings FROM users WHERE username = "${username}"`)
		if (!query.length) {
			return res.send({ err: "user doesnt exist", code: "user_not_found" })
		}
		followings = JSON.parse(query[0].followings)
		if (followings.includes(flightid)) {
			// remove flightid from user's json array
			await SQL(`
				UPDATE users
				SET followings = JSON_REMOVE(followings, replace(json_search(followings, 'one', ${flightid}), '"', ''))
				WHERE json_search(followings, 'one', ${flightid}) IS NOT NULL
				AND username = "${username}"
			`)
			await SQL(`UPDATE flights SET followers = followers - 1 WHERE id = ${flightid}`)

			return res.send({ msg: "Removed flightid from followings array successfully." })
		} else {
			// check if flight exists
			let query2 = await SQL(`SELECT * FROM flights WHERE id = ${flightid}`)
			if (!query2.length) {
				return res.send({ err: "flight doesnt exist", code: "flight_not_found" })
			}

			// push flightid to user's json array
			await SQL(`
				UPDATE users
				SET users.followings = JSON_ARRAY_APPEND(users.followings, '$', ${flightid})
				WHERE users.username = "${username}"
			`)

			await SQL(`UPDATE flights SET followers = followers + 1 WHERE id = "${flightid}";`)

			return res.send({ msg: "Added flightid to followings array successfully." })
		}
	} catch (err) {
		console.log(err)
		return res.status(500).send({ err: err.sqlMessage, code: err.code })
	}
})

/*
const res = await fetch("http://localhost:1000/createflight", {
	method: "post",
	headers: {"content-type": "application/json"},
	body: JSON.stringify({destination, description, ...}),
	credentials: "include"
})
*/
app.post("/createflight", async (req, res) => {
	let { destination, description, image_url, start_date, end_date, price } = req.body

	if (!destination || !description || typeof image_url !== "string" || !start_date || !end_date || !price) {
		return res.status(400).send({ err: "Missing info", code: "missing" })
	}

	if (destination.length > 30 || description.length > 200 || image_url.length > 1500) {
		return res.status(409).send({ err: "Maximum characters exceeded. dest: 30, desc: 200, img: 1500", code: "max_char" })
	}

	if (isNaN(price)) {
		return res.status(409).send({ err: "Price is not a number", code: "price_NaN" })
	} else if (price > 99999 || price < 1) {
		return res.status(409).send({ err: "Price must be between 1 to 100000", code: "price_invalid" })
	}

	if (!Date.parse(start_date) || !Date.parse(end_date)) {
		return res.status(409).send({ err: "Start date or end date are not valid dates", code: "date_invalid" })
	}

	// convert to unix
	start_date = parseInt((new Date(start_date).getTime() / 1000).toFixed(0))
	end_date = parseInt((new Date(end_date).getTime() / 1000).toFixed(0))

	try {
		let query;
		if (image_url.length) {
			query = await SQL(`
				INSERT INTO flights
				(destination, description, image_url, start_date, end_date, price)
				VALUES
				('${destination}', '${description}', '${image_url}', ${start_date}, ${end_date}, ${price})
			`)
		} else {
			query = await SQL(`
				INSERT INTO flights
				(destination, description, start_date, end_date, price)
				VALUES
				('${destination}', '${description}', ${start_date}, ${end_date}, ${price})
			`)
		}
		return res.send({ msg: "Flight created successfully.", insertId: query.insertId })
	} catch (err) {
		console.log(err)
		return res.status(500).send({ err: err.sqlMessage, code: err.code })
	}
})

/*
const res = await fetch("http://localhost:1000/updateflight", {
	method: "put",
	headers: {"content-type": "application/json"},
	body: JSON.stringify({id, destination, description, ...}),
	credentials: "include"
})
*/
app.put("/updateflight", async (req, res) => {
	let { id, destination, description, image_url, start_date, end_date, price } = req.body

	if (!destination || !description || typeof image_url !== "string" || !start_date || !end_date || !price) {
		return res.status(400).send({ err: "Missing info", code: "missing" })
	}

	if (destination.length > 30 || description.length > 200 || image_url.length > 1500) {
		return res.status(409).send({ err: "Maximum characters exceeded. dest: 30, desc: 200, img: 1500", code: "max_char" })
	}

	if (isNaN(price)) {
		return res.status(409).send({ err: "Price is not a number", code: "price_NaN" })
	} else if (price > 99999 || price < 1) {
		return res.status(409).send({ err: "Price must be between 1 to 100000", code: "price_range" })
	}

	if (!Date.parse(start_date) || !Date.parse(end_date)) {
		return res.status(409).send({ err: "Start date or end date are not valid dates", code: "date_invalid" })
	}

	// convert to unix
	start_date = parseInt((new Date(start_date).getTime() / 1000).toFixed(0))
	end_date = parseInt((new Date(end_date).getTime() / 1000).toFixed(0))

	try {
		const query = await SQL(`SELECT * FROM flights WHERE id = ${id}`)

		if (!query.length) {
			return res.status(404).send({ err: "Cannot find flight ID. Refresh page.", code: "doesnt_exist" })
		}

		await SQL(`
			UPDATE flights SET
				destination = '${destination}', 
				image_url = ${image_url ? `'${image_url}'` : "'https://i.imgur.com/qBY62uF.jpg'"}, 
				start_date = ${start_date}, 
				end_date = ${end_date}, 
				price = ${price}
			WHERE id = ${id}
		`)

		return res.send({ msg: "Flight updated successfully." })
	} catch (err) {
		console.log(err)
		return res.status(500).send({ err: err.sqlMessage, code: err.code })
	}
})

/* const res = await fetch(`http://localhost:1000/deleteflight/${flight.id}`, { method: "delete", credentials: "include" }) */
app.delete("/deleteflight/:flightID", async (req, res) => {
	const { flightID } = req.params

	try {
		const query = await SQL(`SELECT * FROM flights WHERE id = ${flightID}`)

		if (!query.length) {
			return res.status(404).send({ err: "Cannot find flight ID. Refresh page.", code: "doesnt_exist" })
		}

		await SQL(`DELETE FROM flights WHERE id = ${flightID}`)

		return res.send({ msg: "Flight deleted successfully." })

	} catch (err) {
		console.log(err)
		return res.status(500).send({ err: err.sqlMessage, code: err.code })
	}
})

app.listen(process.env.PORT || 1000, () => console.log(`Server running.`))