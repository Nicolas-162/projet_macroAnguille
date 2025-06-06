import { useState } from "react";

const ButtonWithHover = ({
	onClose,
	selectedConfig,
}: {
	onClose: () => void;
	selectedConfig: boolean;
}) => {
	// State to track hover
	const [isHovered, setIsHovered] = useState(false);

	// Default styles
	const defaultStyle = {
		backgroundColor: selectedConfig ? "white" : "red",
		color: selectedConfig ? "black" : "",
		borderColor: selectedConfig ? "rgb(127, 255, 148)" : "red",
	};

	// Hover styles
	const hoverStyle = {
		backgroundColor: selectedConfig
			? "rgba(202, 255, 188, 0.9)"
			: "rgb(255, 102, 102)",
		color: selectedConfig ? "black" : "",
		borderColor: selectedConfig ? "rgb(127, 255, 148)" : "red",
	};

	return (
		<button
			type="button"
			className="control-cancel"
			onClick={onClose}
			style={isHovered ? hoverStyle : defaultStyle}
			onMouseEnter={() => setIsHovered(true)} // Set hover state to true
			onMouseLeave={() => setIsHovered(false)} // Reset hover state
		>
			Annuler
		</button>
	);
};

export default ButtonWithHover;
