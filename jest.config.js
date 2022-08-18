module.exports = {
    preset: "ts-jest",
    roots: [
        "<rootDir>/src"
    ],
    transform: {
        "^.+\\.(t|j)sx?$": "ts-jest",
    },
    transformIgnorePatterns: [
        "node_modules/(?!(@arcgis)/)"
    ]
};