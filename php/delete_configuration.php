<?php
// Enable CORS headers
header('Access-Control-Allow-Origin: http://localhost:5173'); // Allow only the React app origin
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE'); // Allowed HTTP methods
header('Access-Control-Allow-Headers: Content-Type'); // Allowed headers

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
   // Respond with 200 OK for preflight requests
   http_response_code(200);
   exit;
}

header('Content-Type: application/json');

// Get query parameter
// $config_name = isset($_GET['config_name']) ? intval($_GET['config_name']) : null;
$data = json_decode(file_get_contents('php://input'), true);
$label = trim($data['label']);

// if (!$config_id) {
//    http_response_code(400);
//    echo json_encode(["error" => "Configuration ID is required."]);
//    exit;
// }

require __DIR__ . '/common.php';

try {
   $pdo = connectPDO();

   // Delete configuration
   // $stmt = $pdo->prepare("DELETE FROM station_index_config WHERE label = :config_name");
   // $stmt->bindParam(':config_name', $config_name, PDO::PARAM_INT);
   // $stmt->execute();

   $stmt = $pdo->prepare("DELETE FROM station_index_config WHERE LOWER(label) = :label");
   $stmt->bindParam(':label', $label);
   $stmt->execute();

   echo json_encode(["success" => true]);
} catch (Exception $e) {
   http_response_code(500);
   echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
