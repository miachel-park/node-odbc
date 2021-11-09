# UnixODBC를 이용한 Tibero, Mysql access

ODBC (Open DataBase Connectivity)는 마이트로소프트가 만든 데이터베이스에 접근하기 위한 소프트웨어 표준 규격으로, 각 데이터베이스의 차이는 ODBC 드라이버에 흡수되기 때문에 사용자는 ODBC에 정해진 순서에 따라서 프로그램을 쓰면 접속처이 데이터베이스가 어떠한 데이터베이스 관리 시스템에 관리되고 있는지 의식할 필요 없이 접근할 수 있다.

## unixODBC를 이용한 연동 메카니즘

Node Application <--> node-odbc <--> unixODBC <--> Tibero or MySql RDBMS

* node-odbc <br>
    Node.js에서 unixODBC를 사용하기 위한 비동기 인터페이스
* unixODBC <br>
unixODBC는 ODBC API를 구현하는 오픈소스 프로젝트로 Unix, Linux, IBM OS/2등에서 사용가능<br>
여기서는 UnixODBC를 이용하여 linux node application에서 Tibero 또는 MySql에 접속<br>

--------

## Install unixOdbc in ubuntu 20.04

    Update the package index:
        $ sudo apt-get update
    Install unixodbc-dev deb package:
        $ sudo apt-get install -y unixodbc unixodbc-dev

## Install odbc in node

프로젝트 루트에 odbc package 설치

    $ npm install odbc

## RDBMS 설치

Tibero 또는 MySql 설치

### Install Tibero6

[참고자료](https://kamsi76.tistory.com/entry/TIBERO-Centos7-%EC%84%9C%EB%B2%84%EC%97%90-Tibero-6-%EC%84%A4%EC%B9%98)

#### Create Database

Database 생성시 아래와 같이 charter set과 national charter set을 UTF8과 UTF16으로 설정

    create database "tibero" 
    user sys identified by tibero 
    maxinstances 8 
    maxdatafiles 100 
    character set UTF8 
    national character set UTF16 
    logfile 
        group 1 'log001.log' size 100M, 
        group 2 'log002.log' size 100M, 
        group 3 'log003.log' size 100M 
    maxloggroups 255 
    maxlogmembers 8 
    noarchivelog 
        datafile 'system001.dtf' size 100M autoextend on next 100M maxsize unlimited 
        default temporary tablespace TEMP 
            tempfile 'temp001.dtf' size 100M autoextend on next 100M maxsize unlimited 
            extent management local autoallocate 
        undo tablespace UNDO 
            datafile 'undo001.dtf' size 100M autoextend on next 100M maxsize unlimited 
            extent management local autoallocate;

### Install MySql

MySql을 docker image로 설치

#### pull latest mysql docker image
    $ docker pull mysql:latest
    
#### MySql docker 기동

-p 호스트 접속 포트 : 컨테이너의 MySql 포트 <br>
-e MYSQL_ROOT_PASSWORD= mysql root password (default: password)<br>
--name 컨테이너 이름 <br>
-v 호스트 볼륨:/var/lib/mysql<br>
    docker 재기동시에 데이터를 유지 하기위해 호스트의 persistence volume을 지정<br>
--character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci<br> 
한글을 위한 mysql charset

    $ docker run --rm -d -p <host_port>:<mysql_port_in_docker> -e MYSQL_ROOT_PASSWORD=<password> --name <container name> -v <volume in host>:/var/lib/mysql --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci

#### MySql database user 생성

database user id : tmax<br>
database user password : tibero

    mysql> CREATE USER 'tmax'@'%' IDENTIFIED BY 'tibero';
    mysql> GRANT ALL PRIVILEGES ON *.* TO 'tmax'@'%';
    mysql> flush privileges;

#### Install mysql odbc driver

Linux generic MySql driver을 다운로드 받아 압축을 풀고 lib/, bin/ 아래 있는 파일을 /usr/local/mysql에 복사 <br>

[드라이버 다운로드](https://dev.mysql.com/doc/connector-odbc/en/connector-odbc-installation-binary-unix-tarball.html)

## Setting odbc.init & odbcinit 

### Tibero odbc driver 설정

/etc/odbcinst.ini 에 tibero odbc driver 설정

    ;
    ; odbcinst.ini
    ;
    [Tibero 6 ODBC Driver]
    Description = ODBC Driver for Tibero 6
    Driver = <Path to libtbodbc.so>
    UsageCount = 1
      
### MySql odbc driver 등록

아래와 명령을 이용하여 /etc/odbcinst.ini에 MySql unicode odbc driver를 등록

    $ myodbc-installer -a -d -n "MySQL ODBC 8.0 Driver" -t "Driver=/usr/local/mysql/lib/libmyodbc8w.so"


### Database 접속정보 설정

/etc/odbc.ini 또는 홈 디렉토리에 .odbc.ini에 tibero(또는 Mysql) 접속정보 설정

#### Tibero6 접속정도 설정
    ;
    ;   odbc.ini
    ;
    [ODBC Data Source]
    Tibero6     = Tibero 6 ODBC Driver

    [ODBC]
    Trace       = 1
    TraceFile   = /tmp/odbc.trace

    [Tibero6]
    Driver      = <Path to libtbodbc.so>
    Description = Tibero6 ODBC Datasource
    SID         = tibero ; tbdsn.tbr 파일에 설정한 DSN 정보
    User        = <database user id>
    Password    = <database user password>

#### MySql 접속정보 설정
Configuring a Connector/ODBC DSN on Unix

    ;
    ;  odbc.ini configuration for Connector/ODBC 8.0 driver
    ;

    [ODBC Data Sources]
    myodbc8w     = MyODBC 8.0 UNICODE Driver DSN
    myodbc8a     = MyODBC 8.0 ANSI Driver DSN

    [myodbc8w]
    Driver       = <Path to Dirver's folder>/libmyodbc8w.so
    Description  = Connector/ODBC 8.0 UNICODE Driver DSN
    SERVER       = <mysql server host>
    PORT         =
    USER         = 
    Password     =
    Database     = 
    OPTION       = 3
    SOCKET       =

---
## Issues

* Tibero ODBC driver경우, 영문과 한글이 깨짐 UTF8 처리에 문제가 있느듯 함
* window 10에 tibero 설치하고 window 10에서 실행하면 한글 문제 없음
* linux tibero odbc driver에서 encoding 이슈가 있는듯

* varchar type column에 UTF-8로 encoding으로 저장되어 있는것 같음
* 이 데이터를 select 하면 깨지는데 이를 hex string으로 변경하고
* hex string을 binary string으로 변경해서 해결 (urlencoding 사용)
