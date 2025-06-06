<?php

// Enable CORS headers
header('Access-Control-Allow-Origin: http://localhost:5173'); // Allow only the React app origin
header('Access-Control-Allow-Methods: GET, POST, OPTIONS'); // Allowed HTTP methods
header('Access-Control-Allow-Headers: Content-Type'); // Allowed headers

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
   // Respond with 200 OK for preflight requests
   http_response_code(200);
   exit;
}

header('Content-Type: application/json');

// Database configuration
$host = 'localhost'; // Hostname
$dbname = 'water'; // Database name
$username = 'root'; // MySQL username
$password = ''; // MySQL password (leave empty if no password)

try {
   // Connect to the database
   $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
   $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

   $apiUrl =
      "https://hubeau.eaufrance.fr/api/v2/hydrometrie/observations_tr?code_entite=H320000104&size=3&pretty&grandeur_hydro=H&fields=code_station,date_debut_serie,date_fin_serie,date_obs,resultat_obs,continuite_obs_hydro";

   $input = file_get_contents($apiUrl);
   $data = json_decode($input, true);

   if (empty($data)) {
      http_response_code(400); // Bad Request
      echo json_encode(["message" => "No data provided"]);
      exit;
   }

   // Prepare the SQL statement
   $stmt = $pdo->prepare("
       INSERT INTO water_data (
           code_station, date_debut_serie, date_fin_serie, date_obs, resultat_obs
       ) VALUES (
           :code_station, :date_debut_serie, :date_fin_serie, :date_obs, :resultat_obs
       )
   ");

   // Insert each record into the database
   foreach ($data as $record) {
      $stmt->execute([
         ":code_station" => $record["code_station"],
         ":date_debut_serie" => $record["date_debut_serie"],
         ":date_fin_serie" => $record["date_fin_serie"],
         ":date_obs" => $record["date_obs"],
         ":resultat_obs" => $record["resultat_obs"]
      ]);
   }

   // Respond with success message
   http_response_code(201); // Created
   echo json_encode(["message" => "Data saved successfully"]);
} catch (Exception $e) {
   // Handle errors
   http_response_code(500); // Internal Server Error
   echo json_encode(["message" => "Error saving data", "error" => $e->getMessage()]);
}
