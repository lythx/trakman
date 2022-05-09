import client from './Client.js'

class Chat {

    static sendMessage(str) {
        client.call('ChatSendServerMessage',
            [{ string: str }])
    }

}

export default Chat