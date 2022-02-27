import { useState } from "react"
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import { blueGrey } from '@mui/material/colors'

export default function PageLogin({ setUpdate }) {

	const [username, setUsername] = useState("")
	const [password, setPassword] = useState("")
	const [infoMsg, setInfoMsg] = useState({ color: "blue", msg: "" })

	async function submit(event) {
		event.preventDefault()
		const res = await fetch("https://fullstack-flights-app.herokuapp.com/login/", {
			method: "post",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ username, password }),
			credentials: "include"
		})

		const data = await res.json()

		if (data.err) {
			setInfoMsg({ color: "red", msg: `${data.err}` })
		} else {
			console.log(data)
			setInfoMsg({ color: "green", msg: `${data.msg} ${data.username}` })
		}

		setUpdate(prev => !prev)
	}

	return (
		<form onSubmit={submit} className="form-login-register">
			<br />
			<h1>LOGIN</h1>
			<br />
			<TextField
				type="text"
				label="Username"
				variant="filled"
				onChange={e => setUsername(e.target.value)}
				sx={{ input: { color: "white" }, "label": { color: "white" }, div: { backgroundColor: "rgba(0 0 0 / 40%)" } }}
			/>
			<br />
			<TextField
				type="text"
				label="Password"
				variant="filled"
				onChange={e => setPassword(e.target.value)}
				sx={{ input: { color: "white" }, "label": { color: "white" }, div: { backgroundColor: "rgba(0 0 0 / 40%)" } }}
			/>
			<br />
			<Button sx={{ backgroundColor: blueGrey[500] }} type="submit" variant="contained">Login</Button>
			<h3 style={{ color: infoMsg.color }}>{infoMsg.msg}</h3>
		</form>
	)
}