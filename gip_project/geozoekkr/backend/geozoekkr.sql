CREATE DATABASE geozoekkr;

USE geozoekkr;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    games_played INT DEFAULT 0,
    total_score INT DEFAULT 0,
    best_score INT DEFAULT 0
);

CREATE TABLE achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    achievement_name VARCHAR(100) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE game_times (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    shortest_time TIME NOT NULL,
    total_play_time TIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
create table scores (
    id int auto_increment primary key ,
    user_id int not null,
    games_played int default 0,
    total_score int default 0,
    best_score int default 0,
    foreign key (user_id) references users(id) on delete cascade
)