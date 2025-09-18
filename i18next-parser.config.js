module.exports = {
    locales: ["en", "it"],
    output: "src/i18n/messages/$LOCALE.json",
    defaultNamespace: "common",
    namespaceSeparator: false, // <--- evita che Navbar:home diventi annidato male
    keySeparator: false, // <--- evita che t("Navbar.home") divida la chiave
    lexers: {
        js: ["JavascriptLexer"],
        jsx: ["JsxLexer"],
        ts: ["JavascriptLexer"],
        tsx: ["JsxLexer"],
    },
    indentation: 2,
};
