import { red } from 'colors'
import * as path from 'path'
import * as fs from 'fs'
import * as mkdirp from 'mkdirp'
import klawSync = require('klaw-sync')

import { StateModel, readStateModel } from './model/State'

const fileName = process.argv[2]

if (!fileName) {
    console.error(red('You need to pass in a model to process. (yml file)'))
    process.exit(1)
}

/**
 * 
 * @param packageName The folder sub structure to create.
 */
function createPackageFolder(packageName: string) : string {
    console.log(`package: ${packageName}`)
    const folder = packageName.replace(/\./g, '/')
    mkdirp.sync(folder)

    return folder
}

const model = readStateModel(fileName)

const targetFolder = path.join('.', createPackageFolder(model.package))
const templateFolder = path.resolve(path.join('.', __dirname, 'templates/java/'))

/**
 * Write the template file.
 * @param templateFilePath The source template.
 * @param targetFilePath The target file to write.
 */
function applyTemplate(templateFilePath, targetFolder, filePath) {
    filePath = filePath.replace(/Xyz/g, model.name)
    
    const targetFilePath = path.join(targetFolder, filePath);

    let fileContent = fs.readFileSync(templateFilePath, 'utf-8')

    fileContent = fileContent.replace(/Xyz/g, model.name)
    fileContent = fileContent.replace(/com\.ciplogic\.statemachine/g, model.package)

    fs.writeFileSync(targetFilePath, fileContent, {encoding: 'utf-8'})
}

klawSync(templateFolder, { nofile: true })
    .map(file => file.path.substring(templateFolder.length + 1))
    .forEach(folderPath => {
        folderPath = folderPath.replace(/Xyz/g, model.name)
        mkdirp.sync(path.join(targetFolder, folderPath))
    })


klawSync(templateFolder, { nodir: true })
    .map(file => file.path.substring(templateFolder.length + 1))
    .forEach(filePath => {
        applyTemplate(
            path.join(templateFolder, filePath),
            targetFolder,
            filePath
        );
    })

