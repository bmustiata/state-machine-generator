import { red, yellow } from 'colors'
import * as path from 'path'
import * as fs from 'fs'
import * as mkdirp from 'mkdirp'
import klawSync = require('klaw-sync')

import { StateModel, readStateModel } from './Model'
import { isSimpleTemplate, applyTemplate, createPackageFolder } from './Template'

const templateName = process.argv[2]
const fileName = process.argv[3]

if (!fileName || !templateName) {
    console.error(red('You need to pass in a template and a model to process. (yml file)'))
    console.error(yellow('state-machine-generator TEMPLATE_NAME YML_FILE'))
    process.exit(1)
}

const model = readStateModel(fileName)

let templateFolder

if (isSimpleTemplate(templateName)) {
    console.log(`__dirname is ${__dirname}`)
    templateFolder = path.resolve(path.join(
        __dirname, '../src/templates/', templateName,'/'))
} else {
    templateFolder = templateName
}

const targetFolder = path.join('.', createPackageFolder(model.package))

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
            filePath,
            model
        );
    })

