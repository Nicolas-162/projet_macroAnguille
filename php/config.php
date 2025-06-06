<?php

$environment = 'DEV'; // 'PROD'
$_config = [
   'DEV' => [
      'environment' => 'DEV',
      'vue_version' => '3.5.13',
      /**
       * Authentification pour accès à la base de données
       */
      // 'serveur' => 'localhost',
      // 'database' => 'copie_dist',
      // 'user' => 'root',
      // 'password' => 'password',
      'serveur' => 'localhost',
      'database' => 'lol',
      'user' => 'root',
      'password' => '',

      /**
       * Adresse url (avec le slash '/' à la fin!!) pour permettre à certaines tâches cron de fonctionner correctement
       * (Exportation mensuel au format excel)
       */
      'site_url' => 'localhost/',

      /**
       * Token interne permettant de faire des requêtes du serveur vers lui-même
       * (Utiliser par une tâche Cron pour générer automatiquement des Excels mensuels, par exemple )
       */
      'internal_api_token' => '',

      /**
       * Durée de vie des données des modèles dans le cache de session (en seconde)
       */
      'reload_session_time' => 30,

      'pages_prix' => [
         'https://www.nordpoolgroup.com/en/Market-data1/Dayahead/Area-Prices/fr/hourly/?view=table',
         'https://www.services-rte.com/fr/visualisez-les-donnees-publiees-par-rte/bourses-de-lelectricite-spot-france.html',
      ],


      /**
       * Clé authentifiant l'accès aux API de RTE
       */
      'api_rte_auth_key' => '',
      //'api_rte_auth_key' => 'Basic NmM0YWM1NTgtMjQxMy00YzRiLTg2MTktNmJjNWQ0OTc3NWZmOjRkZjJiNWFiLTVjMzEtNGRjOC1hMjRiLWE2MjQyNjE0MjgwYw==',

      /**
       * Défini le seuil de communication perdue avant qu'une alerte soit émise
       * Si le pourcentage de transmissions reçues (comparée à celui attendu) est inférieur à ce seuil,
       * une alerte sera émise
       */
      'seuil_alerte_communication' => 90,

      /**
       * Défini le seuil d'alerte (en %) basé sur le nombre de transmissions dont les valeurs sont inférieur à la puissance minimale d'un groupe
       * Si 100% est défini, la moindre transmission sous le seuil est signalé par exemple
       */
      'seuil_alerte_groupe' => 5,

      /**
       * Nombre de minutes sous le seuil de production électrique à partir duquel une alerte doit se déclencher sur l'heure précédente
       * (%)
       */
      'seuil_alerte_usine' => 5,

      /**
       * Durée de vie du cookie de session (côté utilisateur, en secondes)
       */
      'session_length' => 86400,

      /**
       * Durée de vie avant que le garbage collector du serveur n'efface une session inactive (en secondes)
       */
      'session_gc' => 86400,

   ]
];

return $_config[$environment];
