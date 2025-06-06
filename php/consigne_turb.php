<?php
// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: text/plain");

// Path to the file
$filePath = "../Gestion_turbinage/consigne_journalière/Consigne_turb.txt";

// Read and output the file content
if (file_exists($filePath)) {
   readfile($filePath);
} else {
   http_response_code(404);
   echo "File " . $filePath . " not found.";
}
