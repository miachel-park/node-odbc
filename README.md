# UnixODBC를 이용한 Tibero, Mysql access

## Install unixOdbc in ubuntu 20.04

    Update the package index:
    # sudo apt-get update
    Install unixodbc-dev deb package:
    # sudo apt-get install unixodbc-dev

## Install Tibero6
    Reference : https://kamsi76.tistory.com/entry/TIBERO-Centos7-%EC%84%9C%EB%B2%84%EC%97%90-Tibero-6-%EC%84%A4%EC%B9%98

    Admin : sys/tibero
    User : tmax/tibero

## Create Database
    create database "iso8859" 
    user sys identified by tibero 
    maxinstances 8 
    maxdatafiles 100 
    character set WE8ISO8859P1 
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

## Setting odbc.init & odbcinit for tibero
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
    User        = tibero
    Password    = tmax

    ;
    ; odbcinst.ini
    ;
    [Tibero 6 ODBC Driver]
    Description = ODBC Driver for Tibero 6
    Driver = <Path to libtbodbc.so>
    UsageCount = 1

## Install mysql with docker
    ### pull latest mysql docker image
        $ docker pull mysql:latest
    
    ### run mysql docker
    -p host_port:container_port
    -v host_mysql_db_dir:container_mysql_db_dir
    --character-set-server=--character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci 한글을 위한 mysql charset
        $ docker run --rm -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=password --name test-mysql -v /home/ec2-user/db:/var/lib/mysql mysql:latest --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci

    ### Create mysql db user tmax
        mysql> CREATE USER 'tmax'@'%' IDENTIFIED BY 'tibero';
        mysql> GRANT ALL PRIVILEGES ON *.* TO 'tmax'@'%';
        mysql> flush privileges;

    ### Install mysql odbc driver
        ## Download linux generic mysql odbc driver tarball and extract
            https://dev.mysql.com/doc/connector-odbc/en/connector-odbc-installation-binary-unix-tarball.html
        ## Register Unicode Driver
        $ myodbc-installer -a -d -n "MySQL ODBC 8.0 Driver" -t "Driver=/usr/local/lib/libmyodbc8w.so"
        ## Configuring a Connector/ODBC DSN on Unix
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

            [myodbc8a]
            Driver       = <Path to Dirver's folder>/libmyodbc8a.so
            Description  = Connector/ODBC 8.0 ANSI Driver DSN
            SERVER       = <mysql server host>
            PORT         =
            USER         = 
            Password     =
            Database     = test
            OPTION       = 3
            SOCKET       =

## Install odbc in node
    npm install odbc