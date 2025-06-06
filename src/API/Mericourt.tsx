import { formatInTimeZone } from "date-fns-tz";
import React, { useEffect, useState } from "react";

// Define the expected structure of the API response
interface WaterData {
	code_station: string;
	date_debut_serie: string;
	date_fin_serie: string;
	date_obs: string;
	resultat_obs: number;
	continuite_obs_hydro: string;
}

const Mericourt: React.FC = () => {
	// State to hold the fetched data and loading/error states
	const [waterData, setWaterData] = useState<WaterData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const apiUrl =
			"https://hubeau.eaufrance.fr/api/v2/hydrometrie/observations_tr?code_entite=H320000104&size=3&pretty&grandeur_hydro=Q&fields=code_station,date_debut_serie,date_fin_serie,date_obs,resultat_obs,continuite_obs_hydro";

		const isValidDate = (date: Date): boolean => !isNaN(date.getTime());

		const fetchData = async () => {
			try {
				const response = await fetch(apiUrl);
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}
				const data = await response.json();

				if (data && Array.isArray(data.data)) {
					const convertedData = data.data.map((item: WaterData) => ({
						...item,
						date_obs: isValidDate(new Date(item.date_obs))
							? formatInTimeZone(
									new Date(item.date_obs),
									"Europe/Paris",
									"yyyy-MM-dd HH:mm:ss"
							  )
							: "Invalid Date",
						date_debut_serie: isValidDate(
							new Date(item.date_debut_serie)
						)
							? formatInTimeZone(
									new Date(item.date_debut_serie),
									"Europe/Paris",
									"yyyy-MM-dd HH:mm:ss"
							  )
							: "Invalid Date",
						date_fin_serie: isValidDate(
							new Date(item.date_fin_serie)
						)
							? formatInTimeZone(
									new Date(item.date_fin_serie),
									"Europe/Paris",
									"yyyy-MM-dd HH:mm:ss"
							  )
							: "Invalid Date",
					}));

					setWaterData(convertedData);

					// Send data to the PHP backend
					const backendUrl =
						"http://localhost/my-project/store_data.php"; // Replace with your PHP script URL
					const backendResponse = await fetch(backendUrl, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(convertedData),
					});

					if (!backendResponse.ok) {
						console.error("Failed to save data to the database");
					} else {
						console.log("Data saved to the database successfully");
					}
				} else {
					setError("Unexpected API response format");
				}
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: "An unknown error occurred"
				);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []); // Empty dependency array ensures this runs only once on component mount

	// Render loading, error, or data based on the state
	if (loading) {
		return <div>Loading...</div>;
	}

	if (error) {
		return <div>Error: {error}</div>;
	}

	return (
		<div>
			<h1>Water Level and Flow Data for Mericourt Station</h1>
			<ul>
				{waterData.map((item, index) => (
					<li key={index}>
						<strong>Station:</strong> {item.code_station} <br />
						<strong>Date Range:</strong> {item.date_debut_serie} to{" "}
						{item.date_fin_serie} <br />
						<strong>Observation Date:</strong> {item.date_obs}{" "}
						<br />
						<strong>Flow Observation:</strong> {item.resultat_obs}{" "}
						m³/s <br />
						<strong>Continuity:</strong> {item.continuite_obs_hydro}
						<hr />
					</li>
				))}
			</ul>
		</div>
	);
};

export default Mericourt;
