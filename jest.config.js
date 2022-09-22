module.exports = {
  roots: ["<rootDir>"],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/fileTransformer.js',
    "<src>(.*)$": "<rootDir>/src/$1",
    "\\.(css|less)$": "identity-obj-proxy"
  },
  coverageReporters:[ 'text', 'cobertura'],
  collectCoverage: false,
  collectCoverageFrom: [
    "src/**/*.{ts,tsx,js,jsx}"
  ],
  coveragePathIgnorePatterns: [
    "src/stories/*",
    "src/types/*"
  ],
  setupFiles:["dotenv/config"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],    
  bail: true,  
  bail: 3 // stop after 3 failed tests
};

