/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        ink: '#0a0a0a',
        ink2: '#0b0b0b',
        paper: '#EFEFEF',
        cream: '#f5f2ed',
        creamtext: '#141414',
        accent: '#b0704f',
        rust: '#9f4920',
        sage: '#788c8c',
        lavender: '#a697c6',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      transitionTimingFunction: {
        expo: 'cubic-bezier(0.83, 0, 0.17, 1)',
      },
    },
  },
  plugins: [],
};
