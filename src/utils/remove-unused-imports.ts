// This file is derived from the MIT-licensed project by Simon Hänisch.
// Original source: https://github.com/simonhaenisch/prettier-plugin-organize-imports
// Copyright (c) Simon Hänisch
// Licensed under the MIT License. See THIRD_PARTY_LICENSES.md

import { dirname } from 'path';

import {
    createLanguageService,
    findConfigFile,
    getDefaultLibFileName,
    LanguageService,
    OrganizeImportsArgs,
    OrganizeImportsMode,
    parseJsonConfigFileContent,
    readConfigFile,
    ScriptSnapshot,
    sys,
    TextChange,
} from 'typescript';

import { ExtendedOptions } from '../types';

function getCompilerOptions(configPath: string | undefined) {
    const compilerOptions = configPath
        ? parseJsonConfigFileContent(
              readConfigFile(configPath, sys.readFile).config,
              sys,
              dirname(configPath),
          ).options
        : {};

    compilerOptions.allowJs = true;
    compilerOptions.allowNonTsExtensions = true;

    return compilerOptions;
}

function getLanguageService(filepath: string, code: string): LanguageService {
    const configFile = findConfigFile(filepath, sys.fileExists);
    const compilerOptions = getCompilerOptions(configFile);

    const serviceHost = {
        readFile: sys.readFile,
        fileExists: sys.fileExists,
        getDefaultLibFileName: getDefaultLibFileName,
        getCompilationSettings: () => compilerOptions,
        getScriptFileNames: () => [filepath],
        getScriptVersion: () => '1',
        getCurrentDirectory: () =>
            configFile ? dirname(configFile) : sys.getCurrentDirectory(),
        getScriptSnapshot: (fileName: string) =>
            fileName === filepath ? ScriptSnapshot.fromString(code) : void 0,
    };

    return createLanguageService(serviceHost);
}

const normalizePath = (filepath: string): string =>
    !filepath.includes('\\') ? filepath : filepath.replace(/\\/g, '/');

const applyChanges = (input: string, changes: readonly TextChange[]) =>
    changes.reduceRight((text, change) => {
        const head = text.slice(0, change.span.start);
        const tail = text.slice(change.span.start + change.span.length);

        return `${head}${change.newText}${tail}`;
    }, input);

export function removeUnusedImports(
    filepath: string | undefined,
    code: string,
    options: Omit<ExtendedOptions, 'plugins'>,
) {
    if (!options.removeUnusedImports) {
        return code;
    }

    filepath = filepath ? normalizePath(filepath) : 'file.ts';

    const service = getLanguageService(filepath, code);

    const args: OrganizeImportsArgs = {
        type: 'file',
        fileName: filepath,
        mode: OrganizeImportsMode.RemoveUnused,
    };

    const [fileChanges] = service.organizeImports(args, {}, {});

    return fileChanges ? applyChanges(code, fileChanges.textChanges) : code;
}
