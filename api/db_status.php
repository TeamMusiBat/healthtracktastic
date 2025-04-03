
<?php
// Include database configuration
require_once 'db_config.php';

// Set appropriate headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://healthbyasif.buylevi.xyz');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Return connection status
if ($conn->connect_error) {
    echo json_encode([
        "success" => false,
        "message" => "Connection failed: " . $conn->connect_error
    ]);
} else {
    // Get MySQL version
    $version_query = $conn->query("SELECT VERSION() as version");
    $version = $version_query ? $version_query->fetch_assoc()['version'] : null;
    
    echo json_encode([
        "success" => true,
        "message" => "Connected successfully",
        "host" => $host,
        "database" => $dbname,
        "version" => $version
    ]);
    
    // Close the connection
    $conn->close();
}
?>
