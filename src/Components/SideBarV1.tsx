// SideBar.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StringFormatter from "../Utility/StringFormatter";
import Modal from "./Modal";

// Define a type for sidebar items
interface SidebarItem {
	label: string;
	path: string;
	isAddButton?: boolean; // Optional property for the "Ajouter" button
}

const SideBar: React.FC = () => {
	const navigate = useNavigate();

	// Initial sidebar items
	const initialSidebarItems: SidebarItem[] = [
		{ label: "Varennes", path: "#" },
		{ label: "Mercicourt", path: "/mericourt" },
		{ label: "Courlon", path: "#" },
		{ label: "Thomery", path: "#" },
		{ label: "Decize", path: "/decize" },
		{ label: "Montereau", path: "/montereau" },
		{ label: "Chadrac", path: "/chadrac" },
		{ label: "Ajouter", path: "#", isAddButton: true }, // Special button for adding configurations
	];

	const [sidebarItems, setSidebarItems] = useState(initialSidebarItems);
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Handle navigation or open modal
	const handleButtonClick = (item: SidebarItem) => {
		if (item.isAddButton) {
			setIsModalOpen(true); // Open the modal
		} else {
			if (item.path === "#") {
				navigate("/");
			} else {
				navigate(item.path);
			}
		}
	};

	// Handle adding a new configuration
	const handleAddConfiguration = (configName: string) => {
		const newItem: SidebarItem = {
			label: StringFormatter.capitalizeFirstLetter(configName),
			path: `/${configName.toLowerCase()}`,
		};
		setSidebarItems((prevItems) => [
			...prevItems.slice(0, -1),
			newItem,
			prevItems[prevItems.length - 1],
		]);
		setIsModalOpen(false); // Close the modal
	};

	return (
		<aside className="sidebar">
			{/* Sidebar Buttons */}
			{sidebarItems.map((item, index) => (
				<div
					key={index}
					className="sidebar-element"
					onClick={() => handleButtonClick(item)}
				>
					<span className="sidebar-element-name">{item.label}</span>
				</div>
			))}

			{/* Modal */}
			<Modal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSubmit={handleAddConfiguration}
			/>
		</aside>
	);
};

export default SideBar;
