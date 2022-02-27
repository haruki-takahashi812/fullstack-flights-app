import { useEffect, useRef, useState } from "react"
import Button from '@mui/material/Button'
import { blueGrey } from '@mui/material/colors'

export default function ModalTypeCreateFlight({ isModalOpen_, setFlightsArray }) {

	const [inputValues, setInputValues] = useState({ destination: "", description: "", image_url: "", start_date: "", end_date: "", price: "" })
	const [inputErrors, setInputErrors] = useState({ destination: "", description: "", image_url: "", start_date: "", end_date: "", price: "" })
	const inputRefs = { destination: useRef(null), description: useRef(null), image_url: useRef(null), start_date: useRef(null), end_date: useRef(null), price: useRef(null) }
	const [infoMsg, setInfoMsg] = useState({ color: "blue", msg: "" })

	// for min date input (yyyy-mm-dd)
	const presentTime = new Date().toISOString().split("T")[0]

	function inputChange(e, input) {
		// doesnt trigger re-render
		setInputValues(prev => {
			prev[input] = e.target.value
			return prev
		})
		// triggers re-render
		setInputErrors(prev => ({ ...prev, [input]: "" }))
	}

	function submit(event) {
		event.preventDefault()

		let firstError = [] // indices of useRef list to determine first invalid input and focus() it
		let inputErrorsTemp = { destination: "", description: "", image_url: "", start_date: "", end_date: "", price: "" }

		if (!inputValues.destination.length) {
			firstError.push("destination")
			inputErrorsTemp.destination = "This field is required"
		} else if (inputValues.destination.length > 30) {
			firstError.push("destination")
			inputErrorsTemp.destination = "Must be under 30 characters"
		}

		if (!inputValues.description.length) {
			firstError.push("description")
			inputErrorsTemp.description = "This field is required"
		} else if (inputValues.description.length > 200) {
			firstError.push("description")
			inputErrorsTemp.description = "Must be under 200 characters"
		}

		if (inputValues.image_url.length > 1500) {
			firstError.push("image_url")
			inputErrorsTemp.image_url = "Must be under 1500 characters"
		}

		if (!inputValues.start_date.length) {
			firstError.push("start_date")
			inputErrorsTemp.start_date = "This field is required"
		} else if (new Date(inputValues.start_date) > new Date("2038-01-18")) {
			firstError.push("start_date")
			inputErrorsTemp.start_date = "Date must come before 01-18-2038"
		}

		if (!inputValues.end_date.length) {
			firstError.push("end_date")
			inputErrorsTemp.end_date = "This field is required"
		} else if (new Date(inputValues.end_date) > new Date("2038-01-18")) {
			firstError.push("end_date")
			inputErrorsTemp.end_date = "Date must come before 01-18-2038"
		} else if (new Date(inputValues.end_date) < new Date(inputValues.start_date)) {
			firstError.push("end_date")
			inputErrorsTemp.end_date = "Ending date must come after starting date"
		}

		if (!inputValues.price.length) {
			firstError.push("price")
			inputErrorsTemp.price = "This field is required"
		} else if (isNaN(inputValues.price)) {
			firstError.push("price")
			inputErrorsTemp.price = "Invalid number"
		} else if (inputValues.price > 99999 || inputValues.price < 1) {
			firstError.push("price")
			inputErrorsTemp.price = "Price must be between 1 to 100000"
		}

		setInputErrors(inputErrorsTemp)

		if (firstError.length) {
			// focus() on first input with error
			inputRefs[firstError[0]].current.focus()
		} else {
			// validation test passed, creating flight
			createFlight()
		}

	}

	async function createFlight() {
		try {
			const res = await fetch("https://fullstack-flights-app.herokuapp.com/createflight", {
				method: "post",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(inputValues),
				credentials: "include"
			})
			const data = await res.json()
			if (data.err) {
				setInfoMsg({ color: "red", msg: `${data.err}` })
			} else {
				// update frontend for smooth experience

				const newFlight = {
					id: data.insertId,
					destination: inputValues.destination,
					description: inputValues.description,
					image_url: inputValues.image_url || "https://i.imgur.com/qBY62uF.jpg",
					// convert to unix
					start_date: parseInt((new Date(inputValues.start_date).getTime() / 1000).toFixed(0)),
					end_date: parseInt((new Date(inputValues.end_date).getTime() / 1000).toFixed(0)),
					price: inputValues.price,
					followers: 0
				}

				setFlightsArray(prevArr => [...prevArr, { ...newFlight }])

				setInfoMsg({ color: "green", msg: `${data.msg}` })
			}
		} catch (error) {
			setInfoMsg({ color: "red", msg: "Couldn't connect to server" })
			console.log(error)
		}
	}

	useEffect(() => {
		// on modal close:

		// remove all errors about empty field
		let inputErrorsClone = JSON.parse(JSON.stringify(inputErrors))

		for (let key of Object.keys(inputErrorsClone)) {
			if (inputErrorsClone[key] === "This field is required") {
				inputErrorsClone[key] = ""
			}
		}

		setInputErrors(inputErrorsClone)

		// remove bottom error
		setInfoMsg("")
	}, [isModalOpen_])

	return (
		<form onSubmit={submit} className="modal-form">
			<h2>Create New Flight</h2>

			<label>Destination *
				<input
					className={`input ${inputErrors.destination.length ? "input-error" : ""}`}
					type="text"
					maxLength="30"
					onChange={e => inputChange(e, "destination")}
					ref={inputRefs.destination}
				/>
			</label>
			<p>&nbsp;{inputErrors.destination}</p>

			<label>Description *
				<input
					className={`input ${inputErrors.description.length ? "input-error" : ""}`}
					type="text"
					maxLength="200"
					onChange={e => inputChange(e, "description")}
					ref={inputRefs.description}
				/>
			</label>
			<p>&nbsp;{inputErrors.description}</p>

			<label>Image URL
				<input
					className={`input ${inputErrors.image_url.length ? "input-error" : ""}`}
					type="text"
					maxLength="1500"
					onChange={e => inputChange(e, "image_url")}
					ref={inputRefs.image_url}
				/>
			</label>
			<p>&nbsp;{inputErrors.image_url}</p>

			<label>Start Date *
				<input
					className={`input ${inputErrors.start_date.length ? "input-error" : ""}`}
					type="date"
					min={presentTime}
					max="2038-01-18"
					onChange={e => inputChange(e, "start_date")}
					ref={inputRefs.start_date}
				/>
			</label>
			<p>&nbsp;{inputErrors.start_date}</p>

			<label>End Date *
				<input
					className={`input ${inputErrors.end_date.length ? "input-error" : ""}`}
					type="date"
					min={presentTime}
					max="2038-01-18"
					onChange={e => inputChange(e, "end_date")}
					ref={inputRefs.end_date}
				/>
			</label>
			<p>&nbsp;{inputErrors.end_date}</p>

			<label>Price *
				<input
					className={`input ${inputErrors.price.length ? "input-error" : ""}`}
					type="number"
					min="1"
					max="99999"
					onChange={e => inputChange(e, "price")}
					ref={inputRefs.price}
				/>
			</label>
			<p>&nbsp;{inputErrors.price}</p>

			<h5 style={{ color: infoMsg.color }}>&nbsp;{infoMsg.msg}&nbsp;</h5>
			<br></br>
			<Button sx={{ backgroundColor: blueGrey[500] }} type="submit" variant="contained">Create Flight</Button>
		</form>
	)
}