import { useEffect, useState } from "react"
import ModalTypeCreateFlight from "./ModalTypeCreateFlight"
import ModalTypeDeleteFlight from "./ModalTypeDeleteFlight"
import ModalTypeEditFlight from "./ModalTypeEditFlight"
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'

export default function Modal({ isModalOpen, setIsModalOpen, modalType, setFlightsArray, flight }) {

	const [mouseDown, setMouseDown] = useState(false)

	useEffect(() => {
		function onKeyDown(e) {
			if (e.key === "Escape") {
				setIsModalOpen(false)
			}
		}

		document.addEventListener("keydown", onKeyDown)

		return () => document.removeEventListener('keydown', onKeyDown);
	}, [])

	return (
		<div
			className="dark-overlay"
			style={isModalOpen ? { display: "flex" } : { display: "none" }}
			onMouseDown={e => { e.target === e.currentTarget ? setMouseDown(true) : setMouseDown(false) }}
			onMouseUp={e => { if (e.target === e.currentTarget && mouseDown === true) { setIsModalOpen(false) } }}
		>
			<div className="modal">
				{/* <button onClick={() => setIsModalOpen(false)}>Close</button> */}
				<IconButton className="modal-exit-btn" component="span" onClick={() => setIsModalOpen(false)}>
					<CloseIcon />
				</IconButton>
				{
					modalType === "edit-flight"
						?
						<ModalTypeEditFlight isModalOpen_={isModalOpen} setFlightsArray={setFlightsArray} flight={flight} />
						:
						modalType === "create-flight"
							?
							<ModalTypeCreateFlight isModalOpen_={isModalOpen} setFlightsArray={setFlightsArray} />
							:
							modalType === "delete-flight"
								?
								<ModalTypeDeleteFlight isModalOpen_={isModalOpen} setIsModalOpen_={setIsModalOpen} setFlightsArray={setFlightsArray} flight={flight} />
								:
								<h2>Unspecified Modal Type</h2>
				}
			</div>
		</div>
	)
}