import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker"; // Calendar component
import "react-datepicker/dist/react-datepicker.css";
//import { useParams } from "react-router-dom";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import StringFormatter from "../Utility/StringFormatter";

// Define the structure of the API response
interface WaterData {
	station_id: number;
	mesure: number;
	date_obs: string; // Date in dd/mm HH:mm format
}

interface DailyAverageData {
	station_label: string;
	day: string; // Date in dd/mm/yyyy format
	average_flow: number;
}

interface DebitGraphProp {
	configName: string;
}

const FlowGraphs: React.FC<DebitGraphProp> = ({ configName }) => {
	// State to hold the fetched data for the line graph
	const [data, setData] = useState<WaterData[]>([]);
	// State to hold the fetched data for the bar graph
	const [dailyAverageData, setDailyAverageData] = useState<
		DailyAverageData[]
	>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const { stationLabel } = { stationLabel: configName };
	// State for user inputs
	const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
	const [selectedHour, setSelectedHour] = useState<string>(
		new Date().getHours().toString()
	);
	const [selectedPeriod, setSelectedPeriod] = useState<string>("24");

	// Fetch data for the selected station (line graph)
	useEffect(() => {
		const fetchData = async () => {
			try {
				if (!stationLabel) {
					throw new Error("Station label is missing");
				}

				if (!selectedDate) {
					throw new Error("Date is missing");
				}

				const formattedDate = selectedDate.toISOString().split("T")[0];
				const response = await fetch(
					`http://localhost/php/get_hydro_data.php?station_label=${stationLabel}&date=${formattedDate}&hour=${selectedHour}&period=${selectedPeriod}&type=period`
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
	}, [stationLabel, selectedDate, selectedHour, selectedPeriod]);

	// Fetch data for the bar graph (daily averages)
	useEffect(() => {
		const fetchDailyAverageData = async () => {
			try {
				if (!stationLabel) {
					throw new Error("Station label is missing");
				}

				const response = await fetch(
					`http://localhost/php/get_hydro_data.php?station_label=${stationLabel}&type=daily_average`
				);

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const rawData = await response.json();

				// Ensure rawData is an array
				const normalizedData = Array.isArray(rawData) ? rawData : [];

				// Add a relative day offset (-8 to 0) to each data point
				const today = new Date();
				today.setHours(0, 0, 0, 0); // Normalize today's date to midnight
				const processedData = normalizedData.map((item) => {
					const itemDate = new Date(
						item.day.split("/").reverse().join("-")
					); // Convert dd/mm/yyyy to Date object
					itemDate.setHours(0, 0, 0, 0); // Normalize item's date to midnight
					const diffInDays = Math.floor(
						(itemDate.getTime() - today.getTime()) /
							(1000 * 60 * 60 * 24)
					);
					return {
						...item,
						relativeDay: diffInDays.toString(), // e.g., "-8", "-7", ..., "0"
					};
				});

				console.log("Processed daily average data:", processedData); // Log the processed data

				setDailyAverageData(processedData);
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: "An unknown error occurred"
				);
			}
		};

		fetchDailyAverageData();
	}, [stationLabel]);

	// Check if data is empty
	const isEmptyData = data.length === 0;
	const isEmptyDailyAverageData = dailyAverageData.length === 0;

	return (
		<>
			<div>
				<h1 className="config-title">
					Station:{" "}
					{StringFormatter.capitalizeFirstLetter(stationLabel ?? "")}
				</h1>
			</div>

			<div className="config">
				{/* Render loading, error, or data */}
				{loading && (
					<div className="config">
						<div className="loading-div">
							<span className="spinning-loader"></span>
							<p className="loading-text">
								Chargement en cours...{" "}
							</p>
						</div>
					</div>
				)}
				{error && <div>Error: {error}</div>}

				{!loading && !error && (
					<>
						{/* Line Graph */}
						<h2>Débits collectés sur Hubeau</h2>
						{isEmptyData ? (
							// Render an empty graph
							<div>
								<h2>No Data Available</h2>
								<ResponsiveContainer width="100%" height={400}>
									<LineChart
										data={[]} // Empty data array
										margin={{
											top: 20,
											right: 30,
											left: 20,
											bottom: 50,
										}}
									>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis dataKey="date_obs" />
										<YAxis />
										<Tooltip />
										<Legend />
										<Line
											type="monotone"
											dataKey="mesure"
											name="Average Flow (m³/s)"
											stroke="#8884d8"
										/>
									</LineChart>
								</ResponsiveContainer>
							</div>
						) : (
							// Render the graph for the selected station
							<ResponsiveContainer width="100%" height={400}>
								<LineChart
									data={data}
									margin={{
										top: 20,
										right: 30,
										left: 20,
										bottom: 50,
									}}
								>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis
										dataKey="date_obs"
										angle={-45}
										textAnchor="end"
										interval="preserveStartEnd"
									/>
									<YAxis />
									<Tooltip />
									<Legend />
									<Line
										type="monotone"
										dataKey="mesure"
										name="Débit (m³/s)"
										stroke="#8884d8"
										activeDot={{ r: 8 }}
									/>
								</LineChart>
							</ResponsiveContainer>
						)}

						{/* Interactive Controls */}
						<div style={{ marginTop: "20px" }}>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: "10px",
								}}
							>
								<label>Date:</label>
								<DatePicker
									selected={selectedDate}
									onChange={(date) => setSelectedDate(date)}
									dateFormat="yyyy-MM-dd" // Include time format
								/>
								<label>Heure:</label>
								<select
									value={selectedHour}
									onChange={(e) =>
										setSelectedHour(e.target.value)
									}
								>
									{Array.from({ length: 24 }, (_, i) =>
										i.toString().padStart(2, "0")
									).map((hour) => (
										<option key={hour} value={hour}>
											{hour}:00
										</option>
									))}
								</select>
								<label>Période:</label>
								<button
									value="1"
									onClick={(e) =>
										setSelectedPeriod(e.currentTarget.value)
									}
									style={{
										backgroundColor:
											selectedPeriod === "1"
												? "rgb(110, 209, 90)"
												: "",
									}}
								>
									1 Hour
								</button>
								<button
									value="6"
									onClick={(e) =>
										setSelectedPeriod(e.currentTarget.value)
									}
									style={{
										backgroundColor:
											selectedPeriod === "6"
												? "rgb(110, 209, 90)"
												: "",
									}}
								>
									6 Hours
								</button>
								<button
									value="24"
									onClick={(e) =>
										setSelectedPeriod(e.currentTarget.value)
									}
									style={{
										backgroundColor:
											selectedPeriod === "24"
												? "rgb(110, 209, 90)"
												: "",
									}}
								>
									24 Hours
								</button>
							</div>
						</div>
					</>
				)}
			</div>
			<br />

			<div className="config">
				{!loading && !error && (
					<>
						{/* Bar Graph */}
						<h2>Débit moyen (J-8)</h2>
						{isEmptyDailyAverageData ? (
							<div>
								<h3>No Data Available</h3>
							</div>
						) : (
							<ResponsiveContainer width="100%" height={400}>
								<BarChart
									data={dailyAverageData}
									margin={{
										top: 20,
										right: 30,
										left: 20,
										bottom: 50,
									}}
								>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis
										dataKey="relativeDay" // Use the relative day offset as the label
										angle={0}
										textAnchor="end"
										interval="preserveStartEnd"
									/>
									<YAxis />
									<Tooltip />
									<Legend />
									<Bar
										dataKey="average_flow"
										name="Débit moyen (m³/s)"
										fill="#8884d8"
									/>
								</BarChart>
							</ResponsiveContainer>
						)}
					</>
				)}

				<div style={{ marginTop: "20px" }}>
					<button onClick={() => (window.location.href = "/")}>
						Back to Home
					</button>
				</div>
			</div>
		</>
	);
};

export default FlowGraphs;
