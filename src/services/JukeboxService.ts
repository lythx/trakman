import { Events } from "../Events.js"
import { ChallengeService } from "./ChallengeService.js"

interface JukeboxChallenge {
    readonly challenge: TMChallenge
    readonly isForced: boolean
}

export abstract class JukeboxService {

    private static readonly _queue: JukeboxChallenge[] = []
    private static _current: TMChallenge
    private static readonly _previous: TMChallenge[] = []

    static initialize() {
        for (let i = 0; i < 30; i++) {
            this._queue.push({ challenge: ChallengeService.challenges[i], isForced: false })
        }
        Events.addListener('Controller.Ready', () => {
            this._current = ChallengeService.current
            ChallengeService.setNextChallenge(this._queue[0].challenge.id)
        })
    }

    static update() {
        this._previous.unshift(this._current)
        this._previous.length = Math.min(30, this._previous.length)
        this._current = ChallengeService.current
        if (this._current.id === this._queue[0].challenge.id) {
            this._queue.shift()
            if (this._queue.length < 30) {
                const q = ChallengeService.challenges.find(a => !this._queue.some(b => a.id === b.challenge.id))
                if (q !== undefined) { this._queue.push({ challenge: q, isForced: false }) }
                else { this._queue.push({ challenge: this._previous[0], isForced: false }) }
            }
        }
        ChallengeService.setNextChallenge(this._queue[0].challenge.id)
    }

    static add(challengeId: string) {
        const challenge = ChallengeService.challenges.find(a => a.id === challengeId)
        if (challenge === undefined) { return new Error(`Can't find map with id ${challengeId} in`) }
        this._queue.splice(this._queue.findIndex(a => a.isForced === false), 0, { challenge, isForced: true })
        ChallengeService.setNextChallenge(this._queue[0].challenge.id)
    }

    static get queue() {
        return [...this._queue.map(a => a.challenge)]
    }

    static get previous() {
        return [...this._previous]
    }

    static get current() {
        return this._current
    }

}