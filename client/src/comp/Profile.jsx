import { useState } from "react"
import FlightCard from "./FlightCard"
import { motion } from "framer-motion"
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import { blueGrey } from '@mui/material/colors'

export default function Profile({ profileUser, currentUser, canEdit, flightsArray, setFlightsArray }) {
	const [inputCurrentPass, setInputCurrentPass] = useState("")
	const [inputNewPass, setInputNewPass] = useState("")
	const [infoMsg, setInfoMsg] = useState({ color: "blue", msg: " " })

	async function changePass() {
		setInfoMsg({ color: "blue", msg: " " })
		if (!inputCurrentPass || !inputNewPass) {
			setInfoMsg({ color: "red", msg: `Missing fields.` })
			return
		}

		const username = currentUser.username
		let password = inputCurrentPass

		// authenticate current pass
		const res = await fetch("https://fullstack-flights-app.herokuapp.com/login/", {
			method: "post",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ username, password }),
			credentials: "include"
		})

		const data = await res.json()

		if (data.err) {
			setInfoMsg({ color: "red", msg: `${data.err}` })
			return
		}

		password = inputNewPass

		const res2 = await fetch("https://fullstack-flights-app.herokuapp.com/changepassword/", {
			method: "post",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ username, password }),
			credentials: "include"
		})

		const data2 = await res2.json()

		if (data2.err) {
			setInfoMsg({ color: "red", msg: `${data2.err}` })
			return
		}

		setInfoMsg({ color: "green", msg: `${data2.msg}` })
	}
	console.log(profileUser.followings)
	console.log(profileUser.followings.length)
	return (
		<>
			<br />
			<h1>{profileUser.username}'s profile</h1>
			<br />
			<h4>role: <span className="blue-text">{profileUser.role}</span></h4>
			<br />
			<h3>Name: <span className="blue-text">{profileUser.first_name} {profileUser.last_name}</span></h3>
			<h3>Date Created: <span className="blue-text">{new Date(profileUser.date_created * 1000).toLocaleDateString()}</span></h3>
			<br />
			{
				canEdit
				&&
				<>
					<hr />
					<br />
					<h1>Settings:</h1>
					<br />
					<h3>Change Password:</h3>
					<br />
					<TextField
						label="Current Password"
						variant="filled"
						onChange={e => setInputCurrentPass(e.target.value)}
						sx={{ input: { color: "white" }, "label": { color: "white" }, div: { backgroundColor: "rgba(0 0 0 / 40%)" } }}
					/>
					<br /><br />
					<TextField
						label="New Password"
						variant="filled"
						onChange={e => setInputNewPass(e.target.value)}
						sx={{ input: { color: "white" }, "label": { color: "white" }, div: { backgroundColor: "rgba(0 0 0 / 40%)" } }}
					/>
					<br /><br />
					<Button fullWidth sx={{ backgroundColor: blueGrey[500], maxWidth: "220px" }} variant="contained" onClick={changePass}>Submit</Button>
					<br /><br />
					<h5 style={{ color: infoMsg.color }}>&nbsp;{infoMsg.msg}&nbsp;</h5>
					<br />
				</>
			}
			<hr />
			<br />
			<h1>Followed Vacations:</h1>
			<br />
			<motion.div layout className="flights-container">
				{
					profileUser.followings.length
						?
						// display profileUser's followed flights
						flightsArray.map(flight => {
							if (profileUser.followings.includes(flight.id)) {
								return <FlightCard key={flight.id} flight={flight} currentUser={currentUser} setFlightsArray={setFlightsArray} flightsArray={flightsArray} />
							}
							return null
						})
						:
						<h4>{profileUser.username} does not follow any flights.</h4>
				}
			</motion.div>
		</>
	)
}