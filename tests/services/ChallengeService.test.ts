// import { ChallengeRepository } from '../../src/database/ChallengeRepository.js'
// import { ChallengeService } from '../../src/services/ChallengeService.js'
// import { anything, capture, instance, mock, verify } from 'ts-mockito'
// import { jest } from '@jest/globals'
// import { Client } from '../../src/Client.js'
// import { SpyInstance } from 'jest-mock'
// import { TMXService } from '../../src/services/TMXService'

// let mockedRepo: ChallengeRepository
// let repo: ChallengeRepository
// let client: SpyInstance<Promise<any[]>, [method: string, params?: object[] | undefined, expectsResponse?: boolean | undefined]>
// let tmx: SpyInstance<Promise<TMXTrackInfo>, [trackId: string, game?: string | undefined]>
// // what the service receives from nadeo: challengelist
// const track1: object = {
//   Name: 'track1',
//   UId: 'a',
//   Environnement: 'Bay',
//   Author: 'Nadeo'
// }
// const track2: object = {
//   Name: 'Map 21',
//   UId: 'b_21',
//   Environnement: 'Stadium',
//   Author: 'miapetardez'
// }
// // challengelist expected result
// const list: ChallengeInfo[] = [{
//   id: 'a',
//   name: 'track1',
//   author: 'Nadeo',
//   environment: 'Bay'
// }, {
//   id: 'b_21',
//   name: 'Map 21',
//   author: 'miapetardez',
//   environment: 'Stadium'
// }]
// // currentchallengeinfo response
// const currentChallengeInfo: object = {
//   ...track1,
//   Mood: 'Sunrise',
//   BronzeTime: 5000000,
//   SilverTime: 4000000,
//   GoldTime: 1235134,
//   AuthorTime: 1000000,
//   CopperPrice: 234,
//   LapRace: true,
//   NbLaps: 7,
//   NbCheckpoints: 28
// }
// // current expected result
// const current: TMChallenge = {
//   ...list[0],
//   mood: 'Sunrise',
//   bronzeTime: 5000000,
//   silverTime: 4000000,
//   goldTime: 1235134,
//   authorTime: 1000000,
//   copperPrice: 234,
//   lapRace: true,
//   lapsAmount: 7,
//   checkpointsAmount: 28
// }

// // do this before each test case
// beforeEach(async () => {
//   // pretend to be an instance of ChallengeRepository
//   mockedRepo = mock(ChallengeRepository)
//   repo = instance(mockedRepo)
//   // intercept the Client.call() method, become nadeo
//   client = jest.spyOn(Client, 'call')
//   // intercept TMXService.fetchTrack()
//   tmx = jest.spyOn(TMXService, 'fetchTrackInfo')
// })

// test('invalid setCurrent() - error getting current challenge info', async () => {
//   // first Client.call(), that means GetChallengeList inside getList()
//   client.mockResolvedValueOnce([track1, track2])
//   // second Client.call(), so GetCurrentChallengeInfo throws an error
//   client.mockRejectedValueOnce(Error('dont work'))
//   await ChallengeService.initialize(repo)
//   expect(capture(mockedRepo.add).first()).toStrictEqual(list)
//   // verify(mockedRepo.add(anything())).once()
//   // assert that current track was never set
//   expect(ChallengeService.current).toEqual(undefined)
// })

// // test case
// test('valid push()', async () => {
//   // first Client.call(), that means GetChallengeList inside getList()
//   client.mockResolvedValueOnce([track1, track2])
//   // second Client.call(), so GetCurrentChallengeInfo inside setCurrent()
//   client.mockResolvedValueOnce([currentChallengeInfo])
//   // for simplicity, do not use tmx service, that needs different tests
//   process.env.USE_TMX = 'NO'
//   // call most methods in the class
//   await ChallengeService.initialize(repo)

//   // assert that the first parameter of repo.add() is the challenge list (wrapped in an array)
//   expect(capture(mockedRepo.add).first()).toStrictEqual(list)
//   // verify that repo.add() is called exactly once
//   // verify(mockedRepo.add(notNull())).once()
//   // assert that the current track actually gets set to the correct one
//   expect(ChallengeService.current).toEqual(current)
//   // verify that TMXService.fetchTrack() is never called
//   expect(tmx).toHaveBeenCalledTimes(0)
// })

// test('invalid getList() - error getting challenge list from client', async () => {
//   // throw some error instead of returning ChallengeList
//   client.mockRejectedValue(Error('dont work'))
//   await ChallengeService.initialize(repo)
//   // verify that repo.add() is never called
//   verify(mockedRepo.add(anything())).never()
// })

// /* test('invalid current', async () => {
//   await ChallengeService.initialize(repo)
//   client.mockResolvedValueOnce([track1, track2])
//   client.mockRejectedValueOnce(Error('fuck'))
//   await ChallengeService.push()
//   /*const list = [
//     new Challenge('a', 'track1', 'Nadeo', 'Bay'),
//     new Challenge('b_21', 'Map 21', 'miapetardez', 'Stadium')
//   ]
//   //expect(capture(mockedRepo.add).first()[0]).toStrictEqual(list)
//   //verify(mockedRepo.add(anything())).once()
//   //verify(game).once()
// }) */
