import { useEffect, useState } from "react"
import Button from '@mui/material/Button'

export default function ModalTypeDeleteFlight({ isModalOpen_, setFlightsArray, flight, setIsModalOpen_ }) {
	const [infoMsg, setInfoMsg] = useState({ color: "blue", msg: "" })

	async function confirmFetch() {
		try {
			const res = await fetch(`https://fullstack-flights-app.herokuapp.com/deleteflight/${flight.id}`, {
				method: "delete",
				credentials: "include"
			})
			const data = await res.json()

			if (data.err) {
				setInfoMsg({ color: "red", msg: `${data.err}` })
			} else {
				// update frontend for smooth experience

				setFlightsArray(prevArr => {
					const found = prevArr.findIndex(e => e.id === flight.id)
					prevArr = [...prevArr] // to force re-render
					prevArr.splice(found, 1)
					return prevArr
				})

				// deleted succesfully
			}
		} catch (error) {
			setInfoMsg({ color: "red", msg: "Couldn't connect to server" })
			console.log(error)
		}
	}

	useEffect(() => {
		// on modal close, reset info msg:
		setInfoMsg("")
	}, [isModalOpen_])

	return (
		<div className="modal-form">
			<br />
			<h3>Are you sure you want to delete {flight.destination}?</h3>
			<br /> <br />
			<div style={{display: "flex", justifyContent: "space-around"}}>
				<Button type="button" variant="contained" onClick={() => setIsModalOpen_(false)}>Cancel</Button>
				<Button type="button" variant="contained" onClick={confirmFetch}>Confirm</Button>
			</div>
			<h5 style={{ color: infoMsg.color }}>{infoMsg.msg}</h5>
		</div>
	)
}