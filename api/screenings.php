
<?php
include 'db_config.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Get screenings
        $sql = "SELECT * FROM child_screenings";
        $result = $conn->query($sql);
        
        $screenings = [];
        if ($result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                // Get children for this screening
                $childrenSql = "SELECT * FROM children WHERE screeningId = ?";
                $stmt = $conn->prepare($childrenSql);
                $stmt->bind_param("s", $row['id']);
                $stmt->execute();
                $childrenResult = $stmt->get_result();
                
                $children = [];
                while($child = $childrenResult->fetch_assoc()) {
                    $children[] = $child;
                }
                
                $row['children'] = $children;
                $screenings[] = $row;
            }
        }
        
        echo json_encode(["success" => true, "data" => $screenings]);
        break;
        
    case 'POST':
        // Get POST data
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Begin transaction
        $conn->begin_transaction();
        
        try {
            // Insert screening
            $sql = "INSERT INTO child_screenings (id, date, villageName, ucName, screeningNumber, location, userName, userDesignation, createdBy) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            
            $id = $data['id'];
            $location = isset($data['location']) ? json_encode($data['location']) : null;
            
            $stmt->bind_param(
                "ssssissss", 
                $id, 
                $data['date'], 
                $data['villageName'], 
                $data['ucName'], 
                $data['screeningNumber'], 
                $location, 
                $data['userName'], 
                $data['userDesignation'], 
                $data['createdBy']
            );
            
            $stmt->execute();
            
            // Insert children
            if (isset($data['children']) && is_array($data['children'])) {
                foreach ($data['children'] as $child) {
                    $childSql = "INSERT INTO children (id, screeningId, name, age, muac, vaccineDue, vaccination, status, fatherName, address, dob, gender, remarks, belongsToSameUC) 
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                    $childStmt = $conn->prepare($childSql);
                    
                    $vaccineDue = $child['vaccineDue'] ? 1 : 0;
                    $belongsToSameUC = isset($child['belongsToSameUC']) && $child['belongsToSameUC'] ? 1 : 0;
                    
                    $childStmt->bind_param(
                        "sssiissssssssi", 
                        $child['id'], 
                        $id, 
                        $child['name'], 
                        $child['age'], 
                        $child['muac'], 
                        $vaccineDue, 
                        $child['vaccination'], 
                        $child['status'], 
                        $child['fatherName'], 
                        $child['address'], 
                        $child['dob'], 
                        $child['gender'], 
                        $child['remarks'], 
                        $belongsToSameUC
                    );
                    
                    $childStmt->execute();
                }
            }
            
            // Commit transaction
            $conn->commit();
            echo json_encode(["success" => true, "message" => "Screening saved successfully"]);
            
        } catch (Exception $e) {
            $conn->rollback();
            echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
        }
        break;
        
    case 'DELETE':
        // Get DELETE data
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['id'])) {
            echo json_encode(["success" => false, "message" => "Missing screening ID"]);
            break;
        }
        
        // Begin transaction
        $conn->begin_transaction();
        
        try {
            // Delete children first
            $childrenSql = "DELETE FROM children WHERE screeningId = ?";
            $childrenStmt = $conn->prepare($childrenSql);
            $childrenStmt->bind_param("s", $data['id']);
            $childrenStmt->execute();
            
            // Delete screening
            $sql = "DELETE FROM child_screenings WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("s", $data['id']);
            $stmt->execute();
            
            // Commit transaction
            $conn->commit();
            echo json_encode(["success" => true, "message" => "Screening deleted successfully"]);
            
        } catch (Exception $e) {
            $conn->rollback();
            echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
        }
        break;
        
    default:
        echo json_encode(["success" => false, "message" => "Invalid request method"]);
        break;
}

$conn->close();
?>
