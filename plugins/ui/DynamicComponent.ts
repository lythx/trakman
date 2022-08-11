import { trakman as tm } from "../../src/Trakman.js"

export default abstract class DynamicComponent {

  readonly id: number

  constructor(id: number) {
    this.id = id
  }

  abstract displayToPlayer(login: string): void

  hideToPlayer(login: string): void {
    tm.sendManialink(`<manialink id="${this.id}"></manialink>`, login)
  }

}