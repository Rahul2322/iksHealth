const jwt = require('jsonwebtoken')
const privateKey = process.env.JWT_KEY 

exports.signToken = async (data) => {
    const token =  jwt.sign(data, privateKey,{
        algorithm:'HS256'
    });
    return token
}

exports.verifyToken = async (token) => {
    // const decodedValue =  jwt.verify(token, privateKey)
    // return decodedValue

    try {
        const decoded = jwt.verify(token,privateKey,{ algorithm: 'HS256' });
      
       return {
        valid:  true,
        expired:false,
        decoded 
       }
      } catch (error) {
        return {
            valid:false,
            expired:error.message === 'jwt expired',
            decoded:null
        }
      }
}