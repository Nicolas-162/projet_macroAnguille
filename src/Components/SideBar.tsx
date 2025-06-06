// SideBar.tsx
import React, { useEffect, useState } from "react";
//import { useNavigate } from "react-router-dom";
import StringFormatter from "../Utility/StringFormatter";
import { Configuration } from "../Utility/types";
import Modal from "./Modal";

interface BackendResponse {
	label: string;
}

interface SideBarProps {
	onConfigSelect: (configName: string) => void; // Callback to pass selected config
}

const SideBar: React.FC<SideBarProps> = ({ onConfigSelect }) => {
	//const navigate = useNavigate();
	const [configurations, setConfigurations] = useState<Configuration[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedConfig, setSelectedConfig] = useState<Configuration | null>(
		null
	);
	const [selectedConfigId, setSelectedConfigId] = useState<number | null>(
		null
	);

	useEffect(() => {
		const fetchConfigurations = async () => {
			try {
				const response = await fetch(
					"http://localhost/php/get_configuration.php"
				);
				if (!response.ok) {
					throw new Error("Failed to fetch configurations");
				}

				// Parse the response as BackendResponse[]
				const rawData: BackendResponse[] = await response.json();
				console.log("Raw Data:", JSON.stringify(rawData, null, 2)); // Debugging

				// Map the raw data to the expected format
				const mappedData = rawData.map((item: BackendResponse) => ({
					name: item.label || "Unknown",
					path: item.label.toLowerCase(),
				}));
				setConfigurations(mappedData);
			} catch (err) {
				console.error("Fetch Error:", err); // Debug: Log any errors
				setError(
					err instanceof Error
						? err.message
						: "An unknown error occurred"
				);
			} finally {
				setIsLoading(false);
			}
		};

		fetchConfigurations();
	}, []);

	const handleButtonClick = (item: Configuration, configId: number) => {
		// if (item.path !== "#") {
		// 	navigate(item.path);
		// }
		onConfigSelect(item.name);
		setSelectedConfigId(configId);
	};

	const handleAddConfiguration = async (configName: string) => {
		try {
			const response = await fetch(
				"http://localhost/php/add_configuration.php",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						label: StringFormatter.capitalizeFirstLetter(
							configName
						),
					}),
				}
			);

			if (!response.ok) {
				throw new Error("Failed to add configuration");
			}

			const newConfig: BackendResponse = await response.json();
			setConfigurations((prevConfigs) => [
				...prevConfigs,
				{
					name: StringFormatter.capitalizeFirstLetter(
						newConfig.label
					),
					path: `/${newConfig.label.toLowerCase()}`, // Derive path from label
				},
			]);

			window.location.reload();
			//window.location.href = "/my-project/";
		} catch (err) {
			console.error("Error adding configuration:", err);
			alert("An error occurred while adding the configuration.");
		} finally {
			setIsModalOpen(false); // Close the modal
		}
	};

	const openEditModal = (config: Configuration) => {
		setSelectedConfig(config);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setSelectedConfig(null);
		setIsModalOpen(false);
	};

	if (isLoading) {
		return <div className="sidebar">Loading configurations...</div>;
	}

	if (error) {
		return <div className="sidebar">Error: {error}</div>;
	}

	if (configurations.length === 0) {
		return <div className="sidebar">No configurations found.</div>;
	}

	return (
		<aside className="sidebar">
			{/* Sidebar Buttons */}
			{configurations.map((config, index) => (
				<div
					key={index}
					className={`sidebar-element ${
						selectedConfigId === index ? "selected-config" : ""
					}`}
					onClick={() => handleButtonClick(config, index)}
				>
					<span className="sidebar-element-name">{config.name}</span>
					<button
						className="three-dots-button"
						onClick={(e) => {
							e.stopPropagation();
							openEditModal(config);
						}}
					>
						<b>...</b>
					</button>
				</div>
			))}

			{/* Add Button */}
			<div
				className="sidebar-element config-option-add"
				onClick={() => setIsModalOpen(true)}
			>
				<span className="sidebar-element-name">Ajouter</span>
			</div>

			{/* Modal */}
			<Modal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				onSubmit={handleAddConfiguration}
				selectedConfig={selectedConfig}
			/>
		</aside>
	);
};

export default SideBar;
