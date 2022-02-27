import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import Profile from "./Profile"

export default function PageProfile({ currentUser, flightsArray, setFlightsArray }) {
	const [canEdit, setCanEdit] = useState(false)
	const [loadingState, setLoadingState] = useState({ isLoading: true, isError: false })
	const [doesProfileExist, setDoesProfileExist] = useState(false)
	const [profileUser, setProfileUser] = useState({})

	const { username } = useParams()

	useEffect(() => {
		(async () => {
			try {
				const res = await fetch(`https://fullstack-flights-app.herokuapp.com/publicuserinfo/${username}`, { credentials: "include" })
				const data = await res.json()

				if (data.code === 'user_not_found') {
					setDoesProfileExist(false)
					setLoadingState({ isLoading: false, isError: false })
					return
				}

				setDoesProfileExist(true)

				if (currentUser.username === username) {
					setCanEdit(true)
					setProfileUser(currentUser)
				} else if (currentUser.role === "admin") {
					setCanEdit(true)
					setProfileUser(data)
				} else {
					setCanEdit(false)
					setProfileUser(data)
				}
				setLoadingState({ isLoading: false, isError: false })
			} catch (error) {
				setLoadingState({ isLoading: true, isError: true })
			}
		})()
	}, [])


	return (
		<>
			{
				loadingState.isLoading
					?
					<>
						{
							loadingState.isError
								?
								<h1>Failed to connect to server, try refreshing.</h1>
								:
								<h1>LOADING...</h1>
						}
					</>
					:
					<>
						{
							!doesProfileExist
								?
								<h1>This user doesnt exist</h1>
								:
								<>
									<Profile profileUser={profileUser} currentUser={currentUser} canEdit={canEdit} flightsArray={flightsArray} setFlightsArray={setFlightsArray} />
								</>
						}
					</>
			}
		</>
	)
}
