
-- MySQL database schema for Track4Health

-- Users table
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phoneNumber` varchar(20) DEFAULT NULL,
  `role` enum('developer','master','fmt','socialMobilizer') NOT NULL,
  `password` varchar(255) NOT NULL,
  `isOnline` tinyint(1) DEFAULT 0,
  `lastActive` datetime DEFAULT NULL,
  `location` json DEFAULT NULL,
  `designation` varchar(100) DEFAULT NULL,
  `district` varchar(100) DEFAULT NULL,
  `lastSync` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Child Screenings table
CREATE TABLE `child_screenings` (
  `id` varchar(36) NOT NULL,
  `date` date NOT NULL,
  `villageName` varchar(100) NOT NULL,
  `ucName` varchar(100) NOT NULL,
  `screeningNumber` int(11) DEFAULT NULL,
  `location` json DEFAULT NULL,
  `userName` varchar(50) DEFAULT NULL,
  `userDesignation` varchar(100) DEFAULT NULL,
  `createdBy` varchar(50) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Children table
CREATE TABLE `children` (
  `id` varchar(36) NOT NULL,
  `screeningId` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `age` int(11) NOT NULL,
  `muac` float NOT NULL,
  `vaccineDue` tinyint(1) DEFAULT 0,
  `vaccination` varchar(50) DEFAULT NULL,
  `status` enum('SAM','MAM','Normal') NOT NULL,
  `fatherName` varchar(100) NOT NULL,
  `address` text DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `gender` enum('male','female','other') NOT NULL,
  `remarks` text DEFAULT NULL,
  `belongsToSameUC` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `screeningId` (`screeningId`),
  CONSTRAINT `children_screening_fk` FOREIGN KEY (`screeningId`) REFERENCES `child_screenings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Awareness Sessions table
CREATE TABLE `awareness_sessions` (
  `id` varchar(36) NOT NULL,
  `date` date NOT NULL,
  `villageName` varchar(100) NOT NULL,
  `ucName` varchar(100) NOT NULL,
  `sessionNumber` int(11) DEFAULT NULL,
  `location` json DEFAULT NULL,
  `userName` varchar(50) DEFAULT NULL,
  `userDesignation` varchar(100) DEFAULT NULL,
  `createdBy` varchar(50) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Attendees table
CREATE TABLE `attendees` (
  `id` varchar(36) NOT NULL,
  `sessionId` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `fatherHusbandName` varchar(100) NOT NULL,
  `age` int(11) NOT NULL,
  `gender` enum('male','female','other') NOT NULL,
  `underFiveChildren` int(11) DEFAULT 0,
  `contactNumber` varchar(20) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `address` text DEFAULT NULL,
  `belongsToSameUC` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `sessionId` (`sessionId`),
  CONSTRAINT `attendees_session_fk` FOREIGN KEY (`sessionId`) REFERENCES `awareness_sessions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Session Children table
CREATE TABLE `session_children` (
  `id` varchar(36) NOT NULL,
  `sessionId` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `age` int(11) NOT NULL,
  `muac` float NOT NULL,
  `vaccineDue` tinyint(1) DEFAULT 0,
  `vaccination` varchar(50) DEFAULT NULL,
  `status` enum('SAM','MAM','Normal') NOT NULL,
  `fatherName` varchar(100) NOT NULL,
  `address` text DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `gender` enum('male','female','other') NOT NULL,
  `remarks` text DEFAULT NULL,
  `belongsToSameUC` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `sessionId` (`sessionId`),
  CONSTRAINT `session_children_fk` FOREIGN KEY (`sessionId`) REFERENCES `awareness_sessions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create initial developer user
INSERT INTO `users` (`username`, `name`, `role`, `password`, `isOnline`, `designation`) 
VALUES ('asifjamali83', 'Asif Jamali', 'developer', '$2y$10$8wSQzVs0LrHQgLSQSCSj7uJQwGt4Z9dqH.QBDGqP9CSPt3TTBpRsu', 1, 'Developer');
-- Default password is 'Atifkhan83##'
