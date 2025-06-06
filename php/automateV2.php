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

try {
   //$url = 'http://127.0.0.1:5000/agenda';
   $url = 'http://7f84-2a0d-ee00-8013-7d00-1c66-85d0-5345-4b40.ngrok-free.app/agenda';

   // 1. Événements à insérer
   $events = [
      [
         "timestamp" => time() + 10,
         "function" => "sample_function",
         "args" => [123]
      ],
      [
         "timestamp" => time() + 20,
         "function" => "other_function",
         "args" => ["Bro is here", 42]
      ],
   ];

   // 2. Requête PUT pour remplacer l'agenda
   $ch = curl_init($url);
   curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
   curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
   curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($events));
   curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
   curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
   $response = curl_exec($ch);
   $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
   curl_close($ch);

   echo "Réponse PUT ($httpCode): $response\n";

   // 3. Requête GET pour vérifier l'agenda
   $ch = curl_init($url);
   curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
   curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
   $agenda = curl_exec($ch);
   $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
   curl_close($ch);

   echo "Agenda actuel ($httpCode): $agenda\n";

   if (curl_errno($ch)) {
      http_response_code(500); // Internal Server Error
      echo json_encode(['message' => 'Error sending data to Flask: ' . curl_error($ch)]);
      curl_close($ch);
      exit;
   }

   // Close cURL
   curl_close($ch);

   // Return success response
   echo json_encode([
      'message' => "Data received and forwarded to Flask",
      'flask_response' => $response // Optionally include Flask's response
   ]);
} catch (Exception $e) {
   http_response_code(500); // Internal Server Error
   echo json_encode(['message' => 'An error occurred: ' . $e->getMessage()]);
}
