import { ChallengeRepository } from '../../src/database/ChallengeRepository.js'
import { ChallengeService } from '../../src/services/ChallengeService.js'
import { anything, capture, instance, mock, verify } from 'ts-mockito'
import { jest } from '@jest/globals'
import { Client } from '../../src/Client.js'
import { SpyInstance } from 'jest-mock'
import { GameService } from '../../src/services/GameService'

let mockedRepo: ChallengeRepository
let repo: ChallengeRepository
let track1: object
let track2: object
let client: SpyInstance<Promise<any[]>, [method: string, params?: object[] | undefined, expectsResponse?: boolean | undefined]>
let game: SpyInstance<any, []>

beforeEach(async () => {
  mockedRepo = mock(ChallengeRepository)
  repo = instance(mockedRepo)
  track1 = {
    Name: 'track1',
    UId: 'a',
    FileName: 'track.gbx',
    Environnement: 'Bay',
    Author: 'Nadeo',
    GoldTime: 1235134,
    CopperPrice: 234
  }
  track2 = {
    Name: 'Map 21',
    UId: 'b_21',
    FileName: 'map.gbx',
    Environnement: 'Stadium',
    Author: 'miapetardez',
    GoldTime: 5001,
    CopperPrice: 3 // not a very good map
  }
  client = jest.spyOn(Client, 'call')
  game = jest.spyOn(GameService, 'gameMode', 'get')
})

test('valid push', async () => {
  await ChallengeService.initialize(repo)
  game.mockReturnValue(0)
  client.mockResolvedValueOnce([track1, track2])
  client.mockResolvedValueOnce([{
    ...track1,
    LapRace: true,
    NbLaps: 7
  }])
  await ChallengeService.push()
  const list: TMChallenge[] = [
    { id: 'a', name: 'track1', author: 'Nadeo', environment: 'Bay' },
    { id: 'b_21', name: 'Map 21', author: 'miapetardez', environment: 'Stadium' }
  ]
  list[0].laps = 7
  expect(capture(mockedRepo.add).first()[0]).toStrictEqual(list)
  verify(mockedRepo.add(anything())).once()
  expect(ChallengeService.current).toEqual(list[0])
  // verify(game).once()
})

test('valid no laps', async () => {
  await ChallengeService.initialize(repo)
  client.mockResolvedValueOnce([track1, track2])
  client.mockResolvedValueOnce([{
    ...track2,
    LapRace: false,
    NbLaps: 1
  }])
  await ChallengeService.push()
  const list: TMChallenge[] = [
    { id: 'a', name: 'track1', author: 'Nadeo', environment: 'Bay' },
    { id: 'b_21', name: 'Map 21', author: 'miapetardez', environment: 'Stadium' }
  ]
  expect(capture(mockedRepo.add).first()[0]).toStrictEqual(list)
  verify(mockedRepo.add(anything())).once()
  expect(ChallengeService.current).toEqual(list[1])
  // verify(game).once()
})

test('invalid push', async () => {
  await ChallengeService.initialize(repo)
  client.mockRejectedValue(Error('dont work'))
  await ChallengeService.push()
  verify(mockedRepo.add(anything())).never()
})

/* test('invalid current', async () => {
  await ChallengeService.initialize(repo)
  client.mockResolvedValueOnce([track1, track2])
  client.mockRejectedValueOnce(Error('fuck'))
  await ChallengeService.push()
  /*const list = [
    new Challenge('a', 'track1', 'Nadeo', 'Bay'),
    new Challenge('b_21', 'Map 21', 'miapetardez', 'Stadium')
  ]
  //expect(capture(mockedRepo.add).first()[0]).toStrictEqual(list)
  //verify(mockedRepo.add(anything())).once()
  //verify(game).once()
}) */
