const { Statement } = require('odbc');
const odbc = require('odbc');
const iconv = require('iconv-lite');
const detectCharacterEncoding = require('detect-character-encoding');

// Connection String
const connectionConfig = {
    connectionString: 'DSN=myodbc8w;charset=utf8',
    connectionTimeout: 10,
    loginTimeout: 10,
};

class Customer {
    constructor(id, name, age, address) {
        this.id = id;
        this.name = name;
        this.age = age;
        this.address = address
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
        }
        
        const insert_stmt = 'INSERT INTO customer_test(ID, NAME, AGE, ADDRESS) VALUES(?, ?, ?, ?)';
        stmt.prepare(insert_stmt, (err2) => {
                if (err2) {
                    console.error(err2);
                    return;
                }

                // FIXME : 
                let address = "test code";
                let name = "공명식";
                stmt.bind([Math.floor(Math.random() * 100), name, Math.floor(Math.random() * 100), address], 
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
                        const query_stmt = "SELECT * FROM customer_test";
                        connection.query(query_stmt, (error, rs) => {
                            if (error) { 
                                console.error(error);
                            }
                            rs.forEach( (result) => {
                                const data = {
                                    id : result['ID'],
                                    name : result['NAME'],
                                    age : result['AGE'],
                                    address : result['ADDRESS']
                                };

                                console.log(result);
                            })

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