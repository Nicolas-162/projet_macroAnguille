// App.tsx
import React, { useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
//import SideBar from "./Components/SideBar";

// import FlowGraphs from "./API/FlowGraphs";
import "./App.css";
//import AddConfiguration from "./Components/AddConfiguration";
//import AverageFlow from "./API/AverageFlow";
import DebitGraph from "./API/DebitGraph";
//import MainContent from "./Components/MainContent";
import MainContent from "./Components/MainContent";
import Navbar from "./Components/NavBar";
import Rapport from "./Components/Rapport";
import SimpleForm from "./Components/ReductionForm";
import ResultatSilvRpeak from "./Components/ResultatSilvRpeak";
import SideBar from "./Components/SideBar";
//import SimpleForm from "./Components/SimpleForm";
// import StationSelector from "./Components/StationSelector";

const App: React.FC = () => {
	const [selectedOption, setSelectedOption] = useState<string>(""); // Default to "Graphs"
	const [selectedConfig, setSelectedConfig] = useState<string | null>(null);

	// Handler for navbar option changes
	const handleOptionChange = (option: string) => {
		setSelectedOption(option);
	};

	const handleConfigSelect = (configName: string) => {
		setSelectedConfig(configName); // Set the selected configuration
		setSelectedOption("Graphique"); // Automatically select "Graphs" when a config is selected
	};

	return (
		<Router basename="/macroAnguille/">
			<div className="content">
				{/* Sidebar */}
				<SideBar onConfigSelect={handleConfigSelect} />

				{/* Main Content */}
				<Navbar
					onOptionChange={handleOptionChange}
					selectedOption={selectedOption} // Pass the selected option
				/>
				<main>
					{selectedConfig && (
						<>
							{/* Dynamic Content Based on Selected Option */}
							{selectedOption === "Graphique" && (
								<DebitGraph configName={selectedConfig} />
							)}
							{selectedOption === "SilvRPeak" && (
								<ResultatSilvRpeak
									configName={selectedConfig}
								/>
							)}
							{selectedOption === "Formulaire" && (
								<SimpleForm configName={selectedConfig} />
							)}
							{selectedOption === "Rapport" && <Rapport />}
						</>
					)}
					{!selectedConfig && <MainContent />}
				</main>
			</div>
		</Router>
	);
};

export default App;
