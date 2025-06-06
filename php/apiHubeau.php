<?php
require __DIR__ . '/common.php';
require __DIR__ . '/jobHydroQueries.php';


// Récupération de toutes les informations des stations, ce qui va permettre de générer la 
// requête à l'API
$query = new GetIndexHydroQuery();
$stations = $query->getResultats();


// Si la requête a échoué, on s'arrête maintenant
if (!$stations) {
   exit();
}
// Génération des dates de référence 
$tz = new DateTimeZone('Europe/Paris');
$utc = new DateTimeZone('UTC');
$ajd = new DateTime('now', $tz);


$periodeMax = new DateInterval('P29D');
$max = new DateTime('now', $tz);
$max = $max->sub($periodeMax);

// Récupération des derniers résultats pour générer les dates :
$arrayId = [];
foreach ($stations as $station) {
   $arrayId[] = $station['station_id'];
}

$query = new getLatestResultsQuery($arrayId);
$resultats = $query->getResultats();

echo "<pre>";


// Génération des dates (avec pour max 29j en arrière si vide ou faux)
foreach ($resultats as $key => $value) {
   $date = new DateTime($value, $tz);
   $resultats[$key] = $date->format('Y-m-d H:i:s');
   if ($date < $max || $value == false) {
      $resultats[$key] = $max->format('Y-m-d H:i:s');
   }
   $resultats[$key] = str_replace(':', '%3A', $resultats[$key]);
   $resultats[$key] = str_replace(' ', 'T', $resultats[$key]);
   $resultats[$key] .= '+';
}


//var_dump($resultats);

// Parcours pour récupérer les données de chaque stations
// Parcours pour récupérer les données de chaque station
foreach ($stations as $s) {
   $pageSize = 10000; // Nombre d'enregistrements par page
   $currentPage = 1; // Page courante
   $hasMoreData = true;

   while ($hasMoreData) {
      // Génère l'URL de requête avec pagination
      $url = "https://hubeau.eaufrance.fr/api/v2/hydrometrie/observations_tr?" .
         "code_entite={$s['code_station']}&" .
         "date_debut_obs={$resultats[$s['station_id']]}&" .
         "fields=date_obs%2Cresultat_obs&" .
         "grandeur_hydro={$s['type_mesure']}&" .
         "sort=asc&" .
         "size=$pageSize&" .
         "page=$currentPage";

      // Récupère les résultats via cURL
      $curl = curl_init($url);
      curl_setopt($curl, CURLOPT_HTTPHEADER, ["accept: application/json"]);
      curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
      $result = curl_exec($curl);
      curl_close($curl);

      // Si aucune erreur dans la transmission, on traite les données, sinon on passe
      if ($result != false) {
         $json = json_decode($result, true);

         // Vérifie que les données existent et qu'elles sont un tableau
         if (isset($json['data']) && is_array($json['data']) && count($json['data']) > 0) {
            $data = $json['data'];
            $temp = [];

            foreach ($data as &$d) {
               // Vérifie que les valeurs existent bien
               if (isset($d['resultat_obs']) && isset($d['date_obs'])) {
                  $dateTemp = new DateTime($d['date_obs'], $utc);
                  $dateTemp->setTimezone($tz);
                  $d['date_obs'] = $dateTemp->format('Y-m-d H:i:s');
                  $temp[] = $d;
               }
            }

            // Insère les données dans la base de données
            $query = new InsertDataQuery($s['station_id'], $temp);

            // Vérifie si nous avons atteint la fin des données
            $hasMoreData = count($data) === $pageSize;
            $currentPage++;
         } else {
            $hasMoreData = false; // Arrête la boucle si aucune donnée n'est retournée
         }
      } else {
         echo "Erreur lors de la récupération des données pour la station {$s['station_id']}<br>";
         $hasMoreData = false; // Arrête la boucle en cas d'erreur
      }
   }

   echo $s['station_id'] . ' ok!<br>';
}

// Exécute la requête pour insérer les données filtrées dans data_api_hydro_temp
$query = new InsertFilteredDataQuery();
$rowsInserted = $query->getResultats();

echo "Number of rows inserted into data_api_hydro_temp: $rowsInserted";

// echo count(($temp));

echo "</pre>";
