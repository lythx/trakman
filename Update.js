// Update script (mostly) for docker purposes, if you use git, just do `git pull` instead
// Usage: to perform update: `node Update.js <new version's .hashes.json>`
// To generate hashes for files currently present: `node Update.js`
// Exits with code 0 if successful, code 1 if an error occurred, code 2 if there are conflicts
import fs from 'node:fs/promises'
import crypto from 'node:crypto'
import path from 'node:path'

if (process.argv.length < 3) {
  const hashes = JSON.stringify(Object.fromEntries(await generateHashes()))
  console.log('Writing hashes to file...')
  try {
    await fs.writeFile('.hashes.json', hashes, { encoding: 'utf-8' })
    console.log('Hashes written.')
    process.exit()
  } catch(e) {
    console.log('Failed to write hashes to file.')
    console.log(e)
    process.exit(1)
  }
}

try {
  const newHashes = new Map(Object.entries(JSON.parse(await fs.readFile(process.argv[2], { encoding: 'utf-8' }))))
  const fromPath = path.dirname(process.argv[2])
  try {
    const oldHashes = new Map(Object.entries(JSON.parse(await fs.readFile('.hashes.json', { encoding: 'utf-8' }))))
    if (oldHashes.has('__generated__') && oldHashes.get('__generated__') > newHashes.get('__generated__')) {
      console.log('Local version newer than update, skipping...')
      process.exit()
    }
    await doUpdate(fromPath, newHashes, oldHashes)
  } catch(e) {
    console.log('.hashes.json file does not exist.')
    await doUpdate(fromPath, newHashes)
  }
} catch(e) {
  console.log('Failed to update Trakman.')
  console.log('Usage: node Update.js <new version\'s hashes.json>')
  console.log(e)
  process.exit(1)
}

async function hashFile(path) {
  const hash = crypto.createHash('md5')
  hash.setEncoding('base64')
  try {
    const f = await fs.readFile(path, { encoding: 'utf-8' })
    hash.write(f)
    hash.end()
    return hash.read()
  } catch(e) {
    console.log('Cannot read file ' + path)
    return ''
  }
}

async function generateHashes() {
  console.log('Generating hashes for current files...')
  const entries = (await fs.readdir('./src', { recursive: true, withFileTypes: true }))
  .concat(await fs.readdir('./plugins', { recursive: true, withFileTypes: true }))
  .concat(await fs.readdir('./config', { recursive: true, withFileTypes: true }))

  const res = new Map(
    await Promise.all(entries.filter(a => a.isFile() && (a.name.endsWith('.js') || a.name.endsWith('.ts')))
    .map(async (a) => {
      const p = path.join(a.parentPath, a.name)
      return [p, await hashFile(p)]
    })))
  for (const name of ['Plugins.ts', 'package.json', 'tsconfig.json', 'CHANGELOG.md', 'Update.js']) {
    res.set(name, await hashFile(name))
  }
  res.set('__generated__', Date.now())
  console.log('Hashes generated.')
  return res
}

async function doUpdate(fromPath, newHashes, oldHashes = null) {
  const currHashes = await generateHashes()
  const conflicts = []
  let errorOccurred = false
  let updatePerformed = false
  for (const file of newHashes.keys()) {
    if (file === '__generated__') {
      continue
    }
    const newHash = newHashes.get(file)
    const fullFromPath = path.join(fromPath, file)
    try {
      // NICE NOT AT ALL CONFUSING IF STATEMENTS!!!
      if (currHashes.has(file) && currHashes.get(file) !== newHash && currHashes.get(file) !== '') {
        if (oldHashes !== null && oldHashes.has(file)) {
          if (oldHashes.get(file) === newHash) {
            // no update since only the user's file is different (X Y X)
            continue
          } else if (oldHashes.get(file) === currHashes.get(file)) {
            // normal update since user didn't alter the file (X X Y)
            updatePerformed = true
            await fs.copyFile(fullFromPath, file)
            continue
          }
        }
        // copy the new file with the .new extension since the user modified the file, and it might have been updated (X Y Z)
        conflicts.push(file)
        updatePerformed = true
        await fs.copyFile(fullFromPath, file + '.new')
      } else if (!currHashes.has(file) || currHashes.get(file) === '') {
        // the file exists in the new version and not in the old
        // make sure the directory exists
        updatePerformed = true
        await fs.mkdir(path.dirname(file), { recursive: true })
        await fs.copyFile(fullFromPath, file)
      }
      // otherwise the file is already what it needs to be, no need to update it
    } catch(e) {
      console.log('Could not copy file ' + file)
      console.log(e)
      errorOccurred = true
    }
  }
  // copy new hashes so you only have to update once
  try {
    await fs.copyFile(process.argv[2], '.hashes.json')
  } catch(e) {
    console.log('Failed to copy new hashes.')
    console.log(e)
    process.exit(1)
  }
  if (errorOccurred) {
    console.log('Errors occurred during update, exiting...')
    process.exit(1)
  }
  let log = 'Update successful!'
  if (conflicts.length > 0) {
    console.log('!!! Update conflicts, make sure to fix them by comparing your files to files ending in .new !!!')
    console.log('If you do not fix these conflicts, the controller might fail to start or crash.')
    console.log('Affected files: ')
    log = 'Update did not succeed because of conflicts. Please merge the following files manually:\n'
    conflicts.forEach(name => {
      console.log(name)
      log += name + '\n'
    })
    console.log('_____________________________________')
  }
  try {
    await fs.writeFile('update.log', log, { encoding: 'utf-8' })
  } catch(e) {
    console.log('Failed to write update log.')
    console.log(e)
  }
  if (conflicts.length > 0) { process.exit(2) }
  if (updatePerformed) {
    console.log('Update successful.')
  } else {
    console.log('Update not necessary.')
  }
  process.exit()
}
