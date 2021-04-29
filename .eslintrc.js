module.exports = {
    extends: [require.resolve("@vertigis/workflow-sdk/config/.eslintrc")],
    ignorePatterns: ["**/__mocks__/*.ts", "**/__tests__/*.ts"],
    plugins: ["prettier"],
    rules: {
        "prettier/prettier": "error"
    },
};
