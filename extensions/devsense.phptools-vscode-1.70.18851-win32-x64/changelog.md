
## 1.70.18851 (May 13, 2026)

### Improvements

- The `"numeric-string"` type is now respected; implicit conversions from numeric strings no longer produce unnecessary warnings.
- Various control-flow analysis cleanups and stability improvements.

### PHPDoc

- Parsing nested PHPDoc tags is more tolerant, improving robustness of PHPDoc parsing.
- Fixed matching of `@global` occurrences.
- Fixed type name code completion in PHPDoc tags. [#892 (comment)](https://github.com/DEVSENSE/phptools-docs/issues/892#issuecomment-4422799460)

### IntelliSense

- `$GLOBALS['NAME']` is now handled more specifically in mouse hover and refactoring features.
- Fixed type inference for dynamic properties when an array has more than one element type.

### WordPress

- Added compatibility with more non-standard WordPress type syntax.
- Extended support for structured WordPress type syntax conventions.

## 1.70.18840 (May 9, 2026)

### Minor Improvements

- Laravel routes are recognized better even if defined in groups.
- Performance and memory optimizations for non-Laravel projects.
- Improves handling of generic template types; when they are unbound passed to a base class scope. [#2501](https://community.devsense.com/d/2501), [#2504](https://community.devsense.com/d/2504)
- Starred Suggestions AI model has been updated.
- Respects more WordPress conventions, reports less errors.
- Added code action to add a stub into IntelliSense (`php.stubs` setting). This fixes unknown function or unknown class name that is defined in a PHP book.

### Chinese Localization

The extension UI and IntelliSense is shown in Chinese. This is set automatically, if your VSCode's Display Language is set to `zh-cn`.

## 1.70.18740 (April 7, 2026)

### New Features

- Added diagnostic for incorrect vararg with default value. [#1025](https://github.com/DEVSENSE/phptools-docs/issues/1025)
- Completion for an attribute name lists only valid attribute classes (those with `#[Attribute]`). [#2511](https://community.devsense.com/d/2511)
- More Laravel Controller completions. [#2502](https://community.devsense.com/d/2502)
- PHP manual browser shows attributes (navigation to a symbol from PHP manual, i.e. `Override`.).
- Japanese UI localization.
- Generic template arguments work for nested local functions and lambda functions.

### Fixes

- Fixed Livewire IntelliSense after `View` type.
- False syntax error after `<?php` at the end of file. [#1026](https://github.com/DEVSENSE/phptools-docs/issues/1026)
- Fixed an issue where `php.format.rules.keepControlStatementsOnOneLine` incorrectly removed the blank line before a method body. [#2542](https://community.devsense.com/d/2542-formatting-bug)

## 1.69.18673 (March 26, 2026)

### Starred Suggestions

Most probable member completions are now marked with a star ★ and shown at the top of the list. This helps you find the right item faster with less typing.

![starred suggestions](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/refs/heads/master/docs/vscode/editor/imgs/starred-completion.png)

Nothing changes if you keep typing. The feature stays out of your way and fits naturally into your usual workflow.

> Starred suggestions can be disabled or enabled using the `"php.completion.starredSuggestions"` setting.
> Note: The feature is not supported on _Alpine Linux_ (`musl`). 

### New Features

- Code Action to add a parameter type hint.
- Methods defined by Livewire framework added to IntelliSense (`View::layout()`, `View::title()`). [#2530](https://community.devsense.com/d/2530)

### Minor Changes

- `Premium` users don't see "Buy" button in the welcome screen anymore.
- Alpine/musl has a dedicated installer again. [#1020](https://github.com/DEVSENSE/phptools-docs/issues/1020)
- `PHP0412` (_undefined property_) is reported for a property assignment, and not for subsequent reading. This is more consistent with other code analysis tools, and makes more sense together with the corresponding tooltip. The warning is also not reported if the property is specified in a `@property` doc block, or if there is a magic `__get`/`__set` function.

### Fixes &amp; Improvements

- Resolving controller method inside _Laravel_ Route definition fixes. [#2502/7](https://community.devsense.com/d/2502/7)
- Problems in the workspace are lazily re-analyzed when file edited.
- Blade syntax fixes for CSS rules and related. [#1023](https://github.com/DEVSENSE/phptools-docs/issues/1023)
- Quick fix for incorrect function override where a parameter is missing does not remove the closing parentheses `)`.
- Workspace load time optimizations.

## 1.68.18590 (March 11, 2026)

### Features

- PHP 8.5 `(void)` cast.
- Type Hierarchy Support.
- Custom WordPress actions and filters code completion.
- Code completion for PHP open tags ('<?php' etc.).

### Fixes

- Fixes formatting issue with `php.format.rules.alignConsecutiveAssignments` not aligning directly inside case items.
- Fixes unused variable check in lambda `use` if there is a deep recursion. [#1010](https://github.com/DEVSENSE/phptools-docs/issues/1010)
- Fixes trait adaptations from a different trait `use` block. [#1012](https://github.com/DEVSENSE/phptools-docs/issues/1012)
- Fixes deprecation check for declarations from composer packages.

## 1.67.18520 (Feb 17, 2026)

### Fixes

- Fixed parser inside string interpolation i.e. `"{$a}b"`.
- Fixed false syntax error after previous error recovery.
- Fixed format of `match` arm with trailing comma. [#1007](https://github.com/DEVSENSE/phptools-docs/issues/1007)

### Minor Changes

- Code action for string concatenation different from string interpolation. [#970](https://github.com/DEVSENSE/phptools-docs/issues/970)

## 1.67.18502 (Feb 13, 2026)

### Fixes

- Diagnostic for method override when base method returns `static`. [#932](https://github.com/DEVSENSE/phptools-docs/issues/932)
- Method visibility in special lambda functions (i.e. Pest PHP test). [#1006](https://github.com/DEVSENSE/phptools-docs/issues/1006)
- Fixed missing indentation of named arguments in multiline function calls. [#2510](https://community.devsense.com/d/2510)
- Fixed signature help after string interpolation with `{$var}`. [#4](https://github.com/DEVSENSE/php4vs/issues/4)

## 1.67.18497 (Feb 11, 2026)

### Laravel

- `Storage::fake('')` is handled so the following `Storage::disk('')` is known to return `FileSystemAdapter` with `assert` methods.
- `\Pest\Laravel\actingAs()` returns more specific `TestCase` class, including `Architectable` and `Browsable` traits.

### Minor Features

- The new `URI` extension is properly reported as available since PHP 8.5 if used on older versions of PHP.
- Code completion for **Pest's High Order Tests** incl. `Browsable` and `Architectable` traits.
- Respecting PHPDoc annotation for closure/callable with optional parameters. [#1000](https://github.com/DEVSENSE/phptools-docs/issues/1000)
- Code action: `Remove Unnecessary Spread`.
- Code action: Replace `clone` with `clone with`.
- Inlay Hints not shown for variadic arguments (doesn't make sense).
- Diagnostic _TraitMethodConflict_ `PHP2447`. [#1002](https://github.com/DEVSENSE/phptools-docs/issues/1002)
- Initial implementation of error tolerant parser.
- Spread operator in function call gets checked if its array keys don't conflict with already provided arguments.

### Fixes

- Avoids warning about wrong NEON file (PHPStan configuration), if the file is actually a `.php` file. `.php` PHPStan configurations are not supported.
- Mouse hover and navigation on `"string"` values does not navigate to a global function with the same name always - only if parameter where the string is used is `callable`.
- Fixes unwanted empty lines in a class named `Match`. [#984](https://github.com/DEVSENSE/phptools-docs/issues/984)
- Fixes wrong return type of Laravel's `enum_value()`.
- Fixes wrong message on syntax error.
- Fixes `@extends` check on `interface`. [#2513](https://community.devsense.com/d/2513)
- Respects optional argument on anonymous function.
- References of a private `const` through `self::` in `trait`. [#1004](https://github.com/DEVSENSE/phptools-docs/issues/1004)

## 1.66.18408 (Jan 29, 2026)

### Minor Features

#### Parameter Validation

Added parameter validation for Closure and indirect function invocations.  
  [#2503](https://community.devsense.com/d/2503)

  ![check closure call](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/refs/heads/master/docs/vscode/imgs/cfg-closure-args.png)

#### Refactoring, References, and Navigation

Improved Refactoring, References, and Navigation across `"string"` values in specific code patterns, such as  
  `new ReflectionMethod(FQN::class, "HERE");`.  
  [#2502](https://community.devsense.com/d/2502)

  ![resolve symbols](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/refs/heads/master/docs/vscode/editor/imgs/resolve-string-symbols.png)

#### Laravel Support

Added completion support for Laravel controller action methods.  
  [#2502](https://community.devsense.com/d/2502)

  ![laravel controller method completion](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/refs/heads/master/docs/vscode/editor/imgs/complete-controller-method.png)

#### Editor Insight & Navigation

Enhanced mouse hover and Navigation to provide more detailed method results, using the same logic as code analysis.  
  This improves visibility for generated stubs, helpers, and overloaded methods, and makes it clearer what the editor actually sees internally.

  ![hover all methods](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/refs/heads/master/docs/vscode/editor/imgs/hover-all-method-stubs.png)

### Fixes

- Fixes semantic highlight and unused `use` check for `Closure` type name in `@var` annotations.
- Fixes missing Symfony polyfills in IntelliSense and avoids false deprecation warning with polyfills.
- Fixed `@formatter:off` behavior to correctly preserve original whitespace and brace placement.

## 1.66.1837 (Jan 26, 2026)

### Fixes

- Fixes method resolution when the flawed `_laravel_ide` stubs are there. [#990](https://github.com/DEVSENSE/phptools-docs/issues/990)
- Improves method resolution for static/non-static method calls.
- Improves Laravel Models IntelliSense - static helpers from Query Builder shown and resolved properly.
- Fixes Str::startswith() type inferring based on mehtod's assertions. [#2498](https://community.devsense.com/d/2498)

## 1.66.18374 (Jan 24, 2026)

### Debug

- Added support for function return values. No more temporary variables needed to inspect function results. Captures and displays return values in the Variables pane after a Step Out, clearly identifying the source function (e.g., `strtoupper()`).
- Improved support for `XdebugSettings` in launch.json. You can now reliably override any DBGp feature (like `max_data`, `max_children` or `max_depth`). [#2450](https://community.devsense.com/d/2450-xdebug-settings-cannot-be-changed)

### Minor Features

- `@pure` (and `@phpstan-pure`, `@psalm-pure`) tag in code completion. Note, that this feature is not yet used by code analysis.
- Memory use optimizations.
- Code action to simplify string concatenation with string interpolation handles more possible cases.
- Minor syntax differences across PHP `7.x` and `8.x` are respected, i.e. semi-reserved tokens inside namespace names. Syntax inside opened PHP documents is also re-evaluated when [PHP version is changed](https://docs.devsense.com/vscode/php-version/#choosing-php-version). Fixes [#963](https://github.com/DEVSENSE/phptools-docs/issues/963) and similar.
- PHP 8.5 **URI** extension added to workspace stubs list (not enabled by default - see "Workspace Stubs" command).

### Fixes

- Composer packages with non-standard `installPath` outside the `vendor` directory are not indexed and cached twice; This fixes double occurences in IntelliSense, and unnecessary RAM usage, and unnecessary initial CPU usage. This also improves code flow analysis and overall editor experience in affected projects (like _Drupal_).
- Respects array type annotations for vararg parameters. [#2489](https://community.devsense.com/d/2489)
- Semantic highlight works for class members of an unknown type, i.e. `$unknown->member`.
- In `.blade.php`, the editor was listing code actions for a "code behind" (the code generated by the templating engine); Such code actions were distracting, did not make any sense, and were generating invalid code changes. [#985(2)](https://github.com/DEVSENSE/phptools-docs/issues/985)
- Fixes semantic colors in documentary comments, not colorizing when document is being edited, or just saved.
- Improves conditional `@return` annotation using `true` and `false` constants.
- Fixed missing code completion when there is invalid `class_alias()` or `constant()` in the workspace.
- Fixes to NEON files parsing. [#992](https://github.com/DEVSENSE/phptools-docs/issues/992)
- Fixes `protected` function visibility check when the method is declared outside the scope but its prototype isn't. [#2496](https://community.devsense.com/d/2496)
- Fixes to `try`/`catch` code flow analysis with `goto`s' label inside `finally`.
- Fixes code completion when an invalid class name or constant name is introduced with bad `define()` or bad `class_alias()` functions.
- Fixes the setting `"php.format.exclude"`, so it works with workspace-relative paths. [2499](https://community.devsense.com/d/2499)
- Fixes `ArrayObject::exchangeArray()` parameters signature. [#2494](https://community.devsense.com/d/2494)
- Implements code completion and mouse hover in union types. [#2492](https://community.devsense.com/d/2492)

## 1.65.18327 (Jan 14, 2026)

### New Features

- PHP 8.5 `clone` as a function with the new syntax and optional argument supported. [#2478](https://community.devsense.com/d/2478)
- PHP 8.0 dereferencable string syntax. [#2479](https://community.devsense.com/d/2479)
- Enabled CodeLens for class property hooks. [#2476](https://community.devsense.com/d/2476)
- New `@return` conditional annotation allowing to compare constants and parameter values (_numbers_, _strings_, and _`null`_), i.e.
  ```php
  /** @return ( $name == null ? false : int ) */
  function foo( $name ) { return $name === null ? false : strlen($name); }
  ```
  or
  ```php
  /** @return ( PHP_MAJOR_VERSION >= 8 ? string[] : array|false ) */
  function foo() { ... }
  ```
  Possible operators are `is` (as before for the type comparison), and newly `==`, `<=`, `>=`, `<`, `>`.
- `explode()` function shown with PHP version specific return type annotation (in a tooltip, by a type analysis, and in generated documentation). [#860](https://github.com/DEVSENSE/phptools-docs/issues/860)
- Added specific colors for interfaces and enums (if supported by users' theme).
- Added colors for type names in type hints of property hooks.

### Fixes

- Fixed CodeLens for enum cases. [#2482](https://community.devsense.com/d/2482)
- Respects generated `_ide_helper`, `_laravel_idea`, and `_laravel_ide` in diagnostics. [#974](https://github.com/DEVSENSE/phptools-docs/issues/974), [#2486](https://community.devsense.com/d/2486)
- Fixes falsy warning about wrong member visibility in a `Closure` bound with a new scope.
- Navigation and Mouse Hover works with class properties that are not visible in current scope.
- Fixes syntax errors with `Echo` in a namespace name.
- Fixes type inferring if there is `phpstan/php-8-stubs` composer package which makes all the IntelliSense information ambiguous (slower and less precise). [#2481](https://community.devsense.com/d/2481)
- Possible fix for a rare language server crash. [#979](https://github.com/DEVSENSE/phptools-docs/issues/979)

### Unused class members highlighted

Unused class methods, constants, and properties are now dimmed if there are no direct usages.

## 1.64.18270 (Dec 30, 2025)

### Optimizations

We’ve introduced major **parser optimizations** in the editor. The PHP editor now tracks incremental changes and parses code lazily, skipping parsing entirely when edits are insignificant. This cuts CPU usage while typing by roughly 90%, which is especially noticeable in larger PHP files.

In addition, **initial indexing** has been optimized. Still, it is recommended to exclude your workspace folder from antivirus scanning for a better performance.

Lastly, CodeLens support has also been improved. It now uses significantly less CPU, primarily because its underlying algorithm has been reimplemented.

### Fixes

* Fixes completion inside the `.editorconfig` file. Suggestions include possible formatting rules and code-action configurations.
* Improves `is_numeric()` type inference.
* Improves library support in CodeIgniter 3 projects.
* Fixes the diagnostic position for an unexpected `!` in PHPDoc.
* Multiple negative `@phpstan-assert-if-***` annotations with the `empty-string` type hint are now resolved correctly. [#967](https://github.com/DEVSENSE/phptools-docs/issues/967)
* Don’t dim or strikethrough code if the corresponding diagnostic has been suppressed.
* Don’t report a wrong class in `catch` clauses when its class hierarchy is not fully known (has unknown base types).
* Fixes a false warning when accessing an array item of a structured array type that has been modified. [#969](https://github.com/DEVSENSE/phptools-docs/issues/969)
* Fixes blank-line handling when `Keep*OnOneLine` settings are enabled. [#964](https://github.com/DEVSENSE/phptools-docs/issues/964)
* When renaming, an invalid new identifier now results in a popup message with details.
* Correctly finds references to methods from a trait adaptation block, including those renamed by the adaptation block.
* Fixes falsy deprecation of `ReflectionMethod::__construct()`.

### Minor Features

* The `@suppress` (or `@suppresswarnings`) tag recognizes selected `PHPMD` codes.
* The `empty-string` type hint is recognized.
* Diagnostic for an always-false strict comparison. [#971](https://github.com/DEVSENSE/phptools-docs/issues/971)
* Deprecation check of legacy constructors is more detailed.

## 1.63.18172 (Dec 3, 2025)

### Minor Features

- Inline PestPHP test case runner support. [@MrPunyapal](https://x.com/MrPunyapal/status/1994339061956329731)
- Code completion for suggested argument string values.
- Supports `@psalm-assert-if-true`, `@psalm-assert-if-false`.
- Supports `@phpstan-assert` or `psalm-assert` with type hint prefixed with `=`, used by PHPUnit's `assertInstanceOf()`.
- Respects `@phpstan-ignore-line`.

### Fixes

- False error when using member field or anonymous function in constant expression. [#955](https://github.com/DEVSENSE/phptools-docs/issues/955), [#958](https://github.com/DEVSENSE/phptools-docs/issues/958)
- Invalid unnecessary parentheses hint in `and`, `or` conditions. [#2467](https://community.devsense.com/d/2467)
- Language server crash fix when there is invalid `@dataProvider` annotation.

## 1.63.18152 (Nov 27, 2025)

### Minor Features

- Testing runs tests which groups were excluded in `phpunit.xml` configuration but selected/filtered in Testing view. So large/slow tests can be excluded using `<groups><exclude><group>...` XML configuration, so they don't run by default when running all tests. If those excluded tests aree selected or filtered using the filter box, the exclusion is overriden. [#2426](https://community.devsense.com/d/2426-test-explorer-does-not-filter-by-at-group/12)
- Problems in `/vendor/**` folder (including the special subfolders like `composer`) are not listed at all now, unless the file under `vendor` folder is opened in the editor.
- Type narrowing for `is_numeric`. [#2436](https://community.devsense.com/d/2436)
- Added `php-amqp` stubs.
- Settings `files.exclude`, `php.files.exclude`, `search.exclude`, `php.problems.exclude` support glob patterns with groups, ranges, negations, and special characters enclosed in `[`, `]` brackets. [#945](https://github.com/DEVSENSE/phptools-docs/issues/945)
- Added command `PHP Tools: Quick Settings ...` to access frequently requested PHP editor settings.
- Updated multi-language PHP manual.
- Dimm unused private class functions. [#800](https://community.devsense.com/d/800)
- Quick refactoring to replace `array_merge` with array spread.
- Quick refactoring to cleanup unnecessary `()` around `new` in PHP >= 8.4.
- Quick refactoring to create new callable syntax from anonymous function.
- Completing variable names inside `compact()` function.
- Diagnostics for constant expressions (`PHP2446`) in attributes and various initializers. Seen in [#2458](https://community.devsense.com/d/2458), [#949](https://github.com/DEVSENSE/phptools-docs/issues/949)
- Improves override checks for `enum` definitions with complex hierarchy. [#2460](https://community.devsense.com/d/2460)
- Unknown type checks for union types and intersection types in typed properties. [#2461](https://community.devsense.com/d/2461)

### Fixes

- Fixed auto-closing `)` overtype when completing function with parameters or parentheses. [#947](https://github.com/DEVSENSE/phptools-docs/issues/947)
- Fixed quick fixes inside attributes.
- Fixes code action converting to an arrow function containing an object operator `->`.
- Doesn't suggest PSR-4 class name fix, if the file name is not a valid class name identifier.
- Doesn't suggest arrow `fn` in constant expressions. [#949](https://github.com/DEVSENSE/phptools-docs/issues/949)
- Unused function declaration not reported for `__construct` and other magic methods.[#950](https://github.com/DEVSENSE/phptools-docs/issues/950)
- Fixed `@phpstan-assert` affecting more expressions in the code flow than it should. [#2459](https://community.devsense.com/d/2459)

### Breaking Changes

- The setting `"php.completion.intelliPHP.preSelect"` is `false` by default. Although [this feature is awesome](https://docs.devsense.com/vscode/editor/intelliphp/#pre-selecting-the-item-in-the-completion-list), it may slow down code completion by 50 - 250 ms. 

## 1.62.18097 (Nov 12, 2025)

### Auto-Import with Grouping

Newly, auto-import respects existing `use` groupings, so the imported qualified name is added to the group.

New setting allows to create new `use` groups, if suitable.

```json
"php.completion.autoimport": "auto-import-grouped"
```

![auto-import grouped](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/refs/heads/master/docs/vscode/editor/imgs/vsc-autoimport-group.gif)

### Diagnostic for Unoptimized Special Compiler Functions

[#2438](https://community.devsense.com/d/2438): In case a compiler optimized function is not imported in the current scope, the compiler cannot translate it to a more efficient OP code. New diagnostic `PHP6616` has been added to mark such function calls.

![native function invocation](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/refs/heads/master/docs/vscode/imgs/native-function-invocation-example.png)

By default, such problem is marked less prominently, and not listed in VSCode Problems window. The following configuration allows it to be underlined more prominently, and even auto-fixed on _File Save_, or by triggering VSCode "Auto Fix..." command.

`.editorconfig`
```ini
[*.php]
php_diagnostic_php6616=autofix
```

Read more at our [blog post at blog.devsense.com](https://blog.devsense.com/2025/optimize-native-function-invocation/).

### Minor Features

- Annotations `@phpstan-assert` and `@psalm-assert` are respected across the `vendor` folder.
- Improved **CI3** support; adds dynamic properties on your `CI_Controller` from loaded libraries.
- Completion of array keys when defining an array inside a function call with structured array parameter hint [#942](https://github.com/DEVSENSE/phptools-docs/issues/942).
- Improved _unnecessary parentheses_ hint, respects `and` and `=` operators precedence, adds more hints for `||`, `&&`, assignments, `if`, and other binary operators [#2444](https://community.devsense.com/d/2444).

### Fixes

- Fixed broken type inferring if a method in a composer package returns `self` but is only type annotated in the base interface. [#941](https://github.com/DEVSENSE/phptools-docs/issues/941)
- Fix: The Align Consecutive Assignments feature now correctly works inside callables (closures and anonymous functions). [#2442](https://community.devsense.com/d/2442-align-consecutive-assignments)
- Switching between blade component view and blade component class ([docs](https://docs.devsense.com/vscode/frameworks/laravel/#switch-between-blade-view-and-class)) fixed. [#2443](https://community.devsense.com/d/2443)

## 1.62.18042 (October 30, 2025)

### New Features

- Support for **PHPUnit groups**, so tests can be filtered in Testing panel by the group name.
- Improved type inferring in false branch when type checking.
- Improved type inferring making use of `class-string` type.
- Mouse tooltip for named parameter inlay hint.
- Consecutive assignment alignment now supports formatting assignments of different types (e.g., =, +=, ??=, etc.) [#2432](https://community.devsense.com/d/2432)

## CodeIgniter 3

The lightweight and popular **CodeIgniter 3** framework has its own quirks and conventions that many PHP editors may not handle correctly. PHP Tools for Visual Studio Code now includes built-in support for CodeIgniter 3. This support will be even more enhanced in upcoming updates.

![CI3 completion](https://docs.devsense.com/vscode/frameworks/img/ci3-view-completion.png)

With this version you can see:
- completion for model names.
- completion for view names.
- completion of loaded class in your controller.

Special thanks for the contribution in [#677](https://github.com/DEVSENSE/phptools-docs/issues/677).  
See more at [docs.devsense.com](https://docs.devsense.com/vscode/frameworks/codeigniter3/).

### Fixes

- Backed `enum` implementing an interface resolves to `BackedEnum` correctly [#930](https://github.com/DEVSENSE/phptools-docs/issues/930).
- Results of test cases that are not declared within a namespace were not recoded [#936](https://github.com/DEVSENSE/phptools-docs/issues/936).
- Fixed false type inferrings for `App\Models\` classes not based on Laravel/Symfony frameworks.

## 1.62.17969 (October 9, 2025)

### Tests Code Coverage

We're introducing support for tests [_Code Coverage_](https://docs.devsense.com/vscode/test-explorer/#code-coverage). Try it now, navigate to _Testing_ panel, and click _Run Tests with Coverage_ button. Code coverage will appear in _Testing_ panel, _Explorer_ panel, and also right in your code.

![code coverage button](https://docs.devsense.com/vscode/imgs/code-coverage-start-button.png)

![code coverage](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/refs/heads/master/docs/vscode/imgs/code-coverage-results-explorer.png)

![code coverage](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/refs/heads/master/docs/vscode/imgs/code-coverage-visual.png)

> The feature relies on PHPUnit/Para/Pest functionality - it runs the tests using appropriate command line arguments and displays the coverage information conveniently right in VSCode. Please make sure, your `phpunit.xml` configuration contains `<source>` element. For troubleshooting, watch the _OUTPUT_ window / _PHP (Test Explorer)_ .

### More Features

- `@see` in mouse tooltip contains clickable links to the referenced symbols, if possible.
- `@see` in source code has semantically colorized symbols.
- **PHP 8.5** language level, pipe operator (`|>`) and basic checks.
- Validation of `enum` declarations ([#926](https://github.com/DEVSENSE/phptools-docs/issues/926)).
- Check for implicitly nullable parameters (deprecated in PHP &gt;= 8.4).
- When running all tests with several test suites, only one process is created now.

## 1.61.17926 (September 23, 2025)

### Improvements

- Behavior of `"search.exclude"` is unified across _Find all references_, _Code Lenses_, _Find Implementations_, _Symbols in Workspace_.
- Diagnostic for `new` member call without parentheses on PHP &lt;8.4.
- Pest functions respect the new `$this`. Related to any parameters annotated with `@param closure($this)` or `@param-closure-this` ([#918](https://github.com/DEVSENSE/phptools-docs/issues/918)).
- Diagnostic for unreachable match arm ([#919](https://github.com/DEVSENSE/phptools-docs/issues/919)).
- Changes how completion of function parameter snippets work, which complies with language server protocol and avoids unnecessary warnings by VSCode ([#909](https://github.com/DEVSENSE/phptools-docs/issues/909)).

### PHPUnit, Pest, and Data Sets

We are introducing new features to the _Test Explorer_: Support for newer paratest, experimental support for Pest, and support for data sets right in the Test Explorer UI.

![data sets in Test Explorer](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/testexplorer-datasets.png)

### Fixes

- Fixed overload checks and quick fix to implement missing abstract methods ([#2392](https://community.devsense.com/d/2392)).
- Fixed unwanted space after `[` on the new line in array initializers ([#923](https://github.com/DEVSENSE/phptools-docs/issues/923)).
- Spaces are added for lambdas when `php.format.rules.spaceWithinDeclParens` is enabled ([#922](https://github.com/DEVSENSE/phptools-docs/issues/922)).
- Fixed _Go To Definition_ to a class symbol in PHP manual.

## 1.60.17873 (Sep 2, 2025)

### Fixes

- Parameters completion snippet (setting `php.completion.parameters` == `"parameters"`) has default parameter values as it should have.
- Fixes autocomplete in the inline CSS and script tags [#914](https://github.com/DEVSENSE/phptools-docs/issues/914)

## 1.60.17845 (Aug 23, 2025)

### Improvements

- Checking invalid PHP configuration or configuration that may break debugging; all the warnings are listed in `OUTPUT` / `PHP` log.
- Type inferring inside `trait` has been improved, so members after `static::`, `self::`, `parent::` are mostly resolved. The editor tracks all uses of given `trait`, and it also looks at `@extends` and `@mixin` annotations.

### Debug

Fixed an issue where some breakpoints were incorrectly marked as unverified.

### Fixes

- `$this` in lambda functions with `@closure-this` or `@param callable(TYPE $this)` is annotated with correct type in tooltips.
- "Override abstracts" code action generates correct type namespaces.
- Correctly resolves `@method static static` tag.
- Removed unnecessary parentheses around complex type names in tool tips.
- Correctly resolves `self` and `static` inside `trait`.

## 1.60.17803 (Aug 14, 2025)

### Simplify `&&` Code Action

Long conditions with call chains `->` and and operator `&&` can be simplified now to a single call chain with `?->`.

### Improvements

Various type inferring improvements has been made based on user's feedback.

Newly, methods called through magic `__call()` are annotated with `PHP6615` diagnostic. This shows up in a tool-tip and the in the editor. The new diagnostic helps with unintended wrong method calls.

![unintended method call](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/err-call-via-magic.png)

### Fixes

- Fixed navigation for symbols in current file.
- Fixed navigation to symbols in PHAR files.
- Fixed `"php.problems.exclude"` setting with simple `"/"` glob pattern.
- Fixed `array` type information causing wrong types in functions in `/vendor/`.
- Fixed wrongly detected unused imports of classes used in property hookes.
- Fixed analysis of `method_exists()` with ambiguous `$class_or_object` argument.
- Improved methods check in case of ambiguously inferred type. 

## 1.59.17706 (July 29, 2025)

### Minor Features

- Move magic methods to the end of the autocomplete list [#690](https://github.com/DEVSENSE/phptools-docs/issues/690).
- Improves type information of Eloquent model attributes inferred from the model "casts".
- Code action to fix incorrect magic method modifiers.
- Improves `static` type resolution in complex generics.

### Fixes

- Fixes false deprecation warnings of standard constants [#2328](https://community.devsense.com/d/2328).

## 1.59.17685 (July 23, 2025)

### Fixes

- Fixes regression with false warnings about undefined properties when there is `__get()` magic method.

## 1.59.17674 (July 18, 2025)

### Laravel IDE Improvements

- Livewire computed properties in code completion and navigation.
- IntelliSense shows completions from various Laravel packages (e.g. Filament) (views, translation keys, routes, config keys).
- Laravel relationship methods can have return type `HasOne<T,G>` using generics, and the relationship property will have `T` type.
- Completes `$this` with correct type in Blade files, when corresponding component class is found.
- Completes Eloquent attributes found in `casts()` method or `$casts` property.
- Fixes `@error` directive in blade files.

### Formatting

- Added setting for space before unary not [#874](https://github.com/DEVSENSE/phptools-docs/issues/874).
- Fixes an issue where a closing brace was placed on a new line in single-line property hooks [#878](https://github.com/DEVSENSE/phptools-docs/issues/878).

### Diagnostics Improvements

Code diagnostics were improved in general to avoid falsy warnings. This fixes reporting of unknown class names that were checked before, falsy unimplemented abstract methods, invalid type inferring in some numeric operations, etc.

Additionally the editor now checks for unimplemented abstract properties ([#870](https://github.com/DEVSENSE/phptools-docs/issues/870)).

Fixes for [#2322](https://community.devsense.com/d/2322), [#2272](https://community.devsense.com/d/2272), [#2286](https://community.devsense.com/d/2286) (and related).

### Minor Improvements

- Code completion in return type hint without traits ([#887](https://github.com/DEVSENSE/phptools-docs/issues/887)).
- Fixed "dancing" yellow highlights of "todo" tokens ([#893](https://github.com/DEVSENSE/phptools-docs/issues/893)).
- Override check of members from traits fixes ([#890](https://github.com/DEVSENSE/phptools-docs/issues/890)).

## 1.59.17515 (June 23, 2025)

### Sort 'use' Statements

Newly, order of 'use' statements can be set either to `alphabetic` or `by_length`. This can be set in `settings.json` or in `.editorconfig` where the corresponding `ij_php_import_sorting` directive is respected.

To sort `use`s, follow [the documentation page](https://docs.devsense.com/vscode/code%20actions/organize-uses/). You can sort uses with a code action, automatically on file save, or as auto-fix.

### Laravel IDE Improvements

- `.php.` language files are processed - methods like `trans()`, `__()`, or blade's `@lang` will have completion and navigation with possible translation keys.
- More model attributes in IntelliSense are typed.

### Fixes

- Fixed issues when completion of snippets in blade files inserted `@` twice ([#867](https://github.com/DEVSENSE/phptools-docs/issues/867)).
- Fixed parsing of `Return` in a namespaced name.
- Fixed language server crash with certain polyfill composer packages ([#873](https://github.com/DEVSENSE/phptools-docs/issues/873)).

## 1.59.17478 (June 15, 2025)

### Extract Method, Extract Constant

New code actions to extract selection of code as a function or extract selection as a constant.

### Composer IntelliSense Enhancements

Since `composer.phar` is usually outside the workspace folder, hence it's definitions are unknown to the editor, we have included `composer` IntelliSense database (stubs).

Without doing anything, the editor will recognize Composer's classes that are used e.g. in `/vendor/composer/` files, so they won't be reported as unknown and they can be inspected as well.

If user is developing for example a _Composer_ plugin, they have two options:
- Adding `composer.phar` into the workspace to get IntelliSense (this consumes unnecessary memory though),
- Or preferably adding `composer` stubs into the workspace through the setting `"php.stubs": ["composer", "*"]` or using the command `> Workspace Stubs`.

### IntelliSense Enhancements

- Navigation to constructors through `new self`, `new static`, or `new parent` ([#857](https://github.com/DEVSENSE/phptools-docs/issues/857)).
- Navigation prefers symbols in the current file, if there are ambiguites.
- Handling reserved PHPDoc types ending with `-string`.
- Improved handling of undocumented features of `.phpstorm.meta.php` annotations.
- Inspection of complex trait methods use.
- Use of `$this` in global code and Blade templates is not reported if properly annotated.
- References to callable-string used as a parameter to a `callable` parameter ([#2295](https://community.devsense.com/d/2295-to-go-definition-on-callable-params-in-function-call)).
- Reviewed and fixed URL of all built-in PHP definitions.

### Laravel &amp; Eloquent

- Dynamic properties from relationship methods are added to IntelliSense seamlessly. Their type is infered from the optional generic type anotation.
  ```php
  /** @return HasOne<T> Use generic type annotation to specify type of dynamic property `$relationship`. */
  function relationship(): HasOne { ... }
  ```
- Improved implicit types of Laravel/Eloquent magic methods like `Model::find(int)`, or `Container::make()`.

### Formatting
 
- Prevented automatic collapsing of `foreach` statements into a single line for better readability.
- Fixed an issue where enabling `javascript.format.semicolons` in the JavaScript formatter blocked the PHP formatter from applying changes [#850](https://github.com/DEVSENSE/phptools-docs/issues/850)
- Fixed formatting of block comments when they contain combination of tabs and spaces.
- Fixed formatting of intersetgion types [#2309](https://community.devsense.com/d/2309).

### New Settings

- `php.files.exclude`: glob patterns to exclude files and folders from being indexed by PHP language server, but not excluded from VSCode's Explorer View.
- `php.navigation.referencesScope`: choose whether go to references is strict (requires strictly typed object types), or resolves to any target location possible.
- `phpTools.parallelismLimit`: allows to limit number of background threads used for reading files form disk, parsing, and indexing (user machine setting).

### Breaking Change

HTML auto-update tags was always enabled. Now it respects the VSCode setting `"editor.linkedEditing"` as described on [code.visualstudio.com](https://code.visualstudio.com/docs/languages/html#_auto-update-tags).

### Fixes

- Performance improvements.
- Fix trait member with changed visibility ([#854](https://github.com/DEVSENSE/phptools-docs/issues/854)).
- Blade parser fixes.

## 1.58.17223 (May 2, 2025)

### Method Overrides

Code action to implement selected method overrides has been added. Click on the class header, open quick fix menu (light bulb), and choose `Override Methods`. In the opened quick pick panel, tick some or all the overridable methods, and confirm.

![Implement Method Overrides](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vscode-method-overrides.gif)

### Minor Features

- Updated integrated PHP manual and IntelliSense with (undocumented) PHP 8.4 definitions ([#841](https://github.com/DEVSENSE/phptools-docs/issues/841), [#823](https://github.com/DEVSENSE/phptools-docs/issues/823)).
- Respects and suggests `@(psalm|phpstan)-require-(extends|implements)`; for class hierarchy validation, for membres code completion and for code navigation ([#837](https://github.com/DEVSENSE/phptools-docs/issues/837)).
- Respects `@param-closure-this` ([#825](https://github.com/DEVSENSE/phptools-docs/issues/825)).
- Improves diagnostics for passing `&` ref from lambda or any indirect function call ([#831](https://github.com/DEVSENSE/phptools-docs/issues/831)).
- Outline shows visibility of properties and class constants.
- Formatting fixes for mixed JS/PHP code. [#2259](https://community.devsense.com/d/2259-a-comment-to-ignore-formatting-including-js-blocks)
- More specialied return type of `Request::user()` or `Auth::user()`, giving better code completions after `->`.

### Fixes

- Fixing blade formatter indenting too far.
- Fixes crash on domain-joined Unix systems.
- Fixes unwanted newline after a class body when preceded by a comment
- Fixes inline comments after PHP properties being moved to separate lines during formatting [#2245](https://community.devsense.com/d/2245-class-property-comment-after-goes-to-below-it-after-format)

## 1.57.17158 (April 11, 2025)

### New Features

**`"search.exclude"`** setting is respected for _find references_ and _workspace symbols_ features ([thread [#780](https://github.com/DEVSENSE/phptools-docs/issues/780)](https://github.com/DEVSENSE/phptools-docs/issues/780)).

### Minor Improvements

- Updated integrated PHP manual and IntelliSense.
- `instanceof` type inferrence improved ([#810](https://github.com/DEVSENSE/phptools-docs/issues/810)).
- Respecting anonymous function `newScope` if in `Closure::bind()` - fixes false warnings and improves code completion.

### Fixes

- Fixed check of anonymous functions passed as a named argument ([#821](https://github.com/DEVSENSE/phptools-docs/issues/821)).
- `"files.exclude"` patterns are treated the same way as in VSCode. There were some differences in the behaviour which should be gone now.
- Both `"files.exclude"` and `"search.exclude"` patterns are case-sensitive.

## 1.57.17031 (March 25, 2025)

### New Features

Newly, **code actions** and quick fixes of a text selection are **grouped**. As a result, the same actions can be applied at once for all occurrences within the selection.

![grouped code action](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vsc-grouped-action.png)

Select a portion of code and apply quick refactoring for all the occurrences. This is another enhancement simplifying the code cleanups, in addition to the [Auto-Fix](https://docs.devsense.com/vscode/code%20actions/autofix/) feature.

### Improvements

- Analysis of `explode()` on PHP >= 8 properly infers type `string[]`, excluding `bool` ([#2129](https://community.devsense.com/d/2129-wrong-variable-type-after-test)).
- Reports that type analysis may be incomplete, resulting in possibly incomplete completion. This is caused by internal technical limitation and will be aimed in future.
- More Laravel magic when there is generated `_ide_helper.php` with ambiguous/redundant definitions.
- Reports unused `global` variable within a function.

### Fixes

- Resolving old-style constructors fix.
- Code complation and diagnostics within FQN containing reserved PHP keywords.
- Suggesting Eloquent column names from Model's PHPDoc property fixed.
- Possible fix/improvement when there is unnecessary `@mixin` causing cycle in class definition.
- Removed unwanted spaces after identifier named "and" or "or" [#816](https://github.com/DEVSENSE/phptools-docs/issues/816)
- Fixes Ctrl/Cmd+Click in the links in blade files [#815](https://github.com/DEVSENSE/phptools-docs/issues/815)
- Fix code actions in unsaved (untitled) documents.

## 1.57.16971 (March 12, 2025)

### Minor Features

- Updated PHP manual/IntelliSense for newly documented PHP 8.4 declarations.
- Laravel service ID completion in `app()`, `App::make()`, etc.
- Eloquent's `find(int)` gets more specific IntelliSense. 
- Navigation into `.phar` file entries.
- Improved diagnostics and completions for some edge cases.
- Respects `@param` from base declaration ([#804](https://github.com/DEVSENSE/phptools-docs/issues/804)).
- Profiling now works when running on Docker/Remote with `pathMappings` in your launch profile. The profiling data will be temporarily stored in `/.vscode/profiling` workspace folder ([#800](https://github.com/DEVSENSE/phptools-docs/issues/800)).
- Colors in HEREDOC/NOWDOC strings ([#754](https://github.com/DEVSENSE/phptools-docs/issues/754)). Note, that some themes do not support it.
- Clickable links are now provided in the HTML parts of PHP files.

### Fixes

- Fixed blade braces autocompletion.
- Fixed Blade formatting issues that occurred in specific scenarios

## 1.56.16884 (February 19, 2025)

### Minor Features

- Support for line comments in PHPDoc structured type names.
- Support for `template-type<,,>` PHPStan PHPDoc type function.
- Better array unpacking type inferring.
- Better `foreach` control variable type inferring for old `Collection`.
- Respects `@var` annotation above `if` statement.
- Better `array_find()` return type inferring.

### Formatting

- Fixed an issue where `php.format.rules.blankLinesBeforeClass` did not apply correctly to anonymous classes.
- Added support for property hooks in constructor arguments. [#786](https://github.com/DEVSENSE/phptools-docs/issues/786)
- Fixed a formatting issue with promoted asymmetric properties in constructor arguments. [#788](https://github.com/DEVSENSE/phptools-docs/issues/788)
- Fixed an unwanted blank line appearing before a lambda function when `.editorconfig` option `ij_php_blank_lines_around_method` was set. [#818](https://github.com/DEVSENSE/phptools-docs/issues/818)

## 1.56.16853 (February 12, 2025)

### Laravel

- Code completion for the Eloquent "magic", and Laravel-specific functions.
- Extensible code completion through the special `ide.json` file.
- Completion for config keys in `config(..)`, `config()->string(..)`, `Config::get(..)`, and others.
- Completion of environment variables.
- Completion of view attributes in special Laravel functions.
- Completion of named routes in specific functions.
- Completion of route parameter names in specific functions.
- Completion of IDs from language translation files in specific functions.

### Eloquent

- Completing model columns in various Eloquent Query Builder methods. Columns are resolved from (what's defined first):
  - model class PHPDoc `@property`(s).
  - models Factory class `definition()` function.
  - using models table (if can be resolved), lookups migrations in `database/migrations/` and `Schema` definitions.
- Completing model dynamic fields.
- Completing magic `whereCOLUMN()` functions.

### Laravel Blade

- Completing component aliases defined using `Blade::component()`.
- Completing view aliases defined using `Blade::include()`.
- Completing components from `ide.json`.
- Completing directives and if-directives from `ide.json`, `Blade::directive()` and from `Blade::if()`.
- Livewire: Completing/navigating component attributes in `wire:model` value.
- Livewire: Completing/navigating component action in `wire:***` value.
- Completing section names.
- Added `x-dynamic-component` to the completion.
- Blade formatting and blade folding respects custom `if`-directives.
- Automatic insertion of spaces inside `{{}}` or `{{{}}}`
- Automatic insertion of `{!!  !!}` when you type `{!`
- Automatic insertion of `{{--  --}}` when you type `{{-`
- Command `phptools.blade.switchViewClass` to switch between view and class file. Go to "Open Keyboard Shortcuts" -> Search for "phptools.blade.switchViewClass" -> assign a shortcut.

### HTML

- The completion list now appears immediately after an automatically inserted quote for an HTML attribute.

### Formatting

- Added `php.format.rules.blankLinesBeforeReturnStatement` to define the number of blank lines before a return statement.
- Added `php.format.rules.blankLinesAroundProperty` to define the number of blank lines around a property.
- Added `php.format.rules.blankLinesAroundClassConstant` to define the number of blank lines around a class constant.
- Added `php.format.rules.blankLinesAroundEnumCase` to define the number of blank lines around an enum case.
- Extended PER coding style (`php.format.codestyle` set to `per`), enforcing blank line limits according to the [PHP PER coding style](https://www.php-fig.org/per/coding-style/).
- Resolved an issue with unwanted indentation in PHP files when using multiline template strings in javascript. [#2215](https://community.devsense.com/d/2215-unwanted-indentation/3)

### Debug

- Enhanced support for `.env` files in the debugger.
- Deprecated the `envfile` option; use `envFile` in `launch.json` instead for environment variable configurations.

### Fixes

- Fixed tripple-dots and inlay hints floating around when editing the code ([#776](https://github.com/DEVSENSE/phptools-docs/issues/776)).
- Sort and remove uses, and `editor.codeActionsOnSave` to sort and remove uses fixed for `.blade.php` files with embedded PHP code ([#483#issuecomment-2621398221](https://github.com/DEVSENSE/phptools-docs/issues/483#issuecomment-2621398221)).
- Workspace Symbols don't list files from `vendor` and folders specified in `"files.exclude"` setting.
- `.phar` files in composer packages are not ignored, and definitions from `.phar` files are properly included in IntelliSense.

## 1.55.16740 (January 22, 2025)

### Fixes

- Corrected indentation for multiline method parameter attributes [#767](https://github.com/DEVSENSE/phptools-docs/issues/767)
- Inlay return type hint `Generator` shown properly for functions yielding values (generators).
- Fixed bug when extension was trying to re-activate trial licenses every time the extension starts.
- Fixed use of Profiler when router script is specified.
- Fixed use of Profiler when more requests are made - all profiler outputs are opened. See [Profiler Documentation](https://docs.devsense.com/vscode/profiling/?h=profiler#quickly-setup-php-for-profiling) for details.

### Minor Features

- Code flow analysis infer full `Generator<TKey,TValue,TSend,TReturn>` type of generators, which improves type inferring inside `foreach` over the generator, type check of `Generator::send()`, and `Generator::getReturn()`.
- Colorize Laravel route parameters in `Route::`-like functions.
- Profiling launch configuration added (when there is no `launch.json` and user presses _Start Debugging_ (`F5`)).

## 1.55.16685 (January 15, 2025)

### More Laravel Support

- Completion and navigation for Laravel views and namespaced views.
- Completion and navigation for Laravel route names in `route()` function.
- Completion and navigation for components (`<x-...`) in Blade files.
- Completion and navigation of Livewire components after `<livewire:`.
- Completion and navigation for Livewire views in `@livewire()` and `Livewire::mount()`.
- Completion and navigation for component attributes from view class properties, Livewire `mount()` and `@props()` directive.
- Completion of views in `@includeWhen`, `@includeUnless`, and `@each` Blade directives.
- Completion for paths in specific Laravel functions (`asset`, `storage`, ...).
- PHP features (IntelliSense, Inlay Hints, Code Lenses, navigation, ...) enabled in `Blade` language.

### Formatting

As requested on [#2195](https://community.devsense.com/d/2195-add-new-blank-line-settings-and-update-psr-12-and-per-styles) we're introducting couple of new format settings:

- `php.format.rules.blankLinesBetweenUseTypes`: Specifies the number of blank lines between different types of `use` statements (e.g., classes, functions, constants). This does not affect blank lines between statements of the same type.
- `php.format.rules.blankLinesAfterOpenTag`: Specifies the number of blank lines to insert after an open tag, except when the closing tag is on the same line.

See [Customize Formatting](https://docs.devsense.com/vscode/editor/customize-formatting/#blanklines) for more details.

### Fix: Default Launch Configuration for Laravel Projects

- The default launch configuration has been fixed to correctly use the Laravel router script. 
- If you don't have a `.vscode/launch.json` file, simply open a `.php` file and press `F5`. The default launch action will start and debug the development web server (assuming you have Xdebug installed).
- Additionally, the initial `launch.json` configuration now contains the correct launch settings for Laravel projects.

> This fix affects using quick built-in development server whenever there is a web root in a subfolder, i.e. having `index.php` in `/public`, `/wwwroot`, or `/webroot`. Now, the built-in development server is started with a working directory same as the web root directory, e.g. `${workspaceFolder}/public`. You can try this if you don't have `.vscode/launch.json` file, and you press `F5` to start debugging.

### Minor Features

- Structured object typed are displayed in tool tips and inlay type hints.
- Improves type inferring, makes better use of `class-string<T>` annotations.

### Fixes

- Running tests from abstract classes [#753](https://github.com/DEVSENSE/phptools-docs/issues/753).
- Float and int literals in doc comment [#752](https://github.com/DEVSENSE/phptools-docs/issues/752).
- Invalid unnecessary parentheses hint [#750](https://github.com/DEVSENSE/phptools-docs/issues/750).
- Mouse hover and completion for expressions in parentheses [#743](https://github.com/DEVSENSE/phptools-docs/issues/743).
- Completion after conditional expression.
- Default aliases resolved automatically in `laravel\framework` >= `11.30`.
- Return type of a method resolved from base classes.
- Resolved an issue where the first line inside an `@php` directive in Blade files was indented further to the right each time the file was formatted, under certain formatting rule configurations ([#548](https://github.com/DEVSENSE/phptools-docs/issues/548)).
- Fixed an issue where an unwanted space appeared after control flow directives in Blade files during formatting.

## 1.54.16574 (December 23, 2024)

### Code Actions

- Added code actions for class member modifiers order (according to PSR-12) and for missing visibility modifier.

### Improvements

- Structured arrays are simplified in tooltips and hints ([#703](https://github.com/DEVSENSE/phptools-docs/issues/703)).
- Better completion and mouse hover after `->` operator, after assignment expression, after `new` without parentheses.

### Fixes

- Completion/Hover/Go To Definition after the new `...(set)` keywords.
- References count for class members referenced through `static::`.
- New `...(set)` modifiers in constructor properties.
- Renaming a global variable shows preview when renaming in another file.
- Doesn't check PSR autoload class name case-sensitively (there are issues with VSCode API and FileSystem API [#635](https://github.com/DEVSENSE/phptools-docs/issues/635)).
- Fixes unwanted space after function name in lambda functions [#2196](https://community.devsense.com/d/2196-no-spaces-after-function-name-formatting-rule)
- Navigation in properties with assymetric visibility [#741](https://github.com/DEVSENSE/phptools-docs/issues/741).

### Breaking Changes

- The extension does not bundle the old PHPUnit 6 binary anymore. When running PHPUnit tests, user needs to either install "phpunit/phpunit" composer package or specify `"phpunit.phpunit"` setting value.

## 1.54.16480 (December 10, 2024)

### PHP 8.4 Syntax

The editor respects the new PHP 8.4 asymmetric visibility syntax ([#728](https://github.com/DEVSENSE/phptools-docs/issues/728)). In case your PHP version does not support it yet, the syntax is underlined as error.

### Profiling Tests &amp; Launch Profiles

Test Explorer allows to Run, Debug, and newly Profile PHPUnit tests (if [PHP Profiler](https://marketplace.visualstudio.com/items?itemName=DEVSENSE.profiler-php-vscode) extension is installed). See [Profiling Tests](https://docs.devsense.com/vscode/test-explorer#profiling-tests) for details.

Additionally, [custom `launch.json`](https://docs.devsense.com/vscode/test-explorer#custom-debug-launch-profile) "php" profiles can be used to run tests. 

### Code Actions Have ID

More code actions have been documented (see [Code Actions List](https://docs.devsense.com/en/vscode/code%20actions/list)), so they can be [hidden](https://docs.devsense.com/vscode/code%20actions/hide-code-action) or marked as autofix. [Autofix](https://docs.devsense.com/vscode/code%20actions/autofix) is a neat feature allowing you to implicitly apply useful code actions (when available) on file save or as using "Autofix" command.

### Improvements

- Better suggestion of variable names in syntactically broken file.
- More specific warning message for assigning non-variable by reference.
- PHP manual **Italian** language added. Use command `> PHP Manual Language` or setting `"phpTools.language": "it"`. Note, texts not translated are displayed in English.
- Running PHPUnit tests is faster ([#725](https://github.com/DEVSENSE/phptools-docs/issues/725)). Whenever possible, specific file path is passed to PHPUnit so it won't scan everything.
- `"php.executablePath"` setting can be changed in workspace scope settings.
- `"php.executablePath"` and `"php.executables"` can contain variables, i.e. `"${workspaceFolder}/bin/php"`.
- **ORM**: Infers repository class when calling `EntityManager::getRepository(class-string<T>)` using corresponding `#[ORM\Entity(repositoryClass)]` attribute on class `T` ((#2174)[https://community.devsense.com/d/2174]).
- Added code fixes required for WordPress and PER code style.

### Fixes

- Resolved an issue where the `php.format.rules.maxBlankLines` setting was not correctly applied at the end of files. [#2188](https://community.devsense.com/d/2188-maxblanklines-does-not-work-properly-at-the-end-of-a-file)
- Updated the Laravel code style to place the opening brace of anonymous types on a new line, ensuring alignment with Laravel conventions. [#734](https://github.com/DEVSENSE/phptools-docs/issues/734)
- Laravel code style removes a space before return type in function declaration [#734](https://github.com/DEVSENSE/phptools-docs/issues/734)
- Fixes use of template type arguments in a derived class declared in a `/vendor/` folder (e.g. ORM's `EntityManager::getReference()`).

## 1.53.16379 (November 19, 2024)

### Code Actions Settings

**Code Actions Severity** can be changed now. It means certain refactorings or suggested quick fixes can be either hidden or marked as a warnings or error. 

To hide a code action, use either:

- the corresponding quick fix "Do not show"
- or add the code action to `"php.problems.exclude"` VSCode setting.
- or add the code action to your `.editorconfig` file.

To change its severity, add the code action to your `.editorconfig` file. The following sample marks all the redundant closing tags `?>` as errors, forcing you to clean it up:

For details, see:

- [Set Code Action Severity](https://docs.devsense.com/en/vscode/code%20actions/severity)
- [Hide Code Action](https://docs.devsense.com/en/vscode/code%20actions/hide-code-action)

```ini
[*.php]
php_remove_redundant_closing_tag = error
```

**Code Action Autofix**: a code action can run as auto-fix now. See [Auto-fix](https://docs.devsense.com/en/vscode/code%20actions/autofix) for details.

### Diagnostics

- New diagnostic checking invalid use of `instanceof` with a trait on right side.

### Fixes

- Indexing meta files in `vendor` folder.
- Indexing symlinked packages in `vendor` pointing outside the VSCode Workspace ([#684](https://github.com/DEVSENSE/phptools-docs/issues/684)).
- Fixed deleting text after cursor ([#638](https://github.com/DEVSENSE/phptools-docs/issues/638)).

## 1.53.16338 (November 12, 2024)

### Formatting

We’re excited to announce the introduction of a new **PER** code style option in our extension, aligned with the [PHP-FIG PER coding style standard](https://www.php-fig.org/per/coding-style/). This coding style is designed to help PHP developers maintain consistent, high-quality code that follows the latest industry standards. By using **PER**, you ensure your project’s code adheres to a standardized format, enhancing readability, maintainability, and collaboration with other developers.

![PER code style](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/settings-codestyle-per.png)

To apply this style, simply set `"php.format.codestyle"` setting to `"per"` in your configuration settings, and the formatting adjustments will be automatically applied to your project. This new option is a great way to streamline code formatting and ensure alignment with the **PER** guidelines across your PHP codebase. Happy coding!

### Code Actions

The [Sort Uses Code Action](https://blog.devsense.com/2023/sort-uses-and-remove-unused-uses-on-php-file-save) is a powerful tool that can be applied in several contexts: as a code action, during auto-import, and in conjunction with the `editor.codeActionsOnSave` setting. This feature allows developers to automatically organize their `use` statements in a consistent order, making the code cleaner and more readable.

To further customize the behavior of this feature, you can control its case sensitivity. The setting **`"php.sortUses.caseSensitive"`** lets you specify whether sorting should take case sensitivity into account. Set this option to `true` for case-sensitive sorting, or `false` for case-insensitive sorting. By default, sorting is **not case sensitive**, so all `use` statements will be ordered without distinguishing between uppercase and lowercase letters. 

For more details, check out the related discussion [#2127](https://community.devsense.com/d/2127) on our community forum.

### Diagnostics

- Added diagnostic for using invalid class name, i.e. a reserved class name.

### Fixes

- Copilot chat window does not break IntelliSense and code diagnostics; after closing changes suggested by Copilot chat are ignored.
- Fixed finding references between methods in class and traits used by this class.
- Fixed indexing composer packages symlinked outside the project folder.
- Fixed language server crash when class is named 'parent' or any other reserved keyword.

## 1.52.16273 (October 30, 2024)

### Format Settings in `.editorconfig`

Newly, the code formatting rules can be fully adjusted using the standard `.editorconfig` file. See ["customize formatting"](https://docs.devsense.com/vscode/editor/customize-formatting) for details.

### Improvements

- Tool-tip text keeps the PHPDoc summaries formatted as they are (#2145)[https://community.devsense.com/d/2145].
- Type inferring improvements.
- Added quick action to ignore specific diagnostic globally.

### Fixes

- Fixes `function` import code actions.
- Fixes format on type.
- Diagnostic: `FFI\CData` can be used as array.

## 1.52.16226 (October 21, 2024)

### Features

- **New `PHP > Format Multiple Files`** command that lets you batch format multiple `.php` files. First enter the **glob pattern**. All the format changes will be first collected and shown in a **preview window**. Files will be modified upon confirmation.
- **New code action** to change fully qualified function name to an alias ([#693](https://github.com/DEVSENSE/phptools-docs/issues/693)).
- **New setting `php.format.exclude`**. This allows to specify one or more glob patterns for files that won't get formatted using PHP formatter. This includes `formatOnType`, format document, `formatOnSave`, and format selection. Also when using the new `Format Multiple Files` command, excluded files will be implicitly unchecked during the final format review.

### Improvements

- Default language level changed to 8.3.
- Inlay hints with named parameters can be inserted on double-click only when labguage level is set to PHP 8.0 or greater ([#686](https://github.com/DEVSENSE/phptools-docs/issues/686)).
- `.vscode-server` excluded from indexing by default ([#2132](https://community.devsense.com/d/2132)).
- Respecting `@property-write` together with `@property-read`.
- Structured array syntax in tool-tips (array types are not oversimplified in tool-tips).
- `callable()` with `...` is properly parsed and variadic arguments are shown in tool-tips and respected by inlay hints.
- `@template-contravariant` PHPDoc keyword ([#695](https://github.com/DEVSENSE/phptools-docs/issues/695)).
- Parentheses are not inserted when completing function name after the `use function` construct or as a trait alias.
- Parses `covariant` and `contravariant` modifiers in PHPDoc generic type specfication ([#699](https://github.com/DEVSENSE/phptools-docs/issues/699)).
- `@param` from inherited class respected [#702](https://github.com/DEVSENSE/phptools-docs/issues/702).
- Anonymous function's `$this` infered from containing `Closure::bind()` call [#701](https://github.com/DEVSENSE/phptools-docs/issues/701).

### Fixes

- Fix of unused use falsely reported when used in `@phpstan-import-from`.
- `/** @var */` annotation above assignment does not mismatch types further below.
- `private` typed properties are not shown in code completion when in non-private context.
- `InstalledVersion.php` from composer is indexed by IntelliSense.
- Fixed typo in diagnostic message.
- Falsy warning about private properties while having magic `__get` method.
- Code completion after `identifier( new )->` ([#678](https://github.com/DEVSENSE/phptools-docs/issues/678)).
- Fixes completion after `default` function name ([#692](https://github.com/DEVSENSE/phptools-docs/issues/692)).
- Fixes falsy check for `ArrayAccess` method overrides in PHP &lt; 8.1 ([#689](https://github.com/DEVSENSE/phptools-docs/issues/689)).
- Fixes completion after function return type hint and keywords ([#670](https://github.com/DEVSENSE/phptools-docs/issues/670)).

## 1.51.16099 (September 26, 2024)

### Improvements

- Checking special array function for by-ref arguments. 
- Recognizes `"php-64bit"` version requirement in `composer.json`. [#665](https://github.com/DEVSENSE/phptools-docs/issues/665)
- PHPDoc `Closure()` with `...` alone. [#661](https://github.com/DEVSENSE/phptools-docs/issues/661)

### Debug

- Added support for `skipEntryPaths` setting, which allows specifying glob patterns to skip if the initial entry file is matched.

### Fixes

- Fixes navigation to static object members through `::` operator (tooltips, goto definition, code completion). **[#666](https://github.com/DEVSENSE/phptools-docs/issues/666)** [#2126](https://community.devsense.com/d/2126)
- Fixes indexing of `vendor` when excluded from workspace [#2100](https://community.devsense.com/d/2100).
- Fixes unwanted transformation of `FILTER_NULL_ON_FAILURE` constant to lowercase [#2085](https://community.devsense.com/d/2085-incorrect-auto-lowercasing-of-filter-null-on-failure-constant-in-php-code/8).
- `sodium` included in stubs by default.
- `object` type hint respecting structured `object` phpdoc type hint.
- Code completion works after multiple `::` expression chain.
- Fixes binding of template type arguments in inferred types [#2106](https://community.devsense.com/d/2106-function-parameter-return-type).
- Fixes caching of composer packages when composer is still running.
- Fixes formatting issue with `php.format.rules.alignConstants` not correctly aligning constants outside of class context when a namespace is declared. [#2114](https://community.devsense.com/d/2114-alignconstants-not-always-working)
- Faster initial indexing when there's many composer packages in `vendor` folder.
- "auto-import" adds `use` to the correct namespace scope.
- Fixes possible language server crash when having too many `@import` directives with `from` aliasing. 

## 1.51.15986 (September 10, 2024)

### Improvements

- Not showing useless tooltips ([#611](https://github.com/DEVSENSE/phptools-docs/issues/611)).
- Respects `class-string<T>` annotation when accessing static class members through indirect type.
- Property access visibility check.
- Colorize constant values in PHP doc blocks in a uniform color.
- Type inferring improvements, `@global` tag inherited from base if necessary.
- Refactoring suggestion `switch`->`match` only for PHP>=8 ([#2098](https://community.devsense.com/d/2098)).
- Refactoring and find-references resolving dynamic member access to get better results ([#2093](https://community.devsense.com/d/2093)).
- Enabled standard **inlay hints** by default.

### Fixes

- Fixes missing code folding that started at the beginning of the file.
- Fixing variables completion inside double-quoted strings.
- Fixes updates to `php.stubs` not being respected.
- Fixes updates to `.phar` files in workspace not being included in IntelliSense.
- Fixes align `php.format.rules.alignConsecutiveAssignments` when left value of the assignments is multiline expression. [#642](https://github.com/DEVSENSE/phptools-docs/issues/642)
- Fixes mouse hover for typed const declaration.
- Fixes false warning for using `@extends` on interface.
- Fixes (re-enable) quick fixes for unknown class warning.
- Keeps `@internal` functions in packages cache (i.e. keeps them in IntelliSense).

## 1.50.15906 (August 20, 2024)

### Improvements

- Class constant and enum case checks are correctly case-sensitive.
- Generic type arguments syntax accepts `*` token.
- PSR-4 checks for `"autoload-dev"` rules as well.
- Updated integrated PHP manual, adds `SimpleXmlElement::saveXml`.
- More checks for parameters passed by-ref.

### Fixes

- Fixes problem after document rename on Windows, code actions were corrupted after the renaming file with different letter casing.
- Fixes PSR-4 class name and file path checks and corresponding rename code action.
- Fixes invalid type inferring after `is_numeric()`.
- Fixes incorrect refactoring suggestion of `A ? A : B`. Instead `?:` is correct.
- Fixes override checks with implicit nullables, `never`, and traits.
- Fixes use of `Function` keyword in a namespace name.
- Fixes use of `Collection<T>` with just a single generic type parameter.

## 1.50.15872 (August 13, 2024)

### Editor

- Highlighting of names in structured array/object types ([#597](https://github.com/DEVSENSE/phptools-docs/issues/597)).
- Highlighting of PHPDoc tag names and reserved type names using `keyword` color (depends on selected theme) ([#612](https://github.com/DEVSENSE/phptools-docs/issues/612)).
- Highlights PHPDoc block above trait `use`.

### PHP 8.4 Support (Preview)

This update adds support for the new PHP 8.4 features, including:

- Property hooks, and `__PROPERTY__` magic constant.
- `new` without parentheses.
- Formatting for properties and property hooks.

### Formatter Blank Lines Settings

PHP code formatter has a whole new group of settings "`Blank Lines`" for adjusting blank lines between various kinds of code sections. You can adjust spaces above declarations, class bodies, comments, functions, and more. See the settings for the full list of `php.format.rules.blankLines***` options.

### Features

- `"php.docblock.colorMode"` user-scope setting allows to simplify colorization of PHPDoc blocks ([#612](https://github.com/DEVSENSE/phptools-docs/issues/612)).
- Checking for PSR-4 autoload rules, class names, and file names. Quick Fix for PSR-4 file name mismatch ([#609](https://github.com/DEVSENSE/phptools-docs/issues/609)).

### Improvements

- Adjusted completion sorting for not-imported global types ([#598](https://github.com/DEVSENSE/phptools-docs/issues/598)).
- Magic constants (`__METHOD__`, `__PROPERTY__`, etc.) are checked if they are used in a correct context.
- Diagnostics improvements, fixes for `try`/`finally` control flow and reachability analysis.
- Improved type inferring.

### Fixes

- Fixes code folding when there is a HTML folding crossing a PHP code folding. ([#594](https://github.com/DEVSENSE/phptools-docs/issues/594))
- Fixes argument type check for `self`.
- Fixes use of `@suppress` above function or class.
- Fixes an issue causing unwanted spaces after formatting `require` and similar statements.
- Fixes an issues when formatting complex expressions in array initializers when using the `php.format.rules.arrayInitializersAlignKeyValuePairs` setting.
- Fixed an issue where unwanted line wrapping occurred in code blocks during formatting. [#2057](https://community.devsense.com/d/2057-formatting-sometimes-takes-2-passes/)

## 1.49.15728 (July 8, 2024)

### Improvements

- Doc Comment generated upon typing `/**` above declaration. This features does not require `formatOnType` enabled anymore.
- Triggering suggestion after typing `$` inside double-quoted strings.
- Triggering suggestion when typing a type hint inside a Doc Comment.
- Initial support for `@phpstan-assert`, `@phpstan-assert-if-true`, `@phpstan-assert-if-false`.
- PhpUnit tests discovered in nested directories, and respecting `prefix` configuration.
- `"source.organizeImports"` code action on save won't remove unused uses, as it might not be desirable. ([#1883](https://community.devsense.com/d/1883))
- Added explicit code actions for `"editor.codeActionsOnSave"` setting:
    - `"source.source.sortImports"`: only sorts uses. The same as `"source.organizeImports"`.
    - `"source.source.sortAndRemoveImports"`: removes unused uses and sorts the rest.
- Recognizes unsealed array shape type ([#587](https://github.com/DEVSENSE/phptools-docs/issues/587))
- Blade respects short open tags.

### IntelliSense

- Laravel's `Macroable::macro()` gets better `$this` inferrence inside nested lambda function.
- `@param` completion with missing parameter names.

### Hints (`...`)

Code with an available quick refactoring is annotated using three small dots. There is a mouse tooltip with more details and a quick fix which performs the corresponding code action.

![Quick Fix Hints](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vsc-hint-quickfix.gif)

### Debugger

- Added support for Unicode array keys and property names.
- Debug console provides completion for variable names.

### Fixes

- Fixes `Align Properties` format rule, ensuring proper alignment even after consecutive formatting actions.
- Crash fix when having `@extends parent<>` annotation, with template arguments ([#585](https://github.com/DEVSENSE/phptools-docs/issues/585)).

## 1.48.15635 (June 16, 2024)

### Improvements

- Improves initial indexing, postpones discovering test cases after indexing is done.
- Optimizations, memory usage improvements.
- Better `ReflectionClass::getMethods()` type inference.
- Unified logging into OUTPUT panel.
- Implementing abstract functions adds universal `@inheritDoc` doc comment.
- `Sort uses` code action removes duplicates.

### Formatting Improvements

#### Align Properties

The formatter now provides `Align Properties` functionality to align the properties within class definitions for improved code presentation and readability. Activate this feature using the `php.format.rules.alignProperties` option.

```php
class X
{
    var       $a   = 1;
    public    $bb  = 2;
    protected $ccc = 3;
}
```

### Fixes

- Function override check respects `#[ReturnTypeWillChange]` attribute.
- Fixes false unused variable warning about object that is used as an array ([#533](https://github.com/DEVSENSE/phptools-docs/issues/533)).
- Fixes code folding when there is `array()` or single-lined blocks.
- Fixes code completion right after a comment.
- Rename and highlight occurences of private fields fixes.
- Stability fixes.
- Fixes formatting issues when php is mixed within javascript [#2012](https://community.devsense.com/d/2012-php-file-with-mixed-php-and-javascript-using-in-vscode)

## 1.47.15512 (May 28, 2024)

### Blade `.blade.php` Support

- Supports `@use` directive including type aliases. The code completion and IntelliSense recognized imported and aliased classes properly.
- Highlighting of `@class` directive and other inside HTML tags.
- Opening and closing blade tags highlighted as PHP keywords and HTML begin/end token.
- Improves completion of PHP code, PHP functions signature help, and PHP code folding in blade files.
- Stability fixes.

![Blade @Use completion](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vsc-blade-use.gif)

### Diagnostics

- Respects `/** @ignore $variablename */` so if the `$variablename` is unused, the problem is not reported.
- Supports more complex conditional return type, i.e. `@return ($name is class-string<T> ? T : bool)` ([#538](https://github.com/DEVSENSE/phptools-docs/issues/538)).
- Fixes false unreachable code warning ([#556](https://github.com/DEVSENSE/phptools-docs/issues/556)).
- Handles checks for `method_exists` and `function_exists` to avoid false warning about unknown functions.

### New Features

- Infering lambda function parameters type from target `callable()` PHPDoc type annotation.
- Added inlay hint for infered lambda parameter types. Enable `"php.inlayHints.types.lambdaParameter"` setting.

![Inlay for infered lambda parameters](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/inlay-lambda-parameter-type.png)

### Rename Refactoring

The rename refactoring has been partially reimplemented, new rename scenarios have been implemented, and various cases fixed. The refactoring handles class/const/function imports correctly, template type names, occurences of names in strings and arrays, and more.

#### New Features

- **Renaming aliased type names correctly** so when renaming a type alias which differs from the original type, only the alias is renamed.
- **Renaming aliased functions and constants** behaves correctly now.
- **Renaming generic types** has been fixed and optimized.
- **Renaming imported template types** has been implemented. This works for various PHPDoc tags like `@phpstan-import-from`, `@psalm-type`, etc.
- **Find references** to template type names and type names fixed and new scenarios handled correctly.

Please let us know if there any issues with rename refactoring - we're keen to improve.

_Known missing features:_ rename namespace, rename named arguments. Work in progress.

### Improvements

- Folding for colon blocks (`if:`, `switch:`, `while:`, `for:`, `foreach:`).
- Improves mouse hovers for `by-ref` functions.
- Blade formatter indents PHPDoc blocks in `.blade.php` files correctly.
- Adds selection range inside function header parameters.
- Expanding selection range to corresponding PHPDoc block.
- Generating getters/setters adjust the whole identifier to match `"php.completion.namingConvention"` setting. ([#2011](https://community.devsense.com/d/2011-getters-setters-function-case))

### Fixes

- Fixes unwanted space before named arguments which happens to be keywords as well. [#555](https://github.com/DEVSENSE/phptools-docs/issues/555)
- All PHP child processes are killed after stopping debug sessions. [#542](https://github.com/DEVSENSE/phptools-docs/issues/542)
- Fixes _Outline_ when there is an anonymus `class` ([#557](https://github.com/DEVSENSE/phptools-docs/issues/557)).
- Fixes L-Value variables type in mouse hover.
- Fixes unwatend space after `empty` in lambda function [#564](https://github.com/DEVSENSE/phptools-docs/issues/564)
- Resolved an issue where setting or removing breakpoints during an active debug session caused VSCode to incorrectly flag them as unverified.

## 1.46.15409 (May 9, 2024)

### Features

- Inline suggestion after `namespace`.
- Folding blade blocks.
- Completion for blade tags.
- `.blade.php` files formatting (must be opened as a PHP file).

### Blade Formatting

The blade (`.blade.php` files) code formatting has been implemented. The formatter combines HTML/CSS/JS and PHP pretty print and PHP indentation, together with blade blocks indentation.

There are no further settings (yet). Based on your feedback, we'll be adding more settings and fixes!

![Blade Formatting](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vsc-blade-format.gif)

> Note, if you have another Blade extension, this feature might not be available. Make sure, the language of opened `.blade.php` file is set to `PHP` (the lower right corner of your VSCode window).

### HTML Auto Closing Tags and Attributes

In PHP code, HTML tag elements now close automatically when you type the `>` of the opening tag. Similarly, when you enter the `/` of the closing tag, a matching closing tag is inserted seamlessly.

Additionally, HTML attribute quotes are now automatically included when you type `=`.

### Auto Renaming HTML Tags

Auto-renaming HTML tags is enabled by default now. You can disable this feature using the following setting in your VSCode's `settings.json`:

```json
"[php]": {
    "editor.linkedEditing": false
}
```

![Auto-Renaming HTML Tags](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vsc-html-linkededit.gif)

### Improvements

- Performance and memory usage improvements.
- Shrink/expand selection works in HTML part of the php files and blade files (`Shift+Alt+Left` and `Shift+Alt+Right`)

### Fixes

- Fixes override checks for `static` return types.
- Fixes inlay hints in `.blade.php` files when modifying code.

## 1.45.15272 (April 11, 2024)

### Outlining of Javascript and CSS in PHP files

You can now fold Javascript and CSS code blocks within PHP files, enhancing code organization and readability.

### Fixes

- Fixes language server crash when showing signature help of a closure ([#539](https://github.com/DEVSENSE/phptools-docs/issues/539)).
- Fixed unwanted new line after chained method call [#1969](https://community.devsense.com/d/1969-help-on-formatting-rules)

## 1.45.15260 (April 8, 2024)

### New Features

- Completion list shows function signatures (experimental) - enable setting `"php.completion.showParameters"`.
- New code action to change `define` to `const` if applicable.
- Code action to fix invalid casing of `string` PHPDoc type hint.
- Diagnostic for possibly wrong `foreach` variables.
- Setting `"php.completion.showDeprecated"` to control whether to hide or strikethrough deprecated symbols in completion list. They are shown and strikethrough by default.

### PHPUnit Test Explorer

The test explorer respects the `#[Test]` attribute and shows corresponding tests in the list.

### Improvements

- Override dignostic respects possible `class_alias` of the type hints.
- Override dignostic underlines trait use, it the trait introduces an incompatible method.
- Type inferring improvements.
- Handling some invalid PHPDoc type annotations.
- More quick code suggestions.
- Optimizations.

### Fixes

- Fixed incorrect wrapping of php code blocks in html [#1953](https://community.devsense.com/d/1953-format-html-code-in-php)
- No new line is introduced before `<!DOCTYPE html>` tag when formatting [#1940](https://community.devsense.com/d/1940-no-line-break-between-and-doctype)

## 1.45.15192 (March 26, 2024)

### Auto renaming HTML tags

You can now rename HTML tag pairs in php files with a single edit. Turn this feature on by enabling `editor.linkedEditing` in your `settings.json`:

```json
"[php]": {
    "editor.linkedEditing": true,
}
```

### Improvements

- Function hover information displays generic type arguments if any ([#1915](https://community.devsense.com/d/1915)).
- Improves displaying template type arguments of trait members in hover tooltip.

### Fixes

- Fixes unwanted space before parenthesis in `empty`, `isset` or `exit` ([#522](https://github.com/DEVSENSE/phptools-docs/issues/522))
- Fixes possible freezing when code contains complex array initializers.
- Fixes override diagnostics for `Closure`-typed parameters.
- Fixes parser to allow `namespace private;` construct.
- Fixes type inferring of inherited template type arguments ([#503#comment](https://github.com/DEVSENSE/phptools-docs/issues/503#issuecomment-1998885037))

## 1.45.15145 (March 14, 2024)

### New Settings

- **php.hover.parametersFullName**: show full type names (shortened tu the current namespace) in tool tips.
- **phpTools.suppressPremiumFeatures**: disables some notifications about premium features like code actions.

### Override Diagnostic

Added diagnostics for correct method override ([#234](https://github.com/DEVSENSE/phptools-docs/issues/234)), including checks for correct use of `#[Override]` attribute.

Additionaly, the editor provides quick fixes for common override errors.

### Improvements

- `expectedArguments()` from `.phpstorm.meta.php` respects class name scoping, use of mixins, and traits. ([#1929](https://community.devsense.com/d/1929))
- Type inferring improvements.

### Fixes

- Automatic `organizeImports` and `fixAll` does not slow down VSCode when premium not active. ([#504](https://github.com/DEVSENSE/phptools-docs/issues/504))
- Fixed missing `mixed` in code completion.
- Fixed some missing Eloquent model functions.
- Fixed structured array doc comment type with `@` in an entry name. ([#508](https://github.com/DEVSENSE/phptools-docs/issues/508))
- Fixed unwanted space after `return` when formatting. [#509](https://github.com/DEVSENSE/phptools-docs/issues/509)
- Fixed initial load of Test Explorer ([#1934](https://community.devsense.com/d/1934)).
- Fixes wrapping of `unset` statements, it's controled by `callParametersWrap` option. [#518](https://github.com/DEVSENSE/phptools-docs/issues/518)

## 1.45.15061 (February 27, 2024)

### Improvements

- Automatic parentheses completion works in combination with *IntelliPHP* suggestions.
- Improved type inferring and type checks.
- Improved `foreach` type inferring when taking advantage of generic type arguments and _ide_helper.
- Blade syntax highlighting for inline tags.
- Code formatter pretty prints PHP code in `.blade.php` files.
- IntelliSense for eloquent Model classes.

### Refactorings

- Concatenation to String interpolation refactoring.

### Formatting

Introduced the `php.format.declCompactEmptyBody` option, which now automatically converts an empty function body into {} and maintains it on the same line as the preceding symbol, separated by a single space.

```php
function foo() {}
```

Additionally, we've included support for the wrapping option `always`, ensuring that the appropriate syntax construct is always wrapped.

### Fixes

- Fixed semantic highlighting in `.blade.php` files.
- Updating problems after adding/removing `"php.stubs"`, or adding/removing `ext-**` in `composer.json`'s `require`.
- Code action to implement interface or abstracts adds correct type hints.
- Fixed rare language server crashes (out of memory, 100% CPU, and crash).
- Fixed unwanted space after function names which happen to be keywords as well [#1481](https://community.devsense.com/d/1481-space-after-if-as-a-formatting-rule)
- Fixed formatting that was not working at all.

## 1.44.14997 (February 14, 2024)

### Improvements

- Improved format selection for mixed PHP, HTML/CSS/JS code, improving `editor.formatOnType` and `editor.formatOnPaste` behaviors.
- Support for `@psalm-yield` doc comment tag, and infers `yield` result type accordingly.
- Diagnostics for `#[Override]` attribute.
- Support for phpdoc types `trait-string`, `interface-string`, `enum-string`, `callable-string`.
- Support for `phpcs:ignore` comment.

### Tool-Tips Improvements

- Tool-tips show shorter type names (can be changed using `"php.hover.parameters.fullname"` setting).
- Signature help tool-tips shows `never` return types if appropriate.
- `class-string` type hint fixes.

### Fixes

- Highlighs blade tags correctly inside HTML comments.
- Fixed completion of function override.
- Fixed incorrect indentation of multiline expression parts when preceded by line comments.
- Avoids false `6404` diagnostic when accessing variable as array.
- Updates related diagnostics in other files when a file changes.
- Stability fixes.

## 1.44.14950 (February 7, 2024)

### Improvements

- Automatic format-on-type after typing `default:` or `case ... :`.
- Improves mouse hover for function signatures with more detailed `array` type specification.
- Improves type inferring for `array_rand()` and `is_array()`.
- Fixes use of `{{` in PHP code.
- More Laravel Blade tags supported (`@extends`, `@can`), fixes syntax errors in blade tags.

## 1.44.14925 (February 5, 2024)

### Laravel Blade Editor

This update enables experimental colorization of PHP syntax inside Laravel Blade tags:
- colorize code inside `{{`/`}}`, `{!!`/`!!}`, `{{{`/`}}}`, `@php`/`@endphp`
- colorize code in Blade tag expressions, i.e. `@if ( ... )`
- colorize blade tags
- colorize blade comments, i.e. `{{-- ...  --}}`

Additionally, all the nested PHP code gets the standard features including **IntelliSense**, **diagnostics**, **code actions**, **code fixes**, **tooltips**, and more.

![blade editor colors](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vsc-blade-colorization.png)

### Improvements

- Automatically formatting code after applying a code action or a code fix.
- Improves array type analysis for builtin `array_*` functions.
- Understands more doc block tags prefixed with `@psalm-`, i.e. `@psalm-property`, `@psalm-readonly`, `@psalm-trace`, and more.
- Inlay hint and variable highlighting for doc block tag `@trace` or `@psalm-trace`.
- `.blade.php` files overall parser improved - respects `@php` and `<?php` blocks, respects most documented blade tags and blocks.
- Respects `never` returning functions, function that _exits_, and function that always throws exception.
- Shows tripple dots when code action available.

### Code Actions

- Quick refactoring of `if` into `switch` if possible.
- Remove unnecessary parentheses, and dim them.

### Formatting

We've changed a default behaviour how braces are indented when present directly in switch items. [#1897](https://community.devsense.com/d/1897-custom-formating-rules)

### Fixes

- Fixes an issue where formatter could result in incorrect indentation for complex files containing a blend of PHP and HTML elements. [#1881](https://community.devsense.com/d/1881-autoformat-on-save)
- Fixes incorrect indentation of comments before class const uses [#476](https://github.com/DEVSENSE/phptools-docs/issues/476)
- Fixes a formating case when part of css selector is generated by php [#1736](https://community.devsense.com/d/1736-auto-formatting-error-in-css)
- Fixes tooltip of `never` returning functions.
- Fixes incorrect indentation of attributes in function parameters [#1899](https://community.devsense.com/d/1899-autoformat-attributes-indentation-in-function-parameters)
- Fixes unwanted removal of new lines when formatting a specific case [#1895](https://community.devsense.com/d/1895-php-formatting-issue)
- Stability fixes.

## 1.43.14858 (January 24, 2024)

### Unnecessary Parentheses

Parentheses that can be safely removed are dimmed in the code now, and a corresponding code fix "Remove unnecessary parentheses" is available.

### Improvements

- Type inferring for generic arguments inferred from lambda return type.
- Formatter handles `@formatter:off` and `@formatter:on` directives in comments.

### Formatting

Based on user's feedback [#395](https://github.com/DEVSENSE/phptools-docs/issues/395), we've added a new code style for Joomla developers! To enable it set `"php.format.codeStyle"` setting to `"joomla"`.

### Fixes

- Code style (`"php.format.codeStyle"` setting) for `"drupal"` fixed - inserts spaces.
- Completion after `::` operator fixed.
- Avoids triggering completion when typing a new array `[` ...
- Fix of wnwanted space after `case` identifier [#469](https://github.com/DEVSENSE/phptools-docs/issues/469)
- Fixes incorrect occurences highlighting when there are arrays with two empty strings.
- Memory and performance improvements.
- Fixes bug causing constant CPU use, and never-ending _devsense.php.ls_ process.

## 1.43.14756 (January 15, 2024)

### Code Completion for `$_SERVER` and `$GLOBALS`

Code completion provides known array keys for `$_SERVER` and `$GLOBALS` superglobal variables. Type inferring also takes them into account.

![$_SERVER items completion](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vsc-server-var-completion.gif)

### Code Completion for Array Keys

Array keys are listed and completed as possible. This works great with structured array doc comments (e.g. `array{name:string,id:int}`) and array initializers (e.g. `new ['name' => "John, 'id' => 1]`).

### Code Actions and Refactorings

- Code Action to generate getter/setter for a constructor property.
- Code Action to simplify `isset(A) ? A : B`.

### Improvements

- Doc Block with multiline `array<>` syntax supported.
- Doc Block with `@psalm-type` definition using `=` character supported.
- Doc Block with `@var` defining a type of a whole expression (not just a variable) is handled.
- Type analysis improved in case there is a lot of array types with key names.
- Type analysis handles complex L-value of `instanceof` operator.
- Type analysis improved in case there are a lot of array types with key names.
- Type analysis for `??` operator improved.
- Improves handling global variables in WordPress source code.
- Code completion for array keys, type inferring for array entries, and trigering completion after `[`.
- Inlay hint for variables by reference (`&`) and expressions type won't be inserted on double-clicking.
- PHP language level respects `composer.json` if no specific `php.version` is set.

### Formatting

- Implemented chained method calls wrapping based on user request ([#1868](https://community.devsense.com/d/1868-new-line-after-method-chaining)). Currently, only the `always` option is allowed for this setting.
- Added the ability to specify the placement of the semicolon on a new line when method chaining wrapping applies.

### Debug

We've added `maxConnections` launch setting to control the maximum number of simultaneous debug sessions. [#353](https://github.com/DEVSENSE/phptools-docs/issues/353)

### Fixes

- Fix of unexpected whitespace after `do` in method name [#1871](https://community.devsense.com/d/1871-unexpected-white-space-after-function-name)
- Statiblity fixes for Stack Overflow Exception (happens in Symfony framework) [#437/46](https://community.devsense.com/d/437-stack-overflow-in-symfony-project/46)

## 1.42.14626 (December 30, 2023)

### Improvements

- Improved `array_unshift()` type analysis.
- Refactoring of `private` properties.
- Refactoring of property names specified inside `property_exists()` function.
- Improved detection and completion for eloquent local scopes.
- WordPress's structured array/object doc comment syntax is recognized and respected by code analysis and code completion.
- Tooltip for variable annotated with `@var` with inline description.
- Workarounds diagnostics in incorrectly generated type names in `_ide_helper.php`.
- Diagnostic for `${}` deprecated string interpolation and corresponding code action.
- Diagnostic for redundant closing `?>` tag and corresponding code action.

### Fixes

- Updated PHP parser to handle keywords in PHP8+ FQN namespace syntax.
- Startup fix when opening a workspace from `ftp://` remote using some FTP extensions.
- Fixes falsy diagnostics of unreachable code.
- Not reporting unknown property if it was checked with `property_exists()`.
- Fixed _inlay hints_ in ambiguous function calls (function defined on two places or opened in two files).
- Crash fixes.

## 1.42.14434 (December 12, 2023)

### PHP Stubs UI

Adding a quick command `> Workspace Stubs` which popups quick selection of stubs (PHP books and other stubs including `"WordPress"`) to be available to IntelliSense and Code Analysis.

![PHP Stubs UI](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vsc-php-stubs-ui.png)

### `"source.fixAll"` Action

Safe quick fixes, such as simplifying a name, can be auto-fixed on file save. Use the following settings to apply safe quick fixes on file save:

```json
"editor.codeActionsOnSave": {
    "source.fixAll": true,
    "source.organizeImports": true
}
```

### Debug

#### Breakpoint Resolution

Improved breakpoint resolution by validating breakpoint locations through information from Xdebug. Notably:

- Bound breakpoints are highlighted in red.
- Unbound breakpoints are visually distinguished in grey.
- In cases where a valid location close to the breakpoint couldn't be bound, the breakpoint is automatically adjusted to the valid location.

#### xdebug_notify Support:

Added support for `xdebug_notify()`, enabling the sending of information and objects to the debug console. This feature enhances the debugging experience by facilitating the communication of relevant data directly to the console.

#### Error and Warnings

We've implemented the output of PHP warnings and errors to the debug console.  This approach provides a centralized location for developers to monitor and address issues during debugging sessions.

### Improvements

- **Quick Fix** for missing function `use`.
- Added **`php.stubs`** for `newrelic`.
- Implicitly includes **PHP stubs** from `composer.json` into IntelliSense and Code Analysis.
- **More complex PHP executable**: This allows using a remote `php`, or a custom command to run `php`. Settings `php.executablePath` or `php.executables` can have a command with arguments (i.e. `ddev exec php`). **NOTE:** double-quotes might be needed now.
- **PHPUnit path can be absolute**: Put the setting `phpunit.phpunit` into double-quotes to keep the path to your custom phpunit as it is, i.e. `"phpunit.phpunit": "\"phpunit\""`.
- **PHPUnit command can be customized**: Using new setting `phpunit.command` you can customize the command to run PHPUnit etirely. Use variables for customize the command:
    - `${cwd}`: workspace root path, local. The command will be executed in this directory.
    - `${phpunit}`": path to phpunit binary. It's automatically resolved or it can be cutomized with `phpunit.phpunit` setting.
    - `${phpunitxml}`: path to the phpunit.xml relative to the workspace root.
    - `${phpunitargs}`: constructed PHPUnit arguments. (we need --teamcity and --filter to function properly)
    - `${phpargs}`: optional arguments to PHP which we use to ensure PHP runs and debugs correctly.


### Formatting

In response to feedback from you ([source](https://community.devsense.com/d/1792-turn-off-codelens/8)) we've implemented two additional options aimed at enhancing code formatting flexibility:

#### Keep Functions on a Single Line

Introducing the `php.format.rules.keepFunctionsOnOneLine`` option, which allows users to instruct the formatter to refrain from wrapping functions or methods if they are on a single line. This empowers developers to maintain a concise and consistent coding style.

#### Keep Classes on a Single Line

With the new `php.format.rules.keepClassesOnOneLine`` option, you now have the ability to prevent the formatter from wrapping classes when they are on a single line. This feature supports the preservation of a streamlined and compact structure in your codebase.

### Fixes

- Code Action to sort and remove `use`s fixed, when in a global namespace.
- Improves resolution of methods returning `static`/`$this` ([#1820](https://community.devsense.com/d/1820)).
- Inlay hints position fixed, when editing code near them.
- Fixed Go To Source in Test Explorer.
- Rename refactoring shows _Preview_ when change might be dangerous.
- Rename refactoring handles constructor properties propertly ([#450](https://github.com/DEVSENSE/phptools-docs/issues/450)).
- Various code analysis improvements.
- Workarounds for various `_ide_helper.php` bugs.
- Fix of conditional breakpoints. Previous version broke this feature in certain cases.
- Fix code action to implement interface with `static` functions ([#446](https://github.com/DEVSENSE/phptools-docs/issues/446)).
- Fix of incorrect formatting in nested associative array with multiple functions ([#432](https://github.com/DEVSENSE/phptools-docs/issues/432)).
- Fix for the `invalid or missing options` warning when starting a debugger with an older Xdebug version [#1816](https://community.devsense.com/d/1816-all-in-one-php-support)

### Premium

- Note: _Code Actions_, and _Code Fixes_ are available in [PREMIUM](https://www.devsense.com/en/purchase). It may have worked unintentionally without a license before this update.

## 1.41.14263 (November 14, 2023)

### Formatting Improvements

#### Comments

In this update, we've made improvements to how comments are handled. Now, comments that follow after an expression are preserved in their original positions, giving users the flexibility to indent them as they prefer.

```php
$x = [
  1  => 'one'      // first comment
  42 => 'fortytwo' // second comment
]
```

#### Align match arm bodies

The formatter now offers "Align Match Arm Bodies" to align the bodies (results) within `match` expressions for enhanced code clarity and structure. Enable this feature with `php.format.rules.alignMatchArmBodies` option.

```php
match ($day) {
    'Monday'    => 'Work',
    'Tuesday'   => 'Tacos',
    'Wednesday' => 'Waffles'
};
```

### Doc Comments and Type Annotations

- **Structured `object` Type**: dynamic objects can be annotated within doc comment using `object{property:type,}` syntax.

- **Global `@type` Aliases**: type aliases can be defined in the scope of the entire file using doc comment `@type`, `@phpstan-type`, `@phpstan-import-type`, `@psalm-type`, `@psalm-import-type`. Previously, it only worked above classes and functions. Now it is also valid in a doc comment `/** */` anywhere in the global file scope.

- **Code Actions** for qualified names in doc comments ([#428](https://github.com/DEVSENSE/phptools-docs/issues/428))

- **@method** syntax with modifiers is supported, i.e. `@method public static foo()`. This is an unusual syntax, although we do understand it now.

### `redis` Stubs Added

`"redis"` can be added to your `"php.stubs"` VSCode setting. This adds type checking and IntelliSense for using the `redis` extension.

### Diagnostics in Rename Preview

When renaming a symbol **with preview** (`F2`, `Shift+Enter`), newly the preview window gets analyzed and errors and warnings are underlined.

### Debug

#### Random Xdebug Port

As of now, specifying `"port": 0` in your `launch.json` is treated as a random available port. `php` is started automatically with the corresponding `xdebug.port = ${port}` directive. By default, the port is already chosen randomly if you don't specify anything. Most of **Run &amp; Debug** commands simply work now.

The sample launch configuration, which starts _Built-In Web Server_, initiates debugging, and opens the browser:

```json
{
    "name": "Launch Built-in server",
    "type": "php",
    "request": "launch",
    "runtimeArgs": ["-S", "localhost:8888", "-t", "public"],
    "port": 0,
    "serverReadyAction": {
        "action": "openExternally"
    }
}
```

You can also omit `"port": 0,` completely since it is a default value for this launch configuration.

> Note, default ports when just _listening for Xdebug_ are still `[9003, 9000]`.

> More at: https://docs.devsense.com/en/vscode/debug/launch-json#built-in-php-server

Quick launch commands (pressing `F5` without having `launch.json`) uses random available Xdebug port as well. There is nothing you need to do.

#### Expression Evaluation Enhancement

Now, expressions can be expanded into deeper levels in various contexts, including the Debug Console and Watch Window. Enjoy enhanced debugging with improved evaluation results.

#### Run/Debug current PHP File

Now, you can run or debug the currently opened PHP file with quick Run/Debug buttons in the top right corner of the editor.

### Fixes

- Fixes the wrapping behavior, ensuring that comments are maintained on their original lines when they follow an expression. [#1760](https://community.devsense.com/d/1760-php-format-codestyle-psr-12-makes-my-comments-borken)
- Fixes `php.inlayHints.parameters.suppressNameMatchingValue` setting.
- Fixes code indentation after applying "Implement abstracts" code action.
- Fixes `use` code action inside `enum`. [#425](https://github.com/DEVSENSE/phptools-docs/issues/425)
- Fixes **web** extension running in browser ([vscode.dev](https://vscode.dev)).
- Fixes navigation and completion in `@see` tag when in a namespace.
- Fixes LS crash (stack overflow). [#427](https://github.com/DEVSENSE/phptools-docs/issues/427)
- Fixed unwanted space removal between `readonly` and type in property promotion [#433](https://github.com/DEVSENSE/phptools-docs/issues/433)
- Improves mouse hover tool-tips in case there are ambiguous symbol declarations.

## 1.40.14103 (October 18, 2023)

### Introducing IntelliPHP 🚀

We're thrilled to announce, that PHP extension bundles with **[IntelliPHP](https://marketplace.visualstudio.com/items?itemName=DEVSENSE.intelli-php-vscode)** now.

![IntelliPHP](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/intelliphp-vscode.gif)

**IntelliPHP**: _Your Local PHP AI_ - provides whole-line suggestions as you type, instantly. Complete the suggestion with `TAB` key and be more productive! [Read more ...](https://blog.devsense.com/2023/php-and-visual-studio-updates-july-2023)

### Minor Features

- `"php.inlayHints.insertOnDoubleClick"` setting to enable or disable inserting the inlay hint on double-click ([#1717](https://community.devsense.com/d/1717)).
- `array_multisort()` does not treat the first argument as strictly passed by reference ([#1729](https://community.devsense.com/d/1729)).
- go to and code completion of file paths improvements ([#1735](https://community.devsense.com/d/1735)).
- `@see` and `@exception` in tool tips.
- `list{}` doc comment shape.

### Formatting

New **PHP 8.3** syntax is supported by the formatter.

### Final New Lines

By default, the formatter will no longer trim final new lines. Final new lines will be preserved as they are. However, if you have `files.insertFinalNewline` enabled and a final new line is missing, the formatter will automatically add one for you.

### Fixes

- Fixed installation on **code-server** and GitHub CodeSpaces.
- Fixed `vendor` folder with recursive symlinks ([#1720](https://community.devsense.com/d/1720)).
- False named argument error in case the method accepts variadic arguments ([#1722](https://community.devsense.com/d/1722)).
- Fixed possible stackoverflow and language server crash ([#1724](https://community.devsense.com/d/1724)).
- Fixed analysis of generators return type.
- Fixes improper formatting when named argument as a keyword [#408](https://github.com/DEVSENSE/phptools-docs/issues/408)
- Fixes incorrect indentation inside constructor [#409](https://github.com/DEVSENSE/phptools-docs/issues/409)

## 1.39.13943 (September 20, 2023)

### Class Name Inline Suggestion

Newly, when typing a new class, the class name is suggested based on the file name. The suggestion takes advantage of the Visual Studio Code's inline completion UI, so it's non disruptive; accepted with `TAB` key.

![PHP class name suggestion](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vsc-complete-class-name.gif)

In combination with [IntelliPHP](https://marketplace.visualstudio.com/items?itemName=DEVSENSE.intelli-php-vscode), the inline code suggestions are even more detailed and powerful!

### Completing File Paths

Since this update, the editor is completing and navigating to files [#402](https://github.com/DEVSENSE/phptools-docs/issues/402).

![file path suggestion](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vsc-complete-filenames.gif)

### Fixes

- Old-style `composer/installed.json` file supported.
- Fixes some formatting issues that occurred when mixing PHP with HTML.

## 1.38.13918 (September 15, 2023)

### Setting for Getter/Setter Naming Convention

Added setting for naming convention of generated getters and setters.

![set naming convention](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/getterSetterNaming.png)

### PHP 8.3 Syntax

Adding support for **PHP 8.3** syntax features including:

- Typed class constants
- Anonymous readonly classes
- Dynamic class constant fetch

### Formatting

In response to user feedback([#384](https://github.com/DEVSENSE/phptools-docs/issues/384), [#1691](https://community.devsense.com/d/1691-array-trailing-commas), [#684](https://community.devsense.com/d/684-code-format-array-last-item-comma)), we have introduced additional formatting options that allow users to precisely control the automatic placement of commas in their PHP code.

These new options include:
 - `php.format.rules.addCommaAfterLastArrayElement`: Adds a comma after the last element in an array.
 - `php.format.rules.addCommaAfterLastCallParameter`: Adds a comma after the last parameter in a function call.
 - `php.format.rules.addCommaAfterLastDeclParameter`: Adds a comma after the last declared parameter in a function or method signature.

In addition to the above, we've also introduced the following formatting options:
 - `php.format.rules.booleanConstantCasing`: Defines casing for `true` and `false` constants.
 - `php.format.rules.nullConstantCasing`: Defines casing for `null` constants.

### Fixes

- debugger handles file paths with `%` character [#380](https://github.com/DEVSENSE/phptools-docs/issues/380)
- caching /vendor/ fixes
- problems gets updated after composer updates
- memory use optimizations
- avoids showing keyword tooltip if it's not a keyword
- avoids showing duplicit items in peek window
- When using Drupal code style, the formatter changes all True/False/Null constants to upper case. [#870](https://community.devsense.com/d/870-drupal-code-style-doesn-t-do-uppercasing-true-false-null)
- When multiple changes to settings changes for formatting or inlay hints were performed at once, only the first change was considered; subsequent changes were ignored.
- Resolved formatting issue related to the PSR-12 coding standard for multi-line argument lists. The closing parenthesis and opening brace are now correctly placed together on their own line with one space between them, in accordance with the PSR-12 standard.
- More fixes of code diagnostics and IntelliSense.
- Array initializer values are now formatted with an additional level of indentation. [#935](https://community.devsense.com/d/935-format-indent-array-initializers-values)
- Fixes other formatting issues related to multi-line array inititializers.
- Stability fixes.

## 1.38.13779 (September 1, 2023)

### Fixes

- sticky scroll [#387](https://github.com/DEVSENSE/phptools-docs/issues/387)
- tooltip for `default` case [#1692](https://community.devsense.com/d/1692)
- tooltip for attributes
- fixes type analysis of parameters without type specified
- fixes problems analysis setting
- caching of /vendor/ fixes
- fixes use of `static` in /vendor/ files [#389](https://github.com/DEVSENSE/phptools-docs/issues/389)
- fixes temporary cache incorrectly created in the workspace [X/1697612088196137243](https://twitter.com/driesvints/status/1697612088196137243)

## 1.38.13759 (August 30, 2023)

### Optimized Loading and Memory Use

With this update, we're starting to cache `composer.lock` with `vendor` folder. This significantly improves opening workspaces based on Composer packages, and drops the RAM usage to bare minimum.

_For our insiders_, see your `OUTPUT` / `PHP Language Server` panel for what it's doing.

### Inlay Hints for Attributes

Newly, attributes above classes will have inlay hints with parameter names ([#383](https://github.com/DEVSENSE/phptools-docs/issues/383)), if enabled.

### `scalar_objects` Support

Thanks to the suggestions [#378](https://github.com/DEVSENSE/phptools-docs/issues/378), we're adding native support for the [`scalar_objects`](https://github.com/nikic/scalar_objects) extension by Nikita Popov.

The editor recognizes `register_primitive_type_handler()` calls, and allows completion for specified scalar types.

### Formatting

In direct response to [user request](https://community.devsense.com/d/1656-line-up-on-consecutive-constants) we've added formatting options to align constants `php.format.rules.alignConstants` and enum cases `php.format.rules.alignEnumCases`. Maintaining consistent alignment is now effortless:

```php
class X {
    const a   = 1;
    const bb  = 2;
    const ccc = 3;
}
```

### Code Analysis in Virtual Files

We have enabled full code analysis for files that are virtual - i.e. diff views, peeks, git preview, etc. This allows to analyse for changes you're about to submit easily!

![analyse virtual document](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vsc-analysis-virtual-document.png)

### Outline with Symbol Details

Thanks to the suggestion [#109](https://github.com/DEVSENSE/phptools-docs/issues/109), we have added more details to the document outline. It shows methods access, class access, and `interface`, `trait`, `enum` kinds.

![Symbol outline with details](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/outline-with-details.png)

### Fixes

- Fixes lag when closing VS Code or a Workspace.
- Fixes `use` statements sorting.
- Fixes go-to-def of a method defined in a `trait`.
- Fixes `@psalm-import-type` phpdoc tag support.
- Fixes inlay hints when there is a `new` without parameters.
- Fixes rename refactoring of static methods.
- Optimizations.
- Fixes formatting issues that occurs when using reserved words in namespaces, such as default

## 1.37.13534 (August 4, 2023)

### Completion Namespace Label

Newly, the code completion shows namespaces next to class names. This feature is **enabled** by default, and can be controlled with `"php.completion.showNamespaceLabel"` setting.

![completion namespace label and colored tool tips](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/color-completion-and-namespace-label.png)

### Completion Colored Details

The code completions popup is formatted and colorized as well.

### IntelliSense

- Class name completion in single-quoted strings has been added.

### Fixes

- Fixed infinite RAM usage ([#343](https://github.com/DEVSENSE/phptools-docs/issues/343#issuecomment-1664221959))
- Fixed array not automatically aligned [#364](https://github.com/DEVSENSE/phptools-docs/issues/364)
- Duplicit warnings have been fixed.
- When Folding HTML tags, the closing tag stays visible. [#363](https://github.com/DEVSENSE/phptools-docs/issues/363)
- Fixed removing spaces for variadic arguments [#1639-2](https://community.devsense.com/d/1639-wrongly-detected-problems-for-constructor-arguments/2)
- Resolved multiple issues pertaining to the nesting and combination of HTML tags with PHP tags. [#1634](https://community.devsense.com/d/1634-indentation-problems-with-auto-format-in-vs-code)

## 1.36.13417 (July 1, 2023)

### Debugger &amp; `trigger` Setting

New launch setting `"trigger"` allows to control whether to debug or ignore certain requests.

```json
{
    "name": "Debug built-in server",
    "type": "php",
    "request": "launch",
    "runtimeArgs": [
        "-S",
        "localhost:8000",
        "-t",
        "./public"
    ],
    "trigger": "THIS",
},
```

The `launch.json` setting above will start the built-in Web Server, configure all the Xdebug directives, and waits for requests. Only requests with the `GET` parameter `XDEBUG_TRIGGER=THIS` will be debugged. Any other request will be ignored by the debugger. I.e. request to `http://localhost?XDEBUG_TRIGGER=THIS` will initiate debugging, but `http://localhost` will not.

### IntelliSense &amp; `IteratorIterator`

`IteratorIterator` and `RecursiveIteratorIterator` are extended with generic type argument `TInner`, `@mixin TInner`, and their `__construct()` infers this `TInner`. Therefore, IntelliSense knows the inner iterator type and so it can provide inner iterator's members. ([#1613](https://community.devsense.com/d/1613))

### New IntelliSense Features

- `@phpstan-type` and `@phpstan-import-type` are supported ([#1543](https://community.devsense.com/d/1543-local-type-aliases)).
- `phpstan.neon` (and `.dist` alternatives) in containing directories processed; supporting their global type aliases (`phpstan.neon` file's [`"typeAliases"`](https://phpstan.org/writing-php-code/phpdoc-types#global-type-aliases) setting).
- Handling `Collection<TValue>`, `Iterator<TInner>` correctly.
- Undefined properties accessed with magic `__get()` reported with lower severity.
- Fixes trait adaptation and class inheritance analysis. Classes with complex inheritance with trait `use` with adaptation are analysed correctly giving unseful insights about missing method implementation.
- Fixes control-flow analysis of certain `try`/`finally` blocks.
- Improves Laravel IntelliSense.

### Namespace Auto-Import

There is already namespace auto-import feature, which seamlessly adds correspding `use` or fully-qualifies names when using code completion. There are also code actions where you can choose a new namespace to import. Additionally we're adding commands `Import class ...` and `Fqn class ...` to import a namespace using command bar (`F1`) and quick-pick window ([#450](https://community.devsense.com/d/450)).

### Stability Fixes

- Memory leak when having `.phar` files in the solution has been fixed.

## 1.35.13327 (June 20, 2023)

### Organize Uses

The action known as _Organize Imports_ can be invoked anywhere in source code now ([#349](https://github.com/DEVSENSE/phptools-docs/issues/349)). Removing and Sorting `use` statements affects the entire block of code, not just a single line.

### Composer

Path to `composer.phar` can be set explicitly using the setting `composer.bin`. Also, resolving `composer.phar` has been improved so it mostly uses your own already installed composer. Otherwise, if user does not have composer installed, it gets downloaded and used seamlessly, witnout the need of doing anything.

### Refactoring

Trait function members are resolved in semantic highlighting, finding references, code lenses with method overrides, and rename refactoring.

### Debugger &amp; Phar

The extension parses and understands `.phar` files. Since this updated, debugging and stepping through a code inside a `.phar` file works. Phar file is decoded, opened, and current statement highlighted as it would be a regular `.php` file. Local variables can be also inspected and inline debug values works as well.

### Stability

This update fixes an issue related to the process not being terminated when `code` gets closed.

## 1.34.13295 (June 15, 2023)

### IntelliSense &amp; `@phpstan-type` and `@psalm-type`

Since now, we have a basic support for local type aliasing.

### IntelliSense &amp; Traits with Generics

Newly, `trait` use can be annotated with `@use` doc comment to specify the trait's generic arguments ([#840](https://community.devsense.com/d/840-generics-allow-template-for-trait-usages)), i.e.:

```php
class MyClass {
    /** @use MyTrait<int, string> */
    use MyTrait;
}
```

### IntelliSense &amp; `static` Type

We have reimplemented the internals and improved type analysis for various cases involving use of `static` and `$this` within traits, protected properties, and class inheritance in general. Moreover generic arguments and trait members are resolved better with more inherited type information ([#931](https://community.devsense.com/d/931-inherit-and-static-array-type/)).

### PHPUnit Tests &amp; Continuous Run

Newly it is possible to run tests continuously. The *watch* icon in *Testing* panel allows to keep all the tests, test suites, or just specific test cases always up-to-date. ([#1479](https://community.devsense.com/d/1479-autorun-test-suite-on-file-save))

### Minor Improvements

- Code completion of named arguments completes the `:` at the end. ([#1600](https://community.devsense.com/d/1600-improved-autocomplete))
- Code completion of hinted array keys within single quotes. ([#1600](https://community.devsense.com/d/1600-improved-autocomplete))
- Completion triggered after typing SPACE after `instanceof` keyword.

### Fixes

- Fixed a few memory leaks!
- `match`, `fn`, and `interface` are not reported as syntax errors when within a qualified name (PHP 8.0+).
- PHP 8.2 standalone `true`, `false`, and `null` type names. ([#338](https://github.com/DEVSENSE/phptools-docs/issues/338))
- Fixed a few type inferring cases.
- Fixed reporting functions annotated with `@ignore` tag as unknown.
- Type hinting through `/** @var */` above `if` fixed.
- Fixed check of `define()`. ([#340](https://github.com/DEVSENSE/phptools-docs/issues/340))
- Fixed issue causing removal of new lines when formatting after abstract method. [#1525](https://community.devsense.com/d/1525-formatting-issue)
- Arrow functions now respect php.format.rules.spaceWithinDeclParens to add spaces within parentheses. [#1536](https://community.devsense.com/d/1536-space-within-fn-parenthesis)
- Fixed unwanted space when function is named as keyword [#335](https://github.com/DEVSENSE/phptools-docs/issues/335)
- Do not increase indentation if previous sibling node ends on the same line [#333](https://github.com/DEVSENSE/phptools-docs/issues/333)
- Fix of array items aliging when keys are not simple literals [#1602](https://community.devsense.com/d/1602-auto-format-woes)

## 1.34.13120 (May 5, 2023)

### IntelliSense

#### Trait Adaptation Blocks

Code completion and tool-tips in `trait` adaptation blocks have been implemented. ([#582](https://community.devsense.com/d/582))

#### Other Improvements

- Type inferring in the context of `is_a()` analyzed correctly.
- Less falsy warnings for non-static methods called statically in case there is `__callStatic()` magic method.
- New quick refactorings through code actions.
- Updated integrated PHP manual and localizations.

### Add Missing PHPDoc

The `Add Missing PHPDoc` code action inserts the doc comment as a snippet ([#157(comment)](https://github.com/DEVSENSE/phptools-docs/issues/157#issuecomment-1512313864)). This replaces template variables and allows you to type into placeholders.

### Formatting

We've added an option that enables you to turn formatting on or off within a specified range of code. The code between a comment `// @php-format off` or `/* @php-format off */` and a corresponding comment `// @php-format on` or `/* @php-format on */` will not be formatted. 

Additionally, We've added a new option `php.format.rules.declKeepRightParenAndOpenBraceOnOneLine` which will keep the right closing parenthesis `)` of a function or method declaration header on the one line as opening brace of the body `{`.

The other options that allows for more formatting customizations include:
 - `php.format.rules.openBraceOnNewLineForNamespaces` which place open brace `{` on a new line for namespace declarations.
 - `php.format.rules.openBraceOnNewLineForBlocks` which place open brace `{` on a new line for all types of code blocks, except for those controlled by other formatting rules.
 - `php.format.rules.spaceBeforeParenthesesInControlStatements` which insert a space before parentheses in control statements.
 - `php.format.rules.spaceBeforeParenthesesInCalls` which insert a space before parentheses in method, function and constructor call parentheses.
 - `php.format.rules.spaceBeforeParenthesesInDeclarations` which insert a space before parentheses in method, function and constructor declaration parentheses.

### Inlay Hints

 We've added an option to show return type inlay hint only for named functions, not for anonymous functions and arrow functions ([#326](https://github.com/DEVSENSE/phptools-docs/issues/326)).

### Fixes

- Respecting `class_alias()` within type checks and type inferrence checks.
- Respecting `@return $this` and treating it as `static` return type hint.
- Respecting `"php.completion.autoimport-docblock"` setting when generating **PHPDoc** above functions ([#896](https://community.devsense.com/d/896)).
- `"mongodb"` stub updated and fixed some missing MongoDB classes and functions. Use setting `"php.stubs": {"*", "mongodb"}` to use it ([#927](https://community.devsense.com/d/927)).
- Find All References performs type analysis if necessary to provide better results ([#322](https://github.com/DEVSENSE/phptools-docs/issues/322))
- Fixed use of named parameters of methods introduced with PHPDoc `@method` tag ([#921](https://community.devsense.com/d/921)).
- Properly handling the nullable `?static` type.
- Code diagnostics improvements, avoids a few falsy warnings.
- Fixes internal error when completing user snippets.
- When multiline php code was present inside javascript string, formatting wasn't working correctly [#908](https://community.devsense.com/d/908-tab-stop-indentation-with-open-curly-braces/5)
- Fix of incorrect indentation when named arguments were used in multi-line static function calls.
- Fix of unwanted compacting of new lines when multiple foreach colon blocks were used. [#893-12](https://community.devsense.com/d/893-another-formatting-issue/12)
- Fix of incorrect indentation of named arguments in certain cases [#928](https://community.devsense.com/d/928-wrong-formatting-of-named-arguments)
- Fix of incorrect indent of pseudo class constant [#932](https://community.devsense.com/d/932-formatting-issue)
- Fix of formatting when php was inside script/style tags. [#1460](https://community.devsense.com/d/1460-codeigniter-4)
- Fix of lossing indentation in multiline comments delimited with `/*` [#1489](https://community.devsense.com/d/1489-code-formatting-issue-in-visual-studio-code-using-php-tools/3)
- Fix of formatting removing empty lines in `/*` comments [#1522](https://community.devsense.com/d/1522-comment-block-issue)
- Fix of incorrect indent in multiple nested multiline lambda functions[#1500](https://community.devsense.com/d/1500-formating-issue)

## 1.33.12934 (April 8, 2023)

### IntelliSense

Supporting `.phpstorm.meta.php` with `expectedArgments()` and `argumentsSet()` now.

![expectedarguments](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/meta-expectedarguments.png)

### Fixes

- Formatting was compacting whitespaces after arrow or lambda functions ([#913](https://community.devsense.com/d/913-after-update-formatting-deletes-empty-lines-and-moves-curly-braces-up)).
- Internal exception fix when navigating to definition ("Go To Definition" command).
- Crash fix for rare cases in huge files in Drupal.
- Added the missing `static` keyword in code completion in function body.
- IntelliSense/Code analysis handling `iterable<K,T>` (with 2 generic arguments) the same as PHPStan does ([#914](https://community.devsense.com/d/914-generic-of-traverable/2)).

## 1.33.12924 (April 05, 2023)

### Test Explorer

The _Test Explorer_ looks and watches for any _PHPUnit_ XML configuration file matching glob pattern `**/phpunit*.xml` or `**/phpunit.xml.dist` (outside the `vendor` folder) [#313](https://github.com/DEVSENSE/phptools-docs/issues/313). This allows having **multiple configuration files** in the same directory with custom names.

![multiple phpunit configurations](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/test-multiple-configs.png)

Additionally, we have fixed:

- Executing all tests within a configuration file.
- Executing all tests within a single test suite.
- Correct Xdebug directives so it won't cause unnecessary warnings when debugging tests.

### ParaTest

This update allows running [ParaTest](https://github.com/paratestphp/paratest) in the same way as PHPUnit tests. To do so:

- Install ParaTest composer package using the command `Composer: require dev package`, and search package `brianium/paratest`.
- Update your workspace settings:
  ```json
  {
    "phpunit.phpunit": "./vendor/bin/paratest"
  }
  ```
- Navigate to _Testing_ panel and run or debug your tests.

### Sort Uses on Save

The following setting works for sorting and organizing `use` statements on save:

```json
{
  "editor.codeActionsOnSave": { "source.organizeImports": true },
}
```

### IntelliSense

Now it's possible to `Ctrl`+`Click` (or go to with `F12`) on `@inheritdoc` to navigate to base Doc Comment directly. [#897](https://community.devsense.com/d/897-jump-to-phpdoc-via-clicking-on-inheritdoc)

Additionally, return type hint in signature help is respecting template (generic) arguments.

### Composer `"composer.workingPath"` Setting

Thanks to the feedback [#909](https://community.devsense.com/d/909-setup-a-working-directory-for-composer), we've added setting `"composer.workingPath"` where users can specify the relative path for the `composer.json` and `vendor` folders.

### Fixes

- Memory leak happening when updating/removing `.phar` files in the workspace fixed. (happens usually on `composer update` and `require`.) [#291](https://github.com/DEVSENSE/phptools-docs/issues/291)
- Not auto-completing parentheses `()` after `array`, `require`/`include`, `exit`, and `die`.
- If a multiline HTML attribute was enclosed in single quotes and located within a PHP blocks, it would be indented during every formatting session. [882](https://community.devsense.com/d/882-one-more-auto-format-creeper) 
- Fixed rare case when mixed html/php formatting resulted stopped the formatter. [887-B](https://community.devsense.com/d/887-cannot-format-code-with-syntax-errors)

## 1.32.12895 (March 28, 2023)

### IntelliSense

- `null` specified as Doc Comment `@param` type is reported as invalid.
- `true` pseudo-type correctly handled within union types.
- Methods named `new()` are handled correctly in mouse hover and code completion.
- Detecting Laravel services improved.
- Initial implementation for `expectedArguments()` PHPStorm meta.
- Completing `declare` and `declare(strict_types=1);` after `<?php` tag.

### Refactoring

- PHPDoc `@see` and `@uses` is recognized during rename refactoring, find all references, and highlight occurrences.
- Unused `use` check works even if **problems** setting is turned off.
- **Namespace import** for any simple class name. We have code action suggestions to import a namespace or fully qualify the class name if there are more classes with the same name.

#### Organize Imports

We have added support for VS Code's **"organize imports"** command and eventual `"editor.codeActionsOnSave"` setting allowing you to _organize imports_ (aka **remove unused uses**) when saving documents automatically.

![organize uses](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/source.organizeimports.png)

### Fixes

- Stability fixes.
- Smart select fixes.
- `#!` at the beginning of file not reported as syntax error.
- Properties on some `mixed` types not reported as unknown.
- Format supports indenting PHP8 attributes which are spread over multiple lines [#879](https://community.devsense.com/d/879-php-8-attribute-code-formatting)
- Format was removing whitespaces when `readonly` or `static` was used as function argument name.
- Fixed the case where formatter was adding an extra space between `new` and `()` [#883](https://community.devsense.com/d/883-formatting-new-function-issue)

## 1.31.12821 (March 20, 2023)

### Fixes

- Breadcrumbs fixed. ([#302](https://github.com/DEVSENSE/phptools-docs/issues/302))
- Unrecognized Psalm and PHPStan special type names. ([#860](https://community.devsense.com/d/860-breadcrumb-bar-strange-behavior))
- Global variable type check fix ([#303](https://github.com/DEVSENSE/phptools-docs/issues/303))
- Mouse hover looks into `@mixin`s for properties.
- IntelliSense: Methods from both Laravel facade and DocComment `@method` gets resolved as expected.
- Fixes `rg` processes spawned by VS Code ([#877](https://community.devsense.com/d/877)).
- Fixes a complex html/php mixed formatting issue. [#852](https://community.devsense.com/d/852-another-auto-format-error)
- Fixes incorrect indentation of multi-line chained call. [#862](https://community.devsense.com/d/862-formatting-bug)
- Fixes position of open brace in method or function declaration when multiline header is provider in `PSR-12`. [#305](https://github.com/DEVSENSE/phptools-docs/issues/305)
- Fixes unwanted newline after lambda function passed as an argument to a method or function. [#306](https://github.com/DEVSENSE/phptools-docs/issues/306)
- Fixes formating of enums with backing types implementing interfaces.
- Fixes indentation of named arguments when function call is multiline. [#863](https://community.devsense.com/d/863-php-named-parameters-do-not-get-formatted-correctly)
- Format selection didn't work in certain cases when invoked with html/php mix.
- Format doesn't indent php code block in html comments [#872-3](https://community.devsense.com/d/872-syntax-highlighting-and-another-auto-format-creeper)

## 1.31.12740 (March 4, 2023)

### Inlay Hints

Newly **Inlay Hints** for PHP code are available!

![inlay hints](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vsc-inlay-hints.png)

The inlays are available for parameter names, by-reference arguments, and inferred function return types.

![inlay hints](https://docs.devsense.com/vscode/imgs/vsc-inlay-parameter-byref.png)

To enable or disable the inlay hints, change the following **settings**:

- `"editor.inlayHints.enabled"`
- `"php.inlayHints.parameters.enabled"`
- `"php.inlayHints.parameters.byReference"`
- `"php.inlayHints.types.return"`
- `"php.inlayHints.types.variable"`

See [the documentation](https://docs.devsense.com/vscode/editor/inlay-hints) for more details.

### Quick Fix for missing Doc Comments

New code action adds missing doc comments with inferred type information and summary placeholders. The functionality is the same as by typing `/**` above a function/class/property/constant or `define()` call, but it can be invoked through a code action and it can be invoked over a whole selection of code for multiple declarations at once. ([#226](https://github.com/DEVSENSE/phptools-docs/issues/226))

### Smart Select

Visual Studio Code's selection range feature allows to quickly select syntactic elements; the PHP extension provides selection range for all the statements, declarations, and blocks of code.

### Formatting

Another feature request we received quite often was to introduce `Drupal` code style [#795](https://community.devsense.com/d/795-add-drupal-code-style-to-list). So we're happy to announce `Drupal` code style has been introduced in this version.

Formatter respects `files.InsertFinalNewLine` option now. [#837](https://community.devsense.com/d/837-formatter-removes-a-new-line-after-a-class-closing-brace)

### Fixes

- Fixes highlighted range when peeking definitions ([#288](https://github.com/DEVSENSE/phptools-docs/issues/288))
- Fixes some internal exceptions.
- Fixes mouse hover when code is syntactically invalid.
- Fixes "Search TODO" command if there are remote:// or git:// files in the workspace, possibly after using git merge, or diff window.
- Fixes indexing directories inside `.git` and other special directories when changed.
- Types specified in Doc Comments can be `$this` keyword as an alias to `self`, i.e. `callable($this)` ([#843](https://community.devsense.com/d/843-error-in-parameter-type-with-docblock)).

### Formatting Fixes

- Fixes formatting when multiple method calls chained when object was inside parenthesis.[#820/8].(https://community.devsense.com/d/820-heredoc-with-interpolated-variables-breaks-auto-formatting-for-the-entire-file/8)
- Fixes formatting of mixed JS and PHP. [#820/5](https://community.devsense.com/d/820-heredoc-with-interpolated-variables-breaks-auto-formatting-for-the-entire-file/5)
- Fixes case when JS formatting with php code inside was moving `}` on each format. [#820/7](https://community.devsense.com/d/820-heredoc-with-interpolated-variables-breaks-auto-formatting-for-the-entire-file/7)
- Fixes case when insides of multi-line HTML attributes, comments or CDATA were indented on each format. [#820/12](https://community.devsense.com/d/820-heredoc-with-interpolated-variables-breaks-auto-formatting-for-the-entire-file/12)
- Fixes case when linux line endings caused different format output when mixed languages were present in php file.
- Fixes case when `use` with alias same as class stopped the formatter.
- Fixes double indentation when array access and member use is combined in multi-line expression. [#842](https://community.devsense.com/d/842-formatter-adds-unnecessary-tabs)
- Fixes unwanted space after ampersand in ref assignment [#846](https://community.devsense.com/d/846-spaces-after-symbol-ampersand-to-define-reference), but in the same time respects this notation as well `$a =& $b;`.
- Fixes unwanted double indentation in multiline expression containing array item access.
- Fixes unwanted new line when line comment precedes `elseif`,`catch`,`finally`.
- Fixes unwanted space between `static` or `self` and `(` when creating a new instance of the object.
- Fixes formatter removing spaces aroung bitwise `&` operator.
- Fixes unwanted double indentation of object's field access in constructors calls when spread along multiple lines.
- Fixes `php.format.rules.alignConsecutiveAssignments` when combined with different kind of left expressions.
- Fixes missing space when reseved types were used as a type hint.
- Fixes incorrect commend indentation when used in multiline chained function calls.
- Fixes ocassional missing space after `)` when `php.format.rules.keepControlStatementsInOneLine` option is used. [#852-2](https://community.devsense.com/d/852-another-auto-format-error/2)
- Fixes unwanted space in multiline ternary operator.
- Fixes unwanted space after function with the same name as PHP keyword.
- Fixes static member access double indent when `static` keyword was used.
- Fixes incorrect indent when member was accessed in multiline constructors call.
- Fixes unwanted space after identifier named `default`.
- Fixes case when attributes in function declaration parameters stopped the formatter.
- Fixes case when trait use in namespace might have stopped the formatter.
- Fixes case when trait use with changing visibility to public stopped the formatter.

## 1.30.12484 (February 10, 2023)

### Fixes

- Code Formatter fixes.
- Fixes various standard functions missing, and missing ambiguities.
- Homebrew `php` recognized on macOS.
- Fixed formatting of heredoc with interpolated variables [#820](https://community.devsense.com/d/820-heredoc-with-interpolated-variables-breaks-auto-formatting-for-the-entire-file)

## 1.30.12450 (February 9, 2023)

### Editor

**Folding `use`** has been added; this allows to collapse the block of `use` statements ([tweet](https://twitter.com/JoelPiccoli/status/1622633203818176512)).

### Getter/Setter

Newly, code inserted by adding getters and setters can be customized using settings `"php.completion.getterSnippet"` and `"php.completion.setterSnippet"`. In this way, you can add various value handling and customize return values, or add comments for yourself ([#813](https://community.devsense.com/d/813-setter-without-self-reference)), i.e.:

```json
"php.completion.setterSnippet": "{PROPERTY} = sanitize(${NAME}) ?? throw new InvalidArgumentException('Invalid ${NAME}!');\n//done\nreturn {THIS};",
```

### Formatting

 - Backed enumerations are supported.
 - New setting `php.format.rules.keepControlStatementsInOneLine`. [#810](https://community.devsense.com/d/810-is-there-an-option-to-not-auto-indent-one-liners)
 - Setting `php.format.rules.SpaceBeforeColonInControlflowStatements` renamed to `php.format.rules.SpaceBeforeColonInControlStatements`.
 - Fixed unwanted space in type declaration [#271](https://github.com/DEVSENSE/phptools-docs/issues/271)
 - `php.format.rules.alignConsecutiveAssignments` now aligns only assignment if they directly follow each other. Inserting a new line between assignments will force them to align differently.

 ### Fixes

 - Documents opened in diff view won't appear twice in symbol searches and symbol navigations ([#549](https://community.devsense.com/d/549-intellisense-remembers-old-method-parameters/11)).
 - Fixes symlinks recursion on Unix ([#269](https://github.com/DEVSENSE/phptools-docs/issues/269)).
 - Fixes blank What's New screen.

## 1.30.12417 (February 7, 2023)

### Doc Comments

Supporting literals and constants inside Doc Comments (i.e. inside `key-of<>` and `value-of<>`), so the type information in Doc Comment is parsed and IntelliSense works inside it ([#801](https://community.devsense.com/d/801-key-of-and-value-of-support)).

### Diagnostics

- Duplicate promoted property reported.
- Reports modifying read-only properties.
- Reports use of undefined property if there is `__get`/`__set` but also `@property` doc comment declaration.
- Added diagnostic for unknown attribute class.

### Rename Refactoring

Renaming a `class`, `interface`, `trait`, or `enum` suggests to rename the corresponding file as well, if appliable.

### Hover Tool-Tips

Newly, there are two more settings to configure the hover tool-tip.

- `"php.hover.fullname"` adds the full class member name at the top of tooltip (including the fully qualified name of the class) (disabled by default) ([#808](https://community.devsense.com/d/808-show-class-name-in-function-description-on-hover-popup)).
- `"php.hover.containingClass"` lets you to enable/disable showing class name as a part of a function tool-tip (enabled by default).

### Fixes

- Overall workspace processing time (source code parsing) has been optimized.
- Added missing `ZipArchive::` constants ([#256](https://github.com/DEVSENSE/phptools-docs/issues/256)).
- Constants defined inside lambda functions are shown in IntelliSense, and code diagnostics ([#257](https://github.com/DEVSENSE/phptools-docs/issues/257)).
- Rename refactoring and semantic highlighting of constructor promoted properties.
- Context-aware completion after `extends`/`implements` keywords.
- Fixes `"Problems: Exclude Git Ignore"` in case there are many `.gitignore` files in the workspace.
- Fixes use of `@global` type defined above function declaration.
- Fixes generating Doc Comment upon `/**` above trailing comma ([#265](https://github.com/DEVSENSE/phptools-docs/issues/265))
- Fixes updating problems and code analysis when using `includePath` overlapping the workspace path(s).

## 1.29.12304 (January 29, 2023)

### IntelliSense Improvements

**Respecting `@internal` annotation**

Symbols annotated with `@internal` doc comment tag are hidden in the completion list now;

**Correct ordering**

We have updated how the code completion is ordered depending on context and so-far typed text; Symbols from imported namespaces are listed first, then top-level symbols, and at the end there are symbols that can be auto-imported.

**Deprecated classes**

Additionally, deprecated classes and interfaces are striked-out in the code completion list, and when used in the source code. Previously, we did that only for functions.

![deprecated classes and interfaces](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vscode-deprecated-types.png)

**Performance**

More frequent operations have been moved to a background thread to make the user experience fluent and uninterrupted.

### Short Open Tags `<?`

We have enabled parsing of PHP code inside short open tags (`<?`) by default. It handles the case where `<?xml` is at the beginning of the source code; 

Parsing inside short open tags can be disabled using the setting `"php.workspace.shortOpenTag"`.

### Composer

The local development version of `composer.phar` is updated automatically every 30 days.

### Fixes

- Missing `pcntl` constants added to IntelliSense.
- Fixed `#region`/`#endregion` collapsing.
- Fixed collapsing in various situations.
- Fixed update of IntelliSense after `composer update`.
- Fixed incorrect `integer` type name shown in tool-tips.
- Fixed renaming of global variables ([#242](https://github.com/DEVSENSE/phptools-docs/issues/242))
- Fixed warning message on non-en localizations ([#249](https://github.com/DEVSENSE/phptools-docs/issues/249)).
- Fixed missing unreachable code warning in `switch` statement.
- Fixed missing `Exception` class in the completion right after `throw new`.
- Fixed auto-import when there is a syntax error ([#671](https://community.devsense.com/d/671)).
- Formatter does not remove space after `yield from` ([#248](https://github.com/DEVSENSE/phptools-docs/issues/248)).
- `use` with leading `/` stopped the formatter.
- Colon block ending with `;` separated with whitespaces from colon block closing token stopped the formatter.

## 1.28.12200 (January 21, 2023)

### New Code Actions

More useful refactorings are coming to the PHP extension and VS Code. Following are refactorings introducing common PHP 8 syntax to your code.

**Condition `?:` can be replaced with `?->`**

Simplifying conditional expressions like the one below:

![simplify conditional expression](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vsc-code-action-conditional.gif)

**Assignments can be simplified**

Simplifying assignments:

![simplify assignment expression](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vsc-code-action-assignment.gif)

**Converting `switch` to `match`**

In certain cases, `switch` statement can be converted to the new `match` expression.

### PHPStan Conditional Return Types

This update adds support for the new PHPStan's Conditional return types. Return types specified in this way are properly recognized now, colored accordingly right in the source code, and the IntelliSense uses the specified types correspondingly.

![phpstan conditional return types](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/phpdoc-phpstan-confitional-return.png)

### Improved Type Checks and IntelliSense

**BREAKING:** By default, we're now reporting diagnostics _inside opened documents only_. This can be changed using setting `"php.problems.scope"`. The exception is the syntax errors - those are reported from across the whole workspace.

In addition, various _falsy_ warnings have been fixed, mostly in combination with generic types. The type analysis have been improved in general.

Also, most of polyfills are not messing up with codecompletion and symbol navigation; Since built-in manual is annotated with generic type arguments, it is preferred over the polyfills from 3rd party packages ([#241](https://github.com/DEVSENSE/phptools-docs/issues/241)).

### Improved Completion Ordering

The code completion itself has been improved, so _local_ symbols should be listed first. We're still working on this feature, and improving as much as possible.

### Fixes

- We have fixed a memory leak, and the language server crash.
- Fixed PHPDoc snippet after typing `/**`, when text got corrupted.
- Added missing Psalm scalar type annotations.
- Correct order of resolving `@mixin` members ([#777](https://community.devsense.com/d/777)).
- `html` files can be associated with `php` language support.
- `//region`/`//endregion` folding ([#788](https://community.devsense.com/d/788-region-comments-won-t-fold))

### Formatting

- Removing unwanted extra space after `?` token in nullable return type [#752](https://community.devsense.com/d/752-extra-space-after-optional-type)
- Fixes in **Wordpress** code style
  - Types and function declarations have do not place a open brace `{` on a new line
  - `Unset` calls weren't formatted with spaces within parentheses.
  - `exit()` or `die()` do not have a space within parentheses.
- `php.format.rules.alignConsecutiveAssignments` stopped the formatter in certain cases.
- Using not equal operator `<>` instead of `!=` stopped the formatter.
- Optional comma in constructor header in property promotion stopped the formatter.
- Certain situations when combining HTML and PHP stopped the formatter.
- When `case` inside `switch` was followed by `;` instead of `:` stopped the formatter.

## 1.27.12010 (January 9, 2023)

### Doc Comment Syntaxes

We've been working on recognizing the whole range of commonly used type syntaxes in Doc Blocks; now supporting the most of PHPStan, and other popular linting frameworks.

This release introduces more compatibility, and more features towards Doc Blocks, and related type analysis and code diagnostics.

### Colorization and Semantic Tokens

PHP Doc Comments are getting very complex, and frameworks like PHPStan add even more syntaxes and complexity. We're supporting most of the extended syntax, including generic types, templates, type aliases, unions, intersections, `callable` syntax, and array shapes; and in this release, those types in _documentary comments_ are colorized accordingly.

![php callable specification](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/callable-type-def.png)

The whole type expression is now parsed, colorized, and recognized. The tooltip shows the signature help displaying the `Closure`s arguments and return types.

_Note:_ a nicer tooltip is in progress!

### PHPStan Array Shape, `callable`, `list`, and more

Since this release, the editor supports all the syntaxes for array shapes and callables. In addition, the type analysis handles specified PHPStan types accordingly.

PHPStan and Psalm  **array shapes** specified in PHP Doc Comments are allowed, parsed, colorized, and used in code completion and type analysis.

Additionally, `list` and `non-empty-list` types are handled as well. Including their generic counterparts with `<` and `>` types specified.

All the **callable** syntaxes in PHP Doc Comments are supported now as well.

### More Generic Annotations

This update brings the standard types annotated with generic template types; this is especially helpful in Laravel and Symfony frameworks, where it provides type inferring for all the collections, iterables, `Generator`, `DOMNodeList`, etc.

This improves value inferred within `foreach` for all kinds of iterables.

### Doc Comment Snippet for Variables

When creating a Doc Block above variable assignment, or above a global variable, you can now configure the snippet that will be created. Additionally, the snippet setting has a new property `"singleline": true|false` (for variables it's `true` by default) allowing you to specify whether to create the Doc Block single-lined (i.e. `/** @var Type */`).

Sample setting:

```json
{
    "php.docblock.variableSnippet": {
        "singleline": false
    }
}
```

### Fixes

- `integer`, `boolean`, `list` types are handled properly in Doc Block.
- Unused `use` analysis fixed, so it handles type names specified in Doc Blocks.
- Diagnostic and parameter completion for `session_set_cookie_params()` works for both possible definitions.
- Missing `Imagick` constants added.
- Improves type inferring for generic types and various edge cases.

## 1.26.11866 (January 3, 2023)

### IntelliSense &amp; Enums

The PHP 8.1 `enum` objects implicitly implements `UnitEnum` and `BackedEnum` interfaces. The `BackedEnum<TValue>` interface is annotated with a template type argument so it can be used in Doc Comments with the backed type for better type analysis. E.g.:

```php
/** @param \BackedEnum<string> $e */
function foo($e) {
    return $e->value // -> string
}

enum MyEnum : string {
    case A;
}

foo( MyEnum::A );
```

**Generic Types &amp; Doc Comments Type Annotations**

The type annotations in PHP Doc Comments have been reimplemented, so even complex constructs are handled, can be completed, refactored, highlighted, and previewed. Highlighting occurences works even in nested generic types, as well as rename refactoring and code completion.

```php
/**
 * @template TElement of \BackedEnum<string>
 * @return (Collection<int, TElement>|array<int, TElement>)[] Complex generic type annotations */
```

**Multi-Lined Structured Array Types**

This release adds support for multi-lined structured array type annotations. This allows users to specify array type with its keys and corresponding entries types. See the exmaple below:

```php
/**
 * @return array
 *         {
 *           name: string,
 *           age: int,
 *         }
 */
```

### Code Diagnostics Improvements

We're constantly working on improving the code analysis and related diagnostics. This release avoids a lot of falsy warnings.

### Formatting

We're happy to introduce new **Laravel** code style. You just need set `php.format.codestyle` to `laravel`. 

Now you can also let formatter to auto-align consecutive assignments with `php.format.rules.alignConsecutiveAssignments` option [#692](https://community.devsense.com/d/692-sug-formatting-add-auto-align-option).

```php
$a     = 1;
$bbb   = 2;
$ccccc = 3;
```

And other formatting rules we've added are:

|Setting|Description|
|-------|-----------|
|`php.format.rules.spaceBeforeColonInControflowStatements`|Insert a space before colon in control flow blocks.|
|`php.format.rules.spaceBeforeColonInReturnType`|Insert a space before colon in a return type.|
|`php.format.rules.spaceWithinCallParens`|Insert a space within method, function and constructor call parentheses.|
|`php.format.rules.spaceWithinDeclParens`| Insert a space within method, function and constructor declaration parentheses. |
|`php.format.rules.spaceWithinArrayInitilizersParens`|Insert a space within array initializer parentheses.|
|`php.format.rules.spaceWithinIfParens`|Insert a space within `if` statement header parentheses.|
|`php.format.rules.spaceWithinWhileParens`|Insert a space within `while` statement header parentheses.|
|`php.format.rules.spaceWithinForParens`|PInsert a space within `for` statement header parentheses.|
|`php.format.rules.spaceWithinForeachParens`|Insert a space within `foreach` statement header parentheses.|
|`php.format.rules.spaceWithinSwitchParens`|Insert a space within `switch` statement header parentheses.|
|`php.format.rules.spaceWithinCatchParens`|Insert a space within `catch` statement header parentheses.|
|`php.format.rules.spaceWithinBrackets`|Insert a space within brackets.|
|`php.format.rules.spaceWithinBracketsAroundExpression`|Insert a space within brackets around expression.|
|`php.format.rules.spaceWithinExpressionParens`|Insert a space within parentheses around expression.|

We've also fixed some formatting issues:
- `readonly` in namespace caused formatter to stop formatting
- `readonly` and `enum` in function declaration doesn't add space before paren
- PHP 8.2 Disjunctive Normal Form Types are supported now
- Constant uses were double indented in multi-line expressions [#748](https://community.devsense.com/d/748-constant-arrays-are-being-double-indented)
- We've address some cases when combing html and php code didn't result in neat looking code. Most notably in **Wordpress** templates.

### Fixes

Hot fix for built-in PHP functions type analysis.

## 1.26.11753 (December 28, 2022)

### Type Analysis Improvements

- Expression in the `assert()` language construct is used to determine variables type now. ([#744](https://community.devsense.com/d/744-support-assert-to-determine-type))
- Certain type annotations are now more precise.
- Implicit closure variables inside arrow functions are now properly initialized. This fixes falsy warnings about uninitialized variables use inside nested arrow functions.
- More Core types have been annotated with template type arguments, allowing for better inferring of types where `@template` and similar are used ([#746](https://community.devsense.com/d/746)).
- Support for generics has been improved to properly handle doctrine/collections and other templated types using extended `@template` syntax ([#746](https://community.devsense.com/d/746)).

### Editor Improvements

- `readonly` and `enum` keywords are not incorrectly reported as a syntax error, when used as a part of namespace or a function declaration.
- The language server is allocating significantly less memory during code completion; this improves the overall performance.

### Formatting

- In **Wordpress** code style we are no longer inserting space between parentheses and brackets when empty e.g `foo()`, but `foo( 1, 2 )`.
- Not aligning array initializers key value pairs when they are not on separate line (when `php.format.rules.arrayInitializersAlignKeyValuePairs` enabled).
- Fixes incorrect outdenting of constants in multiline expressions.

### Apple Silicon

Introducing the support for Apple **M1** and **M2** chips (**Apple Silicon**). These CPU's with `arm64-x64` architecture were not fully supported in previous release and we're happy to provide the language server for those architectures now.

## 1.25.11652 (December 21, 2022)

### PHP 8.2

Built-in IntelliSense has been updated to provide the latest PHP 8.2 classes, functions, constants, and documentation in all the available languages ([#215](https://github.com/DEVSENSE/phptools-docs/issues/215)).

As a part of PHP 8.2, we have added integrated multi-language documentation for the new `Random` extension.

### Formatting

One of the feedbacks we got more often was that sometimes formatting was slow. We've addressed these cases, and it should be much better now. But please let us know if you run into a case when it's not fast.

We're also happy to introduce **Wordpress** code style. You just need set `php.format.codestyle` to `wordpress`. Though there are still a couple of rules for us to implement, it's mostly ready.

In this release, we've also focused on code formatting of mixed html/css/js/php. This one is tricky since the indentation of html code is influencing the php code and vice versa [#171](https://github.com/DEVSENSE/phptools-docs/issues/171). We think we got it right now, so hopefully **wordpress templates** will look good when formatted.

### Fixes

- On the first format request, directly after VSCode was first started, only php code was formatted.
- HTML matching tag should get highlighted regardless if it has a php tag inside. [#172](https://github.com/DEVSENSE/phptools-docs/issues/172)
- Wrapping of function arguments list with trailing comma, stoped the formatter.
- Incorrect indentation of function calls prefixed with namespace backslash.
- Unwanted spaces inserted into php code in javascript. [#222](https://github.com/DEVSENSE/phptools-docs/issues/222)
- When formatting, indentation of php code determined by a position of open tags might have been incorrect. The formatter needed a second pass to get it right.
- Code diagnostics fixes:
  - `parent::` not reported as static call in some cases.
  - Local variables in nested arrow functions not reported as uninitialized.
  - Inheriting `@param` type from base classes, if there is no Doc Comment.
  - Removed support for old `@param` syntax [#740](https://community.devsense.com/d/740).
  - Fixes control flow analysis of nested binary expressions.
  - Added support for alternative Doc Comment array syntax, i.e. `(int|string)[]`.
  - Fixed type analysis for more complex generic types inheritance.
  - Added support for generic `IteratorAggregate<TValue>`.
  - Generic types are properly propagated and substituted in tool-tips.

## 1.25.11537 (December 11, 2022)

### Hover Tool-Tip Improvements

Newly, the mouse hover tool-tip shows **descriptions of parameters**. This behavior can be changed using the setting `"php.hover.parameters"`.

The documentation link the muse hover tool-tip can be enabled or disabled using the new setting `"php.hover.documentation"`.

### Generics

The template type inferring and substitution has been improved to handle more complex type hierarchies. ([#723](https://community.devsense.com/d/723), [#733](https://community.devsense.com/d/733), [#731](https://community.devsense.com/d/731))

### Fixes

- Generated **Doc Comment** respects `yield` and correctly annotates function with `Generator` type hint. Additionally, the code diagnostics respect function returning `Generator` and correctly analyzes the return value type.

- `'enum'` keyword is a little hack in the PHP itself. We have fixed how it is parsed so it respects the PHP 5, 7, 8, and 8.1 onwards conrrectly ([#205](https://github.com/DEVSENSE/phptools-docs/issues/205)).

- Autocompletion of parenthesis `()` is inserted ust once when generating automatic function override ([#730](https://community.devsense.com/d/730))

- _Go to Definition_ has been fixed.

### Formatting

#### New customization settings

As promised, we are adding more formatting options based on your feedback.

|Setting|Description|
|-------|-----------|
|`php.format.rules.spaceBeforeParenthesesInArrowFunctions`|Space before parentheses in arrow functions|
|`php.format.rules.spaceAroundConcatenation`|Space around concatenation `.`|
|`php.format.rules.spaceAfterUnaryNot`|Space after unary not `!`|
|`php.format.rules.groupUseWrap`| Defines wrapping behavior of group use |
|`php.format.rules.groupUseNewLineBeforeFirstDeclaration`|Place a new line before first group use declaration|


#### `foreach`

We are compacting `foreach` statement headers into a one line by default now (as defined in `PSR-12`).

```php
<?php 
foreach ($iterable as $key => $value) {
}
```

#### `PSR-12`

We've slightly improved `PSR-12` code style. Now we are automatically wrapping multiline group use declarations as specified in the standard.

```php
<?php
use Vendor\Package\SomeNamespace\{
    SubnamespaceOne\ClassA,
    SubnamespaceOne\ClassB,
    SubnamespaceTwo\ClassY,
    ClassZ,
};
```

#### Fixes

- When anonymous class implements list was defined on multiple lines, we didn't indent them correctly
- Implements list wrapping settings work for anonymous classes too

## 1.24.11420 (December 1, 2022)

### Array Shapes

The editor treats inline array shapes specified in Doc Comments now. The following syntax is correct, and understood by the PHP editor:

```php
<?php

/**
 * @param array{ name: string, id: int, data: \App\Model\User } $a The entity.
 */
function foo($a) { .. }
```

Array shapes improve your code completion, as it provides code completion for array keys; and inferred types, as it resolves the array items type according to the specified index.

### IntelliSense Improvements

**Prentheses Completion**

Newly, IntelliSense completes parentheses when completing a function. The keyboard cursor is placed in between them. Optionally, the feature can be either disabled, or the complete function signature can be completed as a snippet. This allows jumping between parameters with `[tab]` key and fill-in the arguments.

The feature is configurable through the setting `"php.completion.parameters"`. By default, it is set to `"parentheses"` so it completes just the parentheses `()`.

![php complete parentheses](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vsc-complete-parentheses.gif)

**Xdebug stubs**

We have added stubs for **Xdebug** extension. Go to settings, and add `"xdebug"` to the `"php.stubs"` setting:

```json
{ "php.stubs": ["*", "xdebug"] }
```

This adds _Xdebug_ functions to IntelliSense, code diagnostics, and improves the type inferring analysis.

**Deprecation Messages**

Whenever a deprecated symbol is used, it is striked out and the corresponding warning is shown. Additionally, in this release, we're adding the deprecation message to the code completion tool-tip.

![php deprecation message](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vsc-deprecated-message.png)

Note, to mark your function as deprecated, add the `@deprecated` Doc Comment tag as it is below:

```php
/** @deprecated Do not use this, since version 1.2.3 it is not maintaned anymore! */
function getEntity(array $row) : object { ... }
```

### Customizable Formatter

Many companies have coding guidelines when creating source code which might differ from our predefined code styles. We're happy to introduce highly customizable formatter and we begin with around `30` different code formatting options. This is just a begining and we're accepting suggestions which options to prioritize next.

These more granular code formatting options are only available for `PREMIUM` users, but Community version users can still influence formatting with `php.format.codestyle` option.

For example you can let formatter to auto-align key value pairs in array initializers with `php.format.rules.arrayInitializersAlignKeyValuePairs` option [#692](https://community.devsense.com/d/692-sug-formatting-add-auto-align-option).

```php
$x = [
    1    => 'foo',
    1234 => 'bar'
];
```

Or if you and your company prefer `Whitesmiths` style you can set that up by setting `php.format.codestyle` to `allman` and `php.format.rules.indentBraces` to `true` [#689](https://community.devsense.com/d/689-whitesmiths-style-sometimes-termed-wishart-style).

```php
function foo()
    {
    echo "Hello";
    }
```

In general use `php.format.rules.*` settings to configure the formatter to behave as you wish. For a detailed list of formatting options, either open the Settings Editor (`Ctrl+,`) and type `php format` in the Search bar or see our [documentation page](https://docs.devsense.com/vscode/editor/customize-formatting).

### Format on Type

We've reimplemented how format on type behaves. Now it correctly picks up what part of the code you are editing and formats it when you type `;` or `}`. This way your code always stays correctly formatted without a need to explicitly call the formatting command.

We recommend to turn this feature on. By default in VS Code it's disabled.

If you'd like to turn it on just for PHP you can do it in `settings.json` like this:

```json
"[php]": {
  "editor.formatOnType": true
}
```

### Formatting Fixes

- Functions with multiple parameters that also contained `func_get_args` or `funct_num_args` in the body stopped the formatter.
- Multiline use traits statement were double indented.
- Indentation fix of lambda functions nested in certain statement headers.
- Fixes indenation of chained method calls when part of the chain is a field. [#715](https://community.devsense.com/d/715-if-expression-without-braces-indents)
- Correctly indents arguments of static method calls spread across multiple lines.
- Fixes indentation of multiline field uses, including static fields or constants.
- Null-safe operator is supported.
- Attributes are supported.

### IntelliSense Fixes

**Control Flow**

We have fixed the control flow analysis, when there are functions that never return (i.e. they throw an exception instead of returning a value). Correspondingly, false warnings about unreachable code were fixed, and corresponding variables type inferring as well.

**Trailing Comma in Lambda `use ()`**

The issue with unsupported trailing comma in lambda declaration has been fixed ([#207](https://github.com/DEVSENSE/phptools-docs/issues/207)).

**Blade**

We have fixed use of `@can`, `@endcan`, `@forelse`, and `@empty` inside `.blade.php` files.

**`"php.stubs"`**

The configuration setting `"php.stubs"` has been fixed. It was not working after reloading a workspace.

## 1.23.11234 (November 10, 2022)

### `launch.json` with `"envfile"` Option

Newly, you can specify your `.env` file to be used by the built-in PHP server. This is important especially when developing a **Laravel** application! An example launch configuration would look like the following:

```json
{
    "name": "Start Built-in Server with .env",
    "type": "php",
    "request": "launch",
    "runtimeArgs": ["-S", "localhost:8888", "-t", "public"],
    "envfile": ".env"
}
```

### Doc Comment Generator

The generated PHP Doc has been improved. It specifies `@var` above properties and class constants if possible. Additionally, if the function is recognized as it **never** returns, it annotates the return type as `@return never` ([#193](https://github.com/DEVSENSE/phptools-docs/issues/193)).

### Quick Fixes

The quick fix for getters and setters follows `PSR-12` now. Additionally, it specifies a type hint in the correct form.

Quick fix for generating `__construct()` ([#198](https://github.com/DEVSENSE/phptools-docs/issues/198)) generates Doc Comment in the correct form now. Then generated function complies with PSR-12 now as well.

Also the quick fix for implementing an interface has been updated to follow PSR-12 and to generate type names correctly.

### PHP 8.2

The remaining PHP 8.2 features are being supported by PHP Editor.

- Newly, the special attribute `#[SensitiveParameter]` is included in code completion.
- Also, `enum` case values can be used in constant expressions, as specified in RFC.

### Formatting

#### `PSR-12`

There are couple more rules we are introducing for `PSR-12` code style in this version. Particularly they instruct the formatter on how to behave when formatting control statement headers which are spread across multiple lines.

e.g. 
```php
for ($i = 0; $i < 10; $i++
    ) {
    // for body
}
```

gets formatted to:

```php
for (
    $i = 0;
    $i < 10;
    $i++
) {
    // for body
}
```

In a same way when list of `implements` is split across multiple lines, we put first item on the next line and each interface on a separete line.

Now, when wrapping function or method calls we also consider what kind of arguments are used. When a single argument is split into multiple lines, such as array or lambda function, we do not consider this as a reason to split the argument list. (This behaviour is according to [PSR12 specification](https://www.php-fig.org/psr/psr-12/#47-method-and-function-calls))

```php
<?php

somefunction($foo, $bar, [
  // ...
], $baz);

$app->get('/hello/{name}', function ($name) use ($app) {
    return 'Hello ' . $app->escape($name);
});
```

#### Format Selection

We've improved how format selection is working, which will also affect when `editor.formatOnType` and `editor.formatOnPaste` is enabled.

#### Fixes

We've also fixed an issue when Javascript formatter was adding spaces into php code [#203](https://github.com/DEVSENSE/phptools-docs/issues/203)
and HTML formatter editing contents of php code. This mainly manifestated when `editor.formatOnPaste` option was enabled.

The next, we've addressed some formatting issues as well:
  - Constructor closing `)` was sometimes indented incorrectly when statement was multiline.
  - In certain cases comments were indented incorrectly.
  - Method calls on single line shouldn't wrap. [#693](https://community.devsense.com/d/693-sug-formatting-don-t-wrap-when-there-is-no-data-in-brackets)
  - Functions with `func_get_args` or `funct_num_args` in the body stopped the formatter. [#691](https://community.devsense.com/d/691-bug-formatting-not-working-when-there-are-specific-functions)
  - Only multi-line comments begining with `*` are indented + 1.
  - Sometimes unnecesary new line was added after array initializer.
  - lambdas weren't pushed to the new line when containing element was wrapped
  - fix of double indentation when constructor was present in multiline array
  - Array with multiple lambdas indentation bug. [#702](https://community.devsense.com/d/702-code-format-array-with-multiple-anonymous-functions)
  - Parenthesis expressions weren't indented. [#700](https://community.devsense.com/d/700-code-format-if-condition-with-braces)
  - Multi-line use traits statement is properly indented now.
  - In certain cases new lines after the optional return type were collapsed. [#704](https://community.devsense.com/d/704-code-format-abstract-function)

## 1.22.11089 (October 31, 2022)

### PSR-12 Formatting

We are happy to announce an introduction **PSR-12** code style. With the previous releases we've mostly covered all the important rules necessary for PSR-12 compilent formatter. There are some minor things we are still going to improve, but we are mostly there. We are also switching the default formatting code style from old PSR-2 and from now on, it's going to be PSR-12.

![PSR-12 code style](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/psr-12.png)

To be complient we've also added these rules:
 - Adding space between exception types in `catch (OtherThrowableType | AnotherThrowableType $e)`
 - Compacting whitespaces in function declaration header so the return type is on the same line as `)` parenthesis

Being complient with `PSR-12` is important, but how the code looks after the formatting is too. And we are continuing to work on beauty part as well. One case we've done for this release is how array initializers are threated. When there is an new line anywhere in the array then we put all the array items on a new line and indent. [#683](https://community.devsense.com/d/683-code-format-array-new-line).

![Array initializer](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/array_initializers.gif)

In similar way, we are applying the analogous behaviour for call parameters and function/method declarations, but only in `PSR-12` code style.

We've also fixed some minor formatting issues.

### Composer Improvements

`create-project` command has been updated. Now it opens the Open Folder dialog if it's not clear where you'd like to create the new project. At the end, it opens the newly created project in VS Code.

### New Code Diagnostics

Newly, invalid declaration of properties inside interfaces is reported. ([#174](https://github.com/DEVSENSE/phptools-docs/issues/174))

Also, the code analysis handles the default **Laravel** class aliases. This affects IntelliSense and avoids false code warnings.

See the **Fixes** below for more updates.

### Fixes

Code Diagnostics are less strict about type juggling (`int` -> `float` type juggle in `for` loops), and also it handles better array element type inferring ([#185](https://github.com/DEVSENSE/phptools-docs/issues/185)).

Then we have fixed code diagnostic of functions, that use variable amount of arguments through `func_get_args()`. ([#677](https://community.devsense.com/d/677-problem-with-func-get-args-and-phpdoc/5))

Also there were issues when problems and IntelliSense did not get updated after composer packages being removed or updated - we've make changes that avoids that, and everything gets updated seamlessly as it should. ([#182](https://github.com/DEVSENSE/phptools-docs/issues/182))

## 1.21.10985 (October 23, 2022)

### `@var` above function parameters

Editor handles Documentary blocks right above function parameter definition. If there is a `@var` with type specification, it is used for the parameter type across IntelliSense, tool-tips, and code diagnostics.

```php
class MyClass {
    function __construct(
        /** @var T[] */
        public readonly $list, // $list is of type T[]
    ) { }
}
```

### Formatting

How it looks is important. So we continue our effort to make it beautiful:

 - Indent level is incresed in multi-line expressions when accessing a property or calling a method [#530](https://community.devsense.com/d/530-formatting-keep-braces-in-the-same-line/18)
 - We are indenting code in PHP tags in all the code styles. [#173](https://github.com/DEVSENSE/phptools-docs/issues/173)
 - In certain cases when HTML was combined with PHP unexpected new lines were added [#173](https://github.com/DEVSENSE/phptools-docs/issues/173#issuecomment-1280021048)
 - PHP Close tags `?>` are indented according to the previous `<?php` open tag

 ### Improvements

 #### PHPUnit Test View

 This update improves resolving of PHPUnit tests in _Test View_ panel. Processing test files is faster, avoiding redundant read and parse from disk. Also, the test view now supports tests from inherited classes ([#678](https://community.devsense.com/d/678-phpunit-test-explorer-ignores-tests-inside-abstract-parent-testcase-class)).
 
## 1.20.10937 (October 19, 2022)

### Editor Improvements

#### Highlighting Control Structures

Highlighting occurrences of control structures and corresponding keywords has been added. Newly the editor highlights control structures such as `for`, `foreach`, `while`, or `do`, with the corresponding `continue`, or `break`, when you navigate the caret on them. Also, all `return`s are highlighted in the function, and `case`s with `default` label.

It also highlights matching pairs of `switch`/`endswitch`, `if`/`elseif`/`endif`, `try`/`catch`/`finally`, and others.

![highlight if/elseif/endif](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/highlight-control-structure.png)

#### Fuzzy Search Symbol in Workspace

Searching through the workspace supports fuzzy queries; i.e. the symbol names are matched against letters in the query. Additionally, searching using upper-case letter is case-sensitive, so you can quickly search for camel-cased notation.

![fuzzy search symbols in worksspace](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/fuzzy-search.gif)

#### Formatting

We are improving formatting support with more cases. 

- The cast operators are separated with a space now. ([#175](https://github.com/DEVSENSE/phptools-docs/issues/175)).
- Constructor property promotion is formatted correctly. [#176](https://github.com/DEVSENSE/phptools-docs/issues/176)
- Unwanted space was added after `::class` in certain cases. [#530](https://community.devsense.com/d/530-formatting-keep-braces-in-the-same-line/26)
- `else` or `elseif` is placed on a new line when goes after a statement. [#530](https://community.devsense.com/d/530-formatting-keep-braces-in-the-same-line/25)
- When type reference is separated from the `?` with one space if it's part of the ternary operator. [#530](https://community.devsense.com/d/530-formatting-keep-braces-in-the-same-line/19)

### Diagnostic Improvements

#### New setting `"php.problems.scope": "opened"`

Newly you can only diagnose PHP files that are opened in the editor. Note, parse errors will be still reported across the entire workspace.

Set the setting `"php.problems.scope": "opened"` to see how it works.

#### Check for too many args

Now we check for use of `func_get_args`, `func_get_arg`, or `func_num_args` so functions with variable number of arguments are detected, and _too_many_args_ warning is not reported.

## 1.19.10893 (October 16, 2022)

### New Formatter

We have redesigned and updated the built-in PHP code formatter. It provides several new formatting styles through the setting `"php.format.codeStyle"`.

#### **`Allman`**

The `Allman` style is named after Eric Allman. This style puts the braces on the next line. This applies to all control statements and declarations.

```php
while ($x == $y)
{
    foo();
}
```

#### **`K&R`**

The `K&R` style (Kernighan & Ritchie Style) keeps open braces on the same line for control structures, types, functions and methods.

```php
while ($x == $y) {
    foo();
}
```

You can still keep using previously supported code styles:

- `"PSR-2"` style,
- Visual Studio-like style called `"PHP Tools"`,
- and `"Off"`,

The formatter works with HTML/JS/CSS, formats ranges, formats whole documents, and formats on typing - after closing a block of code or a statement.

![Formatting multi-line expression](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/format-document.gif)

#### Formatting Fixes

The following is the list of formatting issues we have fixed and implemented:

- Arrow function formatting fixes.
- Formatting supports nested function calls.
- Fixes of formatting enumerations.
- Fixes of formatting related to `match` expressions.
- *Heredoc* and *Nowdoc* expressions are left untouched during formatting.
- Formatting correctly indents grouped `use` statements.
- Indent multi-line control statements headers.
- Multi-line expressions inside lambdas are indented.
- Empty blocks with comments are indented.
- Group `use` statements and `match` expressions respect optional trailing comma.
- Space between type and ampersand `type &$x` when formatting function parameters.
- Indenting empty blocks with comments.
- Multi-line expressions inside anonymous types are indented.
- Multi-line function and method calls are correctly indented.
- Parenthesis of function or method headers on a new line are not indented.
- Fix of an incorrect new line after a lambda expression.
- Formatting leaves single-line php blocks.
- Close tag is always separated from the previous token.
- Function named arguments are formatted.
- Anonymous classes have space before `{` if kept on the same line as a class header.
- Fixed formatting of PHP code in HTML attributes (e.g. `<div style="<?php echo "something" ?>">`). The formatter won't add additional white-spaces anymore.

### Highlighting To-Do Comments

Newly the editor highlights to-do annotations in your code. This helps to keep track of unfinished work and pending issues.

![highlight todo](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/highlight-todo.png)

You can customize the style using the following setting:

```json
"php.highlight-todo.style" : {
    "backgroundColor": "#ec0"
}
```

Or you can turn the feature off completely with the setting `"php.highlight-todo.enable": false`.

### Debugger Code Completion

During debugging, when typing into a _Debug Console_, names of existing local variables will be suggested. Type `$` or the completion shortcut (by default `Ctrl`+`Space`), and available local variables will be suggested.

![debugger code completion](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vsc-debug-completion.gif)

### New Diagnostics

The editor checks and reports the following diagnostics:

- Calling instance methods statically. ([#641](https://community.devsense.com/d/641-static-call-to-instance-method-not-detected))
- Invalid assignments to type properties. ([#647](https://community.devsense.com/d/647-assigning-wrong-types-is-not-detected))
- Too many arguments provided to a function call. ([#645](https://community.devsense.com/d/645-wrong-number-of-function-call-arguments-not-detected))
- Allows objects to be used for constants, and handles use of Doc Comment with `@var` above `const`.

### New Settings

We have added a new setting `"php.problems.excludeGitIgnore"` ([#169](https://github.com/DEVSENSE/phptools-docs/issues/169)) which simply lets you to ignore code diagnostics in files/folders specified in workspace's `.gitignore`s.

### Fixes

- Code action for generating `__construct()` respects text editor tabs and spaces setting.
- Generating Doc Comment (`/**`) respects the indentation.
- Generating Doc Comment above function respects customized Doc Comment snippet (`php.docblock.functionSnippet` setting).
- Fixes some cases, when IntelliSense was not updated after adding Composer packages.

## 1.18.10692 (September 30, 2022)

### Profiler Support 🔥

PHP code profiling allows you to inspect how much time and how many calls were made to every single function in the code.

[Read more (docs.devsense.com) ...](https://docs.devsense.com/vscode/profiling)

**We have added support for Xdebug profiling!** Xdebug profile files (cachegrind format) can be opened, viewed, and inspected. The extension also highlights hot paths in your code, according to the profiling results.

**Call Times View:**

![php call times view](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/profile-calltimes.png)

**Callers/Callees View**

Detailed view of callers and called functions, including times.

![php callers callees](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/profile-details.png)

**Hot Path Decoration**

Profiling result file is analyzed, and hot paths are highlighted right in the source code:

![profiling hot path decoration](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/profile-highlight.png)

### Updated code diagnostics

- Variables used inside arrow functions are not reported as uninitialized now ([#664](https://community.devsense.com/d/664-bug-when-use-use-keyword-inside-arrow-function-inside-anonymous-function)).
- Diagnostics `PHP1408` and `PHP1409` are reported with a lower severity now.

### Open-VSX

The entire extension is now available on [open-vsx.org](https://open-vsx.org/extension/devsense/phptools-vscode)

### Other Improvements

- Auto-imported 'use' is sorted ([#666](https://community.devsense.com/d/666-auto-import-alphabetically)).
- HTML code formatting fixes.
- Fix of constructor property promotion formatting.

## 1.17.10641 (September 26, 2022)

### Introducing **What's New**

We are getting many useful feature requests and feedbacks, and we're trying hard to add as many improvements as we can. One of them was to inform briefly about the news. With this release, we've started showing **What's New** window with the major updates.

The window can be opened manually with command `"PHP Tools: Release Notes"`. Automatic opening after each major update can be disabled with the checkbox at the bottom of the window.

  ![release notes command](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vsc-open-releasenotes.png)

### Debug

Debugging has a few neat features! More settings for enabling profiling, `var_dump()` produces nicer and more detailed messages, and Xdebug for PHP is determined when debugging starts.

#### Debug `develop` Mode

Since this release, we have enabled `develop` Xdebug mode. This gives nicer looking and more informative `var_dump()` outputs.

In case you prefer the normal-looking `var_dump()` messages, change the `"noDevelop"` setting in the `launch.json` profile.

#### Debug `profile` Mode

You can enable `profile` mode now. Set the `"profile": true` setting in your `launch.json` profile:

```json
{
    "name": "Launch & Profile built-in Server",
    "type": "php",
    "request": "launch",
    "runtimeArgs": ["-S", "localhost:8000", "-t", "."],
    "noDebug": true, // <-- do not initiate debugging
    "profile": true // <-- enable xdebug.mode "profile"
}
```

#### Uncaught Exceptions Filter

Newly, the Debug view provides option to either break or ignore **Uncaught Exceptions**. This options is located in "Debug and Run" view, at "Breakpoints" panel.

### Code Diagnostics

- We have fixed incorrect duplicit key check in case of `enum`' case values. ([#658](https://community.devsense.com/d/658-problem-with-enums-as-keys))
- Fixed return type check when return type hint is `void`.
- Reporting anonymous functions with unused `use` variable.
- Reporting anonymous function' `use` variable is not initialized.
- Reporting of empty namespaces.
- Checking that value from a function returning `void` is being used.
- Reports accessing a property on `void`.
- Checks expressions in string interpolation are convertible to `string`.
- Checks that type of a property is defined.
- The diagnostic for unknown class or unknown function is suppressed if user is opening just a single file, without opening a workspace or folder.
- The diagnostic `0412` severity has been changed to *error*, code `1412` (unassigned variable use).

### Composer

All-in-One **Composer** integration has been added! It implements useful commands for requiring, removing and browsing packages, automatically installing `composer.phar` so you don't have to, adding IntelliSense for `composer.json`, code lenses for running scripts, neat tool-tips for your installed packages, it checks for abandoned packages, and more!

### Other Improvements

There are fixes to the PHP formatter. Formatting wasn't performed when explicit cast was used with less common data type alias, e.g. `(integer)`, `(boolean)`, or `(real)`.

## 1.15.10535 (September 14, 2022)

### Command `PHP: Search todo ...`

Introducing a quick way of browsing through all the to-do comments in PHP code. The command `"PHP: Search todo ..."` opens quick pick with all the to-do. It allows to filter, search through, and navigate to the selected item.

  ![searching to-do in PHP code](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vsc-search-todo.gif)

### Tool-Tips get nicer

Hover tips for function signatures are split into more lines if they would get too long. Also, the optional parameters are not denoted with `[` `]` anymore. ([#159](https://github.com/DEVSENSE/phptools-docs/issues/159))

  ![long function tool-tip](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vsc-long-tooltip.png)

Additionally, safe HTML tags in code comments get rendered nicely in a tool-tip now. Having tags like `<br/>`, `<b>`, `<i>`, `<ul>`, `<li>`, `<code>` in your documentary comments is allowed and when displayed in a tool-tip, it gets rendered nicely and formatted.

  ![html tool-tip](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vsc-html-tooltip.png)

### Code Diagnostics

We have added more diagnostics, and fixed a few rare cases in code flow analysis.

- There is a diagnostic for invalid use `break;`, when `break` or `continue` are out of the allowed scope.
- Diagnostic of code reachability with `try`/`finally` was fixed.
- Diagnostic of function return has been improved in cases, where there is a type hint `mixed`, but the function does not return anything.

### Other Improvements

There are fixes to internal exceptions, and several performance and memory use optimizations.

## 1.14.10471 (September 7, 2022)

- new `"php"` **task definition**; this allows defining VS Code task that executes a PHP script, using currently configured "php" executable:
  ```json
  // .vscode/tasks.json
  {
      "type": "php",
      "file": "${workspaceFolder}/script1.php",
      "args": ["argument"]
  }
  ```
- **settings** `"phpunit.preTask"` and `"phpunit.postTask"` allowing to specify a task or list of tasks from `tasks.json` to be executed before or after a test runs ([#154](https://github.com/DEVSENSE/phptools-docs/issues/154#issuecomment-1207248667)).
  - tasks executed within `phpunit.preTask` and `phpunit.postTask` can use variables `${command:phpunit.filter}` or `${command:phpunit.testsuite}`
- **settings** to customize DocComments (_PHPDoc_) generated by typing `/**`
- **Diagnostics**:
  - duplicit field declaration reported
  - duplicit class constant declaration reported
  - dynamic properties reported if there isn't corresponding `__get`/`__set`, or `@property` annotation
  - foreach control variables can be annotated with DocBlock
- **IntelliSense**: updated PHP 8 `Attribute` class declaration with its members
- **getter/setter** code action respects `static` properties

## 1.13.10390 (August 30, 2022)

- fixes format on paste

## 1.13.10378 (August 29, 2022)

- fixes for HTML/CSS/JS editor features
- HTML/CSS/JS formatting enabled in PHP files
- fixes Format breaks subsequent code ([#156](https://github.com/DEVSENSE/phptools-docs/issues/156))

## 1.13.10301 (August 16, 2022)

- **PHP 8.2** read-only classes supported.
- Some **PHP 8.2** compatibility checks.
- _Go To Definition_ command navigates to `include`/`require` target file.
- Tooltip for pseudo-constants shows correct value.
- Spacebar (pressing `space`) after `new`, `use`, `extends`, or `implements` triggers code completion.
- Non-Standard Doc Block type names supported ([#622](https://community.devsense.com/d/622-nonstandard-external-library-docblocks)).

## 1.13.10239 (August 11, 2022)

- code diagnostic for unknown properties (`PHP0416`)
  - quick fix for unknown property (for now fixing small typos and casing)
  - `stdClass` and classes with `__get()` magic method ignored (as specified in [the PHP 8.2 RFC](https://wiki.php.net/rfc/deprecate_dynamic_properties))
- auto-import (FQN) avoids creating a conflict name
- code completion after `extends` avoids suggesting the containing class itself
- fixes case-sensitivity checks for property names

## 1.12.10140 (August 4, 2022)

- `Go to Type Definition` command added; navigates to type definition instead of `__construct` in `new` expression.
- PHPUnit View: Fixes tracking a failed test location ([#150](https://github.com/DEVSENSE/phptools-docs/issues/150#issuecomment-1192046307))

## 1.12.10040 (July 26, 2022)

- setting `php.workspace.includePath` allowing to specify additional directories to be included in IntelliSense.
- improves workspace loading, processes files better in parallel

## 1.12.10022 (July 25, 2022)

- fixes activation

## 1.12.9985 (July 20, 2022)

- **PHPUnit Tests Integration**
  - new UI for PHPUnit tests
  - **showing inline failure messages**
  - **debugging PHPUnit tests** using the new UI
  - **diff** of expected and actual values
  - smaller extension
  - avoids dependency to the old `ms-vscode.test-adapter-converter` **(can be uninstalled)**
  - avoids dependency to the old `hbenl.vscode-test-explorer` **(can be uninstalled)**
- optimized extension load, smaller installation package
- suggesting new parameter name based on its type hint
- union types properly inserted in newly generated Doc Comment (when typing `/**` above function)
- generated Doc Comment annotates thrown exceptions (`@throws` PHPDoc Tag)
- handles external changes, fixes re-indexing when composer packages are being installed/updated
- showing all classes in PHPDoc completion, will be auto-imported when commited (according to setting `php.format.autoimport`)
- fixes **Alpine Linux Arm64** platform
- fixes `phpTools.language` setting for various texts (summaries of various built-in functions and constats).
- fixes unused `use` warning being listed twice
- fixes rename refactoring of variables inside Doc Comments.
- not reporting missuse of `$this` in template files
- improved completion after functions noted in .phpstorm.meta file.
- improved completion after methods annotated with generic type within trait
- `php.format.autoimport-docblock` setting to configure completion of type names within Doc Block, `"FQN"` by default.

## 1.11.9762 (July 1, 2022)

- fixes completion after `enum`'s case (no completions listed)
- fixes tooltip over variables, resolved type name is correctly shortened

## 1.11.9761 (June 29, 2022)

- fixes error [#147](https://github.com/DEVSENSE/phptools-docs/issues/147)

## 1.10.9721 (June 25, 2022)

- fixes language server crash when completing the builtin `enum` member.

## 1.10.9716 (June 25, 2022)

- IntelliSense support for builtin `enum` methods and properties.
- Improves type inferring for array-typed properties.
- Laravel's Real-Time Facades recognized, and supported by code completion.
- Eloquent's Local Scopes listed in code completion.
- Fixes highlighting of unused `use` when it's used in an unused Doc Comment.
- Fixes Test Explorer for tests annotated with `@test` Doc Comment.

## 1.9.9585 (June 7, 2022)

- infers `@template` types in combination with `class-string<T>` type annotation
- automatically recognizes some non-standard file extensions to be parsed as PHP files as well (improves code completion on *Drupal*)
- fixes completion after reserved type names (`self`, `parent`, `static`)
- fixes `->` syntax after constants and class constants (*PHP 8.1*)
- fixes completion after `->` with `new` in the expression chain
- fixes changing PHP version

## 1.9.9479 (May 25, 2022)

- improves Laravel Facades inferring on multi-core CPUs
- improves documentary comments processing, respects more conventions from phpstan and psalm
- improves code completion on generic types and generic `@mixin` types
- fixes possible crash on huge projects (StackOverflow fix)
- fixes possible completion issue, when 3rd party extension passes invalid LSP protocol data
- fixes issue handling breakpoints when there are many concurrent requests
- debugger stability improvements

## 1.9.9277 (April 29, 2022)

- **IntelliSense**
  - **support for generics**
  - IntelliSense handles specialized type names
  - templated types are resolved against bound generic arguments
  - generic types are infered from constructor arguments passed to `new()`
  - tooltips shows the generic arguments
  - IntelliSense understands `@template` arguments, and extended PHPDoc syntax (generics, psalm, phpstan)
  - IntelliSense completes special PHPDoc tags used for generics
  - code completion uses the template `of` type if the value is unbound
  - code analysis respects generics
- updated PHP syntax parser, fixes `instanceof` syntax
- fixes missing items in IntelliSense after installing/updating composer packages
- fixes for HTML/CSS/JS IntelliSense
- fixes items in IntelliSense after external file changes
- stubs include `zip` and `zlib` by default
- providing API for 3rd party extensions

## 1.8.8970 (March 23, 2022)

- adds missing `MYSQLI_` constants
- fixes PHPUnit runner; resolves correct `phpunit` PHP script
- fixes processing HEREDOC and NEWDOC syntax with empty lines and indentation
- fixes parser to allow PHP 8 `readonly` modifier in constructor property
- fixes `phpTools.language` setting, PHP manual is localized properly
- unused `use` check respects `@Method` PHPDoc tag
- fixes freezing during resolving PHP binaries and related PHP information
- `php.linkedEditing.variables`: setting to enable linked editing for local variables (`false` by default, `editor.linkedEditing` needs to be enabled)
- `editor.linkedEditing`: avoids bad edits when the whole variable name is deleted
- `editor.linkedEditing`: keeps the linked variable names even after they get deleted
- debugger listens on both IPv4 and IPv6, supports optional launch configuration `"hostname"`
- debugger fixes for arrays
- `php.version` setting is respected by the editor even there is no matching `php` executable
- `composer.json` is checked for the minimum PHP version, if `php.version` setting is not set
- **web** extension shows and allows to change PHP language level

---

- extension does not download external dependencies; makes the initial run faster and reliable
- extension does not expect `dotnet` runtime installed on the system
- language server supports incremental text edits to lower protocol overhead
- new platforms supported: `alpine-x64`, `win32-arm64`, `darwin-arm64`

## 1.7.8766 (March 8, 2022)

- updates IntelliSense with `ctype` books
- updates IntelliSense with STD constants
- functions marked with `@ignore` are not listed in completion and signature help
- completion after `new` lists variables as well
- optimizations

## 1.7.8717 (March 4, 2022)

- language server stability fix of a possible issue (when using ORM notation)
- `"php.debug.port"` can be set in workspace scope settings.
- debugging tests fix; uses correct port from `"php.debug.port"` or `9003` by default.
- Laravel static Facades recognized in IntelliSense
- Laravel class aliases recognized in IntelliSense
- improves code parser with PHPDoc

## 1.7.8637 (February 26, 2022)

- web extension load fix

## 1.7.8627 (February 25, 2022)

- debugger reports correctly when one or all of the ports are not available
- fixes missing `E_` constants in IntelliSense
- PHPUnit debugger respects Xdebug port setting "`php.debug.port`" instead of using hardcoded port `9000`

## 1.6.8588 (February 19, 2022)

- debugger "exclude" launch setting allows to negate the path with `!` prefix, i.e.:
  ```json
  "exclude": ["!**/app/**", "!**/vendor/mypackage/**"]
  ```
- debug won't launch if no Xdebug ports are available
- if Xdebug port can't be used, the detailed message is reported to the debug output panel
- installation: downloading dependencies with alternative locations
- IntelliSense prefers PHPDoc type annotation over the type hint (more specific completions)
- Doctrine ORM attributed annotation used for properties type annotation
- Language Server avoids using File System Watcher improving performance on Unix based system ([#521](https://community.devsense.com/d/521))
- smaller installation package
- setting `"php.stubs"` allowing to explicitly set names of extensions to be included in the IntelliSense, localized manual, and code analysis.
- added support for **linked editing** (`"editor.linkedEditing": true`) for local variables

---

- new platform supported: `web`

## 1.6.8479 (February 11, 2022)

- fixed preview of string values
- optimized file parsing

## 1.6.8448 (February 10, 2022)

- code analysis shows the incorrect declaration of PHP 8.1 `readonly` property
- fixes code-lens in virtual PHP manual files (when navigated to a builtin PHP with Go To Def (`F12`))
- virtual PHP manual displayed as a VS Code virtual document (does not create tmp file on disk)
- **PHPUnit runner and debugger** setting `phpunit.phpunit` to specify phpunit binary

## 1.6.8324 (January 28, 2022)

- **debugging adornments**
- extended compatibility
- code lens for enum cases
- `php.debug.port` and launch port setting allow to listen on multiple ports. `[9003, 9000]` by default.

## 1.5.8292 (January 25, 2022)

- fixes debug tooltips and debug watch

## 1.5.8280 (January 24, 2022)

- **debugging** launch improvements, provides every option on how to start debug according to current file or workspace
- provides advanced commands for running and debugging PHP files and projects
- added setting `php.debug.port` specifying the default Xdebug port
- the editor complies with PHP 8.1 by default, if not specified otherwise
- code lens minor updates
- fixes false warning about missing "php"
- fixes extension dependencies
- fixes extension activation time

## 1.5.8204 (January 17, 2022) preview

- **Code Lens**
  - references, method overrides, trait uses, type implementation, method prototype implementation
  - peeks the references in the references window
  - setting to enable/disable: `php.codeLens.enabled`. By default `true`.
- if no `php` is set for the workspace, the editor picks the highest defined in `php.executables` setting
- improves completion and tooltips after nullable type-hints
- improves code analysis for `trait` with private abstract functions
- improves code analysis for use of `[]`
- improves code analysis about `isset` in global code
- improves analysis of the missing implementation of abstract methods
- validation for PHP 8.1 intersection types (check for use of scalars, check for valid types used)
- added missing modifier keywords to completion within function header
- fixes **Testing** to allow to run all tests (`Run all tests` in *Testing* panel)

## 1.4.8059 (December 20, 2021) preview

- detected PHP binaries may have invalid configuration, PHP Tools will report the warning and use the binaries anyways if a user wants so.
- diagnostic reports improper use of `static` in parameter type hints
- shortens type names inside PHP 8.1 intersection types in tooltips according to the current namespace
- updated color tooltips with PHP 8.1 syntax

## 1.4.8033 (December 17, 2021) preview

- fixed *overflow to double* problem underline position
- debugger respects user arguments over its forced arguments
- avoids suggesting adding `use` if it's already there in some cases ([#127](https://github.com/DEVSENSE/phptools-docs/issues/127))
- updated PHP manual
- updated code completion within PHP 8 attributes
- avoids reporting ByRef issues as an error, reports as a warning instead
- folding HEREDOC blocks
- possible fix of resolution of existing `php` on Windows
- PHP 8.1 intersection types (parsed, resolved)

> *note: type inferring and tooltips do not handle intersection types completely yet*

## 1.4.7597 (September 30, 2021) preview

- updated inferred type analysis of built-in functions
- highlights `case` within `switch`
- fixed possible stack overflow exception

## 1.4.7534 (September 21, 2021) preview

- fixes crashing when code contains huge nested expressions
- fixes language server protocol
- improves code analysis for `array_pad()`, `array_fill()`
- fixes false positive warning for chained use of `[]` in LValue
- memory optimizations

## 1.4.7520 (September 19, 2021) preview

- memory optimizations
- fixes crashing when code contains huge nested expressions

## 1.4.7494 (September 15, 2021) preview

- function return value summary displayed in tooltips
- fixes refactoring actions
- fixes code actions
- fixes PHPDoc generator
- optimizes protocol

## 1.4.7449 (September 7, 2021) preview

- improves analysis of `$this`
- improves error reporting of unused variables
- fixes whole document formatting
- fixes formatting of variable-less `catch`
- fixes an occasional issue when no debug port is specified
- internal performance improvements for JSON protocol
- fixes debugging documents without a workspace *(just an opened file without workspace or folder)*
- updated PHP manual
- fixes PHP parser - `readonly` is treated as it should according to PHP version

## 1.4.7295 (August 17, 2021) preview

- **PHP 8.1** syntax, code sense, and checks
  - read-only properties
  - final class const
  - new in initializers
  - new callable syntax
- updated PHP manual
- fixes incorrectly reported deprecations
- fixes incorrect parameteres with 'null' type hint

## 1.4.7254 (August 15, 2021) preview

- **Debug**
  - allows compound launch
  - allows more debug sessions at once
  - Xdebug port doesn't have to be specified (the `"port"` launch configuration)

## 1.4.6982 (July 15, 2021) preview

- when auto-import enabled, completions shows all possible types within possible namespaces
- automatically completes fully-qualified-name when auto-importing and there is a conflict with existing alias
- shows *(auto import)* in completion, if auto-importing will happen
- completion better lists variables
- optimizations
- when there are multiple types to auto-import, they are all shown in the completion list to choose from

## 1.4.6842 (June 22, 2021) preview

- automatic import of alias when completion
- setting `php.format.autoimport`
  - **auto-import option**: auto imports alias when completing types/function/constants out of namespace scope
  - **fqn**: inserts fully qualified name upon completion
  - **none**: inserts name as it is
  - **hide**: does not show inaccessible symbols in code completion
- fix position of light bulb for code action for fully qualifying name
- strikes out deprecated symbols in code completion

## 1.4.6822 (June 19, 2021) preview

- updated code analysis and code completion
- recognizes more undocumented `.phpstorm.meta.php` constructs ([#102](https://github.com/DEVSENSE/phptools-docs/issues/102))
- fixes PHPUnit TestCase MockObject type analysis ([#102](https://github.com/DEVSENSE/phptools-docs/issues/102))
- code action for simplifying fully qualified names ([#88](https://github.com/DEVSENSE/phptools-docs/issues/88))

## 1.4.6762 (June 07, 2021) preview

- PHP version picker ([see Selecting PHP in docs](https://docs.devsense.com/en/vscode/editor/php-version-select))
- `.editorconfig` problems conventions ([see Problems in docs](https://docs.devsense.com/en/vscode/problems#editorconfig))
- `"php.problems.scope"` setting (ignoring "vendor" folder by default) ([see Problems in docs](https://docs.devsense.com/en/vscode/problems#phpproblemsscope))
- debugging improvements
- exception handling - always break on fatal error, option to choose whether to break on handled errors/exceptions

---

## 1.3.6645 (May 25, 2021) preview

- debugging fixes and improvements
- debugging UX improvements

## 1.3.6632 (May 21, 2021) preview

- **Test Explorer** lists tests without running them
- Test Explorer supports tests with data sets properly
- tests get retired (grayed) if the source is modified
- optimized **debug protocol**

## 1.3.6616 (May 21, 2021) preview

- new **Test Explorer** (requires `hbenl.vscode-test-explorer`)
- debugging has been updated with support for multiple request handling, stability enhancements, corectness
- debugging supports detach
- optimizes Xdebug protocol
- **PHP 8.1** syntax support, `never` return type, `enum`, octal number notation
- completion of static methods after `$this->`
- `#[NoReturn]` attribute supported

---

## 1.2.6549 (May 12, 2021) preview

- fixes debug implementation (unexpected debug sessions closing)
- fixes debug breakpoints
- optimizes Xdebug protocol
- fixes HEREDOC parser
- fixes named parameters analysis for special names
- fixes PHP 8 parsing and invalid syntax errors
- optimizations

## 1.2.6469 (April 24, 2021) preview

- code action for **sort uses** (PSR-12)
- reports curly braces as deprecated since PHP 8.0
- support for remote file systems
- type analysis improvements

## 1.2.6305 (April 04, 2021) preview

- shows PHP version in status bar without suffix
- hotfix for macOS, downloading runtime package

## 1.2.6273 (March 30, 2021) preview

- code action for **generating constructors**
- code action for **getter/setter** respect field staticness
- fixes code actions
- faster code completion popup
- faster tooltip display for variables

## 1.2.6177 (March 17, 2021) preview

- memory optimizations
- fixes for Node.JS on IA-32 architectures
- fixes `PHP0423` for ambigous function declarations
- does not list names of anonymous classes in completion

## 1.2.6021 (Feb 17, 2021) preview

- PHPDoc generated for local variables and globals when user types `/**` above them
- updated PHP manual with more PHP 8 declarations
- pretty-print after `::class` and `fn` fixes
- avoided a few falsely reported problems
- fixes type analysis for reserved keywords within PHPDoc `@return` tag
- more details in tool-tips for built-in type keywords
- DBGp Proxy support fixes for the server downloaded from the Xdebug home page

## 1.2.5988 (Feb 10, 2021) preview

- fixes language server crash (stack overflow exception)
- more tollerant problems validation
- code analysis improvements

## 1.2.5973 (Feb 08, 2021) preview

- code analysis overall improvements, finally blocks fixes, constrained constants not reported
- refactoring and highlight occurence fixes for global constants in a namespace
- improved performance
- (linux, macOs) fixes server not being closed after VSCode shutdown or folder closed

## 1.2.5931 (Jan 31, 2021) preview

- rename refactoring allows to rename dynamic names
- language server crash fix when `__construct` contains trailing comma
- updated pcre check
- type analysis improvements, less falsely warnings
- improved analysis of standard functions
- improved analysis of try/catch blocks
- tolerant to mismatching PHPDoc type annotation of properties
- type check looks into subtypes of traits and interfaces, not being so strict
- fixed code actions and quick fixes

## 1.2.5887 (Jan 23, 2021) preview

- rename refactoring with preview
- pretty print of `use` groups
- built on .NET 5.0 (having `.NET 5.0 Runtime` avoids additional downloads)
- treats subtypes when resolving methods
- handles trait users improving analysis of trait and go to definition for methods in subtypes
- improves code analysis and type analysis
- avoids a lot of falsely warnings
- go to definition of parent of anonymous class fix

## 1.2.5843 (Jan 18, 2021) preview

- files in source controlled folders are ignored when changed (.git, .history, .svn)
- fixes PHP version in status bar - only shown when editing a PHP file
- optimizations
- updated PCRE check
- fixed code completion at the very end of document

## 1.2.5783 (Jan 04, 2021) preview

- respects `@template` annotation in PHPDoc
- handles inline `@var` annotation
- signature help for ambiguous constructors (`new \ReflectionMethod`)
- PHPDoc array type with union elements annotation (`array<A\B\C>`)
- PHPDoc allows for nullable type annotation (e.g. `?int`)
- optimizations
- improves code analysis, avoids some false positives
- improves code flow analysis, isset(), is_resource(), and type inference
- improves analysis for lambda function use variables
- CLI specific constants and variables are allowed and code completed
- updates `.phpstorm.meta.php` parser for type inference
- does not respect PHP4-style ctor when using PHP 7.1+
- fixes "Go to Implementation" in case of an anonymous class
- fixes return check of generator functions
- fixes check for `__clone()` magic method, can be private
- fixes check for array access on `\SplObjectStorage`
- fixes case and array key duplicity check for non-printable characters

---

## 1.1.5686 (Dec 23, 2020) preview

- support for `@mixin` annotations
- support for `@method` annotation with `$this` return type
- handles nullable type annotation in PHPDoc
- fixes resolution of type names in PHPDoc blocks
- fixes some incorrectly reported warnings (mostly an unknown method warning)
- updated pcre check
- can be installed on linux-arm64
- improves type names in tool tips
- code formatting for `match` expressions
- fixes code validation of class declaration
- updated integrated PHP manual

## 1.1.5620 (Dec 12, 2020) preview

- syntax checks respect current PHP version including 8.0.
- more quick fixes for invalid union types
- updated pcre check
- tool-tip type names rendered shorter

## 1.1.5595 (Dec 04, 2020) preview

- named arguments code completion (PHP 8)
- named arguments hover information
- functions annotated with `#[Deprecated]` attribute reported in diagnostics
- diagnostics for matching or unknown named arguments (PHP 8)
- diagnostics for `iterable` type hint
- diagnostics for nullable types
- diagnostics for union types (PHP 8)
- `null` type name within unions (PHP 8)
- improved `.phpstorm.metadata.php` annotations
- support for Xdebug 3.0 and PHP 8.0 debugging

## 1.1.5532 (Nov 21, 2020) preview

- updated PSR-2 code formatting
- warning `PHP0415` for use of an undefined constant
- warning `PHP0418` for use of an undefined method
- code fix for `PHP0415` if it might be a local variable
- doctrine annotations in code completion
- fixes class name completion within PHPDoc
- updated global constants in code completion and analysis
- updated PHP manual translations

---

## 1.0.5403 (Oct 28, 2020) preview

- analysis of class properties
- fixes type hint for magic methods
- stability fixes

## 1.0.5342 (Oct 20, 2020) preview

- PHP 8 new attribute syntax `#[]`
- more code suggestions
- improves unused `use` diagnostic when used in PHPDoc
- improves underlining of problems in opened document when typing
- `@suppress` and `@SuppressWarnings` PHPDoc tags allowing to ignore specified warnings within class/function
- supports more PHPDoc array syntax conventions
- improves analysis of `isset()` and `new static()`

## 1.0.5264 (Sep 30, 2020) preview

- fix for double-dollar `$$` character in code completion of a variable

## 1.0.5229 (Sep 22, 2020) preview

- diagnostic and quick fix for names that can be simplified
- diagnostic for unused parameters in constructors and private functions
- updates of externally modified files (`*.php`)

## 1.0.5153 (Aug 28, 2020) preview

- `@dataProvider` PHPDoc attribute; code sense, navigation, completion
- implement missing abstracts quickfix respects original `public` keyword
- PHP 8.0 null-safe operator supported
- PHP 8.0 `match` construct supported (must have PHP >=8.0 `phpExecutable`)
- fix of `quick fix` for overlapping problems
- stability fixes

## 1.0.5087 (Aug 17, 2020) preview

- deduplicated quick fixes
- improved type analysis of expressions enclosed in parenthesis
- unknown type name in PHPDoc gets quick fix
- mouse hover shows whether function returns `null` as well (`void` is shown as `null` eventually)
- *go to implementations* for methods
- provides quick fix for invalid base classes
- code completion after `namespace` keyword

## 1.0.5044 (Aug 11, 2020) preview

- quick fix for unknown class names in PHPDoc
- quick fix to remove unnecessary `use`
- `iterable` phpdoc type hint
- load status indicator in status bar at left
- current PHP version indicator in status bar (bottom right)
- workspace re-analysed lazily when code is changed (disable with [`"php.problems.workspaceAnalysis": false`](https://docs.devsense.com/en/vscode/configuration#configuration-options))

## 1.0.5029 (Aug 07, 2020) preview

- "go to implementations" support
- `SonarSource.sonarlint-vscode` not reported as incompatible
- fixes "go to" of interface names after `extends` keyword
- deprecations are rendered with a strike through 

## 1.0.5015 (Aug 06, 2020) preview

- "find all references" of `__construct` includes class instantiations
- "find all references" perf.
- problems analysis improvements
- improved analysis of inline PHPDoc type hints
- some problems related to other problems are not reported
- parser fixes

## 1.0.4975 (July 29, 2020) preview

- performance improvements
- problems analysis improvements
- improves workspace loading
- logging of workspace load failures

## 1.0.4934 (July 19, 2020) preview

- standalone `@deprecated` not ignored
- few performance improvements
- fixes duplicities in reported problems
- some problems caused by other problems not reported
- workspace loading and code editing improvements

## 1.0.4908 (July 13, 2020) preview

- less falsely positive warnings
- improved type analysis of `static` and properties
- PHP 8.0 (Alpha 1) syntax supported
- New PHP 8.0 compatibility warnings
- fixed implements abstracts for trait members
- improved formatting when using tabs

## 1.0.4698 (May 19, 2020) preview

- better placement of `use` quick action

## 1.0.4666 (May 06, 2020) preview

- fixes for systems without .NET Runtime (3.x or 5.x) installed

## 1.0.4654 (May 05, 2020) preview

- improved run of all tests (runs within single process now)
- PHPDoc type hints in `@method` respect current namespace
- locals in arrow function used from parent scope and annotated properly

## 1.0.4608 (April 17, 2020) preview

- configuration snippet for `Launch current script in console` fixed
- HTML tooltips in PHP script
- `<` triggers HTML completion
- PCRE patterns check (within `preg_*` functions)
- PHPDoc `@method` with vararg supported
- unused `use` highlighting respects custom PHPDoc tags
- Test Explorer fixes:
  - debugging session closed after test finishes
  - test cases can be debugged without additional configuration
  - fixes exception upon test run

## 1.0.4394 (January 23, 2020) preview

- fixed completion of variables (`$` prefix is not duplicated)

## 1.0.4277 (December 10, 2019) preview

- code flow analysis improvements for `finally` blocks
- makes use of `dotnet` 3.1 if installed on the system
- minor fixes, and updates to stabilty issues

## 1.0.4229 (November 22, 2019) preview

- `Implement abstracts` **code action** & **quick fix** (interfaces and abstract members)
- `Add getter/setter` **code action** for fields and multiple fields
- updates to stability issues

## 1.0.4187 (November 10, 2019) preview

- code editor fixes (occuring when format on save, format on paste)
- completion inside PHPDoc

## 1.0.4168 (November 4, 2019) preview

- improved listing symbols in document/workspace
- listing properties when searching prefixed with `$`
- navigation to trait uses

## 1.0.4145 (October 24, 2019) preview

- problems check for not implemented functions
- problems check for traits
- improved tooltips and performance
- updated builtin PHP manual
- debugger reports common issues human friendly

## 1.0.4009 (September 23, 2019) preview

- `{@link}` in tooltips shown as hyperlink
- `{@inheritdoc}` gets substituted according to PHPDoc specs.
- updated blade templating editor (`@section`, `@yield`) and formatting fixes
- embedded HTML fixes
- stability fixes, improved internal error logging
- reporting problems improvements

## 1.0.3951 (September 9, 2019) preview

- generated PHPDoc respects type hints
- generated PHPDoc treats nullable types correctly
- language server crash fix
- avoids spawning `rg.exe` when running `composer install|update` (fixes system freezing)

## 1.0.3936 (September 5, 2019) preview

- PHAR files in workspace get parsed
- **code completion** includes declarations from PHAR files
- **go to definition** supports content in PHAR files
- **navigation** through entries in PHAR files
- **signature help** and **tooltips** for declarations in PHAR files
- minor fixes and improvements

## 1.0.3774 (August 1, 2019) preview

- formatting of typed properties
- completion after `use` is filtered by class name
- obtaining long data from Xdebug

## 1.0.3748 (July 24, 2019) preview

- classes/interfaces/traits not available in current namespace or uses are not listed in code completion
- dynamic class aliasing supported in code completion and type analysis (`class_alias()` and Joomla registered aliases)
- PHP in blade blocks (`.blade.php`) (except syntax highlighting)
- improved type analysis of arguments passed by reference
- fixed pasting when `Format on Paste` is enabled (HTML was corrupted)

## 1.0.3703 (July 17, 2019) preview

- performance optimizations
- `php.problems.workspaceAnalysis` setting to enable/disable workspace-wide problems analysis
- array unpack type check

**PHP 7.4 support**

- PHP 7.4 support (arrow functions, typed properties, spread array, `??=` operator, underscores in numbers)
- PHP 7.4 features reported when using PHP < 7.4
- PHP 7.4 features analysis, type analysis, problems analysis
- spread array type check

## 1.0.3645 (July 11, 2019) preview

- improved project load and background analysis
- `.phpstorm.meta.php` (version 2016.2+) processed
- Code completion and analysis of IoC
- fixed formatting for nullable types
- formatting pretty-prints opening bracket `{`
- formatting code style defaults to `PSR-2`

## 1.0.3603 (July 8, 2019) preview

- fixed issue when some warnings disappear and after few secs appear
- improved CPU use when opening/closing documents
- fixed formatting around `?:` and `::`
- improved code analysis evaluation
- less strict analysis of use of uninitialized variables
- completion after `use` gets fully qualified names

## 1.0.3593 (July 5, 2019) preview

- diagnostics of magic methods
- diagnostics of duplicit function parameters
- improved type analysis of numbers
- launching debugger enhancements
- PSR-2 formatter fixes

## 1.0.3574 (July 2, 2019) preview

- improved type analysis of `explode()`, `microtime()`, Oxid framework
- `catch` variable diagnostics and analysis

## 1.0.3547 (June 27, 2019) preview

- formatter improvements
- DBGP proxy support
- improved unused variable diagnostic

## 1.0.3525 (June 24, 2019) preview

- anonymous functions type analysis
- anonymous functions annotated with PHPDoc
- anonymous functions details in tool tips
- signature help with function return type
- dimmed unused variables
- loading project performance, responsiveness

## 1.0.3507 (June 22, 2019) preview

- fixed increasing number of untitled documents upon code format
- type analysis improvements
- inital support for dbgp proxy

## 1.0.3483 (June 17, 2019) preview

- updated PHP manual
- validation of value passed to `define()`
- validation of use of `define()` on PHP >= 7.3

## 1.0.3471 (June 12, 2019) preview

- support for logpoints
- `php.format.codeStyle` can be set in the workspace scope
- code formatting fixes, indentation after opening tag, blocks on a new line
- `html`+`php` formatting fix for overlapping ranges error

## 1.0.3435 (May 28, 2019) preview

- fix for disabling breakpoints
- optimized debug protocol

## 1.0.3428 (May 27, 2019) preview

- updated PHP manual for the latest PHP 7.3 and PHP 7.4 constructs
- updated readme

## 1.0.3386 (May 9, 2019) preview

- Disabled warning PHP0424 when passing an object in foreach
- Analysis of use params within lambda function
- Minor code navigation fixes
- Minor code formatting fixes

## 1.0.3348 (Apr 23, 2019) preview

- signature helper fixed, showing the correct parameter
- fixes running the extension when there is no `dotnet`
- works with `dotnet` 3.0

## 1.0.3241 (Mar 4, 2019) preview

- PHPDoc generation with parameter names

## 1.0.3230 (Feb 27, 2019) preview

- PHPDoc blocks inserted with placeholders (snippet)
- PHPDoc tags snippets
- PHP compatibility warnings
- fixed not disappearing warnings after file delete
- fixed pretty-print of `die()` construct
- fixed formatting for function headers and properties

## 1.0.3202 (Feb 20, 2019) preview

- updated PHP manual
- format on type (`;` and `}`)
- format profile `Off`
- formatting not applied when code is syntax invalid

## 1.0.3185 (Feb 14, 2019) preview

- code completion in PHPDoc for PHPDoc keywords (after `@`)
- code actions for typos in PHPDoc and unknown type names in PHPDoc

## 1.0.3174 (Feb 12, 2019) preview

- code action for adding `use ;` when applicable
- code action to fully qualify type name when necessary
- generating `PHPDoc` when user types `/**` (`formatOnType` must be enabled)
- selection format
- localized messages - en, de, ja, tz, es

## 1.0.3058 (Dec 30, 2018) preview

- improved code formatting
- few texts localized to german

## 1.0.3031 (Dec 3, 2018) preview

- folding collapses the inner range
- formatting code style setting `php.format.codeStyle`
- PHPDoc for local variables with multiple `@var`/`@global` tags
- code suggestion to add `$this->` if applicable

## 1.0.3003 (Nov 26, 2018) preview

- code suggestion for an unknown class error
- unnecessary `use` directives are rendered as fade out
- `F10` and `F11` start debugging and stop on entry
- `exclude` launch configuration - patterns that will be skipped from debugging when stepping
- debugger allows setting a variable or property value
- debugger supports long strings
- debugger supports paging for large arrays
- test explorer optimization
- generated files are not included in user's workspace
- test explorer shows only user's tests, only if there is no `phpunit.xml` in root then all tests in recursive dirs are listed

## 1.0.2930 (Nov 3, 2018) preview

- display language setting `phpTools.language` can be changed without reloading the workspace
- changing setting `php.problems.exclude` updates the problems window
- a file changed outside the editor gets updated
- stability fixes

## 1.0.2915 (Oct 30, 2018) preview

- debugger allows inspecting stack frames and locals value
- experimental: setting `files.exclude` is handled
- experimental: setting `php.problems.exclude` allows ignoring specified folders and all or specified problem codes
- not completing items right after <?
- highlighting references under caret optimization

## 1.0.2895 (Oct 23, 2018) preview

- project problems are updated after the workspace is loaded
- some false warnings are not reported
- `pathMappings` launch configuration
- fix: closing language server process on Unix systems
- fix: working with large mixed HTML/JS/CSS/PHP code
- signature help for new objects
- memory and perf. optimization
- stability fixes
- project startup optimizations
- code folding for all parenthesis

## 1.0.2802 (Oct 11, 2018) preview

- option to activate license/request trial offline
- option to mute warning about missing PHP
- tests are not loaded and run automatically (either enable `autorun` or click `reload`/`start`)
- debug watch tooltip provides expandable object properties
- more detailed output log about PHP and Xdebug that will be used for debugging/tests
- `F5` starts debugging of current script even without having `launch.json` configuration  
- does not provide basic completion after `:` (but `::`)
- code completion handles ambiguous trait declarations

## 1.0.2765 (Oct 8, 2018) preview

- Symbols in workspace feature.
- Processing all files mapped to `php` language.
- Code completion improvements.

## 1.0.2738 (Oct 3, 2018) preview

- Test Explorer detects phpunit.xml.dist to get enabled
- code completion handles ambiguous types better
- short open tags `<?` allowed if there is no normal open tag `<?php`
- updated readme and documentation
- re-enabled completion after $ (fixes recent update in VSCode)

## 1.0.2681 (Sep 27, 2018) preview

- option to request trial license
- downloading dependencies from CDN
- updated the extension's publisher ID

## 1.0.2590 (Sep 14, 2018) preview

- triggering completion after ->, $, \, ::
- code folding for blocks, comments, PHPDoc and regions
- language server providing
    - code completion
    - hover
    - formatting
    - code structure
    - signature help
    - find all references
    - navigation
    - go to definition
    - refactoring
    - highlighting
- code analysis and validation
- debug support
    - watch
    - debug mouse watch
    - breakpoints
    - UNC paths
    - path mapping
    - remote debug, console, built-in server
- workspaces
- UNC paths
- built-in PHP server
- PHPUnit Test Explorer
    - Live testing
    - Tests debugger
    - Tests browser
- Initial version of PHP Tools for VS Code
