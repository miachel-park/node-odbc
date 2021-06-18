-- Create tablespace
CREATE TABLESPACE test
DATAFILE 'iso8859.dtf' SIZE 500M
AUTOEXTEND ON NEXT 100M
EXTENT MANAGEMENT LOCAL UNIFORM SIZE 256K
;

-- Create user
CREATE USER tmax IDENTIFIED BY tibero
DEFAULT TABLESPACE test
TEMPORARY TABLESPACE TEMP
ACCOUNT UNLOCK
;

-- Grant user priviledge
GRANT RESOURCE, CONNECT, DBA TO tmax;

-- Create test table
create table customer_test (
    ID int not null,
    name varchar(64),
    age int,
    address varchar(128)
);