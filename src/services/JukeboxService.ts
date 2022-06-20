import { Events } from "../Events.js"
import { ChallengeService } from "./ChallengeService.js"
import { TMXService } from "./TMXService.js"

interface JukeboxChallenge {
    readonly challenge: TMChallenge
    readonly isForced: boolean
}

export abstract class JukeboxService {

    private static readonly _queue: JukeboxChallenge[] = []
    private static _current: TMChallenge
    private static readonly _previous: TMChallenge[] = []

    static initialize() {
        this._current = { ...ChallengeService.current }
        const currentIndex = ChallengeService.challenges.findIndex(a => a.id === this._current.id)
        const lgt = ChallengeService.challenges.length
        for (let i = 1; i <= 30; i++) {
            this._queue.push({ challenge: ChallengeService.challenges[(i + currentIndex) % lgt], isForced: false })
        }
        ChallengeService.setNextChallenge(this._queue[0].challenge.id)
    }

    static nextChallenge() {
        this._previous.unshift(this._current)
        this._previous.length = Math.min(30, this._previous.length)
        this._current = ChallengeService.current
        if (this._current.id === this._queue[0].challenge.id) {
            this._queue.shift()
            if (this._queue.length < 30) {
                let currentIndex = ChallengeService.challenges.findIndex(a => a.id === this._current.id)
                const lgt = ChallengeService.challenges.length
                let current: TMChallenge
                let i = 0
                do {
                    i++
                    current = ChallengeService.challenges[(i + currentIndex) % lgt]
                } while ([...this._queue.map(a => a.challenge), ...this._previous, this._current].some(a => a.id === current.id) && i < lgt)
                if (current !== undefined) { this._queue.push({ challenge: current, isForced: false }) }
                else { this._queue.push({ challenge: this._previous[0], isForced: false }) }
            }
        }
        ChallengeService.setNextChallenge(this._queue[0].challenge.id)
    }

    static add(challengeId: string) {
        const challenge = ChallengeService.challenges.find(a => a.id === challengeId)
        if (challenge === undefined) { return new Error(`Can't find map with id ${challengeId} in`) }
        const index = this._queue.findIndex(a => a.isForced === false)
        this._queue.splice(index, 0, { challenge, isForced: true })
        ChallengeService.setNextChallenge(this._queue[0].challenge.id)
        TMXService.add(challengeId, index)
    }

    static remove(challengeId: string): boolean {
        if (!this._queue.filter(a => a.isForced === true).some(a => a.challenge.id === challengeId)) { return false }
        const index = this._queue.findIndex(a => a.challenge.id === challengeId)
        this._queue.splice(index, 1)
        const q = ChallengeService.challenges.find(a => !this._queue.some(b => b.challenge.id === a.id))
        if (q !== undefined) { this._queue.push({ challenge: q, isForced: false }) }
        else { this._queue.push({ challenge: this._previous[0], isForced: false }) }
        ChallengeService.setNextChallenge(this._queue[0].challenge.id)
        TMXService.remove(index)
        return true
    }

    static get jukebox() {
        return [...this._queue.filter(a => a.isForced === true).map(a => a.challenge)]
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