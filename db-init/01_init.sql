-- Datenbank für QA (nur wenn noch nicht vorhanden)
CREATE DATABASE IF NOT EXISTS applicationmanager
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- QA-Benutzer anlegen (Passwort wie in .env.qa)
CREATE USER IF NOT EXISTS 'admin_qa'@'%' IDENTIFIED BY 'axJY46SfOUHdu95ziuIu';
GRANT ALL PRIVILEGES ON applicationmanager.* TO 'appuser_qa'@'%';
FLUSH PRIVILEGES;

