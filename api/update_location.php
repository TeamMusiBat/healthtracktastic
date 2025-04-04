
<?php
include 'db_config.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

// Check if required data is present
if (!isset($data['userId']) || !isset($data['latitude']) || !isset($data['longitude'])) {
    echo json_encode(["success" => false, "message" => "Missing required data"]);
    exit();
}

// Update user location
$sql = "UPDATE users SET location = ? WHERE id = ?";
$stmt = $conn->prepare($sql);

// Create location JSON
$location = json_encode([
    'latitude' => $data['latitude'],
    'longitude' => $data['longitude']
]);

$stmt->bind_param('ss', $location, $data['userId']);
$result = $stmt->execute();

if ($result) {
    echo json_encode(["success" => true, "message" => "Location updated successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to update location: " . $conn->error]);
}

$stmt->close();
$conn->close();
?>
