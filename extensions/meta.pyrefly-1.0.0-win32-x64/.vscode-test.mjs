/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
	files: 'dist/test/**/*.test.js',
    workspaceFolder: "../pyrefly/lib/test/lsp/test_files"
});
