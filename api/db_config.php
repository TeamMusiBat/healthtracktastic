
<?php
// Database configuration
$host = "srv1135.hstgr.io";
$dbname = "u769157863_track4health";
$username = "u769157863_track4health";
$password = "Atifkhan83##"; 

// Create connection with improved error handling
try {
    $conn = new mysqli($host, $username, $password, $dbname);

    // Check connection
    if ($conn->connect_error) {
        header('Content-Type: application/json');
        echo json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]);
        die();
    }

    // Set character set
    $conn->set_charset("utf8mb4");

    // Set appropriate CORS headers
    header('Access-Control-Allow-Origin: *'); // Allow all origins for development
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    
    // Handle preflight OPTIONS request
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
    
} catch (Exception $e) {
    header('Content-Type: application/json');
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
    die();
}
?>
