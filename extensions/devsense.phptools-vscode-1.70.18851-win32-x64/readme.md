# PHP Tools for Visual Studio Code

[![Home page](https://img.shields.io/badge/%F0%9F%8C%8E-Home%20page-blue.svg)](https://www.devsense.com) 
[![PHP Tools on Twitter](https://badgen.net/badge/@php4vs/twitter/blue?icon=twitter)](https://twitter.com/php4vs) 
[![PHP Tools Changelog](https://img.shields.io/badge/platform-MacOS%20%7C%20Linux%20%7C%20Win-green.svg)](https://www.devsense.com/download#vscode) 
![Supported PHP Versions](https://img.shields.io/badge/php-5.4%20--%205.6%20%7C%207.0%20--%208.5-8892BF.svg?logo=php) 

**PHP Tools for VS Code** is a full development integration for the PHP language. The features are provided respecting conventions, stability, simple use, and performance. Please see the product page for more details on [devsense.com](https://www.devsense.com/features#vscode).

This package extends VS Code with fast code completion, advanced editor features, code fixes, code lenses, code generators, debugger, built-in development web server, test explorer, tests debugger, and workspace-wide code analysis.

### Editor

- **fast code completion** with context-aware resolution, automatic import, and detailed informational tooltips.
- **starred suggestions:** ([premium](https://www.devsense.com/features#vscode)) most probable completions are marked with a star and shown at the top of the list.
- **generics**, **PHPStan** and **Psalm** integrated with the entire IntelliSense functionality.
- **@mixin** support and other annotations natively included.
- **signature help** guides through the function's parameters and PHP 8 named arguments.
- **auto-import** corresponding aliases upon completion automatically.
- **navigation** for workspace-wide go-to-definition, references, and implementations.
- **symbol search** to quickly list declarations across the workspace.
- **go to Implementations** lists all derived classes, implemented interfaces, traits, and overridden functions.
- **PHAR** files and their content can be inspected, navigated into, and used seamlessly.
- **PHPDoc** generator when `/**` is typed, automatic completion of keywords, diagnostics, and quick fixes.
- **PHPStorm metadata** notation is automatically processed.
- **PHP manual** in all major languages is seamlessly integrated into the editor.
- **code formatting** for ranges, documents, and blocks. Formats contained HTML/JS/CSS as well.
- **detailed tooltips** revealing localized descriptions, colored headers, and URLs to the documentation.
- **highlighting occurrences** of a symbol under the cursor.
- **breadcrumbs and outlines** for fast and easy navigation within a file.
- **PHP/HTML/JS/CSS** mixed codes are colored and editable together with code completion.
- **Laravel Blade** full colorization, formatting, and IntelliSense, with PHP IntelliSense, Code Actions, and Hovers. ([link](https://docs.devsense.com/vscode/frameworks/laravel/))
- **code folding** for code blocks, declarations, comments, and user regions.
- **unnecessary import check** dims unused `use` and provides a Quick Fix to clean it up.
- **type hierarchy** visualizing type structure of expressions, classes, interfaces, and traits.
- **highlight to-do** in your code, in Documentary Comments, and Single-Line comments.
- **composer.json** IntelliSense, diagnostics, commands, and code actions through [**Composer**](https://marketplace.visualstudio.com/items?itemName=DEVSENSE.composer-php-vscode) extension.
- **code actions** ([premium](https://www.devsense.com/features#vscode)) for namespace resolution, getters/setters, adding `use`, or implementing interfaces.
- **code fixes** ([premium](https://www.devsense.com/features#vscode)) to resolve common issues, refactor expressions, and more.
- **code lenses** ([premium](https://www.devsense.com/features#vscode)) seamlessly show the number of references and other information.
- **inlay hints** ([premium](https://www.devsense.com/features#vscode)) for parameter names, by-ref arguments, and type annotations.
- **rename refactoring** ([premium](https://www.devsense.com/features#vscode)) safely renames any symbol with rename preview across the workspace.
- **IntelliPHP** ([premium](https://www.devsense.com/features#vscode)), privacy-first local AI whole-line suggestions.

### Laravel IDE

- **Blade** templating with highlighting, completions, components, folding, formatting, and more.
- **Blade Sections** are completed within `@yield` and `@section` directives.
- **Blade Completions** suggest view IDs, component IDs, `x-` tags, `livewire:` tags, component attributes, component variables, and more.
- **Eloquent Magic** guessing Model's properties, local scopes, `where` methods, and query builders.
- **Laravel IDE** `ide.json` configuration file mostly supported for custom completions, custom directives, or components.
- **Laravel Routes** supported, named routes and route parameters are completed in corresponding functions.
- **Laravel Services**, Facades, and Class Aliases are collected across workspace and used for completions.
- **Completions** and detailed tool-tips for Model columns, query builders, view IDs, components, config keys, paths, [and more](https://docs.devsense.com/vscode/frameworks/laravel/).
- **Livewire** components, completions, `wire` actions and properties, and more supported.
- **Debugging and Profiling** using built-in development server for quick run and debug of Laravel application.

### Other Frameworks Support

- **WordPress** support provides WordPress code stubs, respecting WordPress conventions and code style, extending code completion with filters and actions, and fine-tuned editor features.
- **CodeIgniter 3** support adds dynamic services and factories into the code intelligence.
- **PestPHP** support lists tests in Test Explorer, adding test members into code completion, and more.
- Other frameworks following PHPStan or Psalm notations are respected.

### Formatter

- **PSR-12** code formatter built-in.
- **more code styles** can be set, including `"PER"`, `"PSR-12"`, `"PSR-2"`, `"Allman"`, `"K&R"`, `"Laravel"`, `"Drupal"`, or `"WordPress"`.
- **automatic formatting** on paste, when typing expression, or on save.
- **formatting ranges** or whole documents.
- **HTML/CSS/JS** mixed languages formatting support.
- **formatting multiple files** allows to [batch format `.php` files](https://blog.devsense.com/2024/format-multiple-php-files-with-preview) in the entire workspace, with a preview.
- **Laravel Blade** file formatting support - formats everything including PHP/CSS/JS/HTML and Blade directives. ([link](https://docs.devsense.com/vscode/frameworks/laravel/#blade-file-formatting))
- **custom rules** ([premium](https://docs.devsense.com/vscode/editor/customize-formatting)) to fit your code style.

### Debugging

- **built-in web server** gets started as you start debugging.
- **debugger** making use of Xdebug. Provides value editing, debug console, tooltips, and more.
- **DBGp Proxy** support built-in.
- **multiple sessions** allow debugging from more VS Code instances, and more than one program.
- **breakpoints** and **log-points** are must-have features for tracing your program.
- **debug watch tooltips** for safe inspection of the debug session.
- **value editing** allows you to watch and change values during debugging.
- **compound launch** allowing to start of one or more servers at once. ([read more](https://blog.devsense.com/2021/compound-launch-vs-code-php))
- **remote server** support with optional path mappings.
- **profiling** support, Xdebug profile mode, and inspecting profiling files (see [PHP Profiler](https://marketplace.visualstudio.com/items?itemName=DEVSENSE.profiler-php-vscode) extension).
- **debugging adornments** ([premium](https://www.devsense.com/features#vscode)) allows seeing the values you need right in the editor next to the corresponding line.

### Code Analysis

- **extensive problems analysis** continuously reports problems across the entire workspace.
- **respects PHPStorm metadata** to improve the type analysis.
- **configurable** to enable or disable specific warnings within specific directories.
- **hundreds of semantic rules** based on type analysis and PHP internals.
- **deprecation** warnings to highlight obsolete library' or user code.
- **compatibility** checks warn when using constructs from the future version of PHP.
- **generics** with the respect to Psalm/PHPStan annotations are handled.
- **provides quick fixes** ([premium](https://www.devsense.com/features#vscode)) for fast and common errors and typos in user code.

### Testing

- **test explorer** that visualizes, runs PHPUnit and Pest PHP tests, and organizes test results.
- **profiling** ([premium](https://www.devsense.com/features#vscode)) test cases (PHPUnit) with the profiling results visualization.
- **auto-detect binary** and resolves both `pest` and `phpunit` in `vendor`, `bin`, or local `.phar` file.
- **PestPHP High-Order Tests** with full code completion, analysis, `Browsable` and other traits support.
- **debugging** test cases within a single click.
- **continuous testing** supported; changed test files seamlessly re-tested.
- **auto-reload** when a test `.php` file or the configuration file changes.
- **DataSets** are listed with the corresponding result, and can be run separately.
- **test icon** next to the test function to quickly run and debug a single test.
- **margin** with the latest test results right in the code next to the test function.
- **preTask** and **postTask** allow running a VS Code task before/after a test run.

### Support for [vscode.dev](https://vscode.dev)

The PHP Tools extension offers [support](https://blog.devsense.com/2022/php-intellisense-web) when running on [vscode.dev](https://vscode.dev) (including [github.dev](https://github.dev)).
[Read more ...](https://blog.devsense.com/2022/php-intellisense-web)

### Bundle

Some features are provided as a separate extension, and installed together with this one. This lets you to disable/uninstall them.

- [**This extension**](https://marketplace.visualstudio.com/items?itemName=DEVSENSE.phptools-vscode): Provides core functionality, IntelliSense, Debug, Test adapter, and more.
- [**Composer**](https://marketplace.visualstudio.com/items?itemName=DEVSENSE.composer-php-vscode): Quick commands for composer package management, `composer.json` editor, version inlay hints, and deprecation warnings.
- [**IntelliPHP**](https://marketplace.visualstudio.com/items?itemName=DEVSENSE.intelli-php-vscode): inline whole-line suggestions using privacy-first offline AI model.
- [**Profiler**](https://marketplace.visualstudio.com/items?itemName=DEVSENSE.profiler-php-vscode): Opening profiling results (`cachegrind.out.*.gz` files), profiling built-in server, and profiling tests.

---

## Code Help and Completion

Take advantage of type-based, blazing-fast code completion, signature help, and colorful tooltips within VS Code. The editor is context-aware, lists available symbols with detailed information, performs type analysis, and completes selected options. It also auto-completes the dollar character for variables and even provides a URL to online documentation when possible.

![Code Completion](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/completion-tooltip.gif)

The integrated manual of all PHP symbols is localized for the major languages - English, Japanese, Spanish, French, Portuguese, German, Russian, or Chinese.

![Localized Help](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/tooltip-help-ja.png)

## Code Actions

Quickly refactor and generate code using code actions. This feature gives you quick fixes for the code that is right at your cursor, at your hand. Generate **PHPDoc**, property **getters and setters**, implementation of interfaces, abstracts, and more.

![Generate getters and setters](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/getter-setter-action.gif)

## Debug

Run the integrated built-in server, debug a script, or connect to a local or remote server. Debug is provided through _Xdebug_ extension and provides you with all you need. Easy to use with the respect to VS Code conventions. See and manage breakpoints, watch expressions, locals, the call stack, or change a variable's value. Tooltips reveal the expression's value as well, including subsequent listing through large arrays.

![Debug PHP](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/debug-start_server-and-set_value.gif)

## Continuous Code Validation

Reveal troublesome issues and problems without testing, and even before running the code. The built-in type analysis and code validation will check the entire project in seconds, and it gets updated as you type. Problems are listed in the `Problems` window and underlined right in the code editor.

![Code Validation and Diagnostics](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/problems-window.png)

## Navigation

The editor provides you with `Go to definition`, `Find all references`, and browse through all the symbols within the current document and the workspace. It takes advantage of the type analysis and context-aware search, quickly navigating even through extremely large projects.

![Find All References](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/find-all-refs.gif)

## Rename Refactoring

Safely find and rename variables, classes, interfaces, or functions with a single press of a key. The feature takes into account PHPDoc comments, possible indirect variables, or dynamic code constructs.

![Rename Variable](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/rename-variable.gif)

## Code Formatting

The integrated _formatter_ helps you keep the code looking clean and maintain the selected code style (e.g. `"PSR-12"`).

![Format Document](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/format-document.gif)

You can either format the whole document, selected text, or it can be triggered based on user actions, such as typing, saving or pasting.

HTML, CSS and Javascript sections in the PHP files get formatted according to your VS Code settings.

## Testing

PHPUnit, Paratest, and Pest tests within the project are detected and automatically listed in the Test Exporer view. You can run and debug all the tests, a suite, a single test, or a dataset. All the listed tests are marked with the succeeded icon with details of the test run. Failures are inlined in the code with the corresponding diff. See the [testing documentation](https://docs.devsense.com/vscode/test-explorer) for more details.

![Test View](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/test-explorer.gif)

## PHP Doc Comments

_Documentary Comments_ are generated upon typing `/**` above functions, classes, properties, constants, variables, and namespaces. The editor provides full code completion, tooltips, highlighting, searching references, and refactoring through PHPDoc.

Optionally, snippets can be customized using settings `php.docblock.***Snippet`, taking advantage of [variables](https://code.visualstudio.com/docs/editor/userdefinedsnippets#_variables), i.e.:

```json
"php.docblock.classSnippet": {
    "@author": "John",
    "@copyright": "(c) $CURRENT_YEAR"
}
```

![phpdoc generate](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/phpdoc-generate.gif)

_This feature requires `"editor.formatOnType": true` setting to be enabled._

## Related links

- [Home page](https://www.devsense.com)
- [Documentation](https://docs.devsense.com/vscode)
- [PHP Tools for Microsoft Visual Studio](https://www.devsense.com/purchase?from=vscode)

---

## Notices

> The extension may send us (DEVSENSE s.r.o.) error telemetries, if enabled in VS Code (see [Telemetry settings](https://code.visualstudio.com/docs/getstarted/telemetry)). Data are anonymized, sampled, and destroyed after 30 days. This helps us to make the product stable and reliable. We do not provide the data to any 3rd party.

> The extension is based on MIT licensed code and is subject to the following notice:
>
> MIT License
> Copyright (c) 2015 - present Microsoft Corporation
> All rights reserved.
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> The embedded language feature is based on work of Ben Mewburn and is subject to following notice:
>
> Copyright (c) Ben Robert Mewburn 
> Licensed under the ISC Licence.
>
> The software's debug protocol library is based on MIT licensed code and is subject to following notices:
>
> VS Code - Node Debug
>
> Copyright (c) Microsoft Corporation
> All rights reserved.
> MIT License
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> MIT License
> Copyright (c) 2016 Felix Frederick Becker
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> The software's test explorer is based on MIT licensed code and is subject to following notices:
>
> The MIT License (MIT)
> Copyright (c) 2018 Holger Benl <hbenl@evandor.de>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> ini-parser
>
> The MIT License (MIT)
> Copyright (c) 2008 Ricardo Amores Hernández
> 
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: 
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
> 
> vscode-webview-ui-toolkit
> https://github.com/microsoft/vscode-webview-ui-toolkit
>
> Microsoft and any contributors grant you a license to any code in the repository under the MIT License, see the LICENSE file.
> This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft trademarks or logos is subject to and must follow Microsoft’s Trademark & Brand Guidelines. Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship. Any use of third-party trademarks or logos are subject to those third-party’s policies.
> 
