const moment = require('moment');

function formatMsg(username, txt) {
  return {
    username,
    txt,
    time: moment().format('h:mm a')
  }
}

module.exports = formatMsg
