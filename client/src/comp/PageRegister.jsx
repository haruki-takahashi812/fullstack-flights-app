import { useRef, useState } from "react"
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import { blueGrey } from '@mui/material/colors'

export default function PageRegister({ setUpdate }) {

	const [inputValues, setInputValues] = useState({ firstName: "", lastName: "", username: "", password: "" })
	const [inputErrors, setInputErrors] = useState({ firstName: "", lastName: "", username: "", password: "" })
	const inputRefs = { firstName: useRef(null), lastName: useRef(null), username: useRef(null), password: useRef(null) }
	const [infoMsg, setInfoMsg] = useState({ color: "blue", msg: "" })


	function inputChange(e, input) {
		setInputValues(prev => {
			prev[input] = e.target.value
			return prev
		})
		setInputErrors(prev => ({ ...prev, [input]: "" }))
	}

	function submit(event) {
		event.preventDefault()
		let firstError = [] // indices of useRef list to determine first invalid input and focus() it
		let inputErrorsTemp = { firstName: false, lastName: false, username: false, password: false }

		if (!inputValues.firstName.length) {
			firstError.push("firstName")
			inputErrorsTemp.firstName = "This field is required"
		} else if (!/^\w+$/.test(inputValues.firstName)) {
			firstError.push("firstName")
			inputErrorsTemp.firstName = "Allowed characters: a-z, 1-9, and underscore."
		}

		if (!inputValues.lastName.length) {
			firstError.push("lastName")
			inputErrorsTemp.lastName = "This field is required"
		} else if (!/^\w+$/.test(inputValues.lastName)) {
			firstError.push("lastName")
			inputErrorsTemp.lastName = "Allowed characters: a-z, 1-9, and underscore."
		}

		if (!inputValues.username.length) {
			firstError.push("username")
			inputErrorsTemp.username = "This field is required"
		} else if (!/^\w+$/.test(inputValues.username)) {
			firstError.push("username")
			inputErrorsTemp.username = "Allowed characters: a-z, 1-9, and underscore."
		}

		if (!inputValues.password.length) {
			firstError.push("password")
			inputErrorsTemp.password = "This field is required"
		} else if (!/^\w+$/.test(inputValues.password)) {
			firstError.push("password")
			inputErrorsTemp.password = "Allowed characters: a-z, 1-9, and underscore."
		}

		setInputErrors(inputErrorsTemp)

		if (firstError.length) {
			// focus() on first input with error
			inputRefs[firstError[0]].current.focus()
		} else {
			// validation test passed
			submitFetch()
		}

	}

	async function submitFetch() {
		try {
			const res = await fetch("https://fullstack-flights-app.herokuapp.com/register/", {
				method: "post",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					username: inputValues.username,
					password: inputValues.password,
					first_name: inputValues.firstName,
					last_name: inputValues.lastName
				}),
				credentials: "include"
			})

			const data = await res.json()

			if (data.err) {
				if (data.code === "taken") {
					setInputErrors(prev => ({ ...prev, username: "Username already taken" }))
					inputRefs.username.current.focus()
				}
			} else {
				setInfoMsg({ color: "green", msg: `${data.msg}` })
			}

			setUpdate(prev => !prev)
		} catch (error) {
			console.log(error)
			setInfoMsg({ color: "red", msg: "Something went wrong with server." })
		}
	}

	return (
		<form onSubmit={submit} className="form-login-register">
			<br />
			<h1>REGISTER</h1>
			<br />

			<TextField
				label="First Name"
				type="text"
				maxLength="20"
				inputRef={inputRefs.firstName}
				variant="filled"
				onChange={e => inputChange(e, "firstName")}
				error={inputErrors.firstName}
				helperText={inputErrors.firstName}
				sx={{ input: { color: "white" }, "label": {color: "white" }, div: {backgroundColor: "rgba(0 0 0 / 40%)"}}}
			/>

			<br />

			<TextField
				label="Last Name"
				type="text"
				maxLength="20"
				inputRef={inputRefs.lastName}
				variant="filled"
				onChange={e => inputChange(e, "lastName")}
				error={inputErrors.lastName}
				helperText={inputErrors.lastName}
				sx={{ input: { color: "white" }, "label": {color: "white" }, div: {backgroundColor: "rgba(0 0 0 / 40%)"}}}
			/>

			<br />

			<TextField
				label="Username"
				type="text"
				maxLength="20"
				inputRef={inputRefs.username}
				variant="filled"
				onChange={e => inputChange(e, "username")}
				error={inputErrors.username}
				helperText={inputErrors.username}
				sx={{ input: { color: "white" }, "label": {color: "white" }, div: {backgroundColor: "rgba(0 0 0 / 40%)"}}}
				errorStyle={{color: 'green'}}
			/>

			<br />

			<TextField
				label="Password"
				type="text"
				maxLength="45"
				inputRef={inputRefs.password}
				variant="filled"
				onChange={e => inputChange(e, "password")}
				error={inputErrors.password}
				helperText={inputErrors.password}
				sx={{ input: { color: "white" }, "label": {color: "white" }, div: {backgroundColor: "rgba(0 0 0 / 40%)"}}}
			/>

			<br />

			<Button sx={{ backgroundColor: blueGrey[500] }} type="submit" variant="contained">Register</Button>
			<h4 style={{ color: infoMsg.color }}>{infoMsg.msg}</h4>
		</form>
	)
}