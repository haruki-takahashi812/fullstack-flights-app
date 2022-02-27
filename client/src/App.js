import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom'
import PageLogin from './comp/PageLogin'
import PageRegister from './comp/PageRegister'
import Header from './comp/Header'
import PageHome from './comp/PageHome'
import PageChart from './comp/PageChart'
import PageProfile from './comp/PageProfile'

export default function App() {
	const [update, setUpdate] = useState(false)
	const [loggedIn, setLoggedIn] = useState(false)
	const [currentUser, setCurrentUser] = useState({})
	// Loading: true,false  Error: true,true  Finished: false,false 
	const [loadingState, setLoadingState] = useState({ isLoading: true, isError: false })
	const [loadingStateHome, setLoadingStateHome] = useState({ isLoading: true, isError: false })
	const [flightsArray, setFlightsArray] = useState([])

	useEffect(() => {
		(async () => {
			try {
				const res = await fetch("https://fullstack-flights-app.herokuapp.com/loggedin/", { credentials: "include" })
				const data = await res.json()
				if (data.loggedIn) {
					setLoggedIn(true)
					// data: { username: "blah", role: "blah" }
					setCurrentUser(data)
					fetchFlights()
				} else {
					setLoggedIn(false)
					setCurrentUser({})
				}
				setLoadingState({ isLoading: false, isError: false })
			} catch (error) {
				setLoadingState({ isLoading: true, isError: true })
			}
		})()
	}, [update])


	async function fetchFlights() {
		setFlightsArray([])
		console.log("fetching flights");
		try {
			console.log(currentUser)
			const res = await fetch("https://fullstack-flights-app.herokuapp.com/flights", { credentials: "include" })
			const data = await res.json()
			if (data.err) {
				throw new Error("server failed to fetch data")
			}
			setFlightsArray(data.sort((a, b) => b.isFollowed - a.isFollowed))
			console.log(data)
			setLoadingStateHome({ isLoading: false, isError: false })
		} catch (error) {
			console.warn(error)
			setLoadingStateHome({ isLoading: true, isError: true })
		}
	}

	return (
		<>
			{
				loadingState.isLoading
					?
					<>
						{
							loadingState.isError
								?
								<>
									<header></header>
									<main>
										<h1>Failed to connect to server, try refreshing.</h1>
									</main>
								</>
								:
								<>
									<header></header>
									<main>
										<h1>LOADING...</h1>
									</main>
								</>
						}
					</>
					:
					<Router>
						<Header loggedIn={loggedIn} setUpdate={setUpdate} currentUser={currentUser} />
						<main>
							{
								loggedIn
									?
									<Routes>
										<Route path="/" element={
											<PageHome update={update} currentUser={currentUser} flightsArray={flightsArray} loadingStateHome={loadingStateHome} setFlightsArray={setFlightsArray} />
										} />
										{currentUser.role === "admin" && <Route path="/chart" element={<PageChart flightsArray={flightsArray} />} />}
										<Route path="/profile/:username" element={<PageProfile currentUser={currentUser} flightsArray={flightsArray} setFlightsArray={setFlightsArray} />} />
										<Route path="*" element={<Navigate to="/" />} />
									</Routes>
									:
									<Routes>
										<Route path="/register" element={<PageRegister setUpdate={setUpdate} />} />
										<Route path="/login" element={<PageLogin setUpdate={setUpdate} />} />
										<Route path="/*" element={<Navigate to="/login" />} />
									</Routes>
							}
						</main>
					</Router>
			}
		</>
	)
}