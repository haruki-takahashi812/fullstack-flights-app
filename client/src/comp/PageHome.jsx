import { useState } from "react"
import FlightCard from "./FlightCard"
import Modal from "./Modal"
import { motion, AnimatePresence } from "framer-motion"
import Button from '@mui/material/Button'
import AddIcon from '@mui/icons-material/Add'

export default function PageHome({ update, currentUser, flightsArray, setFlightsArray, loadingStateHome }) {
	const [isModalOpen, setIsModalOpen] = useState(false)


	return (
		<>
			{
				loadingStateHome.isLoading
					?
					<>
						{
							loadingStateHome.isError
								?
								<h1>Failed to connect to server, try refreshing.</h1>
								:
								<h1>LOADING...</h1>
						}
					</>
					:
					flightsArray.length
						?
						<>
							{
								currentUser.role === "admin" &&
								<>
									<br />
									<Button
										variant="contained"
										startIcon={<AddIcon />}
										onClick={() => setIsModalOpen(true)}
									>
										Create New Flight
									</Button>
									<Modal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} modalType={"create-flight"} setFlightsArray={setFlightsArray} />
								</>
							}
							<motion.div layout className="flights-container">
								<AnimatePresence>
									{
										flightsArray.map(flight => <FlightCard key={flight.id} flight={flight} currentUser={currentUser} setFlightsArray={setFlightsArray} flightsArray={flightsArray} />)
									}
								</AnimatePresence>
							</motion.div>
						</>
						:
						<h3>
							There are no flights.
						</h3>
			}
		</>
	)
}