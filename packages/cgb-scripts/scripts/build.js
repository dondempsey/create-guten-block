/**
 * Start
 *
 * The create-guten-block CLI starts here.
 *
 * TODO:
 *  - checkRequiredFiles
 *  - printBuildError
 */
'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on( 'unhandledRejection', err => {
	throw err;
} );

const ora = require( 'ora' );
const chalk = require( 'chalk' );
const webpack = require( 'webpack' );
const config = require( '../config/webpack.config.prod' );
const clearConsole = require( '../../cgb-dev-utils/clearConsole' );
const formatWebpackMessages = require( '../../cgb-dev-utils/formatWebpackMessages' );

clearConsole();

// Init the spinner.
const spinner = new ora( {
	text: '',
	enabled: true,
} );
// Create the production build and print the deployment instructions.
async function build( webpackConfig ) {
	spinner.start( `${ chalk.dim( 'Building and compiling blocks...' ) }` );

	// Compiler Instance.
	const compiler = await webpack( webpackConfig );
	spinner.succeed();

	compiler.run( {}, ( err, stats ) => {
		if ( err ) {
			return console.log( err );
		}

		// Get the messages formatted.
		const messages = formatWebpackMessages( stats.toJson( {}, true ) );

		// If there are errors just show the errors.
		if ( messages.errors.length ) {
			// Only keep the first error. Others are often indicative
			// of the same problem, but confuse the reader with noise.
			if ( messages.errors.length > 1 ) {
				messages.errors.length = 1;
			}
			// Formatted errors.
			clearConsole();
			console.log( '\n❌ ', chalk.black.bgRed( ' Failed to compile. \n' ) );
			const logErrors = console.log( '\n👉 ', messages.errors.join( '\n\n' ) );
			return logErrors;
		}

		// CI.
		if (
			process.env.CI &&
			( typeof process.env.CI !== 'string' ||
				process.env.CI.toLowerCase() !== 'false' ) &&
			messages.warnings.length
		) {
			console.log(
				chalk.yellow(
					'\nTreating warnings as errors because process.env.CI = true.\n' +
						'Most CI servers set it automatically.\n'
				)
			);
			return console.log( messages.warnings.join( '\n\n' ) );
		}

		clearConsole();

		return console.log( '\n✅ ', chalk.black.bgGreen( ' Built successfully! \n' ) );
	} );
}

build( config );
