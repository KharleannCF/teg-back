const jwt = require('jsonwebtoken');

const obtenerToken = (payload) => {
    return jwt.sign({
        data: payload
    }, 'SECRET', { expiresIn: '1h' });
}

const obtenerDatosToken = (token) => {
    let data = null;
    jwt.verify(token, 'SECRET', (err, decoded) => {
        if(err) {
            console.log('Error al obtener data del token');
        } else {
            data = decoded;
        }
    });

    return data;
}

module.exports = {
    obtenerToken,
    obtenerDatosToken
}