<?php

class GetIndexHydroQuery extends QueryPDO
{
   protected function query()
   {
      $requete = $this->pdo->query(
         "SELECT station_id, code_station, type_mesure 
            FROM index_api_hydro"
      );

      $res = $requete->fetchAll(PDO::FETCH_ASSOC);
      $requete = null;
      return $res;
   }
}

/**
 * Requete SQL qui récupère les résultats les plus récents dans un array, si ils existent
 * Si une station n'a pas de résultat enregistré, son entrée dans l'array aura la valeur false
 */
class getLatestResultsQuery extends QueryPDO
{
   private array $station_id;

   public function __construct(array $station_id)
   {
      $this->station_id = $station_id;
      parent::__construct();
   }

   protected function query()
   {
      $requete = $this->pdo->prepare(
         "SELECT station_id, date_obs as date
            FROM data_api_hydro
            WHERE station_id = ?
            ORDER BY date_obs DESC
            LIMIT 1"
      );

      $res = [];
      foreach ($this->station_id as $id) {
         $temp = $requete->execute([$id]);
         if ($temp == false) {
            $res[$id] = false;
         } else {
            $res[$id] = $requete->fetch(PDO::FETCH_ASSOC);
            if ($res[$id] != false) {
               $res[$id] = $res[$id]['date'];
            }
         }
      }

      return $res;
   }
}

/**
 * Insère les données récupérées sur une station dans la bdd à partir de l'API
 */
class InsertDataQuery extends QueryPDO
{
   private string $station_id;
   private array $data;

   public function __construct(string $station_id, array $data)
   {
      $this->station_id = $station_id;
      $this->data = $data;
      parent::__construct();
   }

   protected function query()
   {
      $values = "";
      $tz = new DateTimeZone('Europe/Paris');
      foreach ($this->data as $data) {
         $date = new DateTime($data['date_obs'], $tz);
         $values .= "({$this->station_id}, '{$date->format('Y-m-d H:i:s')}', {$data['resultat_obs']}), ";
      }
      $values = substr($values, 0, -2);

      $requete = $this->pdo->query(
         "INSERT INTO data_api_hydro (station_id, date_obs, mesure)
            VALUES {$values}
            ON DUPLICATE KEY UPDATE station_id=VALUES(station_id), date_obs=VALUES(date_obs), mesure=VALUES(mesure)"
      );
      $res = $requete->fetchAll(PDO::FETCH_ASSOC);
      return $res;
   }
}

/**
 * Insère les données filtrées depuis la table data_api_hydro vers data_api_hydro_temp
 */
class InsertFilteredDataQuery extends QueryPDO
{
   public function __construct()
   {
      parent::__construct();
   }

   protected function query()
   {
      $requete = $this->pdo->query(
         "INSERT INTO data_api_hydro_temp (station_id, mesure, date_obs)
            SELECT d1.station_id, d1.mesure, d1.date_obs
            FROM data_api_hydro AS d1
            WHERE 
               (d1.date_obs LIKE '%-__-__ __:00:00' OR
               d1.date_obs LIKE '%-__-__ __:20:00' OR
               d1.date_obs LIKE '%-__-__ __:40:00')
            AND NOT EXISTS (
                  SELECT 1
                  FROM data_api_hydro_temp AS d2
                  WHERE d1.station_id = d2.station_id
                  AND d1.date_obs = d2.date_obs
            )"
      );

      return $requete->rowCount(); // Return the number of rows inserted
   }
}
