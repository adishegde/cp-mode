'use babel';

import { exec } from "child_process";
import promisify from "util.promisify";
import * as path from "path";

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
 *
 * Also child_process.exec is used for running commands while
 * redirection operators '<' and '>' are used for file I/O.
 * Thus large outputs will not work.
*/


// Program names for compiling/running
const GCC = 'gcc';
const GPP = 'g++';
const PYTHON = 'python';
const DEF_EXEC_NAME = (process.platform != "win32")?('a.out'):('a.exe');

// Promisify exec
var runShell = promisify(exec);

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
     *                       with the name 'a.out'. (only for 'C' and
     *                       'C++' files)
    */
    constructor(fileName, lang, executableName) {
        this.fileName = fileName;
        this.lang = lang;

        this.executableName = executableName;
        if(this.executableName == undefined) {
            this.executableName = path.join(path.dirname(this.fileName), DEF_EXEC_NAME);
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
     * In case of error check the 'stderr' property of Promised object
     * for error message.
     *
     * In case of warnings, the promise is not rejected but the the
     * stderr property is set to the warning.
    */
    compileCode(){
        let compiler = GCC;
        if(this.lang == 'cpp'){
            compiler = GPP;
        }

        // Constructing the compile command
        let compileCmd = `${compiler} -o "${this.executableName}" "${this.fileName}"`;

        // LOG
        console.log("Command used for compilation: ", compileCmd);

        // Compiling
        return runShell(compileCmd);
    }

    /* Function to be called to execute program.
     *
     * Return Value:
     *      A Promise for an object with stdout and stderr
     *      properties. In case of error a rejected Promise is returned
     *      with the error object having stdout and stderr properties.
     *
     * Parameters:
     *      inputFileName: Name of the file that contains the input
     *                     to the program. If undefined then no input
     *                     is given to the program.
     *      outputFileName: Name of the file that the output should be
     *                      written to. If undefined then the Promise
     *                      returned by the fuction is the only way to
     *                      access the output. If not undefined then
     *                      the promise's stdout will mostly be empty.
     *
     * In case of error check the 'stderr' property of Promised object
     * for error message. The error is not written into the output file
     * and is left for the user to handle.
    */
    executeCode(inputFileName, outputFileName) {
        let runCmd;
        if(this.lang == 'py') {
            // In case of python use the interpretter
            runCmd = `${PYTHON} "${this.fileName}"`;
        }
        else {
            // In case of C and C++ run executable
            runCmd = `"${this.executableName}"`;
        }

        if(inputFileName != undefined) {
            // Redirect input to program if
            // inputFileName is given
            runCmd += ` <"${inputFileName}"`;
        }

        if(outputFileName != undefined) {
            // Redirect output to outputFileName
            // if it is not undefined
            runCmd += ` >"${outputFileName}"`;
        }

        // LOG
        console.log("Command used for running program: ", runCmd);

        // Execute "runCmd"
        return runShell(runCmd);
    }
}
