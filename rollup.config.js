import typescript from 'rollup-plugin-typescript';

var outro = `
Object.defineProperty( exports, 'AudioContext', {
	get: function () {
		return exports.getAudioContext();
	}
});`;

function glsl () {
	return {
		transform ( code, id ) {
			if ( !/\.glsl$/.test( id ) ) return;

			var transformedCode = 'export default ' + JSON.stringify(
				code
					.replace( /[ \t]*\/\/.*\n/g, '' )
					.replace( /[ \t]*\/\*[\s\S]*?\*\//g, '' )
					.replace( /\n{2,}/g, '\n' )
			) + ';';
			return {
				code: transformedCode,
				map: { mappings: '' }
			}
		}
	};
}

export default {
	entry: 'src/Three.ts',
	indent: '\t',
	plugins: [
		typescript({ typescript: require('typescript'), target: 'es5' }),
		glsl()
	],
	targets: [
		{
			format: 'umd',
			moduleName: 'THREE',
			dest: 'build/three.js',
			sourceMap: true
		},
		{
			format: 'es',
			dest: 'build/three.modules.js',
			sourceMap: true
		}
	],
	outro: outro
};
