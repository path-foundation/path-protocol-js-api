module.exports = {
    "extends": "airbnb",
    "env": {
        "node": true,
        "es6": true,
        "mocha": true
    },
    "globals": {
        "document": false,
        "window": false,
        "fetch": false
    },
    // overrides
    "rules": {
        // error
        "indent": [2, 4, { "SwitchCase": 1 }],
        "comma-dangle": ["error", {
            "arrays": "always-multiline",
            "objects": "always-multiline",
            "imports": "always-multiline",
            "exports": "always-multiline",
            "functions": "ignore"
        }],
        // off
        "no-console": "off",
        "no-plusplus": "off",
        "id-length": "off",
        "func-names": "off",
        "spaced-comment": "off",
        "no-unused-expressions": "off",
        "one-var": "off",
        "react/jsx-indent": "off",
        "import/no-extraneous-dependencies": "off",
        "react/jsx-filename-extension": "off",
        "react/jsx-no-bind": "off",
        "jsx-a11y/label-has-for": "off",
        "arrow-parens": "off",
        "class-methods-use-this": "off",
        "react/jsx-curly-spacing": "off",
        "react/forbid-prop-types": "off",
        "react/jsx-no-target-blank": "off",
        "import/no-named-as-default": "off",
        "react/no-array-index-key": "off",
        "import/prefer-default-export": "off",
        // warn
        "strict": "warn",
        "max-len": "off",
        "no-lonely-if": "warn",
        "react/no-unused-prop-types": "warn",
        "react/no-string-refs": "warn",
        "jsx-a11y/no-static-element-interactions": "warn",
        "no-confusing-arrow": "warn",
        "react/require-default-props": "warn"
    }
};