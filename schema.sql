-- MariaDB v10 +
DROP DATABASE IF EXISTS  ts_project3_flights;
CREATE DATABASE ts_project3_flights;
USE ts_project3_flights;

CREATE TABLE users (
	id INT AUTO_INCREMENT PRIMARY KEY,
	username VARCHAR(45) UNIQUE,
	password VARCHAR(45),
	role VARCHAR(20) DEFAULT "user",
	date_created INT DEFAULT (UNIX_TIMESTAMP()),
	first_name VARCHAR(45),
	last_name VARCHAR(45),
	followings JSON DEFAULT '[]' COMMENT "array of flight IDs which user follows"
);

CREATE TABLE flights (
	id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
	destination VARCHAR(45),
	description VARCHAR(200),
	image_url VARCHAR(1500) DEFAULT "https://i.imgur.com/qBY62uF.jpg",
	start_date INT DEFAULT (UNIX_TIMESTAMP()),
	end_date INT DEFAULT (UNIX_TIMESTAMP()),
	price INT,
	followers INT DEFAULT 0
);

INSERT INTO users
(username, password, role, first_name, last_name, followings)
VALUES
('admin', 'wrongpass', 'admin', 'James', 'Smith', '[1, 2]'),
('wef', '123', 'user', 'Gordon', 'Ramsay', '[2, 3, 5]'),
('user2', '321', 'user', 'Jane', 'Doe', '[2, 7]'),
('moshe', 'abc', 'user', 'Jack', 'Smith', '[5]'),
('jo', 'e', 'user', 'Jo', 'Johnny', '[1, 9]'),
('123', '123', 'user', 'Bob', 'Bobby', '[]');

INSERT INTO flights
(destination, description, image_url, start_date, end_date, price, followers)
VALUES
('Italy', 'Take a plane to Italy', 'https://i.imgur.com/S4Xvitk.jpg', 1649785762, 1649958562, 500, 2),
('New York', 'One-way trip to New York', 'https://i.imgur.com/ZYglqV1.jpg', 1647370162, 1647438449, 600, 3),
('Mexico', 'Cheap round-trip to Mexico', 'https://i.imgur.com/lDInQQ8.jpg', 1653184800, 1653271200, 400, 1),
('Canada', 'Lorem ipsum dolor sit amet.', 'https://i.imgur.com/oFRd02s.jpg', 1653184800, 1653271200, 900, 0),
('Florida', 'Lorem ipsum dolor sit amet.', 'https://i.imgur.com/qyl1OMj.jpg', 1653184800, 1653271200, 1200, 2),
('Paris', 'Lorem ipsum dolor sit amet.', 'https://i.imgur.com/rHyj5b4.jpg', 1653184800, 1653271200, 600, 0),
('Russia', 'Lorem ipsum dolor sit amet.', 'https://i.imgur.com/Zq0rMEY.jpg', 1653184800, 1653271200, 800, 1),
('Brazil', 'Lorem ipsum dolor sit amet.', 'https://i.imgur.com/kS0QmTm.jpg', 1653184800, 1653271200, 500, 0),
('India', 'Lorem ipsum dolor sit amet.', 'https://i.imgur.com/SAHN7di.jpg', 1653184800, 1653271200, 850, 1),
('Australia', 'Lorem ipsum dolor sit amet.', 'https://i.imgur.com/V8Grilf.png', 1653184800, 1653271200, 1300, 0);
