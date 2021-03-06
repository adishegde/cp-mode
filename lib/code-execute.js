'use babel';

import {
    exec,
    spawn
} from 'child_process';
import { lstat } from 'fs';
import promisify from 'util.promisify';
import * as log from 'loglevel';
import * as path from 'path';
import { hrtime } from 'process';

/* CodeExecute class can be used to execute code and get the output.
 * Currently the following type files are supported:
 *      1. C
 *      2. C++
 *      3. Python
 *
 * The code relies on GCC compilers and pyton interpretters.
 * On Windows use MinGW.
 *
 * The main role of the class is to execute the program. It is the
 * responsibility of the user to pass the correct file names.
 * Minimal checking is done on the validity of file names or
 * the paths of files.
 */


// Program names for compiling/running
const GCC = 'gcc';
const GPP = 'g++';
const PYTHON = 'python';
const DEF_EXEC_NAME = (process.platform != "win32")?('a.out'):('a.exe');
const TIMEOUT = 5000; // Timeout in milliseconds

// Promisify exec
var execPromisified = promisify(exec);
var lstatPromisified = promisify(lstat);

// Helper function to extract stdout and stderr from child process instance
function extractStreamsAsString(childProcess) {
    // Extract output and error as strings from streams
    var stdout = childProcess.stdout.read();
    var stderr = childProcess.stderr.read();

    if(stdout) stdout = stdout.toString();
    else stdout = '';

    if(stderr) stderr = stderr.toString();
    else stderr = '';

    return {
        stdout,
        stderr
    };
}

export default class CodeExecute {
    /* Constructor for the class. Each object is bound to
     * one source file and one executable.
     *
     * Parameters:
     *      fileName: the name of the file
     *      lang: the programming language. Althought it can be
     *            inferred from extention of file, due to different
     *            possible extentions for the same language it has
     *            been made a parameter.
     *
     *            Possible options:
     *                  1. c (for C files)
     *                  2. cpp (for C++ files)
     *                  3. py (for Python files)
     *       executableName: Name of the executable file. In case
     *                       it is undefined the executable is placed
     *                       in the same directory as the source code
     *                       with the name 'a.out' (or 'a.exe' for Windows)
     *                       (only for 'C' and 'C++' files)
     */
    constructor(fileName, lang, executableName) {
        this.fileName = fileName;
        this.lang = lang;

        this.executableName = executableName;
        if(this.executableName == undefined) {
            this.executableName = path.join(
                path.dirname(this.fileName),
                DEF_EXEC_NAME
            );
        }
    }

    /* Use to compile C and C++ code. Seperated from execute code
     * for efficiency.
     *
     * Return Value:
     *      A Promise for an object with stdout and stderr
     *      properties. In case of error a rejected Promise is returned
     *      with the error object having stdout and stderr properties.
     *      Here the stdout and stderr properties correspond to the
     *      output and error of the compilation command.
     *
     * In case of error check the 'stderr' property of Promise resolved value
     * for error message.
     *
     * In case of warnings, the promise is not rejected but the the
     * stderr property is set to the warning.
     */
    compileCode() {
        var compiler = GCC;
        if(this.lang == 'cpp'){
            compiler = GPP;
        }

        // Constructing the compile command
        var compileCmd = `${compiler} -o "${this.executableName}" "${this.fileName}"`;

        log.debug("Command used for compilation: ", compileCmd);
        log.info("Compiling code");

        // Compiling
        return execPromisified(compileCmd);
    }

    /* Function to be called to execute program.
     *
     * Return Value:
     *      A Promise for an object with stdout and stderr
     *      properties. In case of error a rejected Promise is returned
     *      with the error object having stdout and stderr properties.
     *
     * Parameters:
     *      input: String containing input to the file
     *
     * In case of error check the 'stderr' property of Promised object
     * for error message.
     */
    async executeCode(input) {
        // Prepare arguments to spawn
        var runCmd;
        if(this.lang == 'py') {
            // In case of python use the interpretter
            runCmd = [PYTHON, [this.fileName]];
        }
        else {
            // In case of C and C++ run executable
            runCmd = [this.executableName];
        }

        log.debug("Command used for running program: ", runCmd);
        log.info("Running program");

        // New promise for executing program
        let programRunPromise = new Promise((resolve, reject) => {
            // Reset timer
            let timer = hrtime();
            // Spawn new process for running program
            let newProcess = spawn(...runCmd);
            let isProcessComplete = false;

            // Register error handler
            newProcess.on('error', (err) => {
                log.error(
                    'An error occurred while executing the program in code-execute.js: ',
                    err
                );

                // Add stdout and stderr keys to err
                err = Object.assign(err, extractStreamsAsString(newProcess));

                // Reject promise with error object
                reject(err);
            });

            // On exit event of newProcess resolve/reject promise
            newProcess.on('exit', () => {
                // Get time elapsed
                let time = hrtime(timer);
                time = (time[1] / 1000000) + time[0] * 1000;

                isProcessComplete = true;

                // resolve the promise
                resolve({
                    output: extractStreamsAsString(newProcess),
                    time
                });
            });

            // Write input text into stream
            newProcess.stdin.write(input);
            newProcess.stdin.end();

            // Set timeout to program
            setTimeout(
                () => {
                    // Kill child process if still running
                    if(!isProcessComplete) {
                        reject("Program took too long to finish execution");
                        newProcess.kill();
                        log.info("Killed program due to timeout");
                    }
                },
                TIMEOUT
            );
        });

        // Promise for getting source file stats
        let sourceFileStatPromise = lstatPromisified(this.fileName);

        // Wait for both promises to resolve
        // If any of the promises is rejected then the function returns a
        // rejected Promise
        let [result, sourceStat] = await Promise.all([
            programRunPromise,
            sourceFileStatPromise
        ]);

        // Add source file size to result
        result.sourceMemory = sourceStat.size;

        return result;
    }
}
