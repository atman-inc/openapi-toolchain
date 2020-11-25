#!/usr/bin/env node

const fs = require('fs')
const package = require('./package.json')
const { program } = require('commander')
const resolveAllOf = require('json-schema-resolve-allof')
const chokidar = require('chokidar')

pm = program.version(package.version)

pm.command('start <swaggerFile>')
    .option('-p, --port <port>', 'port for using by swagger-ui', '8000')
    .option('-h, --host <host>', 'host for using by swagger-ui', '0.0.0.0')
    .option('-c, --config <config>', 'JSON file containing any of the Swagger UI options. Example: {"withCredentials": true}')
    .option('--open', 'Open the view page in the default browser', false)
    .action((swaggerFile, cmd) => {
        const swaggerUIOptions = cmd.config ? JSON.parse(fs.readFileSync(program.config).toString()) : {}
        require('swagger-ui-watcher').start(
            swaggerFile,
            undefined,
            parseInt(cmd.port),
            cmd.host,
            cmd.open,
            swaggerUIOptions
        )
    })

pm.command('bundle <inFile> <outPath>')
    .action(async (inFile, outPath) => {
        try {
            fs.unlinkSync(outPath)
        } catch {
            // NOP
        } finally {
            fs.closeSync(fs.openSync(outPath, 'w'));
        }
        const watcher = chokidar.watch(outPath)

        await new Promise((resolve, reject) => {
            watcher.on('change', () => {
                const json = JSON.parse(fs.readFileSync(outPath, 'utf8').toString())
                const out = resolveAllOf(json)

                fs.writeFileSync(outPath, JSON.stringify(out, null, 2))
                watcher.close().then(resolve).catch(reject)
            })

            require('swagger-ui-watcher').build(
                inFile,
                undefined,
                outPath
            )
        }).catch((e) => {
            console.error(`failed to create bundle: ${e}`)
            watcher.close().then(() => {
                fs.unlinkSync(outPath)
            })
        })
    })

pm.parse(process.argv);