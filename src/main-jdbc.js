// NOTE :
//  this sample code : https://www.npmjs.com/package/jdbc
// 
var jinst = require('jdbc/lib/jinst');
var JDBC = require('jdbc');

// isJvmCreated will be true after the first java call.  When this happens, the
// options and classpath cannot be adjusted.
if (!jinst.isJvmCreated()) {
  // Add all java options required by your project here.  You get one chance to
  // setup the options before the first java call.
  jinst.addOption("-Xrs");
  // Add all jar files required by your project here.  You get one chance to
  // setup the classpath before the first java call.
//   jinst.setupClasspath(['./drivers/hsqldb.jar',
//                         './drivers/derby.jar',
//                         './drivers/derbyclient.jar',
//                         './drivers/derbytools.jar']);
    jinst.setupClasspath(['./src/drivers/tibero6-jdbc.jar'])
}


var config = {
    url : 'jdbc:tibero:thin:@192.168.155.90:8629:tibero',
    user : 'tmax',
    password: 'tibero',
    minpoolsize: 1,
    maxpoolsize: 3,
    drivername: 'com.tmax.tibero.jdbc.TbDriver'
}

// Initialize tibero database
var tiberodb = new JDBC(config);

tiberodb.initialize(function(err) {
    if (err) {
        console.log(err);
    }
    console.log("tibero initialized !!!");
});

var asyncjs = require('async');

tiberodb.reserve(function(err, connObj) {
    if (connObj) {
        console.log("tibero database connected with " + connObj.uuid);
        var conn = connObj.conn
    }

    asyncjs.series(
        [
            // execute insert statement
            function(callback) {
                conn.createStatement(function(err, stmt) {
                    stmt.executeUpdate(
                        "INSERT INTO table01" +
                        " VALUES ('english 와 한글', '한글만', 1234.5);",
                        function(err, count) {
                            if (err) {
                                callback(err);
                            } else {
                                callback(null, count);
                            }
                    });
                });
            },
            // exectue query statement
            function(callback) {
                conn.createStatement(function(err, stmt) {
                    if (err) {
                        callback(err);
                    } else {
                        stmt.setFetchSize(100, function(err) {
                            if (err) {
                                console.log(err);
                            } else {
                                stmt.executeQuery(
                                    "SELECT msgid, hanguel, ncount FROM table01;",
                                    function(err, rs) {
                                        if (err) {
                                            callback(err);
                                        } else {
                                            rs.toObjArray(function(err, results) {
                                                if ( results.length > 0 ) {
                                                    console.log(null, results[0].MSGID);
                                                    console.log(null, results[0].HANGUEL);
                                                    console.log(null, results[0].NCOUNT);
                                                }
                                                callback(null, results);
                                            });
                                        }
                                    }
                                );
                            }
                        });
                    }
                });
            },
            // Rellease connection
            function(err, results) {
                tiberodb.release(connObj, function(err) {
                    if (err) {
                        console.log(err.message);
                    }
                    console.log('terminate pgm');
                });
            }
        ]
    );
});
