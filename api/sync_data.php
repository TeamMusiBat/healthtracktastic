
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
if (!isset($data['userId']) || !isset($data['data']) || !isset($data['type'])) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit();
}

$userId = $data['userId'];
$type = $data['type'];
$syncData = $data['data'];

// Begin transaction
$conn->begin_transaction();

try {
    switch ($type) {
        case 'screenings':
            foreach ($syncData as $screening) {
                // Check if screening already exists
                $checkSql = "SELECT id FROM child_screenings WHERE id = ?";
                $checkStmt = $conn->prepare($checkSql);
                $checkStmt->bind_param("s", $screening['id']);
                $checkStmt->execute();
                $result = $checkStmt->get_result();
                
                $location = isset($screening['location']) ? json_encode($screening['location']) : null;
                
                if ($result->num_rows > 0) {
                    // Update existing screening
                    $sql = "UPDATE child_screenings SET date = ?, villageName = ?, ucName = ?, screeningNumber = ?, location = ? WHERE id = ?";
                    $stmt = $conn->prepare($sql);
                    $stmt->bind_param("sssiss", $screening['date'], $screening['villageName'], $screening['ucName'], $screening['screeningNumber'], $location, $screening['id']);
                } else {
                    // Insert new screening
                    $sql = "INSERT INTO child_screenings (id, date, villageName, ucName, screeningNumber, location, userName, userDesignation, createdBy) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
                    $stmt = $conn->prepare($sql);
                    $stmt->bind_param(
                        "ssssissss", 
                        $screening['id'], 
                        $screening['date'], 
                        $screening['villageName'], 
                        $screening['ucName'], 
                        $screening['screeningNumber'], 
                        $location, 
                        $screening['userName'], 
                        $screening['userDesignation'], 
                        $screening['createdBy']
                    );
                }
                
                $stmt->execute();
                
                // Handle children
                if (isset($screening['children']) && is_array($screening['children'])) {
                    foreach ($screening['children'] as $child) {
                        // Check if child already exists
                        $checkChildSql = "SELECT id FROM children WHERE id = ? AND screeningId = ?";
                        $checkChildStmt = $conn->prepare($checkChildSql);
                        $checkChildStmt->bind_param("ss", $child['id'], $screening['id']);
                        $checkChildStmt->execute();
                        $childResult = $checkChildStmt->get_result();
                        
                        $vaccineDue = $child['vaccineDue'] ? 1 : 0;
                        $belongsToSameUC = isset($child['belongsToSameUC']) && $child['belongsToSameUC'] ? 1 : 0;
                        
                        if ($childResult->num_rows > 0) {
                            // Update existing child
                            $childSql = "UPDATE children SET name = ?, age = ?, muac = ?, vaccineDue = ?, vaccination = ?, 
                                        status = ?, fatherName = ?, address = ?, dob = ?, gender = ?, remarks = ?, belongsToSameUC = ? 
                                        WHERE id = ? AND screeningId = ?";
                            $childStmt = $conn->prepare($childSql);
                            $childStmt->bind_param(
                                "siisssssssiss", 
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
                                $belongsToSameUC,
                                $child['id'],
                                $screening['id']
                            );
                        } else {
                            // Insert new child
                            $childSql = "INSERT INTO children (id, screeningId, name, age, muac, vaccineDue, vaccination, status, fatherName, address, dob, gender, remarks, belongsToSameUC) 
                                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                            $childStmt = $conn->prepare($childSql);
                            $childStmt->bind_param(
                                "sssiissssssssi", 
                                $child['id'], 
                                $screening['id'], 
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
                        }
                        
                        $childStmt->execute();
                    }
                }
            }
            break;
            
        case 'sessions':
            foreach ($syncData as $session) {
                // Check if session already exists
                $checkSql = "SELECT id FROM awareness_sessions WHERE id = ?";
                $checkStmt = $conn->prepare($checkSql);
                $checkStmt->bind_param("s", $session['id']);
                $checkStmt->execute();
                $result = $checkStmt->get_result();
                
                $location = isset($session['location']) ? json_encode($session['location']) : null;
                
                if ($result->num_rows > 0) {
                    // Update existing session
                    $sql = "UPDATE awareness_sessions SET date = ?, villageName = ?, ucName = ?, sessionNumber = ?, location = ? WHERE id = ?";
                    $stmt = $conn->prepare($sql);
                    $stmt->bind_param("sssiss", $session['date'], $session['villageName'], $session['ucName'], $session['sessionNumber'], $location, $session['id']);
                } else {
                    // Insert new session
                    $sql = "INSERT INTO awareness_sessions (id, date, villageName, ucName, sessionNumber, location, userName, userDesignation, createdBy) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
                    $stmt = $conn->prepare($sql);
                    $stmt->bind_param(
                        "ssssissss", 
                        $session['id'], 
                        $session['date'], 
                        $session['villageName'], 
                        $session['ucName'], 
                        $session['sessionNumber'], 
                        $location, 
                        $session['userName'], 
                        $session['userDesignation'], 
                        $session['createdBy']
                    );
                }
                
                $stmt->execute();
                
                // Handle attendees
                if (isset($session['attendees']) && is_array($session['attendees'])) {
                    foreach ($session['attendees'] as $attendee) {
                        // Check if attendee already exists
                        $checkAttendeeSql = "SELECT id FROM attendees WHERE id = ? AND sessionId = ?";
                        $checkAttendeeStmt = $conn->prepare($checkAttendeeSql);
                        $checkAttendeeStmt->bind_param("ss", $attendee['id'], $session['id']);
                        $checkAttendeeStmt->execute();
                        $attendeeResult = $checkAttendeeStmt->get_result();
                        
                        $belongsToSameUC = isset($attendee['belongsToSameUC']) && $attendee['belongsToSameUC'] ? 1 : 0;
                        
                        if ($attendeeResult->num_rows > 0) {
                            // Update existing attendee
                            $attendeeSql = "UPDATE attendees SET name = ?, fatherHusbandName = ?, age = ?, gender = ?, 
                                          underFiveChildren = ?, contactNumber = ?, remarks = ?, address = ?, belongsToSameUC = ? 
                                          WHERE id = ? AND sessionId = ?";
                            $attendeeStmt = $conn->prepare($attendeeSql);
                            $attendeeStmt->bind_param(
                                "ssisssssiss", 
                                $attendee['name'], 
                                $attendee['fatherHusbandName'], 
                                $attendee['age'], 
                                $attendee['gender'], 
                                $attendee['underFiveChildren'], 
                                $attendee['contactNumber'], 
                                $attendee['remarks'], 
                                $attendee['address'], 
                                $belongsToSameUC,
                                $attendee['id'],
                                $session['id']
                            );
                        } else {
                            // Insert new attendee
                            $attendeeSql = "INSERT INTO attendees (id, sessionId, name, fatherHusbandName, age, gender, underFiveChildren, contactNumber, remarks, address, belongsToSameUC) 
                                          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                            $attendeeStmt = $conn->prepare($attendeeSql);
                            $attendeeStmt->bind_param(
                                "ssssisisssi", 
                                $attendee['id'], 
                                $session['id'], 
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
                        }
                        
                        $attendeeStmt->execute();
                    }
                }
                
                // Handle children
                if (isset($session['children']) && is_array($session['children'])) {
                    foreach ($session['children'] as $child) {
                        // Check if child already exists
                        $checkChildSql = "SELECT id FROM session_children WHERE id = ? AND sessionId = ?";
                        $checkChildStmt = $conn->prepare($checkChildSql);
                        $checkChildStmt->bind_param("ss", $child['id'], $session['id']);
                        $checkChildStmt->execute();
                        $childResult = $checkChildStmt->get_result();
                        
                        $vaccineDue = $child['vaccineDue'] ? 1 : 0;
                        $belongsToSameUC = isset($child['belongsToSameUC']) && $child['belongsToSameUC'] ? 1 : 0;
                        
                        if ($childResult->num_rows > 0) {
                            // Update existing child
                            $childSql = "UPDATE session_children SET name = ?, age = ?, muac = ?, vaccineDue = ?, vaccination = ?, 
                                        status = ?, fatherName = ?, address = ?, dob = ?, gender = ?, remarks = ?, belongsToSameUC = ? 
                                        WHERE id = ? AND sessionId = ?";
                            $childStmt = $conn->prepare($childSql);
                            $childStmt->bind_param(
                                "siisssssssiss", 
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
                                $belongsToSameUC,
                                $child['id'],
                                $session['id']
                            );
                        } else {
                            // Insert new child
                            $childSql = "INSERT INTO session_children (id, sessionId, name, age, muac, vaccineDue, vaccination, status, fatherName, address, dob, gender, remarks, belongsToSameUC) 
                                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                            $childStmt = $conn->prepare($childSql);
                            $childStmt->bind_param(
                                "sssiissssssssi", 
                                $child['id'], 
                                $session['id'], 
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
                        }
                        
                        $childStmt->execute();
                    }
                }
            }
            break;
            
        default:
            echo json_encode(["success" => false, "message" => "Invalid data type"]);
            exit();
    }
    
    // Update user's last sync time
    $updateUserSql = "UPDATE users SET lastSync = NOW() WHERE id = ?";
    $updateUserStmt = $conn->prepare($updateUserSql);
    $updateUserStmt->bind_param("i", $userId);
    $updateUserStmt->execute();
    
    // Commit transaction
    $conn->commit();
    
    echo json_encode(["success" => true, "message" => "Data synchronized successfully"]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}

$conn->close();
?>
