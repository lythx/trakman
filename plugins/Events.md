Events prefixed with Controller are emitted from the controller, others are emitted directly from the dedicated server.
USE CONTROLLER EVENTS IF YOU CAN
They exist to reduce number of database and client calls, as they call it once if its needed and pass the result in arguments.
In some cases using dedicated server event instead of controller event might even cause errors, as the order of actions performed by the core and the plugins will be unclear.
Controller events pass an interface in arguments, dedicated server events pass any array.

In controller events you should set callback function argument to a given type from list below to get information about passed object's arguments and types, which will also allow your IDE to help you. Example: 
```typescript 
const callback = async (player: TMPlayer) => {
  TM.sendMessage(`Welcone ${player.nickName}`)
}
```

Controller events
```typescript
'Controller.PlayerChat': MessageInfo -> `Triggered after player sends message, passes player information and the message`
'Controller.PlayerJoin': TMPlayer -> `Triggered after player joins the server, passes player information`
'Controller.PlayerLeave': PlayerInfo -> `Triggered after player leaves the server, passes player information`
'Controller.PlayerRecord': TODO -> `Triggered after player gets a local record,    ` 
'Controller.DedimaniaRecords', TODO `Triggered after dedimania records get fetched,    ` 
```
Dedicated server events
TODO