import { useState } from "react"
import Modal from "./Modal"
import { motion } from "framer-motion"
import Checkbox from '@mui/material/Checkbox'
import FavoriteBorder from '@mui/icons-material/FavoriteBorder'
import Favorite from '@mui/icons-material/Favorite'
import { pink } from '@mui/material/colors'
import IconButton from '@mui/material/IconButton'
import SettingsIcon from '@mui/icons-material/Settings'
import Paper from '@mui/material/Paper'

export default function FlightCard({ flight, currentUser, setFlightsArray, flightsArray }) {

	const [checked, setChecked] = useState(flight.isFollowed)
	const [isModalOpen, setIsModalOpen] = useState(false)

	async function checkboxToggle(event) {
		setChecked(!checked)

		let mutatedArr = [...flightsArray]
		const index = flightsArray.findIndex(each => each.id === flight.id)
		
		if (checked) {
			const find = currentUser.followings.findIndex(e => e === flight.id)
			// if flightID exists in user's followings array:
			if (find !== -1) {
				// remove flightid from user's followings array
				currentUser.followings.splice(find, 1)

				// update flight
				mutatedArr[index].followers -= 1
				mutatedArr[index].isFollowed = false
				setFlightsArray(mutatedArr.sort((a, b) => b.isFollowed - a.isFollowed))
			} else {
				console.warn("refresh page to re-sync to database")
			}
		} else {
			const find = currentUser.followings.findIndex(e => e === flight.id)
			// if flightID does not exist in user's followings array:
			if (find === -1) {
				// add flightid to user's followings array (frontend)
				currentUser.followings.push(flight.id)

				// update flight
				mutatedArr[index].followers += 1
				mutatedArr[index].isFollowed = true
				setFlightsArray(mutatedArr.sort((a, b) => b.isFollowed - a.isFollowed))
			} else {
				console.warn("refresh page to re-sync to database")
			}
		}

		const res = await fetch(`https://fullstack-flights-app.herokuapp.com/togglefollow/${currentUser.username}/${flight.id}`, { method: "put", credentials: "include" })
		const data = await res.json()
		console.log(data)
	}

	return (
		<Paper
			className="FlightCard"
			sx={{ borderRadius: "15px", backgroundColor: "#ffffffcc" }}
			elevation={4}
			component={motion.div}
			layout
			animate={{ opacity: 1 }}
			initial={{ opacity: 0 }}
			exit={{ opacity: 0 }}
		>
			<div className="card-header">
				<h3>{flight.destination}</h3>
				<div className="flex">
					<Checkbox data-total-followers={flight.followers} className="heart-checkbox"
						type="checkbox"
						sx={{ color: pink[800], '&.Mui-checked': { color: pink[600] } }}
						icon={<FavoriteBorder />}
						checkedIcon={<Favorite />}
						checked={checked}
						onChange={checkboxToggle}
					/>
					{
						currentUser.role === "admin" &&
						<>
							<IconButton color="primary" onClick={() => setIsModalOpen(true)}>
								<SettingsIcon />
							</IconButton>
							<Modal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} modalType={"edit-flight"} setFlightsArray={setFlightsArray} flight={flight} />
						</>
					}
				</div>
			</div>
			<br />
			<div className="img-container">
				<img src={flight.image_url} alt={flight.destination + " img"} />
			</div>
			<p>{flight.description}</p>
			<h4>${flight.price}</h4>
			<h5>
				{new Date(flight.start_date * 1000).toLocaleDateString()} - {new Date(flight.end_date * 1000).toLocaleDateString()}
			</h5>
		</Paper>
	)
}