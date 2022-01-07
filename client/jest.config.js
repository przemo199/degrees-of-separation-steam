/** @type {import("ts-jest/dist/types").InitialOptionsTsJest} */
export default {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  extensionsToTreatAsEsm: [".svelte"],
  transform: {
    "^.+\\.ts$": "ts-jest",
    "^.+\\.svelte$": [
      "svelte-jester",
      {
        preprocess: true
      }
    ]
  },
  moduleFileExtensions: [
    "js",
    "ts",
    "svelte"
  ],
  setupFilesAfterEnv: [
    "@testing-library/jest-dom/extend-expect"
  ]
};
