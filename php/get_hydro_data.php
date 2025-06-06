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

// Include common configuration and utilities
require __DIR__ . '/common.php';

try {
   // Connect to the database
   $pdo = connectPDO();

   // Get query parameters
   $stationLabel = $_GET['station_label'] ?? null; // Station label (e.g., Mericourt, Montereau)
   $selectedDate = $_GET['date'] ?? null; // Format: YYYY-MM-DD
   $selectedHour = $_GET['hour'] ?? '00'; // Format: HH (e.g., 08)
   $period = $_GET['period'] ?? '24'; // Default period: 24 hours
   $type = $_GET['type'] ?? 'period'; // Type of request: 'period' or 'daily_average'

   if (!$stationLabel) {
      throw new Exception('No station label provided');
   }

   // Normalize the station label to lowercase for case-insensitive comparison
   $stationLabel = strtolower($stationLabel);

   // Check if the current time is 4:00 PM and store the average flow in data_rapport
   // $currentTime = new DateTime('now', new DateTimeZone('Europe/Paris'));
   // if ($currentTime->format('H:i') === '16:00') {
   //    // Calculate the average flow for the current day until 4 PM
   //    $currentDate = $currentTime->format('Y-m-d');
   //    $stmt = $pdo->prepare("
   //       SELECT 
   //          AVG(t.mesure/1000) AS average_flow
   //       FROM 
   //          data_api_hydro_temp t
   //       INNER JOIN 
   //          index_api_hydro i 
   //       ON 
   //          t.station_id = i.station_id
   //       WHERE 
   //          LOWER(i.station_label) = :station_label
   //          AND DATE(t.date_obs) = :current_date
   //          AND TIME(t.date_obs) <= '16:00:00'
   //    ");

   //    $stmt->execute([
   //       ':station_label' => $stationLabel,
   //       ':current_date' => $currentDate
   //    ]);

   //    $result = $stmt->fetch(PDO::FETCH_ASSOC);
   //    $averageFlow = $result['average_flow'];

   //    if ($averageFlow !== null) {
   //       // Insert the average flow into the data_rapport table
   //       $insertStmt = $pdo->prepare("
   //          INSERT INTO data_rapport (date, seine_flow, max_flow, max_power, reduction)
   //          VALUES (:date, :seine_flow, :max_flow, :max_power, :reduction)
   //          ON DUPLICATE KEY UPDATE
   //             seine_flow = VALUES(seine_flow),
   //             max_flow = VALUES(max_flow),
   //             max_power = VALUES(max_power),
   //             reduction = VALUES(reduction)
   //       ");

   //       $insertStmt->execute([
   //          ':date' => $currentDate,
   //          ':seine_flow' => $averageFlow,
   //          ':max_flow' => 0, // Placeholder value (update as needed)
   //          ':max_power' => 0, // Placeholder value (update as needed)
   //          ':reduction' => false // Placeholder value (update as needed)
   //       ]);
   //    }
   // }

   if ($type === 'period') {
      // Fetch data for the selected station, date, hour, and period
      $endDate = new DateTime($selectedDate . ' ' . $selectedHour . ':00:00');
      $startDate = clone $endDate;

      // Adjust start time based on the selected period
      switch ($period) {
         case '24':
            $startDate->modify('-24 hours'); // 24 hours before the selected time
            break;
         case '6':
            $startDate->modify('-6 hours'); // 6 hours before the selected time
            break;
         case '1':
            $startDate->modify('-1 hour'); // 1 hour before the selected time
            break;
         default:
            throw new Exception('Invalid period');
      }

      $stmt = $pdo->prepare("
         SELECT 
            LOWER(i.station_label) AS station_label,
            t.station_id,
            i.station_label AS original_label,
            DATE_FORMAT(
               FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(t.date_obs) / 1200) * 1200),
               '%d/%m %H:%i'
            ) AS date_obs,
            ROUND(t.mesure/1000, 3) AS mesure
         FROM data_api_hydro_temp t
         INNER JOIN index_api_hydro i ON t.station_id = i.station_id
         WHERE LOWER(i.station_label) = :station_label
            AND t.date_obs >= :start_date
            AND t.date_obs < :end_date
         GROUP BY t.station_id, FLOOR(UNIX_TIMESTAMP(t.date_obs) / 1200)
         ORDER BY t.date_obs ASC
      ");

      $stmt->execute([
         ':station_label' => $stationLabel,
         ':start_date' => $startDate->format('Y-m-d H:i:s'),
         ':end_date' => $endDate->format('Y-m-d H:i:s')
      ]);
   } elseif ($type === 'daily_average') {
      // Fetch average flow for the last 8 days
      $stmt = $pdo->prepare("
         SELECT 
            i.station_label,
            DATE_FORMAT(t.date_obs, '%d/%m/%Y') AS day,
            ROUND(AVG(t.mesure/1000), 3) AS average_flow
         FROM 
            data_api_hydro_temp t
         INNER JOIN 
            index_api_hydro i 
         ON 
            t.station_id = i.station_id
         WHERE 
            LOWER(i.station_label) = :station_label
            AND t.date_obs >= DATE_SUB(CURDATE(), INTERVAL 8 DAY)
            AND TIME(t.date_obs) <= '16:00:00'
         GROUP BY 
            i.station_label, DATE(t.date_obs)
         ORDER BY 
            t.date_obs ASC
      ");

      $stmt->execute([':station_label' => $stationLabel]);
   } elseif ($type === "latest") {
      // Fetch the 3 latest data points for the station
      $stmt = $pdo->prepare("
         SELECT 
            i.station_label,
            DATE_FORMAT(t.date_obs, '%d/%m/%Y %H:%i') AS date_obs,
            t.mesure/1000 as mesure
         FROM 
            data_api_hydro_temp t
         INNER JOIN 
            index_api_hydro i 
         ON 
            t.station_id = i.station_id
         WHERE 
            LOWER(i.station_label) = :station_label
         ORDER BY 
            t.date_obs DESC
         LIMIT 3
      ");

      $stmt->execute([':station_label' => $stationLabel]);
   } else {
      throw new Exception('Invalid type parameter');
   }

   // Fetch and return the data as JSON
   $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
   echo json_encode($data); // Ensure this is an array
} catch (Exception $e) {
   // Handle errors
   http_response_code(500); // Internal Server Error
   echo json_encode(['error' => 'Error: ' . $e->getMessage()]);
}
