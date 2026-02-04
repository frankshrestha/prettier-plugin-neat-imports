#!/usr/bin/env node
import fs from 'fs';

function exitWith(message: string): never {
    console.info(message);
    process.exit(0);
}

function findFile() {
    try {
        return require.resolve('prettier-plugin-tailwindcss', {
            paths: [__dirname],
        });
    } catch (error) {
        exitWith('prettier-plugin-tailwidndcss not found.');
    }
}

const file = findFile();
const content = fs.readFileSync(file, 'utf8');
const isPatched = /@frankshrestha\/prettier-plugin-neat-imports/.test(content);

if (isPatched) {
    exitWith('prettier-plugin-tailwidndcss already patched.');
}

const patched = content.replace(
    /"@ianvs\/prettier-plugin-sort-imports"/,
    `"@frankshrestha/prettier-plugin-neat-imports","@ianvs/prettier-plugin-sort-imports"`,
);

if (patched !== content) {
    fs.writeFileSync(file, patched, 'utf8');
    exitWith('prettier-plugin-tailwidndcss patched successfully.');
}
