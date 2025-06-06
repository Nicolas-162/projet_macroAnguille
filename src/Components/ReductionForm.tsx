import React, { useState } from "react";
import StringFormatter from "../Utility/StringFormatter";

// Define the shape of the form data using an interface
interface FormData {
	stationLabel: string;
	name: string;
	email: string;
}
interface FormOption {
	option: string;
}

interface SimpleFormProps {
	configName: string;
}

const SimpleForm: React.FC<SimpleFormProps> = ({ configName }) => {
	// Initialize state with TypeScript types
	const [formData] = useState<FormData>({
		stationLabel: configName,
		name: "Bro",
		email: "bro@hotmail.com",
	});
	const [formOption, setFormOption] = useState<FormOption>({
		option: "forward",
	});
	const [responseMessage, setResponseMessage] = useState<string>("");

	// Handle input changes
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormOption((prevData) => ({
			...prevData,
			[name]: value,
		}));
	};

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (formOption.option === "forward") {
			try {
				const response = await fetch(
					"http://localhost/php/automate.php",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(formData),
					}
				);

				if (!response.ok) {
					throw new Error("Failed to send data");
				}

				const result = await response.json();
				setResponseMessage(result.message);
			} catch (error) {
				setResponseMessage(`Error: ${(error as Error).message}`);
			}
		} else {
			alert("Second Radio button checked...");
		}
	};

	return (
		<>
			<div>
				<h1 className="config-title">
					Réduction pour la station:{" "}
					{StringFormatter.capitalizeFirstLetter(configName ?? "")}
				</h1>
			</div>
			<div className="config">
				<form onSubmit={handleSubmit}>
					<div>
						<label>
							<input
								type="radio"
								name="option"
								value="forward"
								checked={formOption.option === "forward"}
								onChange={handleChange}
								required
							/>
							Arrêt automatique
						</label>
					</div>
					<div>
						<label>
							<input
								type="radio"
								name="option"
								value="alert"
								checked={formOption.option === "alert"}
								onChange={handleChange}
								required
							/>
							Arrêt manuel
						</label>
					</div>
					<button type="submit">Submit</button>
					{responseMessage && (
						<p style={{ marginTop: "10px" }}>{responseMessage}</p>
					)}
				</form>
			</div>
		</>
	);
};

export default SimpleForm;
