import { expect, test } from 'vitest';

import { DEFAULT_IMPORT_ORDER } from '../../constants';
import { examineAndNormalizePluginOptions } from '../normalize-plugin-options';
import { removeUnusedImports } from '../remove-unused-imports';

const code1 = `import "se3";
import z from 'z';`;

const code2 = `import "se3";
import a from 'z';

a;`;

const options = {
    importOrder: DEFAULT_IMPORT_ORDER,
    importOrderParserPlugins: [],
    importOrderTypeScriptVersion: '1.0.0',
    importOrderCaseSensitive: false,
    importOrderSafeSideEffects: [],
    removeUnusedImports: true,
};

test('it must not change with the `removeUnusedImports` option disabled', () => {
    const { plugins, ...remainingOptions } = examineAndNormalizePluginOptions({
        ...options,
        removeUnusedImports: false,
    });

    const code = removeUnusedImports(__filename, code1, remainingOptions);

    expect(code).toEqual(code);
});

test('it removes unused but preserves side-effect imports', () => {
    const { plugins, ...remainingOptions } =
        examineAndNormalizePluginOptions(options);

    const code = removeUnusedImports(__filename, code1, remainingOptions);

    expect(code).toEqual('import "se3";\n');
});

test('it must do no change', () => {
    const { plugins, ...remainingOptions } =
        examineAndNormalizePluginOptions(options);

    const code = removeUnusedImports(__filename, code2, remainingOptions);

    expect(code).toEqual(code2);
});
