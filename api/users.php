
<?php
include 'db_config.php';
header('Content-Type: application/json');

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Get users
        $sql = "SELECT * FROM users";
        $result = $conn->query($sql);
        
        $users = [];
        if ($result && $result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                // Don't include password in response
                unset($row['password']);
                $users[] = $row;
            }
        }
        
        echo json_encode(["success" => true, "data" => $users]);
        break;
        
    case 'POST':
        // Get POST data
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Debug
        error_log("Received data: " . print_r($data, true));
        
        // Validate required fields
        if (!isset($data['username']) || !isset($data['name']) || !isset($data['role']) || !isset($data['password'])) {
            echo json_encode(["success" => false, "message" => "Missing required fields"]);
            break;
        }
        
        // Check if username already exists
        $checkSql = "SELECT * FROM users WHERE username = ?";
        $stmt = $conn->prepare($checkSql);
        $stmt->bind_param("s", $data['username']);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            echo json_encode(["success" => false, "message" => "Username already exists"]);
            break;
        }
        
        // Hash password
        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
        
        // Insert user
        $sql = "INSERT INTO users (username, name, email, role, password, designation, phoneNumber) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $email = isset($data['email']) ? $data['email'] : '';
        $designation = isset($data['designation']) ? $data['designation'] : '';
        $phoneNumber = isset($data['phoneNumber']) ? $data['phoneNumber'] : '';
        
        $stmt->bind_param("sssssss", $data['username'], $data['name'], $email, $data['role'], $hashedPassword, $designation, $phoneNumber);
        
        if ($stmt->execute()) {
            // Get the newly created user's ID
            $userId = $conn->insert_id;
            
            echo json_encode([
                "success" => true, 
                "message" => "User created successfully", 
                "id" => $userId
            ]);
        } else {
            error_log("SQL Error: " . $stmt->error);
            echo json_encode([
                "success" => false, 
                "message" => "Error: " . $stmt->error
            ]);
        }
        break;
        
    case 'DELETE':
        // Get DELETE data
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['id'])) {
            echo json_encode(["success" => false, "message" => "Missing user ID"]);
            break;
        }
        
        // Delete user
        $sql = "DELETE FROM users WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $data['id']);
        
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "User deleted successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
        }
        break;
        
    default:
        echo json_encode(["success" => false, "message" => "Invalid request method"]);
        break;
}

$conn->close();
?>
