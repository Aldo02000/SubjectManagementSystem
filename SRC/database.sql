DROP DATABASE SubjectSystem;
CREATE DATABASE SubjectSystem;
USE SubjectSystem;

CREATE TABLE User
(
	Id CHAR(6) NOT NULL,
    NameOfUser VARCHAR(30) NOT NULL,
    Email VARCHAR(30) NOT NULL,
    AccountPassword VARCHAR(100) NOT NULL,
    RoleOfUser VARCHAR(10) NOT NULL,
    
    CONSTRAINT PK
		PRIMARY KEY (Id)
);

SELECT * FROM User
