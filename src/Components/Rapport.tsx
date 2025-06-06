import React from "react";
import * as XLSX from "xlsx";

interface TableRow {
	date: string;
	macroArret: string;
	arretRealise: string;
	debitSeine: number | string;
	debitMaxTurbinable: number | string;
	puissanceMax: number | string;
}

const Rapport: React.FC = () => {
	// Define the table data
	const tableData: TableRow[] = [
		{
			date: "01/09/2024",
			macroArret: "Pas d'arrêt",
			arretRealise: "Non",
			debitSeine: 306,
			debitMaxTurbinable: "NA",
			puissanceMax: "Non",
		},
		{
			date: "02/09/2024",
			macroArret: "Pas d'arrêt",
			arretRealise: "Non",
			debitSeine: 313,
			debitMaxTurbinable: "NA",
			puissanceMax: "Non",
		},
		{
			date: "03/09/2024",
			macroArret: "Pas d'arrêt",
			arretRealise: "Non",
			debitSeine: 293,
			debitMaxTurbinable: "NA",
			puissanceMax: "Non",
		},
		{
			date: "04/09/2024",
			macroArret: "Pas d'arrêt",
			arretRealise: "Non",
			debitSeine: 296,
			debitMaxTurbinable: "NA",
			puissanceMax: "Non",
		},
		{
			date: "05/09/2024",
			macroArret: "Arrêt",
			arretRealise: "Non",
			debitSeine: 297,
			debitMaxTurbinable: "NA",
			puissanceMax: "Non",
		},
		{
			date: "06/09/2024",
			macroArret: "Arrêt",
			arretRealise: "Non",
			debitSeine: 586,
			debitMaxTurbinable: 199,
			puissanceMax: 9356,
		},
		{
			date: "07/09/2024",
			macroArret: "Pas d'arrêt",
			arretRealise: "Non",
			debitSeine: 499,
			debitMaxTurbinable: 169,
			puissanceMax: 7991,
		},
		{
			date: "08/09/2024",
			macroArret: "Arrêt",
			arretRealise: "Non",
			debitSeine: 450,
			debitMaxTurbinable: 153,
			puissanceMax: 7264,
		},
		{
			date: "09/09/2024",
			macroArret: "Arrêt",
			arretRealise: "Non",
			debitSeine: 443,
			debitMaxTurbinable: 150,
			puissanceMax: 7127,
		},
	];

	// Function to export table data to Excel with structured headers
	const exportToExcel = () => {
		// Create a worksheet from the table data
		const worksheetData = [
			[
				"Date",
				"Résultat macro arrêt",
				"Arrêt réalisé",
				"",
				"Résultat macro réduction",
				"",
				"",
			], // First header row
			[
				"",
				"",
				"",
				"Débit Seine 11h/11h",
				"Débit max turbinable",
				"Puissance max",
			], // Second header row
			...tableData.map((row) => [
				row.date,
				row.macroArret,
				row.arretRealise,
				row.debitSeine,
				row.debitMaxTurbinable,
				row.puissanceMax,
			]),
		];

		// Create a workbook and add the worksheet
		const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, "Table Data");

		// Define merge ranges for the headers
		worksheet["!merges"] = [
			{ s: { r: 0, c: 0 }, e: { r: 1, c: 0 } }, // Merge "Date"
			{ s: { r: 0, c: 1 }, e: { r: 1, c: 1 } }, // Merge "Résultat macro arrêt"
			{ s: { r: 0, c: 2 }, e: { r: 1, c: 2 } }, // Merge "Arrêt réalisé"
			{ s: { r: 0, c: 3 }, e: { r: 0, c: 5 } }, // Merge "Résultat macro réduction"
		];

		// Export the workbook as an Excel file
		XLSX.writeFile(workbook, "table_data.xlsx");
	};

	return (
		<fieldset className="fieldset-rapport">
			<table className="table-rapport">
				<thead>
					<tr>
						<th rowSpan={2}>Date</th>
						<th rowSpan={2}>Résultat macro arrêt</th>
						<th rowSpan={2}>Arrêt réalisé</th>
						<th colSpan={3}>Résultat macro réduction</th>
					</tr>
					<tr>
						<th>Débit Seine 11h/11h</th>
						<th>Débit max turbinable</th>
						<th>Puissance max</th>
					</tr>
				</thead>
				<tbody>
					{tableData.map((row, index) => (
						<tr key={index}>
							<td>{row.date}</td>
							<td>{row.macroArret}</td>
							<td>{row.arretRealise}</td>
							<td>{row.debitSeine}</td>
							<td>{row.debitMaxTurbinable}</td>
							<td>{row.puissanceMax}</td>
						</tr>
					))}
				</tbody>
			</table>

			{/* Button to export the table to Excel */}
			<div style={{ marginTop: "20px", textAlign: "center" }}>
				<button
					onClick={exportToExcel}
					style={{ padding: "10px 20px", fontSize: "16px" }}
				>
					Export to Excel
				</button>
			</div>
		</fieldset>
	);
};

export default Rapport;
