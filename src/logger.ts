import fs from 'fs';

export class Logger {

    private static FILEPATH = 'log.txt'
    private static LOGGERFILENAME = 'src/logger.ts'
    private logCount: number 
    public srcFilename: string 

    constructor(srcFilename: string) {
        this.srcFilename = srcFilename
        this.initialize()
    }

    private async initialize() {
        const logExists = await this.logFileExists()
        if (logExists) this.logCount = await this.getLogCount()
        else {
            this.createLogFile()
            this.logCount = 0
        }
    }

    private async logFileExists(): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            fs.promises.access(Logger.FILEPATH, fs.constants.F_OK)
                .then(ok => resolve(true))
                .catch(err => resolve(false))
        })
    }

    private createLogFile() {
        fs.writeFile(Logger.FILEPATH, '', 'utf8', (err) => {
            if (err) console.error(`Error creating Log file ${Logger.LOGGERFILENAME}: ${err}`)
            else console.log(`File "${Logger.FILEPATH}" has been created with the content.`)
        })
    }

    private getLogCount(): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            fs.readFile(Logger.FILEPATH, 'utf8', (err, data) => {
                if (err) reject(err)
                else {
                    const lines = data.split('\n')
                    for (let i = lines.length - 1; i >= 0; i--) {
                        const match = lines[i].match(/^\d+/);
                        if (match) resolve(parseInt(match[0]))
                    }
                }
            })
        })
    }

    private writeToLog(text: string) {
        fs.promises.appendFile(Logger.FILEPATH, text)
            .catch(err => console.error(`cannot write to log file ${Logger.FILEPATH}, ${Logger.LOGGERFILENAME}: ${err}`))
    }

    handle(error: any, line_or_function?: string, comment?: string) {
        const logMsg = `${++this.logCount} - ${this.srcFilename} ${line_or_function} - ${comment} - ${error}\n\n`
        console.error(logMsg)
        this.writeToLog(logMsg)
    }
}