import {ChallengeRepository} from "../../src/database/ChallengeRepository.js";
import {Challenge, ChallengeService} from "../../src/services/ChallengeService.js";
import {anything, instance, mock, verify} from "ts-mockito";
import {jest} from '@jest/globals'
import {Client} from "../../src/Client.js";
import { SpyInstance } from "jest-mock";

let mockedRepo: ChallengeRepository
let repo: ChallengeRepository
let track1: object
let track2: object
let client: SpyInstance<Promise<any[]>, [method: string, params?: object[] | undefined, expectsResponse?: boolean | undefined]>


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
})

test('valid', async () => {
  await ChallengeService.initialize(repo)
  client.mockResolvedValue([track1, track2])

  await ChallengeService.push()
  const list = [
    new Challenge('a', 'track1', 'Nadeo', 'Bay'),
    new Challenge('b_21', 'Map 21', 'midapetardez', 'Stadium')
  ]
  verify(mockedRepo.add(list)).once()
})

test('invalid', async () => {

  await ChallengeService.initialize(repo)
  client.mockRejectedValue(Error('dont work'))
  await ChallengeService.push()
  verify(mockedRepo.add(anything())).never()
})