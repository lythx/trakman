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

    static initialize(): void {
        this._current = { ...ChallengeService.current }
        const currentIndex: number = ChallengeService.challenges.findIndex(a => a.id === this._current.id)
        const lgt: number = ChallengeService.challenges.length
        for (let i: number = 1; i <= 30; i++) {
            this._queue.push({ challenge: ChallengeService.challenges[(i + currentIndex) % lgt], isForced: false })
        }
        ChallengeService.setNextChallenge(this._queue[0].challenge.id)
    }

    static nextChallenge(): void {
        this._previous.unshift(this._current)
        this._previous.length = Math.min(30, this._previous.length)
        this._current = ChallengeService.current
        if (this._current.id === this._queue[0].challenge.id) {
            this._queue.shift()
            if (this._queue.length < 30) {
                let currentIndex: number = ChallengeService.challenges.findIndex(a => a.id === this._current.id)
                const lgt: number = ChallengeService.challenges.length
                let current: TMChallenge
                let i: number = 0
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

    static add(challengeId: string): void | Error {
        const challenge: TMChallenge | undefined = ChallengeService.challenges.find(a => a.id === challengeId)
        if (challenge === undefined) { return new Error(`Can't find map with id ${challengeId} in`) }
        const index: number = this._queue.findIndex(a => a.isForced === false)
        this._queue.splice(index, 0, { challenge, isForced: true })
        ChallengeService.setNextChallenge(this._queue[0].challenge.id)
        TMXService.add(challengeId, index)
    }

    static remove(challengeId: string): boolean {
        if (!this._queue.filter(a => a.isForced === true).some(a => a.challenge.id === challengeId)) { return false }
        const index: number = this._queue.findIndex(a => a.challenge.id === challengeId)
        this._queue.splice(index, 1)
        const q: TMChallenge | undefined = ChallengeService.challenges.find(a => !this._queue.some(b => b.challenge.id === a.id))
        if (q !== undefined) { this._queue.push({ challenge: q, isForced: false }) }
        else { this._queue.push({ challenge: this._previous[0], isForced: false }) }
        ChallengeService.setNextChallenge(this._queue[0].challenge.id)
        TMXService.remove(index)
        return true
    }

    static get jukebox(): TMChallenge[] {
        return [...this._queue.filter(a => a.isForced === true).map(a => a.challenge)]
    }

    static get queue(): TMChallenge[] {
        return [...this._queue.map(a => a.challenge)]
    }

    static get previous(): TMChallenge[] {
        return [...this._previous]
    }

    static get current(): TMChallenge {
        return this._current
    }

}