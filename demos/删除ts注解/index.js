const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { parse } = require('@vue/compiler-sfc');
const babel = require('@babel/core');

/**
 * 核心逻辑：使用 Babel 剥离 TS 类型
 */
function stripTypes(code, fileName) {
    try {
        const result = babel.transformSync(code, {
            filename: fileName,
            configFile: false,
            babelrc: false,
            presets: [
                ['@babel/preset-typescript', {
                    isTSX: false,
                    allExtensions: true,
                    onlyRemoveTypeImports: true
                }]
            ],
            // 顺便把代码中的 import './file.ts' 替换为 './file.js'
            plugins: [
                function replaceTsExtension() {
                    return {
                        visitor: {
                            'ImportDeclaration|ExportNamedDeclaration|ExportAllDeclaration'(path) {
                                if (path.node.source && path.node.source.value.endsWith('.ts')) {
                                    path.node.source.value = path.node.source.value.replace(/\.ts$/, '.js');
                                }
                            }
                        }
                    };
                }
            ],
            retainLines: true,
            generatorOpts: { shouldPrintComment: () => true }
        });
        return result ? result.code : code;
    } catch (err) {
        console.error(`❌ Babel 转换错误 [${fileName}]:`, err.message);
        return code;
    }
}

/**
 * 处理 .vue 文件内容
 */
function processVueFile(file, content) {
    const { descriptor } = parse(content);
    let newContent = content;

    const scripts = [descriptor.script, descriptor.scriptSetup].filter(Boolean);
    scripts.forEach(script => {
        if (script.lang === 'ts') {
            const jsCode = stripTypes(script.content, file);
            // 替换代码块并移除 lang="ts"
            newContent = newContent.replace(script.content, `\n${jsCode}\n`);
        }
    });

    // 移除 vue 模板中的 lang="ts" 标识
    newContent = newContent.replace(/\s?lang=["']ts["']/g, '');
    return newContent;
}

function main() {
    // 1. 获取并规范化路径 (处理绝对路径和相对路径)
    const rawIn = process.argv[2];
    const rawOut = process.argv[3];

    if (!rawIn || !rawOut) {
        console.log('\x1b[33m%s\x1b[0m', '用法: node convert-project.js <输入目录> <输出目录>');
        process.exit(1);
    }

    const resolvedIn = path.resolve(process.cwd(), rawIn);
    const resolvedOut = path.resolve(process.cwd(), rawOut);
    const isSameDir = resolvedIn === resolvedOut;

    if (!fs.existsSync(resolvedIn)) {
        console.error(`❌ 错误: 输入目录不存在 -> ${resolvedIn}`);
        process.exit(1);
    }

    // 2. 扫描文件
    const files = glob.sync(`**/*.{vue,ts}`, {
        cwd: resolvedIn,
        absolute: true,
        ignore: ['**/*.d.ts', '**/node_modules/**']
    });

    console.log(`🚀 根目录: ${resolvedIn}`);
    console.log(`📦 目标目录: ${resolvedOut}`);
    console.log(`📄 待处理文件: ${files.length} 个\n`);

    files.forEach(file => {
        const ext = path.extname(file);
        const relativePath = path.relative(resolvedIn, file);
        let targetPath = path.join(resolvedOut, relativePath);
        const content = fs.readFileSync(file, 'utf-8');

        let finalContent = '';

        if (ext === '.vue') {
            finalContent = processVueFile(file, content);
        } else if (ext === '.ts') {
            finalContent = stripTypes(content, file);
            targetPath = targetPath.replace(/\.ts$/, '.js');
        }

        // 3. 写入文件
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
        fs.writeFileSync(targetPath, finalContent, 'utf-8');

        // 4. 如果原位操作，清理旧的 .ts 文件
        if (isSameDir && ext === '.ts') {
            fs.unlinkSync(file);
            console.log(`🗑️  已转换并删除原 TS: ${relativePath}`);
        } else {
            console.log(`✅ 已处理: ${relativePath}`);
        }
    });

    console.log('\n\x1b[32m%s\x1b[0m', '✨ 任务全部完成！');
}

main();
