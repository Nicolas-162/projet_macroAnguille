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
   if ($_SERVER['REQUEST_METHOD'] === 'POST') {
      // Retrieve form data
      $input = file_get_contents('php://input');
      $data = json_decode($input, true);

      // Validate the data
      if (empty($data['stationLabel']) || empty($data['name']) || empty($data['email'])) {
         http_response_code(400); // Bad Request
         echo json_encode(['message' => 'Station\'s label is missing. Name and email are required.']);
         exit;
      }

      // Sanitize the data
      $stationLabel = htmlspecialchars($data['stationLabel'], ENT_QUOTES, 'UTF-8');
      $name = htmlspecialchars($data['name'], ENT_QUOTES, 'UTF-8');
      $email = filter_var($data['email'], FILTER_VALIDATE_EMAIL);

      if (!$email) {
         http_response_code(400); // Bad Request
         echo json_encode(['message' => 'Invalid email address.']);
         exit;
      }

      // Prepare the data to send to Flask
      $flaskData = [
         'station_label' => $stationLabel,
         'name' => $name,
         'email' => $email
      ];

      // Initialize cURL to send data to Flask
      // $ch = curl_init('http://85.69.24.242:5000/receive_data');
      $ch = curl_init('http://localhost:5000/receive_data');
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
      curl_setopt($ch, CURLOPT_POST, true);
      curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($flaskData));

      // Execute the request
      $response = curl_exec($ch);

      // Check for errors
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
         'message' => "Data received and forwarded to Flask: Station Label = $stationLabel, Name = $name, Email = $email",
         'flask_response' => $response // Optionally include Flask's response
      ]);
   } else {
      http_response_code(405); // Method Not Allowed
      echo json_encode(['message' => 'Only POST requests are allowed.']);
   }
} catch (Exception $e) {
   http_response_code(500); // Internal Server Error
   echo json_encode(['message' => 'An error occurred: ' . $e->getMessage()]);
}
