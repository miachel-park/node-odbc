const odbc = require('odbc');
var urlencode = require('urlencode'); 

// Connection String
 const connectionConfig = {
    connectionString: `DSN=Tibero64`,
    connectionTimeout: 10,
    loginTimeout: 10,
 };

function toKoreanLang(queryResult){
    let decodeString = "";
    for(var i=0;i<queryResult.length;i++){
        if(i%2==0){
            decodeString+="%"
        }
        decodeString+=queryResult[i]
    }
    return urlencode.decode(decodeString)
}

function makeReturnObject(result){
    return {
        CARDNO : result.CARDNO,
        EMPNO : result.EMPNO,
        DEPTNM : toKoreanLang(result.DEPTNM),
        NAME : toKoreanLang(result.NAME),
        STATUS : result.STATUS,
     };    
}

const findByName = async (name)=>{
    const con = await odbc.connect(connectionConfig);
    let result = await con.query(`SELECT CARDNO, \
    EMPNO, \
    TO_CHAR(RAWTOHEX(DEPTNM)) as DEPTNM, \
    TO_CHAR(RAWTOHEX(NAME)) as NAME, \
    STATUS \
    FROM V_POS_PERSON WHERE NAME='${name}';`);
    await con.close();
    try{
        return makeReturnObject(result[0]);
    }catch(exception){
        console.error(exception)
        return null;
    }
}

const findByCardNum = async (cardNum)=>{
    const con = await odbc.connect(connectionConfig);
    let result = await con.query(`SELECT CARDNO, \
    EMPNO, \
    TO_CHAR(RAWTOHEX(DEPTNM)) as DEPTNM, \
    TO_CHAR(RAWTOHEX(NAME)) as NAME, \
    STATUS \
    FROM V_POS_PERSON WHERE CARDNO='${cardNum}';`);
    await con.close();
    try{
        return makeReturnObject(result[0]);
    }catch(exception){
        console.error(exception)
        return null;
    }
}

module.exports ={
    findByName,findByCardNum
}