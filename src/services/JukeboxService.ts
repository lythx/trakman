import { Events } from "../Events.js"
import { ChallengeService } from "./ChallengeService.js"

export abstract class JukeboxService {

    private static readonly _queue: TMChallenge[] = []
    private static _current: TMChallenge
    private static readonly _previous: TMChallenge[] = []

    static initialize() {
        for (let i = 0; i < 10; i++) {
            this._queue.push(ChallengeService.challenges[i])
        }
        Events.addListener('Controller.Ready', () => {
            this._current = ChallengeService.current
            ChallengeService.setNextChallenge(this._queue[0].id)
        })
    }

    static update() {
        this._previous.unshift(this._current)
        this._previous.length = Math.min(10, this._previous.length)
        this._current = ChallengeService.current
        if (this._current.id === this._queue[0].id) {
            this._queue.shift()
            const q = ChallengeService.challenges.find(a => !this._queue.some(b => a.id === b.id))
            if (q) { this._queue.push(q) }
            else { this._queue.push(this._previous[0]) }
        }
        ChallengeService.setNextChallenge(this._queue[0].id)
    }

    static get queue() {
        return [...this._queue]
    }

    static get previous() {
        return [...this._previous]
    }

    static get current() {
        return this._current
    }

}