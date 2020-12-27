const generateMessage = (username,text) => {
    return {
        username,
        text,
        createdAT: new Date().getTime()
    }
}

const generateLocationMessage = (username , url) => {
    return {
        username,
        url,
        createdAT: 0
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}