// MainContent.tsx
import React from "react";

const MainContent: React.FC = () => {
	return (
		<div className="config">
			<h2>Veuillez sélectionner une configuration</h2>
			<p>
				Une configuration correspond à un site / une centrale, et peut
				regrouper l'ensemble des configurations des services Windows
				utilisés par ce site. L'objectif de cette page est de
				centraliser la configuration de chaque service sur chaque site.
			</p>
			<p>
				Vous pouvez créer, sélectionner, supprimer ou modifier une
				configuration en cliquant sur la barre verticale gauche.
			</p>
			<p>
				Une fois une configuration sélectionnée, les services
				configurables apparaîtront dans une barre horizontale en haut de
				la page. Il vous suffira ensuite de cliquer sur un service pour
				pouvoir modifier ses paramètres. Pour sauvegarder les paramètres
				d'un service, appuyer sur le bouton "Enregistrer" en bas de
				page.
			</p>
			<p>
				Les paramètres d'un service sont propres à la configuration
				actuellement choisie.
			</p>
		</div>
	);
};

export default MainContent;
