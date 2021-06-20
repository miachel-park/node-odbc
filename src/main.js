const odbc = require('odbc');
const { Statement } = require('odbc');

// Connection String
const connectionConfig = {
    connectionString: 'DSN=tibero;charset=utf8',
    connectionTimeout: 10,
    loginTimeout: 10,
};

class MsgData {
    constructor(msgid, chid, roomid, userid, txhash, timestamp) {
        this.msgid = msgid;
        this.chid = chid;
        this.roomid = roomid;
        this.userid = userid;
        this.txhash = txhash;
        this.timestamp = timestamp;
    }
}

// let content = iconv.decode(Buffer.from('start main'), 'ISO-8859-1');
console.log('한글이 깨진다.');

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
        
        // const insert_stmt = 'INSERT INTO msgdata(msgid, chid, roomid, userid, txhash, timestamp) VALUES(?, ?, ?, ?, ?, ?)';
        const insert_stmt = 'INSERT INTO msgdata VALUES(?, ?, ?, ?, ?, ?)';
        stmt.prepare(insert_stmt, (err2) => {
                if (err2) {
                    console.error(err2);
                    return;
                }

                // FIXME : 
                const msgdata = new MsgData('542d90f8-c357-4469-8dcd-02c786f0915b', "channel-id-002", "roomid-id-002", "userid-00001", "txhash-0001", new Date().toUTCString());
                console.debug(msgdata);

                stmt.bind(['542d90f8-c357-4469-8dcd-02c786f0915b', "channel-id-002", "roomid-id-002", "userid-00001", "txhash-0001", 1624190218636], 
                // stmt.bind([msgdata.msgid, msgdata.chid, msgdata.roomid, msgdata.userid, msgdata.txhash], 
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
                        const query_stmt = "SELECT * FROM msgdata";
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