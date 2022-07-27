module.exports = {
    preset: "ts-jest",
    roots: [
        "<rootDir>/src"
    ],
    transformIgnorePatterns: [
        "node_modules/(?!(@arcgis)/)"
    ]
};