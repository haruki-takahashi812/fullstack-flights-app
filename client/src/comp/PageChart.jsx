import { Bar } from "react-chartjs-2"
import { Chart as ChartJS } from 'chart.js/auto'

export default function PageChart({ flightsArray }) {

	return (
		<div className="chart">
			<h1># of Followers</h1>
			{
				!flightsArray.length
					?
					<h3>There are no flights with followers.</h3>
					:
					<Bar
						data={{
							labels: flightsArray
								.filter(e => e.followers > 0)
								.sort((a, b) => a.followers - b.followers)
								.map(e => e.destination),
							datasets: [
								{
									label: "# of follwers",
									data: flightsArray
										.filter(e => e.followers > 0)
										.sort((a, b) => a.followers - b.followers)
										.map(e => e.followers),
									backgroundColor: ["salmon"],
									borderColor: "black",
									borderWidth: 2,
								}
							]
						}}
						options={{
							plugins: { legend: { display: false } },
							animation: false,
							scales: {
								y: {
									beginAtZero: true,
									ticks: {
										precision: 0
									}
								}
							}
						}}
					/>
			}
		</div>
	)
}