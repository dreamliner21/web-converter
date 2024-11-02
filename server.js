const express = require("express");
const path = require("path");
const app = express();
const PORT = 505; // Menggunakan format desimal untuk port 505

app.use(express.json());
app.use(express.static("public"));

// Fungsi konversi
function convertCJSToESM(code) {
    let result = code
        .replace(/const (\w+) = require\(['"](.+?)['"]\);?/g, 'import $1 from \'$2\';')
        .replace(/let (\w+) = require\(['"](.+?)['"]\);?/g, 'import $1 from \'$2\';')
        .replace(/var (\w+) = require\(['"](.+?)['"]\);?/g, 'import $1 from \'$2\';')
        .replace(/module\.exports\s*=\s*({?.*}?);?/g, 'export default $1;')
        .replace(/exports\.(\w+)\s*=\s*(\w+);?/g, 'export const $1 = $2;');

    // Tambahkan export default jika tidak ada module.exports
    if (!/export default/.test(result)) {
        result += '\nexport default {};';
    }

    return result;
}

function convertESMToCJS(code) {
    let result = code
        .replace(/import (\w+) from ['"](.+?)['"];/g, 'const $1 = require(\'$2\');')
        .replace(/import \* as (\w+) from ['"](.+?)['"];/g, 'const $1 = require(\'$2\');')
        .replace(/import \{(.*?)\} from ['"](.+?)['"];/g, (match, p1, p2) => {
            const imports = p1.split(',').map(i => i.trim());
            return `const { ${imports.join(', ')} } = require('${p2}');`;
        })
        .replace(/export default (\w+);?/g, 'module.exports = $1;')
        .replace(/export const (\w+) = (\w+);?/g, 'exports.$1 = $2;');

    // Tambahkan module.exports jika tidak ada export default
    if (!/module\.exports/.test(result)) {
        result += '\nmodule.exports = {};';
    }

    return result;
}

// Route untuk konversi
app.post("/convert", (req, res) => {
    const { code, type } = req.body;

    if (!code) {
        return res.status(400).send("Masukkan kode yang ingin diubah");
    }

    let result;
    if (type === "toesm") {
        if (!code.includes("require") && !/module\.exports/.test(code)) {
            return res.status(400).send("Kode tidak valid: tidak mengandung 'require' atau 'module.exports' untuk konversi ke ESM");
        }
        result = convertCJSToESM(code);
    } else if (type === "tocjs") {
        if (!code.includes("import") && !/export default/.test(code)) {
            return res.status(400).send("Kode tidak valid: tidak mengandung 'import' atau 'export default' untuk konversi ke CJS");
        }
        result = convertESMToCJS(code);
    } else {
        return res.status(400).send("Tipe konversi tidak valid");
    }

    res.send(result);
});

// Redirect semua request lain ke index.html
app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "index.html")); // pastikan index.html di root
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
