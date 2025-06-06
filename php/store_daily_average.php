<?php
// Enable CORS headers (optional, if needed for frontend interaction)
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
   http_response_code(200);
   exit;
}

// Include common configuration and utilities
require __DIR__ . '/common.php';

try {
   // Connect to the database
   $pdo = connectPDO();

   // Get the current date and time
   $currentTime = new DateTime('now', new DateTimeZone('Europe/Paris'));
   $currentHour = $currentTime->format('H:i:s'); // Current time in HH:mm:ss format
   $currentDate = $currentTime->format('Y-m-d'); // Current date in YYYY-MM-DD format

   // Check if the current time is exactly 4:00 PM
   // if ($currentHour !== '16:00') {
   //    echo json_encode(['message' => 'Not 4 PM yet. No action taken.']);
   //    exit;
   // }

   // Fetch all station IDs from the index_api_hydro table
   $stmt = $pdo->query("
      SELECT station_id, station_label 
      FROM index_api_hydro
      WHERE station_id IN (2, 3, 5)
   ");
   $stations = $stmt->fetchAll(PDO::FETCH_ASSOC);

   // Loop through each station and calculate the daily average flow up to 4 PM
   foreach ($stations as $station) {
      $stationId = $station['station_id'];
      $stationLabel = strtolower($station['station_label']);

      // Calculate the average flow for the day up to 4 PM
      $stmt = $pdo->prepare("
         SELECT 
            AVG(t.mesure) AS average_flow
         FROM 
            data_api_hydro_temp t
         WHERE 
            t.station_id = :station_id
            AND DATE(t.date_obs) = :current_date
            AND TIME(t.date_obs) <= '16:00:00'
      ");

      $stmt->execute([
         ':station_id' => $stationId,
         ':current_date' => $currentDate
      ]);

      $result = $stmt->fetch(PDO::FETCH_ASSOC);
      $averageFlow = $result['average_flow'] ?? 0; // Default to 0 if no data is available

      // Insert or update the data_rapport table
      $stmt = $pdo->prepare("
         INSERT INTO data_rapport (
            station_id, 
            debit_seine, 
            debit_max_turb, 
            puissance_max, 
            date_obs, 
            reduction
         ) VALUES (
            :station_id, 
            :debit_seine, 
            0, -- Default value for debit_max_turb
            0, -- Default value for puissance_max
            :date_obs, 
            FALSE -- Default value for reduction
         )
         ON DUPLICATE KEY UPDATE 
            debit_seine = VALUES(debit_seine), 
            debit_max_turb = VALUES(debit_max_turb), 
            puissance_max = VALUES(puissance_max), 
            reduction = VALUES(reduction)
      ");

      $stmt->execute([
         ':station_id' => $stationId,
         ':debit_seine' => $averageFlow,
         ':date_obs' => $currentTime->format('Y-m-d H:i:s')
      ]);
   }

   echo json_encode(['message' => 'Daily averages stored successfully.']);
} catch (Exception $e) {
   // Handle errors
   http_response_code(500); // Internal Server Error
   echo json_encode(['error' => 'Error: ' . $e->getMessage()]);
}
