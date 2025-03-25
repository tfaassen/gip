CREATE DATABASE geozoekkr;
USE geozoekkr;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE scores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  score INT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
