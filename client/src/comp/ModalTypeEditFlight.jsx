import { useEffect, useRef, useState } from "react"
import Modal from "./Modal"
import Button from '@mui/material/Button'
import DeleteIcon from '@mui/icons-material/Delete'
import { blueGrey } from '@mui/material/colors'

export default function ModalTypeEditFlight({ isModalOpen_, setFlightsArray, flight }) {
	const [inputValues, setInputValues] = useState({
		destination: flight.destination,
		description: flight.description,
		image_url: flight.image_url,
		// convert date from unix to input format
		start_date: new Date(flight.start_date * 1000).toISOString().split("T")[0],
		end_date: new Date(flight.end_date * 1000).toISOString().split("T")[0],
		price: flight.price
	})
	const [inputErrors, setInputErrors] = useState({ destination: "", description: "", image_url: "", start_date: "", end_date: "", price: "" })
	const inputRefs = { destination: useRef(null), description: useRef(null), image_url: useRef(null), start_date: useRef(null), end_date: useRef(null), price: useRef(null) }
	const [infoMsg, setInfoMsg] = useState({ color: "blue", msg: "" })
	// for recursive modal
	const [isModalOpen, setIsModalOpen] = useState(false)

	function inputChange(e, input) {
		// doesnt trigger re-render
		setInputValues(prev => {
			prev[input] = e.target.value
			return prev
		})

		// triggers re-render
		setInputErrors(prev => ({ ...prev, [input]: "" }))
	}

	function resetBtn(input) {
		if (input === "start_date" || input === "end_date") {
			inputRefs[input].current.value = new Date(flight[input] * 1000).toISOString().split("T")[0]
			setInputValues(prev => {
				prev[input] = new Date(flight[input] * 1000).toISOString().split("T")[0]
				return prev
			})
		} else {
			inputRefs[input].current.value = flight[input]
			setInputValues(prev => {
				prev[input] = flight[input]
				return prev
			})
		}
		// clear errors
		setInputErrors(prev => ({ ...prev, [input]: "" }))
	}

	function submit(event) {
		event.preventDefault()

		setInfoMsg("")
		let inputErrorsTemp = { destination: "", description: "", image_url: "", start_date: "", end_date: "", price: "" }
		let imgUrlTemp = inputValues.image_url || "https://i.imgur.com/qBY62uF.jpg"

		if (inputValues.destination === flight.destination && inputValues.description === flight.description
			&& imgUrlTemp === flight.image_url && inputValues.start_date === new Date(flight.start_date * 1000).toISOString().split("T")[0]
			&& inputValues.end_date === new Date(flight.end_date * 1000).toISOString().split("T")[0] && inputValues.price === flight.price) {
			// nothing has changed
			setInfoMsg({ color: "blue", msg: `Nothing has changed.` })
			return
		}

		let firstError = [] // indices of useRef list to determine first invalid input and focus() it

		if (inputValues.detination !== flight.destination) {
			if (!inputValues.destination.length) {
				firstError.push("destination")
				inputErrorsTemp.destination = "This field cannot be empty"
			} else if (inputValues.destination.length > 30) {
				firstError.push("destination")
				inputErrorsTemp.destination = "Must be under 30 characters"
			}
		}

		if (inputValues.description !== flight.description) {
			if (!inputValues.description.length) {
				firstError.push("description")
				inputErrorsTemp.description = "This field is required"
			} else if (inputValues.description.length > 200) {
				firstError.push("description")
				inputErrorsTemp.description = "Must be under 200 characters"
			}
		}

		if (imgUrlTemp !== flight.image_url) {
			if (imgUrlTemp.length > 1500) {
				firstError.push("image_url")
				inputErrorsTemp.image_url = "Must be under 1500 characters"
			}
		}

		if (inputValues.start_date !== new Date(flight.start_date * 1000).toISOString().split("T")[0]) {
			if (!inputValues.start_date.length) {
				firstError.push("start_date")
				inputErrorsTemp.start_date = "This field is required"
			} else if (new Date(inputValues.start_date) > new Date("2038-01-18")) {
				firstError.push("start_date")
				inputErrorsTemp.start_date = "Date must come before 01-18-2038"
			}
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

		if (inputValues.price !== flight.price) {
			if (!inputValues.price.length) {
				firstError.push("price")
				inputErrorsTemp.price = "This field is required"
			} else if (inputValues.price.includes("e")) {
				firstError.push("price")
				inputErrorsTemp.price = 'Character "e" is not allowed'
			} else if (isNaN(inputValues.price)) {
				firstError.push("price")
				inputErrorsTemp.price = "Invalid number"
			} else if (inputValues.price > 99999 || inputValues.price < 0) {
				firstError.push("price")
				inputErrorsTemp.price = "Price must be between 0 to 100000"
			}
		}

		setInputErrors(inputErrorsTemp)

		if (firstError.length) {
			// focus() on first input with error
			inputRefs[firstError[0]].current.focus()
		} else {
			// validation test passed, sending to backend
			submitFetch()
		}

	}

	async function submitFetch() {
		try {
			const res = await fetch("https://fullstack-flights-app.herokuapp.com/updateflight", {
				method: "put",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ id: flight.id, ...inputValues }),
				credentials: "include"
			})
			const data = await res.json()
			if (data.err) {
				setInfoMsg({ color: "red", msg: `${data.err}` })
			} else {
				// update frontend for smooth experience

				const modifiedFlight = {
					destination: inputValues.destination,
					description: inputValues.description,
					image_url: inputValues.image_url || "https://i.imgur.com/qBY62uF.jpg",
					// convert to unix
					start_date: parseInt((new Date(inputValues.start_date).getTime() / 1000).toFixed(0)),
					end_date: parseInt((new Date(inputValues.end_date).getTime() / 1000).toFixed(0)),
					price: inputValues.price
				}

				setFlightsArray(prevArr => {
					const found = prevArr.findIndex(e => e.id === flight.id)
					prevArr = [...prevArr] // to force re-render
					prevArr[found] = { ...prevArr[found], ...modifiedFlight }
					return prevArr
				})
				console.log(data)
				setInfoMsg({ color: "green", msg: `${data.msg}` })
			}
		} catch (error) {
			setInfoMsg({ color: "red", msg: "Couldn't connect to server" })
			console.log(error)
		}
	}

	useEffect(() => {
		// on modal close, reset states:
		setInputValues({
			destination: flight.destination,
			description: flight.description,
			image_url: flight.image_url,
			start_date: new Date(flight.start_date * 1000).toISOString().split("T")[0],
			end_date: new Date(flight.end_date * 1000).toISOString().split("T")[0],
			price: flight.price
		})
		setInputErrors({ destination: "", description: "", image_url: "", start_date: "", end_date: "", price: "" })
		setInfoMsg({ color: "blue", msg: "" })
	}, [isModalOpen_])

	return (
		<form onSubmit={submit} className="modal-form edit-flight-modal">
			<h2>Edit Flight</h2>

			<label>
				Destination
				<div className="flex">
					<input
						className={`input ${inputErrors.destination.length ? "input-error" : ""}`}
						type="text"
						maxLength="30"
						onChange={e => inputChange(e, "destination")}
						ref={inputRefs.destination}
						defaultValue={flight.destination}
					/>
					<button type="button" className="small-btn" onClick={e => resetBtn("destination")}>Reset</button>
				</div>
			</label>
			<p>&nbsp;{inputErrors.destination}</p>

			<label>Description
				<div className="flex">
					<input
						className={`input ${inputErrors.description.length ? "input-error" : ""}`}
						type="text"
						maxLength="200"
						onChange={e => inputChange(e, "description")}
						ref={inputRefs.description}
						defaultValue={flight.description}
					/>
					<button type="button" className="small-btn" onClick={e => resetBtn("description")}>Reset</button>
				</div>
			</label>
			<p>&nbsp;{inputErrors.description}</p>

			<label>Image URL
				<div className="flex">
					<input
						className={`input ${inputErrors.image_url.length ? "input-error" : ""}`}
						type="text"
						maxLength="1500"
						onChange={e => inputChange(e, "image_url")}
						ref={inputRefs.image_url}
						defaultValue={flight.image_url}
					/>
					<button type="button" className="small-btn" onClick={e => resetBtn("image_url")}>Reset</button>
				</div>
			</label>
			<p>&nbsp;{inputErrors.image_url}</p>

			<label>Start Date
				<div className="flex">
					<input
						className={`input ${inputErrors.start_date.length ? "input-error" : ""}`}
						type="date"
						min="2022-01-01"
						max="2038-01-18"
						onChange={e => inputChange(e, "start_date")}
						ref={inputRefs.start_date}
						defaultValue={new Date(flight.start_date * 1000).toISOString().split("T")[0]}
					/>
					<button type="button" className="small-btn" onClick={e => resetBtn("start_date")}>Reset</button>
				</div>
			</label>
			<p>&nbsp;{inputErrors.start_date}</p>

			<label>End Date
				<div className="flex">
					<input
						className={`input ${inputErrors.end_date.length ? "input-error" : ""}`}
						type="date"
						min="2022-01-01"
						max="2038-01-18"
						onChange={e => inputChange(e, "end_date")}
						ref={inputRefs.end_date}
						defaultValue={new Date(flight.end_date * 1000).toISOString().split("T")[0]}
					/>
					<button type="button" className="small-btn" onClick={e => resetBtn("end_date")}>Reset</button>
				</div>
			</label>
			<p>&nbsp;{inputErrors.end_date}</p>

			<label>Price
				<div className="flex">
					<input
						className={`input ${inputErrors.price.length ? "input-error" : ""}`}
						type="number"
						min="1"
						max="99999"
						onChange={e => inputChange(e, "price")}
						ref={inputRefs.price}
						defaultValue={flight.price}
					/>
					<button type="button" className="small-btn" onClick={e => resetBtn("price")}>Reset</button>
				</div>
			</label>
			<p>&nbsp;{inputErrors.price}</p>

			<h4 style={{ color: infoMsg.color }}>&nbsp;{infoMsg.msg}&nbsp;</h4>

			<Button sx={{ backgroundColor: blueGrey[500], margin: "6px 0" }} type="submit" variant="contained">
				Make Changes
			</Button>
			<Button
				type="button"
				onClick={() => setIsModalOpen(true)}
				color="error"
				variant="contained"
				startIcon={<DeleteIcon />}
			>
				Delete Flight
			</Button>
			<Modal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} modalType={"delete-flight"} setFlightsArray={setFlightsArray} flight={flight} />

		</form>
	)
}