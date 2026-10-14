import nextVitals from 'eslint-config-next/core-web-vitals';

export default [
	...nextVitals,
	{
		rules: {
			// Existing hooks intentionally hydrate browser capabilities after mount.
			'react-hooks/set-state-in-effect': 'off',
		},
	},
];
