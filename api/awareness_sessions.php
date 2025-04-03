
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
        // Get sessions
        $sql = "SELECT * FROM awareness_sessions";
        $result = $conn->query($sql);
        
        $sessions = [];
        if ($result->num_rows > 0) {
            while($row = $result->fetch_assoc()) {
                // Get attendees for this session
                $attendeesSql = "SELECT * FROM attendees WHERE sessionId = ?";
                $stmt = $conn->prepare($attendeesSql);
                $stmt->bind_param("s", $row['id']);
                $stmt->execute();
                $attendeesResult = $stmt->get_result();
                
                $attendees = [];
                while($attendee = $attendeesResult->fetch_assoc()) {
                    $attendees[] = $attendee;
                }
                
                // Get children for this session
                $childrenSql = "SELECT * FROM session_children WHERE sessionId = ?";
                $childStmt = $conn->prepare($childrenSql);
                $childStmt->bind_param("s", $row['id']);
                $childStmt->execute();
                $childrenResult = $childStmt->get_result();
                
                $children = [];
                while($child = $childrenResult->fetch_assoc()) {
                    $children[] = $child;
                }
                
                $row['attendees'] = $attendees;
                $row['children'] = $children;
                $sessions[] = $row;
            }
        }
        
        echo json_encode(["success" => true, "data" => $sessions]);
        break;
        
    case 'POST':
        // Get POST data
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Begin transaction
        $conn->begin_transaction();
        
        try {
            // Insert session
            $sql = "INSERT INTO awareness_sessions (id, date, villageName, ucName, sessionNumber, location, userName, userDesignation, createdBy) 
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
                $data['sessionNumber'], 
                $location, 
                $data['userName'], 
                $data['userDesignation'], 
                $data['createdBy']
            );
            
            $stmt->execute();
            
            // Insert attendees
            if (isset($data['attendees']) && is_array($data['attendees'])) {
                foreach ($data['attendees'] as $attendee) {
                    $attendeeSql = "INSERT INTO attendees (id, sessionId, name, fatherHusbandName, age, gender, underFiveChildren, contactNumber, remarks, address, belongsToSameUC) 
                                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                    $attendeeStmt = $conn->prepare($attendeeSql);
                    
                    $belongsToSameUC = isset($attendee['belongsToSameUC']) && $attendee['belongsToSameUC'] ? 1 : 0;
                    
                    $attendeeStmt->bind_param(
                        "ssssisisssi", 
                        $attendee['id'], 
                        $id, 
                        $attendee['name'], 
                        $attendee['fatherHusbandName'], 
                        $attendee['age'], 
                        $attendee['gender'], 
                        $attendee['underFiveChildren'], 
                        $attendee['contactNumber'], 
                        $attendee['remarks'], 
                        $attendee['address'], 
                        $belongsToSameUC
                    );
                    
                    $attendeeStmt->execute();
                }
            }
            
            // Insert children
            if (isset($data['children']) && is_array($data['children'])) {
                foreach ($data['children'] as $child) {
                    $childSql = "INSERT INTO session_children (id, sessionId, name, age, muac, vaccineDue, vaccination, status, fatherName, address, dob, gender, remarks, belongsToSameUC) 
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
            echo json_encode(["success" => true, "message" => "Session saved successfully"]);
            
        } catch (Exception $e) {
            $conn->rollback();
            echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
        }
        break;
        
    case 'DELETE':
        // Get DELETE data
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['id'])) {
            echo json_encode(["success" => false, "message" => "Missing session ID"]);
            break;
        }
        
        // Begin transaction
        $conn->begin_transaction();
        
        try {
            // Delete attendees first
            $attendeesSql = "DELETE FROM attendees WHERE sessionId = ?";
            $attendeesStmt = $conn->prepare($attendeesSql);
            $attendeesStmt->bind_param("s", $data['id']);
            $attendeesStmt->execute();
            
            // Delete children
            $childrenSql = "DELETE FROM session_children WHERE sessionId = ?";
            $childrenStmt = $conn->prepare($childrenSql);
            $childrenStmt->bind_param("s", $data['id']);
            $childrenStmt->execute();
            
            // Delete session
            $sql = "DELETE FROM awareness_sessions WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("s", $data['id']);
            $stmt->execute();
            
            // Commit transaction
            $conn->commit();
            echo json_encode(["success" => true, "message" => "Session deleted successfully"]);
            
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
