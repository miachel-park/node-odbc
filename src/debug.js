const odbc = require('odbc');
const { Statement } = require('odbc');
const iconv = require("iconv-lite");

// Connection String
const connectionConfig = {
    connectionString: 'DSN=TiberoSecom',
    connectionTimeout: 10,
    loginTimeout: 10,
};

function ConvertStringToHex(str) {
    var arr = [];
    for (var i = 0; i < str.length; i++) {
           arr[i] = ("00" + str.charCodeAt(i).toString(16)).slice(-4);
    }
    return "\\u" + arr.join("\\u");
}

function	hex_to_byte		(hex_str)
{
	return parseInt(hex_str, 16);
}

function hex_string_to_bytes(hex_str)
{
	var	result = [];

	for (var i = 0; i < hex_str.length; i+=2) {
		result.push(hex_to_byte(hex_str.substr(i,2)));
	}
	return result;
}

function utf8_bytes_to_string(arr)
{
    if (arr == null)
        return null;
    var result = "";
    var i;
    while (i = arr.shift()) {
        if (i <= 0x7f) {
            result += String.fromCharCode(i);
        } else if (i <= 0xdf) {
            var c = ((i&0x1f)<<6);
            c += arr.shift()&0x3f;
            result += String.fromCharCode(c);
        } else if (i <= 0xe0) {
            var c = ((arr.shift()&0x1f)<<6)|0x0800;
            c += arr.shift()&0x3f;
            result += String.fromCharCode(c);
        } else {
            var c = ((i&0x0f)<<12);
            c += (arr.shift()&0x3f)<<6;
            c += arr.shift() & 0x3f;
            result += String.fromCharCode(c);
        }
    }
    return result;
}

odbc.connect(connectionConfig, (error, connection) => {
    console.log('connecting to database!!! : ', connectionConfig);
    if ( error ) { 
        console.error('connecting failed : ', error);
        return;
    }
    
    // select record from table
    const query_stmt = "SELECT rawtohex(name) as name from v_pos_person where rownum = 1";
    connection.query(query_stmt, (error, rs) => {
        if (error) { 
            console.error(error);
        }
        console.log(rs);
        var name = utf8_bytes_to_string(hex_string_to_bytes(rs[0].NAME));        
        console.log(name.toString());

        // close connection
        connection.close((error) => {
            if (error) { console.error(error); }
        });
    });
});