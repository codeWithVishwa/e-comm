// tailwind.config.js
export const content = ["./src/**/*.{js,jsx,ts,tsx}"];
export const theme = {
    extend: {
        animation: {
        ringing: 'ringing 0.5s infinite',
      },
      keyframes: {
        ringing: {
          '0%': { transform: 'rotate(0deg)' },
          '15%': { transform: 'rotate(15deg)' },
          '30%': { transform: 'rotate(-15deg)' },
          '45%': { transform: 'rotate(10deg)' },
          '60%': { transform: 'rotate(-10deg)' },
          '75%': { transform: 'rotate(5deg)' },
          '85%': { transform: 'rotate(-5deg)' },
          '92%': { transform: 'rotate(2deg)' },
          '100%': { transform: 'rotate(0deg)' },
        }
      }
        
    },
};
export const plugins = [];