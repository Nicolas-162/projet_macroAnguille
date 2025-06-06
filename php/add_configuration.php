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

header("Content-Type: application/json");

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);
$label = trim($data['label']);

if (empty($label)) {
   http_response_code(400);
   echo json_encode(["error" => "Configuration name cannot be empty."]);
   exit;
}

require __DIR__ . '/common.php';


try {
   $pdo = connectPDO();

   // Insert new configuration
   $stmt = $pdo->prepare("INSERT INTO station_index_config (label) VALUES (:label)");
   $stmt->bindParam(':label', $label);
   $stmt->execute();

   // Return the newly added configuration
   $config_id = $pdo->lastInsertId();
   echo json_encode(["config_id" => $config_id, "label" => $label]);
} catch (Exception $e) {
   http_response_code(500);
   echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
