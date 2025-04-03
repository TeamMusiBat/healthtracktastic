
-- Health By Asif - Database Schema

-- Create the users table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100),
  `phoneNumber` VARCHAR(20),
  `role` ENUM('developer', 'master', 'fmt', 'socialMobilizer') NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `designation` VARCHAR(100),
  `location` JSON,
  `isOnline` TINYINT(1) DEFAULT 0,
  `lastActive` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create the awareness_sessions table
CREATE TABLE IF NOT EXISTS `awareness_sessions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `sessionId` VARCHAR(36) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  `coordinates` JSON,
  `date` DATE NOT NULL,
  `startTime` TIME NOT NULL,
  `endTime` TIME NOT NULL,
  `topic` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `conductedById` INT NOT NULL,
  `userName` VARCHAR(100) NOT NULL,
  `userRole` VARCHAR(50) NOT NULL,
  `attendees` JSON,
  `totalAttendees` INT DEFAULT 0,
  `images` JSON,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`conductedById`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create the child_screenings table
CREATE TABLE IF NOT EXISTS `child_screenings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `screeningId` VARCHAR(36) NOT NULL UNIQUE,
  `childName` VARCHAR(100) NOT NULL,
  `age` INT NOT NULL,
  `gender` ENUM('male', 'female', 'other') NOT NULL,
  `weight` FLOAT NOT NULL,
  `height` FLOAT NOT NULL,
  `muac` FLOAT,
  `nutritionalStatus` ENUM('sam', 'mam', 'normal') NOT NULL,
  `vaccinated` TINYINT(1) DEFAULT 0,
  `vaccines` JSON,
  `location` VARCHAR(255),
  `coordinates` JSON,
  `contactPerson` VARCHAR(100),
  `contactNumber` VARCHAR(20),
  `screenedById` INT NOT NULL,
  `userName` VARCHAR(100) NOT NULL,
  `userRole` VARCHAR(50) NOT NULL,
  `followUpDate` DATE,
  `followUpNotes` TEXT,
  `images` JSON,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`screenedById`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create the blogs table
CREATE TABLE IF NOT EXISTS `blogs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `author` VARCHAR(100) NOT NULL,
  `authorId` INT,
  `date` DATE NOT NULL,
  `image` VARCHAR(255),
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`authorId`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default developer user
INSERT INTO `users` (`username`, `name`, `email`, `role`, `password`, `designation`, `isOnline`) 
VALUES ('admin', 'Asif Jamali', 'admin@healthbyasif.buylevi.xyz', 'developer', '$2y$10$dCd5KUSqPpBWdXQH/xJXbeGsq5JiE6gLuaK7Q3bHGDfI0EQC.J5u2', 'Developer', 1)
ON DUPLICATE KEY UPDATE `name` = 'Asif Jamali';
-- Note: Default password is 'admin123' - Change this immediately after importing!

-- Insert initial blog posts
INSERT INTO `blogs` (`title`, `content`, `author`, `date`, `image`) VALUES
('The Importance of Child Nutrition', 'Proper nutrition in early childhood is crucial for cognitive and physical development. For children under 5, adequate protein, vitamins, and minerals establish foundations for lifelong health. Regular nutritional assessment helps identify deficiencies early and enables targeted interventions. Parents and caregivers should focus on diverse diets rich in fruits, vegetables, proteins, and whole grains while limiting processed foods and sugary drinks. Community health workers play a vital role in educating families and monitoring growth patterns.', 'Asif Jamali', '2023-05-15', 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=987&q=80'),
('Vaccination: Protecting Communities', 'Vaccinations are one of the most effective public health interventions, preventing millions of deaths annually. They work by stimulating the immune system to recognize and fight specific pathogens. Community immunity (herd immunity) occurs when a significant portion of a population becomes immune, reducing disease spread. Following recommended vaccination schedules is crucial for children\'s health and community protection. Healthcare providers must address vaccine hesitancy through education and trust-building. Together, we can prevent the resurgence of deadly diseases through comprehensive vaccination programs.', 'Asif Jamali', '2023-06-20', 'https://images.unsplash.com/photo-1576765608866-5b51f5501212?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2533&q=80'),
('Maternal Health & Childbirth Safety', 'Maternal health encompasses the well-being of women during pregnancy, childbirth, and the postpartum period. Regular prenatal care is essential for detecting potential complications early and ensuring both mother and baby remain healthy. Healthcare providers should monitor vital signs, screen for common issues like gestational diabetes and preeclampsia, and provide nutritional guidance. Communities benefit from trained birth attendants and emergency transport systems for complicated deliveries. Postpartum care, including mental health support, is equally important for new mothers as they adjust to their changing bodies and new responsibilities.', 'Asif Jamali', '2023-07-10', 'https://images.unsplash.com/photo-1516832378525-cae96d32c952?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'),
('Water & Sanitation Practices', 'Access to clean water and proper sanitation facilities are fundamental determinants of community health. Waterborne diseases like cholera, dysentery, and typhoid remain prevalent in areas without safe water sources. Simple interventions such as handwashing stations, household water treatment methods, and proper waste disposal significantly reduce disease transmission. Community education on hygiene practices should be culturally appropriate and accessible to all age groups. Health workers can lead by example and work with local leaders to implement sustainable water and sanitation solutions that protect vulnerable populations, especially children under five.', 'Asif Jamali', '2023-08-05', 'https://images.unsplash.com/photo-1581093196277-9f695e9c0ef5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80');
