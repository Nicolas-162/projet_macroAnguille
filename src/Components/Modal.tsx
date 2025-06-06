// Modal.tsx
import React, { useState } from "react";
import { Configuration } from "../Utility/types";
import CancelButton from "./CancelButton";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (configName: string) => void;
	selectedConfig?: Configuration | null; // Optional prop for editing
}

const Modal: React.FC<ModalProps> = ({
	isOpen,
	onClose,
	onSubmit,
	selectedConfig,
}) => {
	const [configName, setConfigName] = useState(selectedConfig?.name || "");

	// Handle input change
	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setConfigName(event.target.value);
	};

	// Handle form submission
	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (configName.trim()) {
			onSubmit(configName);
			setConfigName("");
		}
	};

	// Handle Delete Button Click
	const handleDelete = async () => {
		try {
			if (
				confirm(
					"Confirmer la suppression de " +
						selectedConfig?.name +
						"\nCette action est irréversible!"
				)
			) {
				const response = await fetch(
					"http://localhost/php/delete_configuration.php?",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							label: selectedConfig?.name.toLowerCase(),
						}),
					}
				);

				if (!response.ok) {
					throw new Error("Failed to delete configuration");
				}

				onClose();
				window.location.reload();
				//window.location.href = "/my-project/";
			}
		} catch (err) {
			console.error("Error deleting configuration:", err);
			alert("An error occurred while deleting the configuration.");
		}
	};

	if (!isOpen) return null;

	return (
		<div className="modal-wrapper">
			<form className="modal-container" onSubmit={handleSubmit}>
				<div className="modal-title">
					<h3>
						{selectedConfig
							? "Modifier la configuration"
							: "Ajouter une configuration"}
					</h3>
					<span className="modal-exit" onClick={onClose}>
						X
					</span>
				</div>
				<div className="modal-content">
					<label>Nom de la configuration :</label>
					<input
						type="text"
						name="configName"
						minLength={3}
						maxLength={50}
						required
						value={selectedConfig?.name}
						onChange={handleInputChange}
					/>
				</div>
				<div className="form-control">
					<CancelButton
						onClose={onClose}
						selectedConfig={!!selectedConfig}
					/>
					{selectedConfig && (
						<button
							type="button"
							className="control-delete"
							onClick={handleDelete}
						>
							Supprimer
						</button>
					)}
					<button type="submit" className="control-valid">
						Enregistrer
					</button>
				</div>
			</form>
		</div>
	);
};

export default Modal;
