-- Create tablespace
CREATE TABLESPACE tibero
DATAFILE 'tibero.dtf' SIZE 500M
AUTOEXTEND ON NEXT 100M
EXTENT MANAGEMENT LOCAL UNIFORM SIZE 256K
;

-- Create user
CREATE USER tmax IDENTIFIED BY tibero
DEFAULT TABLESPACE tibero
TEMPORARY TABLESPACE TEMP
ACCOUNT UNLOCK
;

-- Grant user priviledge
GRANT RESOURCE, CONNECT, DBA TO tmax;

-- Create test table
-- Create message data table
-- FIXME
--  msgid 만으로 primary key가 될수 있는지
--  검색을 위한 index key 설정 필요
create table msgdata (
    msgid   VARCHAR (128)   NOT NULL PRIMARY KEY,
    chid    VARCHAR (64)    NOT NULL ,
    roomid  VARCHAR (64)    NOT NULL ,
    userid  VARCHAR (64)    NOT NULL ,
    txhash  VARCHAR (512)   NOT NULL ,
    TIMESTAMP TIMESTAMP     NOT NULL
);