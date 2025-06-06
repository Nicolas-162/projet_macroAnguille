// Navbar.tsx
import React from "react";

interface NavbarProps {
	onOptionChange: (option: string) => void; // Callback to handle option changes
	selectedOption: string; // Track the currently selected option
}

const Navbar: React.FC<NavbarProps> = ({ onOptionChange, selectedOption }) => {
	return (
		<aside className="services-bar">
			{/* Graphs Button */}
			<div
				className={`service-bar-item ${
					selectedOption === "Graphique" ? "selected-item" : ""
				}`}
				onClick={() => onOptionChange("Graphique")}
			>
				Graphique
			</div>

			{/* Option2 Button */}
			<div
				className={`service-bar-item ${
					selectedOption === "SilvRPeak" ? "selected-item" : ""
				}`}
				onClick={() => onOptionChange("SilvRPeak")}
			>
				SilvRPeak
			</div>

			{/* Option3 Button */}
			<div
				className={`service-bar-item ${
					selectedOption === "Formulaire" ? "selected-item" : ""
				}`}
				onClick={() => onOptionChange("Formulaire")}
			>
				Formulaire
			</div>
			<div
				className={`service-bar-item ${
					selectedOption === "Rapport" ? "selected-item" : ""
				}`}
				onClick={() => onOptionChange("Rapport")}
			>
				Rapport
			</div>
		</aside>
	);
};

export default Navbar;
