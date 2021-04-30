module.exports = {
    extends: [require.resolve("@vertigis/workflow-sdk/config/.eslintrc")],
    overrides: [
        {
            files: ["**/__mocks__/*.ts", "**/__tests__/*.ts"],
            rules: {
                "@typescript-eslint/no-non-null-assertion": "off",
                "@typescript-eslint/no-unused-vars": "off"
            }
        },
    ],
    plugins: ["prettier"],
    rules: {
        "prettier/prettier": "error"
    },
};
