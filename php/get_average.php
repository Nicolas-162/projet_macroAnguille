<?php

require __DIR__ . '/common.php';

try {
   // Connect to the database
   $pdo = connectPDO();

   // Enable CORS
   header("Access-Control-Allow-Origin: *"); // Allow all origins
   header("Access-Control-Allow-Methods: GET"); // Allow only GET requests
   header("Access-Control-Allow-Headers: Content-Type"); // Allow specific headers

   // Get query parameters
   $stationLabel = $_GET['station_label'] ?? null; // Station label (e.g., Mericourt)
   if (!$stationLabel) {
      throw new Exception('No station label provided');
   }

   // Calculate the date range: (today-8) to today
   $endDate = new DateTime('now'); // Today
   $startDate = clone $endDate;
   $startDate->modify('-8 days'); // Start from 8 days ago

   // Fetch data for the selected station within the date range
   $stmt = $pdo->prepare("
            SELECT 
                  DATE(t.date_obs) AS date,
                  AVG(t.mesure) AS avg_mesure
            FROM data_api_hydro_temp t
            INNER JOIN index_api_hydro i ON t.station_id = i.station_id
            WHERE i.station_label = :station_label
               AND t.date_obs >= :start_date
               AND t.date_obs < :end_date
            GROUP BY DATE(t.date_obs)
            ORDER BY DATE(t.date_obs) ASC
         ");

   $stmt->execute([
      ':station_label' => strtolower($stationLabel), // Ensure case-insensitive comparison
      ':start_date' => $startDate->format('Y-m-d'),
      ':end_date' => $endDate->format('Y-m-d')
   ]);

   $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

   // Return the data as JSON
   header('Content-Type: application/json');
   echo json_encode($data); // Ensure this is an array
} catch (Exception $e) {
   // Handle errors
   http_response_code(500); // Internal Server Error
   echo json_encode(['error' => 'Error: ' . $e->getMessage()]);
}
