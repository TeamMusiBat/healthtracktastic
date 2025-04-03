
<?php
include 'db_config.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
    exit();
}

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($data['userId']) || !isset($data['latitude']) || !isset($data['longitude'])) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit();
}

// Update user location
$sql = "UPDATE users SET location = ?, lastActive = NOW() WHERE id = ?";
$stmt = $conn->prepare($sql);

$location = json_encode([
    'latitude' => $data['latitude'],
    'longitude' => $data['longitude']
]);

$stmt->bind_param("si", $location, $data['userId']);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Location updated successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
}

$conn->close();
?>
