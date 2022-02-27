import { Link } from "react-router-dom"
import Button from '@mui/material/Button'

export default function Header({ setUpdate, loggedIn, currentUser }) {

	async function logout() {
		const res = await fetch("https://fullstack-flights-app.herokuapp.com/logout/", {
			method: "post",
			credentials: "include"
		})
		const data = await res.json()
		if (data.err) {
			console.log(data.err)
		} else {
			console.log(data.msg)
		}
		setUpdate(prev => !prev)
	}

	return (
		<header>
			{
				loggedIn
					?
					// LOGGED IN
					<nav>
						<Button
							component={Link}
							to={`/profile/${currentUser.username}`}
							sx={{ fontSize: "18px", color: "white", "&:hover": { backgroundColor: "#242424" } }}
						>
							Profile ({currentUser.username})
						</Button>

						<Button
							component={Link}
							to="/"
							sx={{ fontSize: "18px", color: "white", "&:hover": { backgroundColor: "#242424" } }}
						>
							Home
						</Button>

						{
							currentUser.role === "admin"
							&&
							<Button
								component={Link}
								to="/chart"
								sx={{ fontSize: "18px", color: "white", "&:hover": { backgroundColor: "#242424" } }}
							>
								Chart
							</Button>
						}

						<Button sx={{ fontSize: "18px", color: "white" }} onClick={logout} variant="outlined">
							LOGOUT
						</Button>
					</nav>
					:
					// NOT LOGGED IN
					<nav>
						<Link to="/register">Register</Link>
						<Link to="/login">Login</Link>
					</nav>
			}
		</header>
	)
}