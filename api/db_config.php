
<?php
// Database configuration
$host = "srv1135.hstgr.io";
$dbname = "u769157863_track4health";
$username = "u769157863_track4health";
$password = "Atifkhan83##"; 

// Create connection
$conn = new mysqli($host, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    header('Content-Type: application/json');
    echo json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]);
    die();
}

// Set character set
$conn->set_charset("utf8mb4");
?>
