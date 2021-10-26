const odbc = require('odbc');
const { Statement } = require('odbc');
const iconv = require("iconv-lite");

// Connection String
const connectionConfig = {
    connectionString: 'DSN=Tibero6',
    connectionTimeout: 10,
    loginTimeout: 10,
};

class Table01 {
    constructor(msgid, hanguel, ncount) {
        this.msgid = msgid;
        this.hanguel = hanguel;
        this.ncount = ncount;
    }
}

odbc.connect(connectionConfig, (error, connection) => {
    console.log('connecting to database!!!');
    if ( error ) { 
        console.error('connecting failed : ', error);
        return;
    }
    
    // insert record into table
    connection.createStatement((err1, stmt) => {
        console.debug('creating statement!!!');
        if (err1) {
            console.error(err1);
            return;
        }
        
        const insert_stmt = 'INSERT INTO table01(msgid, hanguel, ncount) VALUES(?, ?, ?)';
        stmt.prepare(insert_stmt, (err2) => {
                if (err2) {
                    console.error(err2);
                    return;
                }

                // FIXME : 
                var msgid = iconv.encode("ABC한글", 'Windows949').toString();
                var hanguel = '바이트한글';
                console.debug(iconv.encodingExists('CP949'));
                const data = new Table01(msgid, hanguel, 1234);
                console.debug(data);

                stmt.bind([data.msgid, data.hanguel, data.ncount], 
                    (err3) => {
                    if (err3) {
                        console.error(err3);
                        return;
                    }
                    console.debug('executing statement!!!')
                    stmt.execute((err4, result) => {
                        if (err4) {
                            console.error(err4);
                            return;
                        }
                        console.log(result);

                        // select record from table
                        const query_stmt = "SELECT * FROM table01";
                        connection.query(query_stmt, (error, rs) => {
                            if (error) { 
                                console.error(error);
                            }
                            console.log(rs);
                            // close connection
                            connection.close((error) => {
                                if (error) { console.error(error); }
                            })
                        });
                    });
                });
        });
    });
});