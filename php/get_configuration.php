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

require __DIR__ . '/common.php';

try {
   $pdo = connectPDO();

   // Query to fetch configurations
   $stmt = $pdo->query("
            SELECT label 
            FROM station_index_config
         ");
   $configurations = $stmt->fetchAll(PDO::FETCH_ASSOC);

   // Return configurations as JSON
   echo json_encode($configurations);
} catch (Exception $e) {
   http_response_code(500);
   echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
