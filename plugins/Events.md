Events prefixed with Controller are emitted from the controller, others are emitted directly from the dedicated server.
USE CONTROLLER EVENTS IF YOU CAN
They exist to reduce number of database and client calls, as they call it once if its needed and pass the result in arguments.
In some cases using dedicated server event instead of controller event might even cause errors, as the order of actions performed by the core and the plugins will be unclear.
Controller events pass an interface in arguments, dedicated server events pass any array.

In controller events you should set callback function argument to a given type from list below to get information about passed object's arguments and types, which will also allow your IDE to help you. Example: 
```typescript 
import { TRAKMAN as TM } from '../src/Trakman.js'
const event  = 'Controller.PlayerJoin'
const callback = (player: JoinInfo) => {
  TM.sendMessage(`Welcome ${player.nickName}`)
}
TM.addListener(event, callback)
```

Controller events
```typescript
'Controller.Ready' (no params) -> `Triggered on startup after all core services are ready`
'Controller.PlayerChat': MessageInfo -> `Triggered after player sends message, passes player information and the message`
'Controller.PlayerJoin': JoinInfo -> `Triggered after player joins the server, passes player information`
'Controller.PlayerLeave': LeaveInfo -> `Triggered after player leaves the server, passes player information`
'Controller.PlayerRecord': RecordInfo -> `Triggered after player gets a local record, passes player and record information` 
'Controller.PlayerFinish': FinishInfo -> `Triggered after player finishes, passes player and run information`
'Controller.PlayerInfoChanged': InfoChangedInfo -> `Triggered when players state changes, passes various information about player status`
'Controller.ManialinkClick': ManialinkClickInfo -> `Triggered when player clicks a manialink which has an actionID, passes player information and actionID`
'Controller.PlayerCheckpoint': CheckpointInfo -> `Triggered after player gets a checkpoint, passes player and checkpoint information`
'Controller.BeginChallenge': BeginChallengeInfo -> `Triggered when new challenge starts, passes challenge information and local records`
'Controller.EndChallenge', EndChallengeInfo -> `Triggered when challenge ends, passes challenge information and local records`
'Controller.DedimaniaRecords', ChallengeDedisInfo -> `Triggered after dedimania records get fetched, contains information about challenge and an array of dedis` 
```
Dedicated server events
TODO