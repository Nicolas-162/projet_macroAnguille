import React, { useEffect, useState } from "react";

interface Props {
	configName: string;
}

interface LatestData {
	mesure: number;
	date_obs: string;
}

const ResultatSilvRpeak: React.FC<Props> = ({ configName }) => {
	const [date, setDate] = useState<string>("");
	const [debit, setDebit] = useState<string>("");
	const [prob, setProb] = useState<string>("");
	const [result, setResult] = useState<string>("");
	const [debitMax, setDebitMax] = useState<string>("");

	const currentDate = new Date().toLocaleString("fr-FR");
	const [currentTime, setCurrentTime] = useState("");

	// Function to determine the file path using a switch block
	// const getPathForConfig = (configName: string): string => {
	// 	switch (configName) {
	// 		case "Méricourt":
	// 			return "Gestion_turbinage/Méricourt/Consigne_turb.txt";
	// 		case "Var":
	// 			return "Gestion_turbinage/Var/Consigne_turb.txt";
	// 		case "Nice":
	// 			return "Gestion_turbinage/Nice/Consigne_turb.txt";
	// 		default:
	// 			return "http://localhost/Gestion_turbinage/consigne_journalière/Consigne_turb.txt"; // Default path
	// 	}
	// };

	// Dynamically determine the path based on configName
	const filePath = "http://localhost/php/consigne_turb.php";

	const [error, setError] = useState<string | null>(null);
	const [data, setData] = useState<LatestData[]>([]);
	const { stationLabel } = { stationLabel: configName };

	const fetchDefaultFile = async () => {
		try {
			// Fetch the file content from the public directory
			const response = await fetch(filePath);
			if (!response.ok) {
				throw new Error("Failed to load the default file.");
			}

			const content = await response.text(); // Read the file content as text
			const lines = content.split("\n"); // Split content into lines
			const headerLine = lines[0].trim(); // First line (header)
			const dataLine = lines[1].trim(); // Second line (data)

			// Extract headers and data
			const headers = headerLine.split("\t"); // Assuming tab-separated values
			const data = dataLine.split("\t");

			const dateIndex = headers.indexOf("date");
			setDate(data[dateIndex]);

			const debitIndex = headers.indexOf("Q");
			setDebit(data[debitIndex]);

			const probindex = headers.indexOf("prob_P75");
			setProb(data[probindex]);
			// Find the index of the "Reduction_turb" column
			const reductionTurbIndex = headers.indexOf("Reduction_turb");
			if (reductionTurbIndex === -1) {
				//setResult('Column "Reduction_turb" not found in the file.');
				return;
			}

			// Extract the value of the 4th field (Reduction_turb)
			const reductionTurbValue = data[reductionTurbIndex].toUpperCase(); // Normalize to uppercase

			// Validate the value
			if (reductionTurbValue === "NON" || reductionTurbValue === "OUI") {
				setResult(`${reductionTurbValue}`);
			} else {
				setResult(
					`Valeur incorrecte pour "Reduction_turb": ${reductionTurbValue}`
				);
			}

			const debiMaxIndex = headers.indexOf("Qturb_max_autorise");
			setDebitMax(data[debiMaxIndex]);
		} catch (error) {
			setResult(`Error: ${(error as Error).message}`);
		}
	};

	// Trigger the file fetch when the component mounts
	useEffect(() => {
		fetchDefaultFile();
	}); // Re-fetch if the path changes

	useEffect(() => {
		const fetchLatestData = async () => {
			try {
				if (!stationLabel) {
					throw new Error("Station label is missing");
				}

				const response = await fetch(
					`http://localhost/php/get_hydro_data.php?station_label=${stationLabel}&type=latest`
				);

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const rawData = await response.json();
				console.log("RawData: ", rawData);
				const transformedData = Array.isArray(rawData)
					? rawData.map((item: LatestData) => ({
							mesure: item.mesure,
							date_obs: item.date_obs,
					  }))
					: [];
				setData(transformedData);
				console.log("Transformed data: ", transformedData);
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: "An unknown error occurred"
				);
				console.error(error);
			}
		};

		fetchLatestData();
	}, [stationLabel, error]);

	useEffect(() => {
		// Function to update the current time
		const updateTime = () => {
			const now = new Date();
			const hours = String(now.getHours()).padStart(2, "0"); // Ensure two digits
			const minutes = String(now.getMinutes()).padStart(2, "0"); // Ensure two digits
			setCurrentTime(`${hours}:${minutes}`);
		};

		// Update time immediately and then every second
		updateTime(); // Initial call
		const intervalId = setInterval(updateTime, 1000);

		// Cleanup interval on component unmount
		return () => clearInterval(intervalId);
	}, []);

	return (
		<>
			<div>
				<h2>Date/heure courante: {currentDate}</h2>
			</div>
			<div className="form-config">
				<fieldset className="fieldset-container">
					<legend>Dernière données</legend>
					<div className="table-wrapper">
						<table className="table-latest">
							<thead>
								<tr>
									<th>Date</th>
									<th>Valeurs</th>
								</tr>
							</thead>
							<tbody>
								{data.length > 0 ? (
									data.map((item, index) => (
										<tr key={index}>
											<td>{item.date_obs}</td>
											<td>{item.mesure} m³/s</td>
										</tr>
									))
								) : (
									<tr>
										<td colSpan={2}>
											No latest data available.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</fieldset>
				<fieldset>
					<table>
						<tr className="header-row">
							<th colSpan={5}>
								REDUCTION DE TURBINAGE DE{" "}
								{stationLabel.toUpperCase()}
							</th>
						</tr>
						<tr className="header-row">
							<td colSpan={2}>19H00 à 05H00 été</td>
							<td colSpan={3}>18H00 à 4H00 Hiver</td>
						</tr>

						<tr className="sub-header-row">
							<td colSpan={5}>
								Processus en cours - Résultat disponible à 16h
							</td>
						</tr>

						<tr className="status-row">
							{currentTime >= "16:00" ? (
								<>
									{result === "NON" && (
										<td colSpan={5}>
											PAS DE RÉDUCTION PRÉVUE
										</td>
									)}
									{result === "OUI" && (
										<td colSpan={5}>RÉDUCTION PRÉVUE</td>
									)}
								</>
							) : (
								<td colSpan={5}>ATTENTE DE RÉSULTAT</td>
							)}
						</tr>

						<tr className="separator">
							<td></td>
						</tr>
						<tr className="data-row">
							<th>date</th>
							<th>Q</th>
							<th>prob_P75</th>
							<th>Reduc_turb</th>
							<th>Q_max</th>
						</tr>

						<tr className="data-row">
							<td>{date}</td>
							<td>{debit}</td>
							<td>{prob}</td>
							<td>{result}</td>
							<td>{debitMax}</td>
						</tr>
					</table>
				</fieldset>
				<fieldset className="fieldset-container">
					<legend>Résultat SilvRpeak</legend>
					{currentTime >= "16:00" ? (
						<>
							{result === "OUI" && (
								<>
									<p style={{ color: "red" }}>
										<b>
											Une réduction est prévue pour la
											station de {configName}.
										</b>
									</p>
									<p>
										Vous pouvez programmer la réduction
										<b> autommatiquement</b> ou l'effectuer
										<b> manuellement</b>.
									</p>
								</>
							)}

							{result === "NON" && (
								<p style={{ color: "rgb(92, 244, 54)" }}>
									<b>
										Aucune réduction est prévue pour la
										station de {configName}.
									</b>
								</p>
							)}
						</>
					) : (
						<p>
							Aucun résultat pour l'instant.
							<b> Veuillez attendre 16:00.</b>
						</p>
					)}
				</fieldset>
			</div>
		</>
	);
};

export default ResultatSilvRpeak;
