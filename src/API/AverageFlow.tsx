import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

interface DailyFlowData {
	date: string;
	avg_mesure: number;
}

const AverageFlowGraph: React.FC = () => {
	const [data, setData] = useState<DailyFlowData[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const stationLabel = "Mericourt";

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch(
					`http://localhost/get_average.php?station_label=${stationLabel}`
				);

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const rawData = await response.json();

				// Ensure rawData is an array
				const normalizedData = Array.isArray(rawData) ? rawData : [];

				console.log("Normalized data:", normalizedData); // Log the normalized data

				setData(normalizedData);
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
	}, [stationLabel]);

	return (
		<div>
			<h1>Average Flow Graph for {stationLabel}</h1>

			{/* Render loading, error, or data */}
			{loading && <div>Loading...</div>}
			{error && <div>Error: {error}</div>}

			{!loading && !error && (
				<BarChart
					width={700}
					height={400}
					data={data}
					margin={{
						top: 20,
						right: 30,
						left: 20,
						bottom: 50,
					}}
				>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="date" />
					<YAxis />
					<Tooltip />
					<Legend />
					<Bar dataKey="avg_mesure" fill="#45aaf2" />
				</BarChart>
			)}
		</div>
	);
};

export default AverageFlowGraph;
