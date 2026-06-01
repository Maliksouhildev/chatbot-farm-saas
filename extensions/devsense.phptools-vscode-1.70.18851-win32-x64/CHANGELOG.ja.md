## 1.70.18851 (2026年5月13日)


### 改善点

- `"numeric-string"` 型が尊重されるようになり、数値文字列からの暗黙の型変換が不必要な警告を生成しなくなりました。
- 様々な制御フロー解析の整理と安定性の向上。

### PHPDoc

- ネストされたPHPDocタグの解析がより寛容になり、PHPDoc解析の堅牢性が向上しました。
- `@global` の出現のマッチングを修正しました。
- PHPDocタグ内の型名コード補完を修正しました。 [#892 (comment)](https://github.com/DEVSENSE/phptools-docs/issues/892#issuecomment-4422799460)

### IntelliSense

- `$GLOBALS['NAME']` がマウスホバーやリファクタリング機能でより具体的に扱われるようになりました。
- 配列に複数の要素型がある場合の動的プロパティの型推論を修正しました。

### WordPress

- より多くの非標準WordPress型構文との互換性を追加しました。
- 構造化されたWordPress型構文の規約のサポートを拡張しました。

## 1.70.18840 (2026年5月9日)



### マイナーな改善点

- グループで定義されていても、Laravelルートがより正確に認識されるようになりました。
- 非Laravelプロジェクトのためのパフォーマンスとメモリ最適化。
- ジェネリックテンプレート型の処理を改善します。これらがベースクラススコープに渡された場合に未バインドである場合に対応しています。 [#2501](https://community.devsense.com/d/2501), [#2504](https://community.devsense.com/d/2504)
- 星型提案AIモデルが更新されました。
- WordPressの規約をより尊重し、エラー報告が少なくなりました。
- IntelliSenseにスタブを追加するコードアクションを追加しました (`php.stubs` 設定)。これにより、PHPブックに定義されている未知の関数またはクラス名の問題が修正されます。

### 中国語のローカライズ

拡張機能のUIとIntelliSenseが中国語で表示されるようになりました。これは、VSCodeの表示言語が `zh-cn` に設定されている場合に自動的に設定されます。

## 1.70.18740 (April 7, 2026)



### 新機能

- デフォルト値を持つ不正な可変引数に関する診断を追加しました。 [#1025](https://github.com/DEVSENSE/phptools-docs/issues/1025)
- 属性名の補完が有効な属性クラス（`#[Attribute]`を持つもの）のみをリストします。 [#2511](https://community.devsense.com/d/2511)
- Laravelコントローラの補完をさらに追加。 [#2502](https://community.devsense.com/d/2502)
- PHPマニュアルブラウザで属性を表示（PHPマニュアルからシンボルへのナビゲーション、例：`Override`）。
- 日本語UIローカライズ。
- ジェネリックテンプレート引数がネストされたローカル関数とラムダ関数で機能します。

### 修正

- `View`タイプの後のLivewire IntelliSenseを修正しました。
- ファイルの末尾での`<?php`後の誤った構文エラー。 [#1026](https://github.com/DEVSENSE/phptools-docs/issues/1026)
- `php.format.rules.keepControlStatementsOnOneLine`が誤ってメソッド本体の前の空行を削除する問題を修正しました。 [#2542](https://community.devsense.com/d/2542-formatting-bug)

## 1.69.18673 (2026年3月26日)



### お気に入りの候補

最も可能性の高いメンバー補完が星印 ★ でマークされ、リストのトップに表示されます。これにより、より少ない入力で正しいアイテムを迅速に見つけることができます。

![starred suggestions](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/refs/heads/master/docs/vscode/editor/imgs/starred-completion.png)

入力を続けると何も変わりません。この機能は自然に普段のワークフローに溶け込み、邪魔になりません。

> 星印の候補は、`"php.completion.starredSuggestions"` 設定を使用して無効または有効にできます。
> 注: この機能は _Alpine Linux_ (`musl`) ではサポートされていません。

### 新機能

- パラメータの型ヒントを追加するためのコードアクション。
- Livewire フレームワークによって定義されたメソッドが IntelliSense に追加されました (`View::layout()`, `View::title()`)。 [#2530](https://community.devsense.com/d/2530)

### 小さな変更

- `Premium` ユーザーには、ウェルカム画面に「購入」ボタンが表示されなくなりました。
- Alpine/musl 用の専用インストーラーが再び提供されます。 [#1020](https://github.com/DEVSENSE/phptools-docs/issues/1020)
- `PHP0412` (_未定義プロパティ_) はプロパティの代入に対して報告され、後続の読み取りには報告されません。これは他のコード分析ツールとより一貫しており、対応するツールチップと一緒に使用することでより理にかなっています。また、プロパティが `@property` ドキュメントブロックで指定されている場合やマジックな `__get`/`__set` 関数がある場合、この警告は報告されません。

### 修正と改善

- _Laravel_ ルート定義内でのコントローラーメソッドの解決の修正。 [#2502/7](https://community.devsense.com/d/2502/7)
- ワークスペース内の問題は、ファイル編集時に遅延再解析されます。
- CSS ルールおよび関連するものに対する Blade 構文の修正。 [#1023](https://github.com/DEVSENSE/phptools-docs/issues/1023)
- パラメータが不足している不正な関数オーバーライドの迅速な修正では、括弧の閉じ `)`を削除しません。
- ワークスペースのロード時間の最適化。

## 1.68.18590 (2026年3月11日)




### 機能

- PHP 8.5 `(void)` キャスト。
- 型階層のサポート。
- カスタムのWordPressアクションとフィルターのコード補完。
- PHPオープンタグ（'<?php' など）のコード補完。

### 修正

- `php.format.rules.alignConsecutiveAssignments` が直接case項目内で揃わないフォーマット問題の修正。
- 深い再帰がある場合のlambda `use` における未使用変数チェックの修正。[#1010](https://github.com/DEVSENSE/phptools-docs/issues/1010)
- 異なるトレイト `use` ブロックからのトレイト適応の修正。[#1012](https://github.com/DEVSENSE/phptools-docs/issues/1012)
- composerパッケージからの宣言に対する非推奨チェックの修正。

## 1.67.18520 (2026年2月17日)




### 修正

- 文字列補間内のパーサーを修正、例: `"{$a}b"`。
- 以前のエラー回復後の誤った構文エラーを修正。
- 末尾のコンマがある`match`アームの形式を修正しました。[#1007](https://github.com/DEVSENSE/phptools-docs/issues/1007)

### 小さな変更

- 文字列補間とは異なる文字列連結のコードアクション。[#970](https://github.com/DEVSENSE/phptools-docs/issues/970)

## 1.67.18502 (2026年2月13日)




### 修正

- 基本メソッドが `static` を返す場合のメソッドオーバーライドに関する診断。[#932](https://github.com/DEVSENSE/phptools-docs/issues/932)
- 特殊なラムダ関数（つまり、Pest PHPテスト）でのメソッドの可視性。[#1006](https://github.com/DEVSENSE/phptools-docs/issues/1006)
- 複数行の関数呼び出しにおける名前付き引数のインデントが欠落していた問題を修正。[#2510](https://community.devsense.com/d/2510)
- `{$var}`による文字列補間後のシグネチャヘルプを修正。[#4](https://github.com/DEVSENSE/php4vs/issues/4)

## 1.67.18497 (2026年2月11日)



### Laravel

- `Storage::fake('')`が処理され、後続の`Storage::disk('')`が`assert`メソッドを持つ`FileSystemAdapter`を返すことが知られています。
- `\Pest\Laravel\actingAs()`は、`Architectable`や`Browsable`トレイトを含む、より具体的な`TestCase`クラスを返します。

### マイナーフィーチャー

- 新しい`URI`拡張は、古いバージョンのPHPで使用された場合にも、 PHP 8.5以降で利用可能として適切に報告されます。
- **Pestの高次テスト**のためのコード補完、`Browsable`および`Architectable`トレイトを含む。
- オプションのパラメータを持つクロージャー/コール可能に対するPHPDocアノテーションを尊重します。[#1000](https://github.com/DEVSENSE/phptools-docs/issues/1000)
- コードアクション: `Remove Unnecessary Spread`。
- コードアクション: `clone`を`clone with`に置き換え。
- 可変引数にインレイヒントを表示しません（意味がありません）。
- 診断 _TraitMethodConflict_ `PHP2447`。[#1002](https://github.com/DEVSENSE/phptools-docs/issues/1002)
- エラートレラントパーサーの初期実装。
- 関数呼び出し内でのスプレッド演算子は、提供済みの引数と配列キーが競合しないか確認します。

### 修正

- NEONファイル（PHPStan構成）に関する警告を避けるため、実際にファイルが`.php`である場合には発生しません。`.php`のPHPStan構成はサポートされていません。
- `"string"`値に対するマウスホバーとナビゲーションは、常に同名のグローバル関数に移動するのではなく、文字列が使用されるパラメータが`callable`の場合のみです。
- `Match`という名前のクラスで不要な空行を修正しました。[#984](https://github.com/DEVSENSE/phptools-docs/issues/984)
- Laravelの`enum_value()`の誤った戻り値タイプを修正しました。
- 構文エラーに関する誤ったメッセージを修正しました。
- `interface`に対する`@extends`チェックを修正。[#2513](https://community.devsense.com/d/2513)
- 無名関数のオプション引数を尊重します。
- `trait`内での`self::`によるプライベート`const`の参照。[#1004](https://github.com/DEVSENSE/phptools-docs/issues/1004)

## 1.66.18408 (2026年1月29日)



### 小さな機能

#### パラメータ検証

Closureと間接関数呼び出しのパラメータ検証を追加しました。  
  [#2503](https://community.devsense.com/d/2503)

  ![check closure call](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/refs/heads/master/docs/vscode/imgs/cfg-closure-args.png)

#### リファクタリング、参照、およびナビゲーション

特定のコードパターンで`"string"`値を介したリファクタリング、参照、およびナビゲーションを改善しました。  
  `new ReflectionMethod(FQN::class, "HERE");`など。  
  [#2502](https://community.devsense.com/d/2502)

  ![resolve symbols](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/refs/heads/master/docs/vscode/editor/imgs/resolve-string-symbols.png)

#### Laravelサポート

Laravelコントローラーアクションメソッドの補完サポートを追加しました。  
  [#2502](https://community.devsense.com/d/2502)

  ![laravel controller method completion](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/refs/heads/master/docs/vscode/editor/imgs/complete-controller-method.png)

#### エディターの洞察＆ナビゲーション

コード分析と同じロジックを使用して、マウスホバーとナビゲーションを強化し、より詳細なメソッド結果を提供します。  
  これにより、生成されたスタブ、ヘルパー、オーバーロードされたメソッドの可視性が向上し、エディターが内部的に実際に見ているものが明確になります。

  ![hover all methods](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/refs/heads/master/docs/vscode/editor/imgs/hover-all-method-stubs.png)

### 修正

- `@var`注釈で`Closure`型名のセマンティックハイライトと未使用の`use`チェックを修正。
- SymfonyポリフィルがIntelliSenseで欠落する問題を修正し、ポリフィルでの誤った非推奨警告を回避。
- `@formatter:off`の動作を修正して、元の空白とブレースの配置を正しく保持するようにしました。

## 1.66.1837 (2026年1月26日)



### 修正

- 不完全な`_laravel_ide`スタブがある場合のメソッド解決を修正。 [#990](https://github.com/DEVSENSE/phptools-docs/issues/990)
- 静的/非静的メソッド呼び出しのメソッド解決を改善。
- Laravel Models IntelliSenseを改善 - Query Builderからの静的ヘルパーが正しく表示および解決される。
- Str::startswith() メソッドのアサーションに基づく型推論を修正。 [#2498](https://community.devsense.com/d/2498)

## 1.66.18374 (2026年1月24日)



### デバッグ

- 関数の戻り値のサポートを追加しました。関数結果を調査するための一時変数は不要です。ステップアウト後に変数ペインで戻り値をキャプチャして表示し、ソース関数を明確に識別します（例：`strtoupper()`）。
- launch.json の `XdebugSettings` のサポートを改善しました。DBGp の機能（`max_data`、`max_children`、`max_depth` など）を確実に上書きできます。 [#2450](https://community.devsense.com/d/2450-xdebug-settings-cannot-be-changed)

### マイナー機能

- コード補完で `@pure`（および `@phpstan-pure`、`@psalm-pure`）タグが使用できるようになりました。この機能はまだコード分析では使用されていません。
- メモリ使用量の最適化。
- 文字列結合を文字列補間で簡素化するコードアクションは、より多くの可能なケースを処理します。
- PHP `7.x` と `8.x` の間のマイナーな構文の違いが考慮されます。すなわち、名前空間名内の準予約トークンです。PHPバージョンが変更されたときに開かれているPHP文書内の構文も再評価されます。 [#963](https://github.com/DEVSENSE/phptools-docs/issues/963) および類似の問題を修正。
- PHP 8.5 **URI** エクステンションがワークスペーススタブリストに追加されました（デフォルトでは有効になっていません - "Workspace Stubs" コマンドを参照）。

### 修正

- `vendor` ディレクトリ外の非標準的な `installPath` を持つ Composer パッケージが二重にインデックス化およびキャッシュされません。これにより、IntelliSenseでの二重出現、不要なRAM使用量、初期CPU使用量が修正されます。また、コードフロー分析および影響を受けるプロジェクト（Drupalなど）全体のエディターの体験が改善されます。
- 可変引数パラメーターの配列型アノテーションに対応。 [#2489](https://community.devsense.com/d/2489)
- 不明なタイプのクラスメンバーに対するセマンティックハイライトが機能します。すなわち、`$unknown->member`。
- `.blade.php` で、エディターにテンプレーティングエンジンによって生成された「コードビハインド」に対するコードアクションがリストされていました。これらのコードアクションは注意を散らし、意味をなさず、無効なコード変更を生成していました。 [#985(2)](https://github.com/DEVSENSE/phptools-docs/issues/985)
- ドキュメントコメント内のセマンティックカラーを修正しました。ドキュメントが編集中または保存された場合に色が付かない。
- 定数 `true` および `false` を使用した条件付き `@return` アノテーションを改善。
- ワークスペースに無効な `class_alias()` または `constant()` がある時のコード補完が欠如している問題を修正。
- NEON ファイルの解析に関する修正。 [#992](https://github.com/DEVSENSE/phptools-docs/issues/992)
- メソッドがスコープ外で宣言されているが、そのプロトタイプがされていない時の `protected` 関数可視性チェックを修正。 [#2496](https://community.devsense.com/d/2496)
- `try`/`catch` のコードフロー分析における、`finally` 内の `goto` のラベルに関する修正。
- 無効なクラス名または定数名が `define()` または `class_alias()` 関数で導入された場合のコード補完を修正。
- 設定 `"php.format.exclude"` の修正により、ワークスペース相対パスと共に動作するようにしました。 [2499](https://community.devsense.com/d/2499)
- `ArrayObject::exchangeArray()` のパラメーターシグネチャを修正。 [#2494](https://community.devsense.com/d/2494)
- ユニオン型でのコード補完およびマウスホバーを実装。 [#2492](https://community.devsense.com/d/2492)

## 1.65.18327 (2026年1月14日)



### 新機能

- PHP 8.5 `clone` が新しい構文およびオプションの引数をサポートする関数として。 [#2478](https://community.devsense.com/d/2478)
- PHP 8.0 参照可能な文字列構文。 [#2479](https://community.devsense.com/d/2479)
- クラスプロパティフックのための CodeLens を有効化しました。 [#2476](https://community.devsense.com/d/2476)
- 定数とパラメータ値（_数値_、_文字列_、および _`null`_）を比較可能にする新しい `@return` 条件付き注釈、例：
  ```php
  /** @return ( $name == null ? false : int ) */
  function foo( $name ) { return $name === null ? false : strlen($name); }
  ```
  または
  ```php
  /** @return ( PHP_MAJOR_VERSION >= 8 ? string[] : array|false ) */
  function foo() { ... }
  ```
  使用可能な演算子は、型比較のための従来の `is` に加えて、新たに `==`、`<=`、`>=`、`<`、`>` です。
- `explode()` 関数がPHPバージョン固有の戻り値型注釈で表示されます（ツールチップ内、型解析による、生成されたドキュメント内）。 [#860](https://github.com/DEVSENSE/phptools-docs/issues/860)
- インターフェイスおよび列挙型に特定の色を追加しました（ユーザーのテーマでサポートされている場合）。
- プロパティフックの型ヒントにおける型名の色を追加しました。

### 修正

- 列挙型のケースのための CodeLens を修正しました。 [#2482](https://community.devsense.com/d/2482)
- 診断において生成された `_ide_helper`、`_laravel_idea`、および `_laravel_ide` を尊重します。 [#974](https://github.com/DEVSENSE/phptools-docs/issues/974), [#2486](https://community.devsense.com/d/2486)
- 新しいスコープにバインドされた `Closure` 内での不正なメンバー可視性に関する誤った警告を修正しました。
- 現在のスコープで表示されないクラスプロパティでのナビゲーションとマウスホバーが動作します。
- 名前空間名での `Echo` による構文エラーを修正しました。
- すべての IntelliSense 情報を曖昧にする `phpstan/php-8-stubs` コンポーザーパッケージが存在する場合の型推論を修正しました（より遅く、精度が低くなります）。 [#2481](https://community.devsense.com/d/2481)
- まれに発生する言語サーバーのクラッシュの可能性を修正しました。 [#979](https://github.com/DEVSENSE/phptools-docs/issues/979)

### 未使用クラスメンバーのハイライト

直接使用されていないクラスメソッド、定数、およびプロパティは、現在、薄く表示されます。

## 1.64.18270 (2025年12月30日)




### 最適化

エディターで主要な**パーサー最適化**を導入しました。PHPエディターはインクリメンタルな変更を追跡し、コードを遅延的に解析するため、編集が重要でない場合は解析を完全にスキップします。これにより、入力中のCPU使用率が約90％削減され、大きなPHPファイルで特に顕著です。

さらに、**初期インデックス作成**が最適化されました。それでも、パフォーマンスを向上させるためにワークスペースフォルダをウイルス対策スキャンから除外することをお勧めします。

最後に、CodeLensのサポートも改善されました。主に基礎となるアルゴリズムが再実装されたため、CPUの使用量が大幅に減少しました。

### 修正

* `.editorconfig`ファイル内での補完を修正しました。候補には可能なフォーマットルールやコードアクションの設定が含まれます。
* `is_numeric()`型推論を改善しました。
* CodeIgniter 3プロジェクトでのライブラリサポートを改善しました。
* PHPDoc内の予期しない`!`に対する診断位置を修正しました。
* `empty-string`型ヒントを伴う複数の否定`@phpstan-assert-if-***`注釈が正しく解決されるようになりました。[#967](https://github.com/DEVSENSE/phptools-docs/issues/967)
* 対応する診断が抑制されている場合、コードを薄暗くしたり取り消し線を引いたりしません。
* クラス階層が完全に知られていない（基底型が不明な）場合、`catch`句内での誤ったクラスの報告は行いません。
* 編集された構造化配列型の配列項目にアクセスする際の誤警告を修正しました。[#969](https://github.com/DEVSENSE/phptools-docs/issues/969)
* `Keep*OnOneLine`設定が有効な場合の空行処理を修正しました。[#964](https://github.com/DEVSENSE/phptools-docs/issues/964)
* リネーム時に無効な新しい識別子は、詳細を表示したポップアップメッセージを表示します。
* 特徴適応ブロックからメソッドの参照を正しく見つけ、適応ブロックによってリネームされたものも含みます。
* `ReflectionMethod::__construct()`の誤った廃止勧告を修正しました。

### 軽微な機能

* `@suppress`（または`@suppresswarnings`）タグが選択された`PHPMD`コードを認識します。
* `empty-string`型ヒントが認識されます。
* 常に偽となる厳密な比較の診断。[#971](https://github.com/DEVSENSE/phptools-docs/issues/971)
* 従来のコンストラクタの廃止チェックがより詳細になりました。

## 1.63.18172 (2025年12月3日)




### マイナー機能

- インライン PestPHP テストケースランナーサポート。 [@MrPunyapal](https://x.com/MrPunyapal/status/1994339061956329731)
- 引数の文字列値提案のコード補完。
- `@psalm-assert-if-true`、`@psalm-assert-if-false`をサポート。
- `@phpstan-assert` または `psalm-assert` を `=` を前に付けた型ヒントとともにサポートし、PHPUnit の `assertInstanceOf()` で使用。
- `@phpstan-ignore-line` を考慮。

### 修正

- 定数式でメンバーフィールドや無名関数を使用したときの誤ったエラー。[#955](https://github.com/DEVSENSE/phptools-docs/issues/955), [#958](https://github.com/DEVSENSE/phptools-docs/issues/958)
- `and`、`or` 条件における不必要な括弧の無効ヒント。[#2467](https://community.devsense.com/d/2467)
- 無効な `@dataProvider` 注釈があるときの言語サーバークラッシュ修正。

## 1.63.18152 (2025年11月27日)



### マイナー機能

- `phpunit.xml` 構成で除外されているが、テストビューで選択/フィルタされたグループを含むテストが実行されます。したがって、すべてのテストを実行する際にデフォルトで実行されないように、大規模/遅いテストを `<groups><exclude><group>...` XML 構成を使用して除外することができます。これらの除外されたテストがフィルタボックスを使用して選択またはフィルタされる場合、除外は上書きされます。[#2426](https://community.devsense.com/d/2426-test-explorer-does-not-filter-by-at-group/12)
- 現在、`/vendor/**` フォルダ（`composer` のような特別なサブフォルダを含む）の問題は、`vendor` フォルダ内のファイルがエディタで開かれない限り、全くリストされません。
- `is_numeric` の型の絞り込み。[#2436](https://community.devsense.com/d/2436)
- `php-amqp` スタブを追加しました。
- 設定 `files.exclude`、`php.files.exclude`、`search.exclude`、`php.problems.exclude` は、グループ、範囲、否定、および特殊文字を含むグロブパターンをサポートします。`[`, `]` で囲まれた括弧。[#945](https://github.com/DEVSENSE/phptools-docs/issues/945)
- 頻繁に要求されるPHPエディタ設定にアクセスするためのコマンド `PHP Tools: Quick Settings ...` を追加しました。
- 複数言語のPHPマニュアルを更新しました。
- 未使用のプライベートクラス関数を薄く表示します。[#800](https://community.devsense.com/d/800)
- クイックリファクタリングで `array_merge` を配列スプレッドに置き換えます。
- PHP >= 8.4 の `new` の周りの不要な `()` をクリーンアップするためのクイックリファクタリング。
- 無名関数からの新しい呼び出し可能な構文を作成するクイックリファクタリング。
- `compact()` 関数内の変数名を補完。
- 属性やさまざまな初期化における定数式 (`PHP2446`) の診断。見かけた箇所: [#2458](https://community.devsense.com/d/2458), [#949](https://github.com/DEVSENSE/phptools-docs/issues/949)
- 複雑な階層を持つ `enum` 定義のオーバーライドチェックを改善。[#2460](https://community.devsense.com/d/2460)
- 型付きプロパティにおける結合型と交差型の未知の型チェック。[#2461](https://community.devsense.com/d/2461)

### 修正

- パラメータや括弧を含む関数を補完する際の `)` の自動閉じの上書きを修正しました。[#947](https://github.com/DEVSENSE/phptools-docs/issues/947)
- 属性内のクイックフィックスを修正しました。
- オブジェクト演算子 `->` を含む矢印関数へのコードアクション変換を修正。
- ファイル名が正しいクラス名識別子でない場合、PSR-4 のクラス名修正を提案しません。
- 定数式内での矢印 `fn` を提案しません。[#949](https://github.com/DEVSENSE/phptools-docs/issues/949)
- `__construct` やその他のマジックメソッドに対して未使用の関数宣言は報告されません。[#950](https://github.com/DEVSENSE/phptools-docs/issues/950)
- `@phpstan-assert` がコードフロー内で適用されるべき以上に多くの式に影響する問題を修正しました。[#2459](https://community.devsense.com/d/2459)

### 破壊的変更

- 設定 `"php.completion.intelliPHP.preSelect"` はデフォルトで `false` です。[この機能は素晴らしいですが](https://docs.devsense.com/vscode/editor/intelliphp/#pre-selecting-the-item-in-the-completion-list)、コード補完を 50 - 250 ms 遅くする可能性があります。

## 1.62.18097 (2025年11月12日)




### グループ化された自動インポート

新しく、自動インポートは既存の `use` グループを尊重し、インポートされた修飾名がグループに追加されます。

新しい設定では、適切であれば新しい `use` グループを作成することができます。

```json
"php.completion.autoimport": "auto-import-grouped"
```

![auto-import grouped](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/refs/heads/master/docs/vscode/editor/imgs/vsc-autoimport-group.gif)

### 非最適化の特殊コンパイラ関数の診断

[#2438](https://community.devsense.com/d/2438): コンパイラ最適化関数が現在のスコープでインポートされていない場合、コンパイラはそれをより効率的なOPコードに変換することができません。このような関数呼び出しをマークする新しい診断 `PHP6616` が追加されました。

![native function invocation](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/refs/heads/master/docs/vscode/imgs/native-function-invocation-example.png)

デフォルトでは、このような問題はあまり目立たないようにマークされ、VSCodeの問題ウィンドウに表示されません。以下の設定により、より目立つように下線が引かれ、_ファイル保存時_ やVSCodeの「自動修正...」コマンドをトリガーすることで自動修正されることも可能です。

`.editorconfig`
```ini
[*.php]
php_diagnostic_php6616=autofix
```

詳細は[ブログ記事 blog.devsense.com](https://blog.devsense.com/2025/optimize-native-function-invocation/)をご覧ください。

### 小さな機能

- `@phpstan-assert` や `@psalm-assert` アノテーションが `vendor` ディレクトリ全体にわたって尊重されます。
- **CI3** サポートが改善され、ロードされたライブラリから `CI_Controller` に動的プロパティが追加されます。
- 配列パラメータヒントが構造化された関数呼び出し内で配列を定義する際の配列キーの補完 [#942](https://github.com/DEVSENSE/phptools-docs/issues/942)。
- 改善された_不要な括弧_ヒントは `and` と `=` 演算子の優先順位を尊重し、`||`、`&&`、代入、`if`、その他の二項演算子に対するより多くのヒントを追加 [#2444](https://community.devsense.com/d/2444)。

### 修正

- コンポーザーパッケージ内のメソッドが `self` を返すが、基本インターフェイスでは型が注釈されている場合に壊れていた型推論を修正しました。[#941](https://github.com/DEVSENSE/phptools-docs/issues/941)
- 修正: 連続代入の整列機能がクロージャーや匿名関数内で正しく動作するようになりました。[#2442](https://community.devsense.com/d/2442-align-consecutive-assignments)
- ブレードコンポーネントビューとブレードコンポーネントクラス間の切り替えが修正されました（[ドキュメント](https://docs.devsense.com/vscode/frameworks/laravel/#switch-between-blade-view-and-class)）。[#2443](https://community.devsense.com/d/2443)

## 1.62.18042 (2025年10月30日)




### 新機能

- テストパネルでグループ名によってテストをフィルタリングできるように、**PHPUnit グループ**をサポート。
- タイプチェック時のfalseブランチでの型推定の改善。
- `class-string`型を活用した型推定の改善。
- 名前付きパラメータのインレイヒント用のマウスツールチップ。
- 連続した代入の整列が異なるタイプの代入（例えば=、+=、??=、など）の書式設定をサポートするようになりました [#2432](https://community.devsense.com/d/2432)。

## CodeIgniter 3

軽量で人気のある**CodeIgniter 3**フレームワークには、多くのPHPエディタが正しく処理できない癖と規約があります。Visual Studio Code用PHP Toolsには、CodeIgniter 3のための組み込みサポートが含まれるようになりました。このサポートは今後のアップデートでさらに強化されます。

![CI3 completion](https://docs.devsense.com/vscode/frameworks/img/ci3-view-completion.png)

このバージョンで確認できること:
- モデル名の補完。
- ビュー名の補完。
- コントローラ内で読み込まれたクラスの補完。

特別な貢献をしてくださった [#677](https://github.com/DEVSENSE/phptools-docs/issues/677) に感謝します。  
詳しくは [docs.devsense.com](https://docs.devsense.com/vscode/frameworks/codeigniter3/) をご覧ください。

### 修正

- インターフェースを実装するバックされた`enum`が正しく`BackedEnum`に解決されるようになりました [#930](https://github.com/DEVSENSE/phptools-docs/issues/930)。
- 名前空間内に宣言されていないテストケースの結果が記録されていなかった問題を修正 [#936](https://github.com/DEVSENSE/phptools-docs/issues/936)。
- Laravel/Symfonyフレームワークに基づいていない`App\Models\`クラスに対する誤った型推定を修正。

## 1.62.17969 (2025年10月9日)




### テストコードカバレッジ

テストの[_コードカバレッジ_](https://docs.devsense.com/vscode/test-explorer/#code-coverage)のサポートを導入しました。今すぐお試しください。「テスト」パネルに移動し、「Run Tests with Coverage」ボタンをクリックします。コードカバレッジは「テスト」パネル、「エクスプローラー」パネル、そしてコード内にも表示されます。

![code coverage button](https://docs.devsense.com/vscode/imgs/code-coverage-start-button.png)

![code coverage](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/refs/heads/master/docs/vscode/imgs/code-coverage-results-explorer.png)

![code coverage](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/refs/heads/master/docs/vscode/imgs/code-coverage-visual.png)

> この機能はPHPUnit/Para/Pestの機能に依存しており、適切なコマンドライン引数を使用してテストを実行し、VSCode内で便利にカバレッジ情報を表示します。`phpunit.xml`構成に`<source>`要素が含まれていることを確認してください。トラブルシューティングには、「OUTPUT」ウィンドウ / _PHP (Test Explorer)_ を監視してください。

### その他の機能

- マウストツールチップ内の`@see`が参照されているシンボルへのクリック可能なリンクを含んでいます（可能な場合）。
- ソースコード内の`@see`には意味的に色付けされたシンボルがあります。
- **PHP 8.5**の言語レベル、パイプ演算子（`|>`）、および基本的なチェック。
- `enum`宣言の検証 ([#926](https://github.com/DEVSENSE/phptools-docs/issues/926))。
- 暗黙的にnullableなパラメータのチェック（PHP &gt;= 8.4で非推奨）。
- 複数のテストスイートを持つすべてのテストを実行する際、現在は1つのプロセスのみが作成されます。

## 1.61.17926 (2025年9月23日)




### 改善点

- `"search.exclude"` の動作が _Find all references_、_Code Lenses_、_Find Implementations_、_Symbols in Workspace_ で統一されました。
- PHP 8.4未満で、新しいメンバー呼び出しに括弧がない場合の診断。
- Pest 関数が新しい `$this` を考慮します。`@param closure($this)` または `@param-closure-this` で注釈が付けられた任意のパラメーターに関連しています ([#918](https://github.com/DEVSENSE/phptools-docs/issues/918))。
- 到達不能な match arm の診断 ([#919](https://github.com/DEVSENSE/phptools-docs/issues/919))。
- 関数パラメータのスニペット補完の動作が変更され、ランゲージサーバープロトコルに準拠し、VSCodeによる不必要な警告を回避します ([#909](https://github.com/DEVSENSE/phptools-docs/issues/909))。

### PHPUnit、Pest、データセット

_Test Explorer_ に新機能を導入します：新しい paratest のサポート、Pest の実験的サポート、データセットを Test Explorer UI でのサポート。

![Test Explorer のデータセット](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/testexplorer-datasets.png)

### 修正点

- オーバーロードチェックの修正および不足している抽象メソッドを実装するためのクイックフィックス ([#2392](https://community.devsense.com/d/2392))。
- 配列初期化子で新しい行に `[` の後に不要なスペースができる問題を修正 ([#923](https://github.com/DEVSENSE/phptools-docs/issues/923))。
- `php.format.rules.spaceWithinDeclParens` が有効なときにラムダのスペースを追加 ([#922](https://github.com/DEVSENSE/phptools-docs/issues/922))。
- PHP マニュアルのクラスシンボルへの _Go To Definition_ の修正。

## 1.60.17873 (2025年9月2日)




### 修正

- パラメータ補完スニペット（設定 `php.completion.parameters` == `"parameters"`）にデフォルトのパラメータ値が正しく含まれるようになりました。
- インラインCSSとスクリプトタグ内での自動補完を修正しました [#914](https://github.com/DEVSENSE/phptools-docs/issues/914)

## 1.60.17845 (2025年8月23日)




### 改善点

- 無効なPHP構成やデバッグを壊す可能性のある構成のチェック。すべての警告は `OUTPUT` / `PHP` ログに一覧表示されます。
- `trait` 内の型推論が改善され、`static::`、`self::`、`parent::` の後のメンバーがほぼ解決します。エディターは指定された `trait` のすべての使用を追跡し、また `@extends` および `@mixin` 注釈も確認します。

### デバッグ

一部のブレークポイントが正しくないにもかかわらず検証済みとマークされる問題を修正しました。

### 修正

- `@closure-this` または `@param callable(TYPE $this)` を伴うラムダ関数内の `$this` が、ツールチップで正しい型で注釈されます。
- 「抽象をオーバーライド」コードアクションが正しい型の名前空間を生成します。
- `@method static static` タグを正しく解決します。
- 複雑な型名の周りの不要な括弧をツールチップから削除しました。
- `trait` 内の `self` および `static` を正しく解決します。

## 1.60.17803 (2025年8月14日)




### `&&` コードアクションの簡素化

呼び出しチェーン `->` と論理演算子 `&&` を用いた長い条件は、今では `?->` を用いた単一の呼び出しチェーンに簡素化できます。

### 改善点

ユーザーのフィードバックに基づいて、さまざまな型推論の改善を行いました。

新たに、マジックメソッド `__call()` を通じて呼び出されるメソッドは、`PHP6615` 診断で注釈されます。これはツールチップとエディタ内に表示されます。この新しい診断は、意図しない間違ったメソッド呼び出しを防ぐのに役立ちます。

![unintended method call](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/err-call-via-magic.png)

### 修正

- 現在のファイル内のシンボルのナビゲーションを修正しました。
- PHAR ファイル内のシンボルへのナビゲーションを修正しました。
- 単純な `"/"` グロブパターンを持つ `"php.problems.exclude"` 設定を修正しました。
- `/vendor/` 内の関数で誤った型を引き起こす `array` 型情報を修正しました。
- プロパティフックで使用されるクラスの未使用インポートが誤って検出される問題を修正しました。
- あいまいな `$class_or_object` 引数を持つ `method_exists()` の解析を修正しました。
- あいまいに推論された型の場合のメソッドチェックを改善しました。

## 1.59.17706 (2025年7月29日)



### 軽微な機能

- 自動補完リストの末尾にマジックメソッドを移動 [#690](https://github.com/DEVSENSE/phptools-docs/issues/690)。
- モデルの "casts" から推論されたEloquentモデル属性の型情報を改善。
- 不正なマジックメソッド修飾子を修正するコードアクション。
- 複雑なジェネリクス内での `static` 型の解決を改善。

### 修正

- 標準定数の誤った非推奨警告を修正 [#2328](https://community.devsense.com/d/2328)。

## 1.59.17685 (2025年7月23日)




### 修正

- `__get()`マジックメソッドがある場合に未定義プロパティについての誤った警告が出る回帰を修正しました。

## 1.59.17674 (2025年7月18日)



### Laravel IDEの改善

- Livewireの計算プロパティがコード補完とナビゲーションで利用可能。
- IntelliSenseが様々なLaravelパッケージ（例：Filament）から補完を表示 (ビューファイル、翻訳キー、ルート、設定キー)。
- Laravelのリレーションメソッドはジェネリクスを使用して`HasOne<T,G>`の戻り型を持つことができ、リレーションプロパティは`T`型になります。
- 対応するコンポーネントクラスが見つかった場合、Bladeファイルで`$this`を正しい型で補完します。
- `casts()`メソッドや`$casts`プロパティで見つかったEloquent属性を補完します。
- Bladeファイルでの`@error`ディレクティブを修正。

### フォーマット

- 単項演算子`not`の前にスペースを追加する設定を追加しました [#874](https://github.com/DEVSENSE/phptools-docs/issues/874)。
- 単一行のプロパティフックで閉じ中括弧が新しい行に配置される問題を修正しました [#878](https://github.com/DEVSENSE/phptools-docs/issues/878)。

### 診断の改善

コード診断が全体的に改善され、誤った警告を避けるようになりました。これにより、以前チェックされていた未知のクラス名のレポート、虚偽の未実装抽象メソッド、一部の数値操作における無効な型推論などが修正されました。

さらに、エディタは未実装の抽象プロパティをチェックするようになりました（[#870](https://github.com/DEVSENSE/phptools-docs/issues/870)）。

[#2322](https://community.devsense.com/d/2322)、[#2272](https://community.devsense.com/d/2272)、[#2286](https://community.devsense.com/d/2286)（および関連するもの）の修正。

### 小さな改善

- traitsなしでの戻り型ヒントにおけるコード補完 [#887](https://github.com/DEVSENSE/phptools-docs/issues/887)。
- "todo"トークンの「ダンス」する黄色いハイライトを修正 [#893](https://github.com/DEVSENSE/phptools-docs/issues/893)。
- traitsからのメンバーのオーバーライドチェックの修正 [#890](https://github.com/DEVSENSE/phptools-docs/issues/890)。

## 1.59.17515 (2025年6月23日)



### 'use' ステートメントのソート

新しく、'use' ステートメントの順序を `alphabetic` または `by_length` に設定できるようになりました。これは `settings.json` や、対応する `ij_php_import_sorting` ディレクティブが尊重される `.editorconfig` で設定できます。

`use` のソートについては、[ドキュメントページ](https://docs.devsense.com/vscode/code%20actions/organize-uses/)を参照してください。コードアクションで、ファイル保存時に自動的に、または自動修正として `use` をソートできます。

### Laravel IDE の改善

- `.php.` 言語ファイルが処理され、`trans()`, `__()`, または blade の `@lang` のようなメソッドで翻訳キーの補完とナビゲーションが可能になります。
- IntelliSense で多くのモデル属性が型指定されます。

### 修正

- blade ファイルでスニペット完了が `@` を2回挿入してしまう問題を修正しました ([#867](https://github.com/DEVSENSE/phptools-docs/issues/867))。
- 名前空間付き名前での `Return` の解析を修正しました。
- 特定のポリフィル composer パッケージで言語サーバーがクラッシュする問題を修正しました ([#873](https://github.com/DEVSENSE/phptools-docs/issues/873))。

## 1.59.17478 (2025年6月15日)




### メソッド抽出、定数抽出

コードの選択範囲を関数として抽出する、または定数として抽出する新しいコードアクション。

### Composer IntelliSenseの強化

`composer.phar` は通常ワークスペースフォルダの外にあるため、その定義はエディタに知られていません。これを解決するために、`composer` IntelliSenseデータベース（スタブ）を含めました。

特に何もせずに、エディタは `/vendor/composer/` ファイル内で使用されるComposerのクラスを認識し、それらが未知として報告されず、また調査することができます。

ユーザーがたとえば _Composer_ プラグインを開発している場合、以下の2つのオプションがあります:
- メモリを不必要に消費しますが、`composer.phar` をワークスペースに追加してIntelliSenseを得ること。
- または、設定 `"php.stubs": ["composer", "*"]` を使用するか、コマンド `> Workspace Stubs` を使用して `composer` スタブをワークスペースに追加することが推奨されます。

### IntelliSenseの強化

- `new self`、`new static`、または `new parent` を通じてコンストラクタへのナビゲーション ([#857](https://github.com/DEVSENSE/phptools-docs/issues/857))。
- ナビゲーションは曖昧さがある場合、現在のファイル内のシンボルを優先します。
- `-string` で終わる予約されたPHPDocタイプの処理。
- `.phpstorm.meta.php` アノテーションの未ドキュメント機能の取り扱いを改善。
- 複雑なトレイトメソッドの使用を検査。
- グローバルコードやBladeテンプレートで`$this`の使用が適切にアノテートされている場合、報告されません。
- `callable` パラメータとして使用される callable-string への参照 ([#2295](https://community.devsense.com/d/2295-to-go-definition-on-callable-params-in-function-call))。
- すべての組み込みPHP定義のURLをレビューし修正。

### Laravel & Eloquent

- リレーションシップメソッドからの動的プロパティは、型を指定するためのオプションのジェネリック型注釈から型が推論され、IntelliSenseにシームレスに追加されます。
  ```php
  /** @return HasOne<T> ジェネリック型アノテーションを使用して動的プロパティ `$relationship` の型を指定します。 */
  function relationship(): HasOne { ... }
  ```
- `Model::find(int)` や `Container::make()` のようなLaravel/Eloquentのマジックメソッドの暗黙的な型を改善。

### フォーマット
 
- 読みやすさを向上させるために、`foreach` ステートメントが自動的に単一行に折りたたまれることを防止。
- JavaScriptフォーマッタで `javascript.format.semicolons` を有効にすると、PHPフォーマッタが変更を適用できなくなる問題を修正 [#850](https://github.com/DEVSENSE/phptools-docs/issues/850)。
- タブとスペースの組み合わせを含むブロックコメントのフォーマットを修正。
- インターセクションタイプのフォーマットを修正 [#2309](https://community.devsense.com/d/2309)。

### 新しい設定

- `php.files.exclude`: PHP言語サーバーによるファイルとフォルダーのインデックスを除外するためのglobパターン。ただし、VSCodeのエクスプローラービューからは除外されません。
- `php.navigation.referencesScope`: リファレンスに移動する際の選択肢が厳格（厳密に型付けされたオブジェクトタイプを必要とする）か、可能な任意のターゲット位置に解決するかを選択できます。
- `phpTools.parallelismLimit`: ディスクからファイルを読み取り、解析し、インデックス化するために使用するバックグラウンドスレッドの数を制限することができます（ユーザーマシン設定）。

### 互換性のない変更

HTMLの自動タグ更新が常に有効でした。これからは、[code.visualstudio.com](https://code.visualstudio.com/docs/languages/html#_auto-update-tags) に記載されているように、VSCodeの設定 `"editor.linkedEditing"` を尊重します。

### 修正

- パフォーマンスの改善。
- 可視性が変更されたトレイトメンバーの修正 ([#854](https://github.com/DEVSENSE/phptools-docs/issues/854))。
- Bladeパーサーの修正。

## 1.58.17223 (2025年5月2日)




### メソッドオーバーライド

選択されたメソッドオーバーライドを実装するコードアクションが追加されました。クラスヘッダをクリックし、クイックフィックスメニュー（電球）を開いて、`Override Methods` を選択します。開いたクイックピックパネルで、オーバーライド可能なメソッドのいくつかまたはすべてにチェックを入れ、確認します。

![Implement Method Overrides](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vscode-method-overrides.gif)

### マイナーな機能

- 統合されたPHPマニュアルとIntelliSenseを（未公開の）PHP 8.4定義で更新しました ([#841](https://github.com/DEVSENSE/phptools-docs/issues/841), [#823](https://github.com/DEVSENSE/phptools-docs/issues/823))。
- クラス階層の検証、メンバーコード補完、およびコードナビゲーションのために `@(psalm|phpstan)-require-(extends|implements)` を尊重し、提案します ([#837](https://github.com/DEVSENSE/phptools-docs/issues/837))。
- `@param-closure-this` を尊重します ([#825](https://github.com/DEVSENSE/phptools-docs/issues/825))。
- ラムダや任意の間接関数呼び出しから `&` 参照を渡す際の診断を改善しました ([#831](https://github.com/DEVSENSE/phptools-docs/issues/831))。
- アウトラインはプロパティとクラス定数の可視性を表示します。
- 混在するJS/PHPコードのフォーマット修正。[#2259](https://community.devsense.com/d/2259-a-comment-to-ignore-formatting-including-js-blocks)
- `Request::user()` や `Auth::user()` のより専門的な戻り型により、`->` 後のコード補完が向上しました。

### 修正

- Bladeフォーマッタのインデントが深すぎるのを修正。
- ドメインに結合したUnixシステムでのクラッシュを修正。
- コメントの前にクラス本体があるときの不要な改行を修正。
- PHPプロパティ後のインラインコメントがフォーマット中に別の行に移動される問題を修正 [#2245](https://community.devsense.com/d/2245-class-property-comment-after-goes-to-below-it-after-format)

## 1.57.17158 (2025年4月11日)



### 新機能

_参照の検索_ と _ワークスペースシンボル_ 機能に **`"search.exclude"`** 設定が適用されるようになりました（[thread #780](https://github.com/DEVSENSE/phptools-docs/issues/780)）。

### 小さな改善

- 統合された PHP マニュアルと IntelliSense を更新しました。
- `instanceof` 型推論の改善（[#810](https://github.com/DEVSENSE/phptools-docs/issues/810)）。
- `Closure::bind()` 内で匿名関数 `newScope` を尊重し、誤警告の修正とコード補完の改善。

### 修正

- 名前付き引数として渡された匿名関数のチェックを修正しました（[#821](https://github.com/DEVSENSE/phptools-docs/issues/821)）。
- `"files.exclude"` パターンが VSCode と同じように扱われます。これまで存在していた動作の違いがなくなりました。
- `"files.exclude"` と `"search.exclude"` パターンの両方が大文字小文字を区別します。

## 1.57.17031 (2025年3月25日)




### 新機能

新たに、テキスト選択の**コードアクション**とクイック修正が**グループ化**されました。その結果、同じアクションを選択内のすべての出現箇所に対して一度に適用できます。

![grouped code action](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vsc-grouped-action.png)

コードの一部を選択し、すべての出現箇所にクイックリファクタリングを適用します。これは、[Auto-Fix](https://docs.devsense.com/vscode/code%20actions/autofix/) 機能に加えてコードのクリーンアップを簡素化するためのもう一つの強化です。

### 改良点

- PHP >= 8 の `explode()` の解析が、`bool` を除外して `string[]` 型を正しく推論します ([#2129](https://community.devsense.com/d/2129-wrong-variable-type-after-test))。
- 型解析が不完全である可能性があり、その結果補完が不完全になる可能性があることを報告します。これは内部的な技術的制限によるもので、今後改善を目指します。
- `_ide_helper.php` が生成された場合の曖昧・冗長な定義があるときに、より多くの Laravel マジック。
- 関数内で未使用の `global` 変数を報告します。

### 修正

- 旧式のコンストラクタ修正の解決。
- 予約された PHP キーワードを含む FQN 内でのコード補完と診断。
- Model の PHPDoc プロパティからの Eloquent カラム名提案の修正。
- 不要な `@mixin` がクラス定義にサイクルを引き起こす場合の可能な修正/改善。
- "and" または "or" という名前の識別子の後の不要なスペースを削除しました [#816](https://github.com/DEVSENSE/phptools-docs/issues/816)。
- Blade ファイル内のリンクでの Ctrl/Cmd+クリックを修正しました [#815](https://github.com/DEVSENSE/phptools-docs/issues/815)。
- 未保存（無題）ドキュメント内のコードアクションの修正。

## 1.57.16971 (2025年3月12日)




### 小さい機能

- 新しく文書化されたPHP 8.4宣言のためにPHPマニュアル/IntelliSenseを更新しました。
- `app()`, `App::make()`などのLaravelサービスIDの補完。
- Eloquentの`find(int)`がより具体的なIntelliSenseを得ます。
- `.phar`ファイルエントリへのナビゲーション。
- いくつかの特異ケースにおける診断と補完が改善されました。
- 基本宣言からの`@param`を尊重します ([#804](https://github.com/DEVSENSE/phptools-docs/issues/804))。
- プロファイリングはDocker/Remoteで`pathMappings`を使用して実行する場合に機能するようになりました。プロファイリングデータは`/.vscode/profiling`ワークスペースフォルダに一時的に保存されます ([#800](https://github.com/DEVSENSE/phptools-docs/issues/800))。
- HEREDOC/NOWDOC文字列の色 ([#754](https://github.com/DEVSENSE/phptools-docs/issues/754))。一部のテーマではこれをサポートしていないことに注意してください。
- PHPファイルのHTML部分にクリッカブルなリンクが提供されるようになりました。

### 修正

- Blade中括弧の自動補完を修正しました。
- 特定のシナリオで発生したBladeのフォーマット問題を修正しました。

## 1.56.16884 (2025年2月19日)




### 小さな機能

- PHPDoc構造型名でのラインコメントをサポート。
- `template-type<,,>` PHPStan PHPDoc型関数をサポート。
- 配列の展開型推論を改善。
- 古い`Collection`のための`foreach`制御変数の型推論を改善。
- `if`文の上にある`@var`アノテーションを尊重。
- `array_find()`の返り値の型推論を改善。

### フォーマット

- `php.format.rules.blankLinesBeforeClass`が匿名クラスに正しく適用されない問題を修正。
- コンストラクタ引数でのプロパティフックをサポート。[#786](https://github.com/DEVSENSE/phptools-docs/issues/786)
- コンストラクタ引数での非対称プロパティの昇格に関するフォーマットの問題を修正。[#788](https://github.com/DEVSENSE/phptools-docs/issues/788)
- `.editorconfig`オプション`ij_php_blank_lines_around_method`が設定されているときに、ラムダ関数の前に不要な改行が表示される問題を修正。[#818](https://github.com/DEVSENSE/phptools-docs/issues/818)

## 1.56.16853 (2025年2月12日)



### Laravel

- Eloquentの「マジック」およびLaravel固有の関数のコード補完。
- 特別な`ide.json`ファイルを通じた拡張可能なコード補完。
- `config(..)`, `config()->string(..)`, `Config::get(..)`などでの設定キーの補完。
- 環境変数の補完。
- 特別なLaravel関数でのビュー属性の補完。
- 特定の関数での名前付きルートの補完。
- 特定の関数でのルートパラメータ名の補完。
- 特定の関数での言語翻訳ファイルからのIDの補完。

### Eloquent

- 様々なEloquentクエリビルダーメソッドでのモデル列の補完。列は次から解決されます（最初に定義されたもの）：
  - モデルクラスのPHPDoc `@property`。
  - モデルのファクトリークラスの`definition()`関数。
  - モデルのテーブルを使用して（解決可能であれば）、`database/migrations/`内のマイグレーションと`Schema`定義で参照。
- モデル動的フィールドの補完。
- マジック`whereCOLUMN()`関数の補完。

### Laravel Blade

- `Blade::component()`を使用して定義されたコンポーネントエイリアスの補完。
- `Blade::include()`を使用して定義されたビューエイリアスの補完。
- `ide.json`からのコンポーネントの補完。
- `ide.json`, `Blade::directive()`, `Blade::if()`からのディレクティブと条件ディレクティブの補完。
- Livewire: `wire:model`値でのコンポーネント属性の補完/ナビゲーション。
- Livewire: `wire:***`値でのコンポーネントアクションの補完/ナビゲーション。
- セクション名の補完。
- `x-dynamic-component`を補完に追加。
- BladeのフォーマットとBladeの折りたたみがカスタム`if`ディレクティブを尊重。
- `{{}}`または`{{{}}}`内部にスペースを自動挿入。
- `{!`を入力すると`{!! !!}`が自動挿入。
- `{{-`を入力すると`{{-- --}}`が自動挿入。
- ビューとクラスファイルを切り替えるための`phptools.blade.switchViewClass`コマンド。 「キーボードショートカットを開く」をクリック -> 「phptools.blade.switchViewClass」を検索 -> ショートカットを割り当て。

### HTML

- HTML属性のために自動挿入された引用符の直後に補完リストが即座に表示されるように。

### フォーマット

- リターン文の前の空行数を定義する`php.format.rules.blankLinesBeforeReturnStatement`を追加。
- プロパティの周りの空行数を定義する`php.format.rules.blankLinesAroundProperty`を追加。
- クラス定数の周りの空行数を定義する`php.format.rules.blankLinesAroundClassConstant`を追加。
- enumケースの周りの空行数を定義する`php.format.rules.blankLinesAroundEnumCase`を追加。
- [PHP PERコーディングスタイル](https://www.php-fig.org/per/coding-style/)に従って空行制限を強制するため、PERコーディングスタイルを拡張（`php.format.codestyle`を`per`に設定）。
- JavaScriptでマルチラインテンプレート文字列を使用する際のPHPファイルでの不要なインデントの問題を解決。[#2215](https://community.devsense.com/d/2215-unwanted-indentation/3)

### デバッグ

- デバッガーでの`.env`ファイルのサポートを強化。
- `envfile`オプションは非推奨になりました。環境変数の設定には`launch.json`の`envFile`を使用してください。

### 修正

- コード編集時のトリプルドットとインレイヒントの浮遊修正（[#776](https://github.com/DEVSENSE/phptools-docs/issues/776)）。
- `.blade.php`ファイルで埋め込まれたPHPコードと`editor.codeActionsOnSave`を使用したソートと使用の削除が修正されました（[#483#issuecomment-2621398221](https://github.com/DEVSENSE/phptools-docs/issues/483#issuecomment-2621398221)）。
- ワークスペースシンボルが`vendor`および`"files.exclude"`設定で指定されたフォルダーからファイルをリストしない。
- composerパッケージ内の`.phar`ファイルは無視されず、`.phar`ファイルからの定義がIntelliSenseに適切に含まれる。

## 1.55.16740 (2025年1月22日)




### 修正

- 複数行のメソッドパラメータ属性のインデントを修正しました [#767](https://github.com/DEVSENSE/phptools-docs/issues/767)
- 値を生成する関数（ジェネレーター）に対して、インレイの戻り値型ヒントとして`Generator`が正しく表示されます。
- 拡張機能が起動するたびに試用ライセンスを再アクティブ化しようとするバグを修正しました。
- ルータースクリプトが指定されている場合のプロファイラーの使用を修正しました。
- より多くのリクエストが行われる場合のプロファイラーの使用を修正しました - すべてのプロファイラー出力が開かれます。詳細は[プロファイラーのドキュメント](https://docs.devsense.com/vscode/profiling/?h=profiler#quickly-setup-php-for-profiling)を参照してください。

### 小さな機能

- コードフロー解析がジェネレーターの完全な`Generator<TKey,TValue,TSend,TReturn>`型を推論し、`foreach`によるジェネレーターの中での型推論、`Generator::send()`の型チェック、および`Generator::getReturn()`を改善します。
- `Route::`のような関数内でLaravelのルートパラメータをカラー表示します。
- プロファイリングの起動構成が追加されました（`launch.json`がない場合にユーザーが_デバッグ開始_（`F5`）を押したとき）。

## 1.55.16685 (2025年1月15日)




### Laravelサポートの強化

- Laravelのビューと名前空間ビューの補完とナビゲーション。
- `route()` 関数内でのLaravelルート名の補完とナビゲーション。
- Bladeファイルのコンポーネント (`<x-...`) の補完とナビゲーション。
- `<livewire:` の後のLivewireコンポーネントの補完とナビゲーション。
- `@livewire()` および `Livewire::mount()` でのLivewireビューの補完とナビゲーション。
- ビュークラスのプロパティ、Livewireの `mount()`、`@props()` ディレクティブからのコンポーネント属性の補完とナビゲーション。
- `@includeWhen`、`@includeUnless`、`@each` Bladeディレクティブでのビューの補完。
- 特定のLaravel関数（`asset`、`storage`、...）内のパスの補完。
- `Blade` 言語でPHP機能（IntelliSense、インレイヒント、コードレンズ、ナビゲーション、...）が有効。

### フォーマット

[#2195](https://community.devsense.com/d/2195-add-new-blank-line-settings-and-update-psr-12-and-per-styles) でのリクエストに応じて、新しいフォーマット設定をいくつか導入しました:

- `php.format.rules.blankLinesBetweenUseTypes`: 異なる種類の `use` 文（例：クラス、関数、定数）間の空行数を指定します。同じ種類の文間の空行には影響しません。
- `php.format.rules.blankLinesAfterOpenTag`: 開始タグの後に挿入する空行の数を指定しますが、終了タグが同じ行にある場合は除きます。

詳細については、[フォーマットのカスタマイズ](https://docs.devsense.com/vscode/editor/customize-formatting/#blanklines) を参照してください。

### 修正: Laravelプロジェクトのデフォルト起動設定

- デフォルトの起動設定が修正され、Laravelルーターのスクリプトを正しく使用できるようになりました。
- `.vscode/launch.json` ファイルがない場合は、`.php` ファイルを開いて `F5` を押すだけです。デフォルトの起動アクションが始まり、開発用Webサーバーのデバッグが開始されます（Xdebugがインストールされていると仮定します）。
- さらに、初期の `launch.json` 設定には、Laravelプロジェクト用の正しい起動設定が含まれています。

> この修正は、Webルートがサブフォルダーにある場合、例: `/public`、`/wwwroot`、または `/webroot` に `index.php` があるときに、クイック組み込み開発サーバーを使用する際に影響します。今では、組み込み開発サーバーはWebルートディレクトリと同じ作業ディレクトリで開始されます。例: `${workspaceFolder}/public`。`.vscode/launch.json` ファイルがなく、`F5` を押してデバッグを開始する場合に試してみてください。

### 小さな機能

- 構造化されたオブジェクト型がツールチップおよびインレイタイプヒントに表示されます。
- 型推論が改善され、`class-string<T>` アノテーションをより有効に活用します。

### 修正

- 抽象クラスからのテストの実行 [#753](https://github.com/DEVSENSE/phptools-docs/issues/753)。
- Docコメント内の浮動小数点数と整数リテラル [#752](https://github.com/DEVSENSE/phptools-docs/issues/752)。
- 不要な括弧のヒントが無効 [#750](https://github.com/DEVSENSE/phptools-docs/issues/750)。
- 括弧内の式のマウスホバーと補完 [#743](https://github.com/DEVSENSE/phptools-docs/issues/743)。
- 条件式後の補完。
- `laravel\framework` >= `11.30` のデフォルトエイリアスが自動で解決されています。
- 基底クラスからメソッドの戻り型を解決。
- 特定のフォーマットルール設定下で、Bladeファイルの `@php` ディレクティブ内部の最初の行が、ファイルがフォーマットされるたびに右方向にさらにインデントされる問題を解決（[#548](https://github.com/DEVSENSE/phptools-docs/issues/548)）。
- フォーマット中にBladeファイルの制御フローディレクティブの後に不要なスペースが現れる問題を修正。

## 1.54.16574 (2024年12月23日)



### コード操作

- クラスメンバー修飾子の順序（PSR-12に従う）および可視性修飾子の欠落に対するコード操作を追加しました。

### 改良点

- 構造化配列がツールチップやヒントにおいて簡略化されました ([#703](https://github.com/DEVSENSE/phptools-docs/issues/703))。
- `->` 演算子の後、代入式の後、かっこなしの `new` の後での補完とマウスホバーが改善されました。

### 修正

- 新しい `...(set)` キーワードの後での補完/ホバー/定義への移動。
- `static::` を通して参照されるクラスメンバーへの参照カウント。
- コンストラクタプロパティでの新しい `...(set)` 修飾子。
- 別のファイルでグローバル変数をリネームする際にプレビューを表示します。
- PSR オートロードクラス名をケースセンシティブではチェックしません（VSCode API および FileSystem API に問題があります [#635](https://github.com/DEVSENSE/phptools-docs/issues/635)）。
- ラムダ関数内の関数名の後の不要なスペースを修正しました [#2196](https://community.devsense.com/d/2196-no-spaces-after-function-name-formatting-rule)
- 非対称可視性を持つプロパティでのナビゲーション [#741](https://github.com/DEVSENSE/phptools-docs/issues/741)。

### 互換性のない変更

- 拡張機能は、もはや古い PHPUnit 6 バイナリを同梱しません。PHPUnit テストを実行する際には、ユーザーは "phpunit/phpunit" コンポーザーパッケージをインストールするか、`"phpunit.phpunit"` 設定値を指定する必要があります。

## 1.54.16480 (2024年12月10日)




### PHP 8.4 構文

エディターは新しいPHP 8.4非対称の可視性構文をサポートします（[#728](https://github.com/DEVSENSE/phptools-docs/issues/728)）。もしご使用のPHPバージョンがまだサポートしていない場合は、構文がエラーとして下線が引かれます。

### プロファイリングテストと起動プロファイル

テストエクスプローラーは、PHPUnitテストを実行、デバッグ、そして新しくプロファイルできるようになりました（[PHP Profiler](https://marketplace.visualstudio.com/items?itemName=DEVSENSE.profiler-php-vscode)拡張がインストールされている場合）。詳細については[プロファイリングテスト](https://docs.devsense.com/vscode/test-explorer#profiling-tests)を参照してください。

さらに、テストを実行するために[カスタム`launch.json`](https://docs.devsense.com/vscode/test-explorer#custom-debug-launch-profile)「php」プロファイルを使用できます。

### コードアクションにIDが追加されました

より多くのコードアクションが文書化されました（[コードアクションリスト](https://docs.devsense.com/en/vscode/code%20actions/list)を参照してください）。これにより、それらを[非表示にする](https://docs.devsense.com/vscode/code%20actions/hide-code-action)ことや自動修正としてマークすることができます。[オートフィックス](https://docs.devsense.com/vscode/code%20actions/autofix)は、ファイル保存時または「Autofix」コマンドの使用時に利用可能な場合、有用なコードアクションを暗黙的に適用できる便利な機能です。

### 改善点

- 構文的に壊れたファイルでの変数名のより良い提案。
- 参照渡しで非変数を割り当てる際のより特定された警告メッセージ。
- PHPマニュアルの**イタリア語**が追加されました。コマンド`> PHP Manual Language`または設定`"phpTools.language": "it"`を使用します。未翻訳のテキストは英語で表示されます。
- PHPUnitテストの実行が高速化されました（[#725](https://github.com/DEVSENSE/phptools-docs/issues/725)）。可能な場合は、特定のファイルパスがPHPUnitに渡され、全てをスキャンする必要はありません。
- `"php.executablePath"`設定はワークスペーススコープ設定で変更できます。
- `"php.executablePath"`と`"php.executables"`は変数を含むことができます。例えば`"${workspaceFolder}/bin/php"`です。
- **ORM**: `EntityManager::getRepository(class-string<T>)`をクラス`T`に対応する`#[ORM\Entity(repositoryClass)]`属性を使用して呼び出す際のリポジトリクラスを推測します ((#2174)[https://community.devsense.com/d/2174])。
- WordPressとPERコードスタイルに必要なコード修正を追加しました。

### 修正

- `php.format.rules.maxBlankLines`設定がファイルの末尾で正しく適用されない問題を解決しました。[#2188](https://community.devsense.com/d/2188-maxblanklines-does-not-work-properly-at-the-end-of-a-file)
- Laravelのコードスタイルを更新し、匿名型のオープニングブレースを新しい行に配置してLaravelの慣習に揃えました。[#734](https://github.com/DEVSENSE/phptools-docs/issues/734)
- Laravelのコードスタイルから戻り値の型の前のスペースを削除します。[#734](https://github.com/DEVSENSE/phptools-docs/issues/734)
- `/vendor/`フォルダーで宣言された派生クラスでのテンプレート型引数の使用を修正します（例: ORMの`EntityManager::getReference()`）。

## 1.53.16379 (2024年11月19日)



### コードアクション設定

**コードアクションの重大度** は今変更可能です。これにより、特定のリファクタリングやクイック修正提案を非表示にしたり、警告またはエラーとしてマークしたりできます。

コードアクションを非表示にするには、次のいずれかを使用します:

- 対応するクイック修正「表示しない」
- または、VSCode設定の `"php.problems.exclude"` にコードアクションを追加
- または、あなたの `.editorconfig` ファイルにコードアクションを追加

その重大度を変更するには、コードアクションをあなたの `.editorconfig` ファイルに追加します。以下のサンプルは、すべての冗長な閉じタグ `?>` をエラーとしてマークし、削除を促します:

詳細については、以下を参照してください:

- [コードアクションの重大度を設定する](https://docs.devsense.com/en/vscode/code%20actions/severity)
- [コードアクションを非表示にする](https://docs.devsense.com/en/vscode/code%20actions/hide-code-action)

```ini
[*.php]
php_remove_redundant_closing_tag = error
```

**コードアクションの自動修正**: コードアクションは自動修正として実行できるようになりました。詳細は [自動修正](https://docs.devsense.com/en/vscode/code%20actions/autofix) を参照してください。

### 診断

- 右側にトレイトを使った `instanceof` の無効な使用を検出する新しい診断。

### 修正

- `vendor` フォルダ内のメタファイルのインデックス作成。
- VSCodeワークスペース外を指す `vendor` 内のシンボリックリンクされたパッケージのインデックス作成 ([#684](https://github.com/DEVSENSE/phptools-docs/issues/684))。
- カーソル後のテキスト削除の修正 ([#638](https://github.com/DEVSENSE/phptools-docs/issues/638))。

## 1.53.16338 (2024年11月12日)




### フォーマット

新しい**PER**コードスタイルオプションの導入を発表できることを嬉しく思います。これは、[PHP-FIG PERコーディングスタイル標準](https://www.php-fig.org/per/coding-style/)に準拠しています。このコーディングスタイルは、PHP開発者が一貫性のある高品質なコードを維持し、最新の業界標準に従うことを支援します。**PER**を使用することで、プロジェクトのコードは標準化された形式に従うようになり、読みやすさ、保守性、および他の開発者とのコラボレーションが向上します。

![PER code style](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/settings-codestyle-per.png)

このスタイルを適用するには、設定で `"php.format.codestyle"` を `"per"` に設定するだけで、フォーマットの調整がプロジェクトに自動的に適用されます。この新しいオプションは、コードフォーマットを効率化し、PHPコードベース全体で**PER**ガイドラインと整合性を確保するための素晴らしい方法です。楽しいコーディングを！

### コードアクション

[Sort Uses Code Action](https://blog.devsense.com/2023/sort-uses-and-remove-unused-uses-on-php-file-save)は、コードアクションとして、オートインポート中、および`editor.codeActionsOnSave`設定と連携して適用できる強力なツールです。この機能により、開発者は`use`ステートメントを一貫した順序で自動的に整理でき、コードをよりクリーンで読みやすくします。

この機能の動作をさらにカスタマイズするために、ケースセンシティブを制御できます。設定 **`"php.sortUses.caseSensitive"`** では、ソートが大小文字を区別するかどうかを指定できます。このオプションを`true`に設定するとケースセンシティブソートが行われ、`false`に設定するとケースインセンシティブソートが行われます。デフォルトでは、ソートは**ケースセンシティブではない**ため、大小文字を区別せずにすべての`use`ステートメントが整理されます。

詳細については、コミュニティフォーラムの関連ディスカッション [#2127](https://community.devsense.com/d/2127) をご覧ください。

### 診断

- 無効なクラス名（予約済みクラス名）の使用に関する診断を追加しました。

### 修正

- CopilotチャットウィンドウがIntelliSenseおよびコード診断を妨げることはありません。Copilotチャットによって提案された変更は閉じた後に無視されます。
- クラスのメソッド間とこのクラスで使用されるトレイト間の参照の検索を修正しました。
- プロジェクトフォルダー外でシンボリックリンクされたComposerパッケージのインデックスを修正しました。
- クラスが 'parent' もしくはその他の予約語として命名された場合の言語サーバークラッシュを修正しました。

## 1.52.16273 (2024年10月30日)




### `.editorconfig` におけるフォーマット設定

新たに、コードフォーマットルールは標準の `.editorconfig` ファイルを使用して完全に調整可能になりました。詳細は["customize formatting"](https://docs.devsense.com/vscode/editor/customize-formatting)を参照してください。

### 改善点

- ツールチップテキストは、PHPDoc の要約をそのままのフォーマットで保持します (#2145)[https://community.devsense.com/d/2145]。
- 型推論の改善。
- 特定の診断をグローバルに無視するクイックアクションを追加。

### 修正

- `function` インポートコードアクションの修正。
- タイプのフォーマット修正。
- 診断: `FFI\CData` は配列として使用できます。

## 1.52.16226 (2024年10月21日)




### 機能

- 複数の `.php` ファイルを一括でフォーマットできる**新しい `PHP > Format Multiple Files`** コマンド。最初に**グロブパターン**を入力します。すべてのフォーマット変更は最初に収集され、**プレビューウィンドウ**に表示されます。確認後にファイルが変更されます。
- 完全修飾関数名をエイリアスに変更する**新しいコードアクション** ([#693](https://github.com/DEVSENSE/phptools-docs/issues/693))。
- **新しい設定 `php.format.exclude`**。これにより、PHPフォーマッターを使用してフォーマットされないファイルのグロブパターンを1つまたは複数指定できます。これには `formatOnType`、ドキュメントのフォーマット、`formatOnSave`、および選択した部分のフォーマットが含まれます。また、新しい `Format Multiple Files` コマンドを使用する際、除外されたファイルは最終フォーマットレビュー中に暗黙にチェックが外されます。

### 改善点

- デフォルトの言語レベルが8.3に変更されました。
- 名付けられたパラメータを持つインレイヒントは、言語レベルがPHP 8.0以上に設定されている場合にのみダブルクリックで挿入できます ([#686](https://github.com/DEVSENSE/phptools-docs/issues/686))。
- `.vscode-server` はデフォルトでインデックスから除外されます ([#2132](https://community.devsense.com/d/2132))。
- `@property-write` と `@property-read` を尊重します。
- ツールチップ内の構造化配列構文（配列型はツールチップ内で簡略化されません）。
- `callable()` と `...` は正しく解析され、可変長引数はツールチップに表示され、インレイヒントにより考慮されます。
- `@template-contravariant` PHPDocキーワード ([#695](https://github.com/DEVSENSE/phptools-docs/issues/695))。
- `use function` 構文またはトレイトエイリアスとしての関数名の補完時に括弧は挿入されません。
- PHPDocのジェネリック型指定で `covariant` と `contravariant` 修飾子を解析 ([#699](https://github.com/DEVSENSE/phptools-docs/issues/699))。
- 継承クラスからの `@param` が尊重されます [#702](https://github.com/DEVSENSE/phptools-docs/issues/702)。
- 無名関数の `$this` は内包する `Closure::bind()` 呼び出しから推論されます [#701](https://github.com/DEVSENSE/phptools-docs/issues/701)。

### 修正

- `@phpstan-import-from` で使用時に未使用の使用として誤って報告される問題の修正。
- 代入の上にある `/** @var */` アノテーションが、下で型の不一致を起こさないようにしました。
- `private` タイプのプロパティは非プライベートコンテキストでコード補完に表示されません。
- Composerからの `InstalledVersion.php` がインデックスされています。
- 診断メッセージ内のタイプミスを修正しました。
- マジック `__get` メソッドを持つ場合のプライベートプロパティに関する誤った警告。
- `identifier( new )->` の後のコード補完 ([#678](https://github.com/DEVSENSE/phptools-docs/issues/678))。
- `default` 関数名の後の補完を修正 ([#692](https://github.com/DEVSENSE/phptools-docs/issues/692))。
- PHP &lt; 8.1 での `ArrayAccess` メソッドオーバーライドに対する誤ったチェックの修正 ([#689](https://github.com/DEVSENSE/phptools-docs/issues/689))。
- 関数の戻り値の型ヒントとキーワードの後の補完を修正 ([#670](https://github.com/DEVSENSE/phptools-docs/issues/670))。

## 1.51.16099 (2024年9月26日)



### 改善点

- 参照渡し引数のための特別な配列関数のチェック。
- `composer.json` で `"php-64bit"` バージョン要件を認識。 [#665](https://github.com/DEVSENSE/phptools-docs/issues/665)
- `PHPDoc` における `Closure()` と単独の `...` 。 [#661](https://github.com/DEVSENSE/phptools-docs/issues/661)

### デバッグ

- 初期エントリファイルが一致した場合にスキップするグロブパターンを指定できる `skipEntryPaths` 設定のサポートを追加。

### 修正

- `::` 演算子を介した静的オブジェクトメンバーへのナビゲーションの修正（ツールチップ、定義への移動、コード補完）。**[#666](https://github.com/DEVSENSE/phptools-docs/issues/666)** [#2126](https://community.devsense.com/d/2126)
- ワークスペースから除外された場合の `vendor` のインデックス付けの修正 [#2100](https://community.devsense.com/d/2100)。
- `FILTER_NULL_ON_FAILURE` 定数の不要な小文字変換の修正 [#2085](https://community.devsense.com/d/2085-incorrect-auto-lowercasing-of-filter-null-on-failure-constant-in-php-code/8)。
- デフォルトでスタブに `sodium` を含む。
- 構造化された `object` phpdoc 型ヒントを尊重する `object` 型ヒント。
- 複数の `::` 式チェーンの後でコード補完が機能する。
- 推論された型におけるテンプレート型引数のバインディングの修正 [#2106](https://community.devsense.com/d/2106-function-parameter-return-type)。
- composer がまだ実行中の場合に composer パッケージのキャッシュの修正。
- `php.format.rules.alignConstants` に関するフォーマットの問題を修正し、ネームスペースが宣言されている場合にクラスコンテキスト外で定数を正しく整列させない問題を修正。[#2114](https://community.devsense.com/d/2114-alignconstants-not-always-working)
- `vendor` フォルダに多数の composer パッケージがある場合の初期インデックス作成の高速化。
- "auto-import" が `use` を正しいネームスペーススコープに追加。
- `@import` ディレクティブと `from` エイリアシングが多すぎる場合に発生する可能性のある言語サーバークラッシュの修正。

## 1.51.15986 (2024年9月10日)



### 改善点

- 無益なツールチップが表示されないようにしました ([#611](https://github.com/DEVSENSE/phptools-docs/issues/611))。
- 間接的な型を通じて静的クラスメンバーにアクセスする際に `class-string<T>` 注釈を尊重します。
- プロパティのアクセス可視性のチェックを行います。
- PHP ドキュメントブロック内で定数値を均一な色で着色します。
- 型推論の改善、必要に応じてベースからの `@global` タグを継承します。
- リファクタリング推奨 `switch`->`match` は PHP>=8 のみ ([#2098](https://community.devsense.com/d/2098))。
- 動的メンバーアクセスを解決し、より良い結果を得るためのリファクタリングと参照の検索 ([#2093](https://community.devsense.com/d/2093))。
- 標準の**インレー ヒント**をデフォルトで有効にしました。

### 修正

- ファイルの先頭から始まったコード折りたたみが不足しているのを修正しました。
- ダブルクォートで囲まれた文字列内の変数補完を修正しました。
- `php.stubs` の更新が反映されない問題を修正しました。
- ワークスペース内の `.phar` ファイルの更新が IntelliSense に含まれない問題を修正しました。
- 左側の値が複数行の式である場合の `php.format.rules.alignConsecutiveAssignments` の整列を修正しました。 [#642](https://github.com/DEVSENSE/phptools-docs/issues/642)
- 型付きの定数宣言のマウスホバーを修正しました。
- インターフェースに `@extends` を使用する際の誤った警告を修正しました。
- 未知のクラス警告に対するクイックフィックス（再有効化）を修正しました。
- `@internal` 関数をパッケージキャッシュに保持します（つまり、それらを IntelliSense に保持します）。

## 1.50.15906 (2024年8月20日)



### 改善点

- クラス定数と列挙ケースのチェックが正しく大文字と小文字を区別するようになりました。
- ジェネリック型引数の構文が `*` トークンを受け入れます。
- `"autoload-dev"` ルールのための PSR-4 チェックも行います。
- 統合されたPHPマニュアルを更新し、`SimpleXmlElement::saveXml` を追加。
- 参照渡しパラメータのチェックを強化。

### 修正

- Windowsで文書名を変更した後の問題を修正し、ファイル名の大文字小文字が異なる場合にコードアクションが破損していた問題を修正。
- PSR-4のクラス名とファイルパスのチェックおよび対応するリネームコードアクションを修正。
- `is_numeric()` の後の無効な型推論を修正。
- `A ? A : B` の誤ったリファクタリング提案を修正。代わりに `?:` が正しい。
- 暗黙の nullable, `never`, およびトレイトによるオーバーライドチェックを修正。
- 名前空間名で `Function` キーワードの使用を修正。
- 単一のジェネリック型パラメータのみを持つ `Collection<T>` の使用を修正。

## 1.50.15872 (2024年8月13日)



### エディター

- 構造化配列/オブジェクトタイプ内の名前のハイライト ([#597](https://github.com/DEVSENSE/phptools-docs/issues/597))。
- PHPDocタグ名と予約型名を`keyword`色でハイライト（選択されたテーマに依存） ([#612](https://github.com/DEVSENSE/phptools-docs/issues/612))。
- トレイト`use`の上のPHPDocブロックをハイライト。

### PHP 8.4 サポート（プレビュー）

このアップデートは、新しいPHP 8.4機能のサポートを追加します。含まれるもの：

- プロパティフックと`__PROPERTY__`マジック定数。
- 括弧なしの`new`。
- プロパティおよびプロパティフックのフォーマット。

### フォーマッタ空行設定

PHPコードフォーマッタは、さまざまな種類のコードセクション間の空行を調整するための新しい設定グループ「`Blank Lines`」を備えています。宣言、クラス本体、コメント、関数などの上のスペースを調整できます。`php.format.rules.blankLines***`オプションの完全なリストについては、設定を参照してください。

### 機能

- `"php.docblock.colorMode"`ユーザースコープ設定は、PHPDocブロックの色分けを簡素化することができます ([#612](https://github.com/DEVSENSE/phptools-docs/issues/612))。
- PSR-4オートロード規則、クラス名、ファイル名のチェック。PSR-4ファイル名不一致のクイックフィックス ([#609](https://github.com/DEVSENSE/phptools-docs/issues/609))。

### 改善点

- インポートされていないグローバルタイプの補完ソートを調整([#598](https://github.com/DEVSENSE/phptools-docs/issues/598))。
- マジック定数（`__METHOD__`、`__PROPERTY__`など）が正しい文脈で使用されているかどうかを確認。
- 診断の改善、`try`/`finally`の制御フローと到達可能性の解析の修正。
- 型の推論を改善。

### 修正

- HTMLの折りたたみがPHPコードの折りたたみを横切る場合のコード折りたたみの修正 ([#594](https://github.com/DEVSENSE/phptools-docs/issues/594))。
- `self`の引数型チェックの修正。
- 関数またはクラスの上での`@suppress`の使用を修正。
- `require`および類似の文のフォーマット後に不要なスペースが生じる問題を修正。
- `php.format.rules.arrayInitializersAlignKeyValuePairs`設定使用時に配列初期化子内の複雑な式をフォーマットする際の問題を修正。
- フォーマット中にコードブロックで不要な改行が発生する問題を修正 [#2057](https://community.devsense.com/d/2057-formatting-sometimes-takes-2-passes/)。

## 1.49.15728 (2024年7月8日)




### 改善点

- 宣言の上に `/**` を入力するとDocコメントが生成されます。この機能は `formatOnType` が有効でなくても動作します。
- 二重引用符で囲まれた文字列内で `$` を入力したときにサジェストをトリガーします。
- Docコメント内で型ヒントを入力したときにサジェストをトリガーします。
- `@phpstan-assert`、`@phpstan-assert-if-true`、`@phpstan-assert-if-false` の初期サポート。
- ネストされたディレクトリ内のPhpUnitテストを検出し、`prefix` 設定を尊重します。
- 保存時の `"source.organizeImports"` コードアクションは、不要な使用を削除しません。これは望ましくない可能性があります。([#1883](https://community.devsense.com/d/1883))
- `"editor.codeActionsOnSave"` 設定用に明確なコードアクションを追加しました:
    - `"source.source.sortImports"`: 使用のみをソートします。`"source.organizeImports"` と同じです。
    - `"source.source.sortAndRemoveImports"`: 不要な使用を削除し、残りをソートします。
- 非シールド配列形状タイプを認識します ([#587](https://github.com/DEVSENSE/phptools-docs/issues/587))
- Bladeは短いオープンタグを尊重します。

### IntelliSense

- Laravelの `Macroable::macro()` は、ネストされたラムダ関数内での `$this` 推論が向上します。
- パラメータ名が欠けている場合の `@param` 補完。

### ヒント (`...`)

利用可能なクイックリファクタリングを持つコードは、3つの小さなドットで注釈が付けられます。詳細を示すマウスのツールチップがあり、対応するコードアクションを実行するクイックフィックスがあります。

![Quick Fix Hints](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vsc-hint-quickfix.gif)

### デバッガ

- Unicode配列キーとプロパティ名をサポートしました。
- デバッグコンソールは変数名の補完を提供します。

### 修正

- `Align Properties` フォーマットルールを修正し、連続したフォーマットアクション後でも正しい配置を確保します。
- テンプレート引数を持つ `@extends parent<>` 注釈でのクラッシュ修正 ([#585](https://github.com/DEVSENSE/phptools-docs/issues/585))。

## 1.48.15635 (2024年6月16日)




### 改善

- 初期のインデックス作成を改善し、インデックス作成後にテストケースの発見を延期。
- 最適化、メモリ使用の改善。
- `ReflectionClass::getMethods()` の型推論が向上。
- OUTPUTパネルへのログ記録を統一。
- 抽象関数の実装に普遍的な `@inheritDoc` ドキュメントコメントを追加。
- `Sort uses` コードアクションが重複を削除。

### フォーマット改善

#### プロパティの整列

フォーマッタは、クラス定義内のプロパティを整列させ、コードの表現力と可読性を向上させるための `Align Properties` 機能を提供します。この機能は `php.format.rules.alignProperties` オプションを使用してアクティブにします。

```php
class X
{
    var       $a   = 1;
    public    $bb  = 2;
    protected $ccc = 3;
}
```

### 修正

- 関数オーバーライドのチェックが `#[ReturnTypeWillChange]` 属性を尊重するように修正。
- 配列として使用されるオブジェクトに関する誤った未使用変数警告を修正 ([#533](https://github.com/DEVSENSE/phptools-docs/issues/533))。
- `array()` または単一行ブロックがある場合のコード折り畳みを修正。
- コメントの直後でのコード補完を修正。
- プライベートフィールドのリネームとハイライト時の問題を修正。
- 安定性の修正。
- JavaScriptに混在するPHPのフォーマット問題を修正 [#2012](https://community.devsense.com/d/2012-php-file-with-mixed-php-and-javascript-using-in-vscode)

## 1.47.15512 (2024年5月28日)




### Blade `.blade.php` サポート

- `@use` ディレクティブをサポートしており、型エイリアスを含みます。コード補完と IntelliSense がインポートされたクラスとエイリアスされたクラスを正しく認識します。
- `@class` ディレクティブや他の HTML タグ内のハイライト。
- 開始/終了の blade タグが PHP キーワードや HTML の開始/終了トークンとしてハイライト。
- Blade ファイル内での PHP コードの補完、PHP 関数のシグネチャヘルプ、PHP コード折りたたみを改善。
- 安定性の修正。

![Blade @Use completion](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vsc-blade-use.gif)

### 診断

- `/** @ignore $variablename */` を尊重し、`$variablename` が未使用の場合でも問題が報告されません。
- より複雑な条件付きの戻り値の型をサポート、すなわち `@return ($name is class-string<T> ? T : bool)` ([#538](https://github.com/DEVSENSE/phptools-docs/issues/538))。
- 誤った到達不能コード警告の修正 ([#556](https://github.com/DEVSENSE/phptools-docs/issues/556))。
- `method_exists` と `function_exists` のチェックを処理して、未知の関数についての誤警告を避けます。

### 新機能

- ターゲット `callable()` PHPDoc 型注釈からのラムダ関数パラメータの型推論。
- 推論されたラムダパラメータ型のインレイヒントを追加。`"php.inlayHints.types.lambdaParameter"` 設定を有効にします。

![Inlay for infered lambda parameters](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/inlay-lambda-parameter-type.png)

### リネームリファクタリング

リネームリファクタリングが部分的に再実装され、新しいリネームシナリオが実装され、様々なケースが修正されました。リファクタリングはクラスや定数、関数インポート、テンプレート型名、文字列や配列内の名前の出現を正しく処理します。

#### 新機能

- **エイリアスされた型名の正しいリネーム**。元の型と異なる型エイリアスをリネームする際、エイリアスのみがリネームされます。
- **エイリアスされた関数と定数のリネーム**が正しく動作するようになりました。
- **ジェネリック型のリネーム**が修正および最適化されました。
- **インポートされたテンプレート型のリネーム**が実装されました。これは `@phpstan-import-from`、`@psalm-type` などの様々な PHPDoc タグに対応しています。
- **テンプレート型名および型名への参照の検索**が修正され、新しいシナリオに正しく対応しました。

リネームリファクタリングに関する問題があればお知らせください。改善に取り組みたいと考えています。

_既知の未実装機能:_ 名前空間のリネーム、名前付き引数のリネーム。進行中です。

### 改善

- コロンブロック（`if:`, `switch:`, `while:`, `for:`, `foreach:`）の折りたたみ。
- `by-ref` 関数のマウスホバーを改善。
- Blade フォーマッタが `.blade.php` ファイル内の PHPDoc ブロックを正しくインデント。
- 関数ヘッダーパラメータ内での選択範囲を追加。
- 対応する PHPDoc ブロックに選択範囲を拡張。
- ゲッター/セッターの生成が`"php.completion.namingConvention"` 設定に一致するように識別子全体を調整。 ([#2011](https://community.devsense.com/d/2011-getters-setters-function-case))

### 修正

- キーワードでもある名前付き引数の前の不要なスペースを修正。 [#555](https://github.com/DEVSENSE/phptools-docs/issues/555)
- デバッグセッションを停止した後にすべての PHP 子プロセスが終了されます。 [#542](https://github.com/DEVSENSE/phptools-docs/issues/542)
- 匿名 `class` のある時の _Outline_ を修正 ([#557](https://github.com/DEVSENSE/phptools-docs/issues/557))。
- マウスホバーでの L-Value 変数型を修正。
- ラムダ関数内の `empty` の後の不要なスペースを修正 [#564](https://github.com/DEVSENSE/phptools-docs/issues/564)
- アクティブなデバッグセッション中にブレークポイントの設定や削除を行うと、VSCode がそれらを未検証として誤って表示する問題を解決。

## 1.46.15409 (2024年5月9日)



### 機能

- `namespace`の後にインライン提案。
- ブレードブロックの折りたたみ。
- ブレードタグの補完。
- `.blade.php`ファイルのフォーマット（PHPファイルとして開く必要があります）。

### ブレードフォーマット

ブレード (`.blade.php`ファイル) のコードフォーマットが実装されました。フォーマッタは、HTML/CSS/JS と PHPのプリティプリントとPHPのインデントを組み合わせ、ブレードブロックのインデントも行います。

今のところ、さらに設定はありません。皆様のご意見に基づいて、より多くの設定や修正を追加していきます！

![Blade Formatting](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vsc-blade-format.gif)

> 注意: 他のブレード拡張機能を使用している場合、この機能は利用できないかもしれません。開いている `.blade.php` ファイルの言語が`PHP`に設定されていることを確認してください（VSCodeウィンドウの右下）。

### HTML タグと属性の自動閉鎖

PHPコード内で、HTMLタグ要素は、開いたタグの`>`を入力すると自動的に閉じます。同様に、閉じタグの`/`を入力すると、対応する閉じタグがシームレスに挿入されます。

さらに、HTML属性の引用符も、`=`を入力すると自動的に含まれるようになりました。

### HTML タグの自動リネーム

HTMLタグの自動リネームはデフォルトで有効になっています。この機能を無効にするには、VSCodeの`settings.json`に次の設定を使用してください:

```json
"[php]": {
    "editor.linkedEditing": false
}
```

![Auto-Renaming HTML Tags](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vsc-html-linkededit.gif)

### 改善点

- パフォーマンスとメモリ使用量の改善。
- 選択範囲の縮小/拡大が、PHPファイルおよびブレードファイルのHTML部分で機能します (`Shift+Alt+Left` と `Shift+Alt+Right`)。

### 修正

- `static`リターンタイプのオーバーライドチェックの修正。
- コードを修正するときの `.blade.php` ファイルのインレイヒントの修正。

## 1.45.15272 (2024年4月11日)



### PHPファイル内のJavascriptとCSSのアウトライニング

PHPファイル内でJavascriptとCSSのコードブロックを折りたたむことができるようになり、コードの整理と読みやすさが向上しました。

### 修正

- クロージャのシグネチャヘルプを表示する際の言語サーバークラッシュを修正しました（[#539](https://github.com/DEVSENSE/phptools-docs/issues/539)）。
- メソッドチェーン呼び出し後の不要な改行を修正しました [#1969](https://community.devsense.com/d/1969-help-on-formatting-rules)

## 1.45.15260 (2024年4月8日)




### 新機能

- 補完リストに関数シグネチャを表示（実験的） - 設定 `"php.completion.showParameters"` を有効にする。
- 該当する場合、`define` を `const` に変更する新しいコードアクション。
- `string` PHPDoc 型ヒントの無効な大文字小文字を修正するコードアクション。
- おそらく間違った `foreach` 変数の診断。
- 完成リストで非推奨のシンボルを非表示または取り消し線で表示するかどうかを制御する設定 `"php.completion.showDeprecated"`。デフォルトでは取り消し線で表示されます。

### PHPUnit テストエクスプローラー

テストエクスプローラーは `#[Test]` 属性を尊重し、対応するテストをリストに表示します。

### 改善点

- オーバーライド診断は型ヒントの可能な `class_alias` を考慮します。
- トレイトが互換性のないメソッドを導入する場合、オーバーライド診断はトレイトの使用を下線で示します。
- 型推論の改善。
- 一部の無効な PHPDoc 型注釈の取り扱い。
- さらなる迅速なコード提案。
- 最適化。

### 修正

- HTML 内の PHP コードブロックの不正な折り返しを修正 [#1953](https://community.devsense.com/d/1953-format-html-code-in-php)
- `<!DOCTYPE html>` タグの前に改行が追加されないようにフォーマットを修正 [#1940](https://community.devsense.com/d/1940-no-line-break-between-and-doctype)

## 1.45.15192 (2024年3月26日)



### HTMLタグの自動リネーム

phpファイル内でHTMLタグペアを単一の編集でリネームできるようになりました。この機能をオンにするには、`settings.json`で`editor.linkedEditing`を有効にしてください:

```json
"[php]": {
    "editor.linkedEditing": true,
}
```

### 改善

- 関数のホバー情報にジェネリック型引数がある場合、表示されるようになりました ([#1915](https://community.devsense.com/d/1915))。
- ホバーツールチップでトレイトメンバーのテンプレート型引数の表示を改善。

### 修正

- `empty`、`isset`、`exit`の括弧の前に不要なスペースが入る問題を修正しました ([#522](https://github.com/DEVSENSE/phptools-docs/issues/522))。
- 複雑な配列初期化子を含むコードでのフリーズの可能性を修正。
- `Closure`型パラメーターのオーバーライド診断を修正。
- `namespace private;`構文を許可するためにパーサーを修正。
- 継承されたテンプレート型引数の型推論を修正 ([#503#comment](https://github.com/DEVSENSE/phptools-docs/issues/503#issuecomment-1998885037))。

## 1.45.15145 (2024年3月14日)




### 新しい設定

- **php.hover.parametersFullName**: ツールチップで完全な型名（現在の名前空間に短縮されたもの）を表示します。
- **phpTools.suppressPremiumFeatures**: コードアクションのようなプレミアム機能に関するいくつかの通知を無効にします。

### オーバーライド診断

正しいメソッドオーバーライドのための診断を追加しました（[#234](https://github.com/DEVSENSE/phptools-docs/issues/234)）。`#[Override]` 属性の正しい使用法を含むチェックを含みます。

さらに、エディタは一般的なオーバーライドエラーに対するクイックフィックスを提供します。

### 改良点

- `.phpstorm.meta.php` の `expectedArguments()` がクラス名スコーピング、ミックスイン、およびトレイトの使用を尊重します。（[#1929](https://community.devsense.com/d/1929)）
- 型推論の改善。

### 修正

- プレミアムがアクティブでない場合でも、`organizeImports` と `fixAll` の自動化が VSCode を遅くしません。（[#504](https://github.com/DEVSENSE/phptools-docs/issues/504)）
- コード補完での欠落していた `mixed` を修正しました。
- 欠落していたいくつかの Eloquent モデル関数を修正しました。
- `@` をエントリ名に持つ構造化配列のドックコメント型を修正しました。（[#508](https://github.com/DEVSENSE/phptools-docs/issues/508)）
- フォーマット時の `return` 後の不要なスペースを修正しました。[#509](https://github.com/DEVSENSE/phptools-docs/issues/509)
- テストエクスプローラーの初回読み込みを修正しました（[#1934](https://community.devsense.com/d/1934)）。
- `unset` ステートメントのラッピングを修正しました。これは `callParametersWrap` オプションで制御されます。[#518](https://github.com/DEVSENSE/phptools-docs/issues/518)

## 1.45.15061 (2024年2月27日)



### 改良

- 自動かっこの補完が*IntelliPHP*の提案と組み合わせて動作します。
- 型推論と型チェックが改善されました。
- ジェネリック型引数と_id_helperを活用する際の`foreach`型推論が改善されました。
- インラインタグのためのBlade文法ハイライト。
- `.blade.php`ファイル内のPHPコードを適切に整形するコードフォーマッター。
- エロクエントモデルクラスのためのIntelliSense。

### リファクタリング

- 文字列補間への連結のリファクタリング。

### フォーマッティング

`php.format.declCompactEmptyBody`オプションが導入され、空の関数ボディを自動的に{}に変換し、前のシンボルと単一のスペースで区切られて同じ行に維持されるようになりました。

```php
function foo() {}
```

さらに、適切な構文が常にラップされることを保証するラッピングオプション`always`のサポートを追加しました。

### 修正

- `.blade.php`ファイルでのセマンティックハイライトの修正。
- `"php.stubs"`を追加/削除した後、または`composer.json`の`require`で`ext-**`を追加/削除した後の問題の更新。
- インターフェースまたは抽象の実装のためのコードアクションが正しい型ヒントを追加。
- 稀な言語サーバークラッシュ（メモリ不足、CPU 100%、クラッシュ）の修正。
- キーワードでもある関数名の後の不要なスペースを修正[#1481](https://community.devsense.com/d/1481-space-after-if-as-a-formatting-rule)
- 全く動作しなかったフォーマッティングの修正。

## 1.44.14997 (2024年2月14日)




### 改善点

- PHP、HTML/CSS/JSコードが混在する場合のフォーマット選択が改善され、`editor.formatOnType`および`editor.formatOnPaste`の動作が向上しました。
- `@psalm-yield`ドックコメントタグのサポート、および`yield`の結果型をその形で推論します。
- `#[Override]`属性の診断を追加しました。
- `trait-string`、`interface-string`、`enum-string`、`callable-string`のphpdoc型に対応しました。
- `phpcs:ignore`コメントのサポート。

### ツールチップの改善

- ツールチップでより短い型名を表示（`"php.hover.parameters.fullname"`設定で変更可能）。
- シグネチャヘルプツールチップで適切な場合には`never`の戻り型を表示。
- `class-string`型ヒントの修正。

### 修正点

- HTMLコメント内のBladeタグを正しく強調表示。
- 関数オーバーライドの補完を修正。
- 行コメントの後に続く複数行にわたる式のインデントが正しくない問題を修正。
- 配列として変数にアクセスする際の誤った`6404`診断を回避。
- ファイルが変更された際に他のファイル内の関連診断も更新。
- 安定性の向上。

## 1.44.14950 (2024年2月7日)




### 改良点

- `default:` または `case ... :` を入力した後の自動フォーマット機能。
- 関数シグネチャのホバー時に、より詳細な`array`型仕様を改善。
- `array_rand()`と`is_array()`の型推論を改善。
- PHPコードでの`{{`の使用を修正。
- より多くのLaravel Bladeタグをサポート（`@extends`, `@can`）、Bladeタグの構文エラーを修正。

## 1.44.14925 (2024年2月5日)



### Laravel Blade エディター

このアップデートでは、Laravel Blade タグ内のPHP構文の実験的なカラー化が可能になります：
- `{{`/`}}`、`{!!`/`!!}`、`{{{`/`}}}`、`@php`/`@endphp`内のコードをカラー化
- Bladeタグ式、つまり `@if ( ... )` 内のコードをカラー化
- Bladeタグをカラー化
- Bladeコメント、つまり `{{-- ... --}}` をカラー化

加えて、入れ子になったすべてのPHPコードは、**IntelliSense**、**診断**、**コードアクション**、**コード修正**、**ツールチップ**などの標準機能を得ます。

![blade editor colors](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vsc-blade-colorization.png)

### 改善点

- コードアクションやコード修正を適用した後にコードを自動的にフォーマット。
- 組み込みの `array_*` 関数のための配列型解析の改善。
- `@psalm-` で始まるより多くのドックブロックタグを理解、例として `@psalm-property`、`@psalm-readonly`、`@psalm-trace` など。
- ドックブロックタグ `@trace` または `@psalm-trace` のためのインレイヒントと変数ハイライト。
- `.blade.php` ファイルの全体的なパーサーの改善 - `@php` と `<?php` ブロックを尊重し、ほとんどのドキュメント化されたBladeタグとブロックを尊重。
- `never` を返す関数、終了する関数、および常に例外を投げる関数を尊重。
- コードアクションが利用可能なときにトリプルドットを表示。

### コードアクション

- 可能な場合、`if` を `switch` にクイックリファクタリング。
- 不要な括弧を削除し、薄暗くする。

### フォーマット

スイッチ項目に直接存在する場合の中括弧のインデント方法のデフォルトの動作を変更しました。[#1897](https://community.devsense.com/d/1897-custom-formating-rules)

### 修正

- PHPとHTML要素の混合を含む複雑なファイルでフォーマッターが不正なインデントを生じる可能性がある問題を修正。[#1881](https://community.devsense.com/d/1881-autoformat-on-save)
- クラス定数の前のコメントの不正なインデントを修正[#476](https://github.com/DEVSENSE/phptools-docs/issues/476)
- PHPによって生成されるCSSセレクタの一部のフォーマットケースを修正[#1736](https://community.devsense.com/d/1736-auto-formatting-error-in-css)
- `never` を返す関数のツールチップを修正。
- 関数パラメーターの属性の不正なインデントを修正[#1899](https://community.devsense.com/d/1899-autoformat-attributes-indentation-in-function-parameters)
- 特定のケースをフォーマットする際の不要な改行の削除を修正[#1895](https://community.devsense.com/d/1895-php-formatting-issue)
- 安定性の修正。

## 1.43.14858 (2024年1月24日)



### 不要な括弧

安全に削除できる括弧がコード内で薄く表示されるようになり、対応するコード修正「不要な括弧を削除」が利用可能になりました。

### 改良点

- ラムダの戻り値から推測されるジェネリック引数の型推論。
- フォーマッタがコメント内の`@formatter:off`および`@formatter:on`ディレクティブに対応。

### フォーマッティング

ユーザーのフィードバック[#395](https://github.com/DEVSENSE/phptools-docs/issues/395)に基づき、Joomla開発者向けの新しいコードスタイルを追加しました！有効にするには、`"php.format.codeStyle"`設定を`"joomla"`に設定してください。

### 修正

- `"drupal"`用のコードスタイル（`"php.format.codeStyle"`設定）を修正 - スペースを挿入します。
- `::`演算子後の補完機能を修正。
- 新しい配列`[`を入力する際に補完機能がトリガーされるのを回避。
- `case`識別子の後の不要なスペースの修正[#469](https://github.com/DEVSENSE/phptools-docs/issues/469)
- 2つの空の文字列を含む配列がある場合の不正な出現ハイライトを修正。
- メモリとパフォーマンスの改善。
- CPUの常時使用と、終わらない_devsense.php.ls_プロセスを引き起こすバグを修正。

## 1.43.14756 (2024年1月15日)




### `$_SERVER` と `$GLOBALS` のコード補完

コード補完は、`$_SERVER` と `$GLOBALS` スーパグローバル変数の既知の配列キーを提供します。型推論もそれらを考慮します。

![$_SERVER items completion](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vsc-server-var-completion.gif)

### 配列キーのコード補完

可能な限り配列キーが一覧表示され、補完されます。これは構造化された配列ドックコメント（例：`array{name:string,id:int}`）や配列初期化子（例：`new ['name' => "John, 'id' => 1]`）と非常に相性が良いです。

### コードアクションとリファクタリング

- コンストラクタプロパティ用のゲッター/セッターを生成するコードアクション。
- `isset(A) ? A : B` を簡略化するコードアクション。

### 改良点

- 複数行の `array<>` 構文を持つドックブロックがサポートされました。
- `=` キャラクターを使用した `@psalm-type` 定義を持つドックブロックがサポートされました。
- （変数だけでなく）式全体の型を定義する `@var` を持つドックブロックが処理されます。
- キー名が多い場合の型解析が改善されました。
- `instanceof` 演算子の複雑な左辺値（L-value）を処理します。
- キー名が多い場合の型解析が改善されました。
- `??` 演算子の型解析が改善されました。
- WordPress ソースコードにおけるグローバル変数の処理を改善しました。
- 配列キーのコード補完、配列エントリの型推論、`[` の後の補完トリガー。
- 参照（`&`）による変数と式の型に対するインレイヒントがダブルクリックで挿入されないようになりました。
- `composer.json` に特定の `php.version` が設定されていない場合に、PHP 言語レベルがこれに従います。

### フォーマット

- ユーザーリクエストに基づいてメソッドの連鎖呼び出しの改行を実装しました ([#1868](https://community.devsense.com/d/1868-new-line-after-method-chaining))。現在、この設定には `always` オプションのみが許可されています。
- メソッドチェーンラッピングが適用されるときにセミコロンを新しい行に配置する機能が追加されました。

### デバッグ

同時デバッグセッションの最大数を制御するために `maxConnections` 起動設定を追加しました。[#353](https://github.com/DEVSENSE/phptools-docs/issues/353)

### 修正

- メソッド名の `do` の後の予期しない空白を修正しました [#1871](https://community.devsense.com/d/1871-unexpected-white-space-after-function-name)
- スタックオーバーフロー例外に対する安定性の修正（Symfony フレームワークで発生）[#437/46](https://community.devsense.com/d/437-stack-overflow-in-symfony-project/46)

## 1.42.14626 (2023年12月30日)




### 改善点

- `array_unshift()`の型解析を改善。
- `private`プロパティのリファクタリング。
- `property_exists()`関数内で指定されたプロパティ名のリファクタリング。
- エロクエントローカルスコープの検出と補完を改善。
- WordPressの構造化配列/オブジェクトのドキュメントコメント構文が、コード解析とコード補完で認識され、尊重されます。
- インライン説明付きで`@var`で注釈された変数のツールチップ。
- `_ide_helper.php`で誤って生成された型名の診断回避策。
- `${}`の非推奨の文字列挿入に関する診断と対応するコードアクション。
- 冗長な閉じタグ`?>`に関する診断と対応するコードアクション。

### 修正点

- PHP8+のFQN名前空間構文でキーワードを処理するPHPパーサーを更新。
- 一部のFTP拡張を使用して`ftp://`リモートからワークスペースを開く際の起動修正。
- 到達不能コードの偽の診断を修正。
- `property_exists()`でチェックされていた場合に未知のプロパティを報告しない。
- 曖昧な関数呼び出し（2箇所で定義された関数または2つのファイルで開かれた関数）での_インレイヒント_の修正。
- クラッシュ修正。

## 1.42.14434 (2023年12月12日)




### PHPスタブユーザーインターフェース

クイックコマンド `> Workspace Stubs` を追加しました。これにより、スタブ（PHPブックや他のスタブ、"WordPress" を含む）をクイックに選択して、IntelliSenseおよびコード分析で利用可能にすることができます。

![PHP Stubs UI](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vsc-php-stubs-ui.png)

### `"source.fixAll"` アクション

名前の単純化など安全なクイックフィックスを、ファイル保存時に自動的に修正できます。ファイル保存時に安全なクイックフィックスを適用するためには、次の設定を使用します:

```json
"editor.codeActionsOnSave": {
    "source.fixAll": true,
    "source.organizeImports": true
}
```

### デバッグ

#### ブレークポイント解決

Xdebugからの情報を通じてブレークポイントの位置を検証することで、ブレークポイント解決を改善しました。特に次の点で改善されています:

- バインドされたブレークポイントは赤でハイライト表示されます。
- バインドされていないブレークポイントは灰色で視覚的に識別されます。
- ブレークポイントに近い有効な場所にバインドできなかった場合、そのブレークポイントは自動的に有効な場所に調整されます。

#### xdebug_notifyサポート:

`xdebug_notify()` のサポートを追加し、デバッグコンソールへの情報やオブジェクトの送信を可能にしました。この機能は、コンソールに直接関連データを伝達することで、デバッグ体験を向上させます。

#### エラーと警告

PHPの警告とエラーをデバッグコンソールに出力するようにしました。このアプローチにより、開発者がデバッグセッション中に問題を監視および対処できる集中的な場所を提供します。

### 改良点

- 欠落している関数 `use` の **クイック修正**。
- `newrelic` に対する **`php.stubs`** を追加。
- `composer.json` からの **PHPスタブ** をIntelliSenseとコード分析に暗黙的に含めます。
- **より複雑なPHP実行**: これによりリモートの `php` を使用したり、オリジナルのコマンドを使用して `php` を実行できます。設定の `php.executablePath` または `php.executables` には、引数付きのコマンド（例: `ddev exec php`）を指定できます。**注意:** ダブルクォーテーションが必要になることがあります。
- **PHPUnitパスは絶対パスにできる**: 設定 `phpunit.phpunit` をダブルクォーツで囲むことで、カスタムphpunitのパスをそのまま維持できます。つまり `"phpunit.phpunit": "\"phpunit\""` です。
- **PHPUnitコマンドをカスタマイズ可能**: 新しい設定 `phpunit.command` を使用することで、PHPUnitを実行するためのコマンドを完全にカスタマイズできます。コマンドをカスタマイズする変数を使用:
    - `${cwd}`: ワークスペースのルートパス、ローカル。コマンドはこのディレクトリで実行されます。
    - `${phpunit}`": phpunitバイナリへのパス。これは自動的に解決されるか、`phpunit.phpunit` 設定でカスタマイズできます。
    - `${phpunitxml}`: ワークスペースのルートに対するphpunit.xmlのパス。
    - `${phpunitargs}`: 構築されたPHPUnit引数。（`--teamcity` と `--filter` を正常に機能させる必要があります）
    - `${phpargs}`: PHPが正しく実行およびデバッグされるようにするために使用するオプション引数。

### フォーマッティング

フィードバックに応えて（[source](https://community.devsense.com/d/1792-turn-off-codelens/8)）、コードフォーマットの柔軟性を向上させる2つの追加オプションを実装しました:

#### 関数を単一行に保つ

`php.format.rules.keepFunctionsOnOneLine`` オプションを導入し、関数またはメソッドが単一行の場合、それを折り返さないようにフォーマッタに指示することができます。これにより、開発者は簡潔で一貫したコーディングスタイルを維持できます。

#### クラスを単一行に保つ

新しい `php.format.rules.keepClassesOnOneLine`` オプションを使用すると、クラスが単一行の場合にフォーマッタがそれを折り返さないように指示できます。この機能は、コードベースにおけるスリムでコンパクトな構造の保持をサポートします。

### 修正

- グローバル名前空間内で `use` の並び替えと削除のためのコードアクションを修正。
- `static`/`$this` を返すメソッドの解決を改善 ([#1820](https://community.devsense.com/d/1820))。
- インレイヒントの位置を修正、コードの近くを編集する際に。 
- テストエクスプローラーでのソースへの移動を修正。
- リネームリファクタリングは、変更が危険な場合に _プレビュー_ を表示。
- リネームリファクタリングは、コンストラクタプロパティを適切に扱います ([#450](https://github.com/DEVSENSE/phptools-docs/issues/450))。
- さまざまなコード分析の改善。
- さまざまな `_ide_helper.php` のバグに対する回避策。
- 条件付きブレークポイントの修正。以前のバージョンでは特定のケースでこの機能が壊れていました。
- `static` 関数を用いたインターフェイスを実装するためのコードアクションを修正 ([#446](https://github.com/DEVSENSE/phptools-docs/issues/446))。
- 複数の関数を含む入れ子の連想配列における誤ったフォーマットを修正 ([#432](https://github.com/DEVSENSE/phptools-docs/issues/432))。
- 古いXdebugバージョンでデバッガ開始時に発生する `invalid or missing options` 警告の修正 [#1816](https://community.devsense.com/d/1816-all-in-one-php-support)

### プレミアム

- 注: _コードアクション_ と _コードフィックス_ は [PREMIUM](https://www.devsense.com/en/purchase) で利用可能です。この更新前にライセンスなしで意図せず動作していた可能性があります。

## 1.41.14263 (2023年11月14日)




### フォーマットの改善

#### コメント

このアップデートでは、コメントの処理方法が改善されました。現在では、式の後に続くコメントは元の位置に保持され、ユーザーが希望するようにインデントできます。

```php
$x = [
  1  => 'one'      // first comment
  42 => 'fortytwo' // second comment
]
```

#### `match` アーム本体の整列

フォーマッターには、「Align Match Arm Bodies」機能が追加され、`match` 式内の本体（結果）が整列されることで、コードの明確さと構造が向上しました。この機能は `php.format.rules.alignMatchArmBodies` オプションで有効にできます。

```php
match ($day) {
    'Monday'    => 'Work',
    'Tuesday'   => 'Tacos',
    'Wednesday' => 'Waffles'
};
```

### ドキュメントコメントと型注釈

- **構造化された `object` タイプ**: 動的オブジェクトは、`object{property:type,}` の構文を使用してドキュメントコメント内で注釈を付けることができます。

- **グローバル `@type` エイリアス**: ドキュメントコメント `@type`、`@phpstan-type`、`@phpstan-import-type`、`@psalm-type`、`@psalm-import-type` を使用して、ファイル全体のスコープで型エイリアスを定義できます。以前はクラスや関数の上にのみ機能していましたが、今ではグローバルファイルスコープのどこでもドキュメントコメント `/** */` 内に有効です。

- **コードアクション** – ドキュメントコメント内の修飾名に対応 ([#428](https://github.com/DEVSENSE/phptools-docs/issues/428))

- **@method** 構文で修飾子がサポートされました、すなわち `@method public static foo()`。これは珍しい構文ですが、現在は理解できます。

### `redis` スタブの追加

`"redis"` を `"php.stubs"` VSCode 設定に追加できます。これにより、`redis` 拡張機能を使用するための型チェックと IntelliSense が追加されます。

### リネームプレビュー内の診断

プレビュー付きでシンボルをリネームする際に（`F2`、`Shift+Enter`）、新たにプレビューウィンドウが分析され、エラーと警告が下線付きで表示されます。

### デバッグ

#### ランダム Xdebug ポート

現在、`launch.json` で `"port": 0` を指定すると、ランダムな利用可能なポートとして扱われます。`php` は対応する `xdebug.port = ${port}` ディレクティブを使用して自動的に開始されます。デフォルトでは、何も指定しない場合にランダムにポートが選ばれます。ほとんどの「実行とデバッグ」コマンドは単に動作します。

ビルトイン Web サーバーの起動、デバッグの開始、ブラウザの起動を行うサンプルの起動構成:

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

この起動構成のデフォルト値であるため、`"port": 0,` を完全に省略することもできます。

> 注意: _Xdebug を待機する_ 場合のデフォルトポートは、依然として `[9003, 9000]` です。

> 詳細は: https://docs.devsense.com/en/vscode/debug/launch-json#built-in-php-server

クイック起動コマンド（`launch.json`を持たずに `F5` を押す）でもランダムな利用可能な Xdebug ポートを使用します。特に何もする必要はありません。

#### 式評価の強化

現在、デバッグコンソールやウォッチウィンドウを含む様々なコンテキストで、式をより深いレベルまで展開できます。改善された評価結果でより優れたデバッグをお楽しみください。

#### 現在の PHP ファイルの実行/デバッグ

現在、エディターの右上コーナーにあるクイック実行/デバッグボタンを使用して、現在開いている PHP ファイルを実行またはデバッグできます。

### 修正

- 式の後に続くコメントが元の行に保持されるようにする折り返し動作の修正。 [#1760](https://community.devsense.com/d/1760-php-format-codestyle-psr-12-makes-my-comments-borken)
- `php.inlayHints.parameters.suppressNameMatchingValue` 設定の修正。
- "Implement abstracts" コードアクションの適用後のコードインデント修正。
- `enum` 内での `use` コードアクションの修正。[#425](https://github.com/DEVSENSE/phptools-docs/issues/425)
- **ウェブ**拡張のブラウザ実行の修正 ([vscode.dev](https://vscode.dev))。
- 名前空間にある `@see` タグ内でのナビゲーションと補完の修正。
- LS のクラッシュ（スタックオーバーフロー）の修正。[#427](https://github.com/DEVSENSE/phptools-docs/issues/427)
- プロパティ昇格で `readonly` と型間の不要なスペースの削除修正 [#433](https://github.com/DEVSENSE/phptools-docs/issues/433)
- 曖昧なシンボル宣言の場合のマウスホバーツールチップの改善。

## 1.40.14103 (2023年10月18日)




### IntelliPHPの導入 🚀

PHP拡張機能が**[IntelliPHP](https://marketplace.visualstudio.com/items?itemName=DEVSENSE.intelli-php-vscode)**をバンドルするようになったことをお知らせできることを嬉しく思います。

![IntelliPHP](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/intelliphp-vscode.gif)

**IntelliPHP**: _あなたのローカルPHP AI_ - 入力中に即座に全行の提案を提供します。`TAB`キーで提案を完了し、生産性を向上させましょう！[続きを読む ...](https://blog.devsense.com/2023/php-and-visual-studio-updates-july-2023)

### 小機能

- 二重クリックでインレイヒントを挿入するかどうかを設定する`"php.inlayHints.insertOnDoubleClick"`設定 ([#1717](https://community.devsense.com/d/1717))。
- `array_multisort()`は最初の引数を厳密には参照渡しとして扱わない ([#1729](https://community.devsense.com/d/1729))。
- ファイルパスの移動とコード補完の改善 ([#1735](https://community.devsense.com/d/1735))。
- `@see`および`@exception`のツールチップ。
- `list{}`ドックコメントの形状。

### フォーマット

新しい**PHP 8.3**の構文がフォーマッタでサポートされています。

### 最終行

デフォルトでは、フォーマッタは最終行のトリムを行いません。最終行はそのまま保持されます。ただし、`files.insertFinalNewline`が有効になっており、最終行が欠けている場合、フォーマッタが自動的に追加します。

### 修正

- **code-server**およびGitHub CodeSpacesでのインストールを修正しました。
- 再帰的なシンボリックリンクを含む`vendor`フォルダを修正しました ([#1720](https://community.devsense.com/d/1720))。
- 可変長引数を受け入れるメソッドの場合の誤った名前付き引数エラー ([#1722](https://community.devsense.com/d/1722))。
- スタックオーバーフローおよび言語サーバーのクラッシュを修正しました ([#1724](https://community.devsense.com/d/1724))。
- ジェネレーターの戻り値型の解析を修正しました。
- キーワードとしての名前付き引数の不適切なフォーマットを修正しました [#408](https://github.com/DEVSENSE/phptools-docs/issues/408)。
- コンストラクタ内の不正なインデントを修正しました [#409](https://github.com/DEVSENSE/phptools-docs/issues/409)。

## 1.39.13943 (2023年9月20日)




### クラス名インラインの提案

新たに、新しいクラスを入力すると、クラス名がファイル名に基づいて提案されます。この提案は、Visual Studio Codeのインライン補完UIを利用して行われるため、邪魔にならず、`TAB`キーで受け入れることができます。

![PHPクラス名の提案](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vsc-complete-class-name.gif)

[IntelliPHP](https://marketplace.visualstudio.com/items?itemName=DEVSENSE.intelli-php-vscode)と組み合わせると、インラインコードの提案がさらに詳細で強力になります！

### ファイルパスの補完

この更新以降、エディタがファイルを補完し、ナビゲートできるようになりました [#402](https://github.com/DEVSENSE/phptools-docs/issues/402)。

![ファイルパスの提案](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vsc-complete-filenames.gif)

### 修正

- 古い形式の`composer/installed.json`ファイルがサポートされました。
- PHPとHTMLを混ぜたときに発生したいくつかのフォーマットの問題を修正しました。

## 1.38.13918 (2023年9月15日)




### ゲッター/セッター命名規則の設定

生成されるゲッターとセッターの命名規則の設定が追加されました。

![set naming convention](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/getterSetterNaming.png)

### PHP 8.3 構文

**PHP 8.3** 構文機能をサポートに追加:

- 型付きクラス定数
- 読み取り専用の匿名クラス
- 動的クラス定数のフェッチ

### フォーマット

ユーザーフィードバックに応えて([#384](https://github.com/DEVSENSE/phptools-docs/issues/384), [#1691](https://community.devsense.com/d/1691-array-trailing-commas), [#684](https://community.devsense.com/d/684-code-format-array-last-item-comma))、PHPコード内のカンマの自動配置を正確に制御できる追加フォーマットオプションを導入しました。

これらの新しいオプションには以下が含まれます:
 - `php.format.rules.addCommaAfterLastArrayElement`: 配列の最後の要素の後にカンマを追加します。
 - `php.format.rules.addCommaAfterLastCallParameter`: 関数呼び出しの最後のパラメータの後にカンマを追加します。
 - `php.format.rules.addCommaAfterLastDeclParameter`: 関数またはメソッドシグネチャの最後に宣言されたパラメータの後にカンマを追加します。

上記に加えて、以下のフォーマットオプションも導入しました:
 - `php.format.rules.booleanConstantCasing`: `true` および `false` 定数の大文字小文字の定義。
 - `php.format.rules.nullConstantCasing`: `null` 定数の大文字小文字の定義。

### 修正

- デバッガが `%` 文字を含むファイルパスを処理するようになりました [#380](https://github.com/DEVSENSE/phptools-docs/issues/380)
- /vendor/ のキャッシュ修正
- composer 更新後に問題が更新されます
- メモリ使用の最適化
- キーワードでない場合はキーワードツールチップを表示しないようにしました
- ピークウィンドウで重複したアイテムを表示しないようにしました
- Drupalコードスタイルを使用する場合、フォーマッタはすべての True/False/Null 定数を大文字に変更します。[#870](https://community.devsense.com/d/870-drupal-code-style-doesn-t-do-uppercasing-true-false-null)
- フォーマットやインレイヒントの設定に対する複数の変更が同時に行われた場合、最初の変更のみが考慮され、それ以降の変更は無視されました。
- PSR-12 コーディング標準に関連するフォーマットの問題を解決しました。複数行の引数リストの閉じ括弧と開き中括弧は、PSR-12標準に従い、一行に一つのスペースを挟んで正しく配置されるようになりました。
- コード診断や IntelliSense のさらなる修正。
- 配列初期化子の値が追加のインデントレベルでフォーマットされるようになりました。[#935](https://community.devsense.com/d/935-format-indent-array-initializers-values)
- 複数行の配列初期化子に関連する他のフォーマットの問題を修正しました。
- 安定性の向上。

## 1.38.13779 (2023年9月1日)



### 修正

- スティッキースクロール [#387](https://github.com/DEVSENSE/phptools-docs/issues/387)
- `default`ケースのツールチップ [#1692](https://community.devsense.com/d/1692)
- 属性のツールチップ
- 型指定なしのパラメーターの型解析を修正
- 問題解析設定の修正
- /vendor/ のキャッシュ修正
- /vendor/ ファイルでの`static`の使用修正 [#389](https://github.com/DEVSENSE/phptools-docs/issues/389)
- ワークスペースに不正に作成された一時キャッシュを修正 [X/1697612088196137243](https://twitter.com/driesvints/status/1697612088196137243)

## 1.38.13759 (2023年8月30日)



### 読み込みとメモリ使用量の最適化

このアップデートでは、`composer.lock`を`vendor`フォルダとともにキャッシュし始めます。これにより、Composerパッケージに基づくワークスペースのオープンが劇的に改善され、RAM使用量が最小限に抑えられます。

_インサイダーの皆様へ_、`OUTPUT` / `PHP Language Server`パネルでその動作を確認してください。

### 属性のインレイヒント

クラスの上の属性には、パラメータ名を含むインレイヒントが表示されるようになりました（[#383](https://github.com/DEVSENSE/phptools-docs/issues/383)）、これが有効な場合。

### `scalar_objects`サポート

[#378](https://github.com/DEVSENSE/phptools-docs/issues/378)の提案に感謝します。Nikita Popovによる[`scalar_objects`](https://github.com/nikic/scalar_objects)拡張をネイティブにサポートしました。

エディターは`register_primitive_type_handler()`呼び出しを認識し、指定されたスカラー型の補完を可能にします。

### フォーマット

[ユーザーリクエスト](https://community.devsense.com/d/1656-line-up-on-consecutive-constants)に直接応え、定数`php.format.rules.alignConstants`と列挙ケース`php.format.rules.alignEnumCases`を整列するためのフォーマットオプションを追加しました。これにより、整合した整列が簡単になりました：

```php
class X {
    const a   = 1;
    const bb  = 2;
    const ccc = 3;
}
```

### 仮想ファイルでのコード解析

仮想ファイル、すなわちdiffビュー、ピーク、gitプレビューなどで完全なコード解析を有効にしました。これにより、送信しようとしている変更を簡単に解析できます！

![analyse virtual document](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vsc-analysis-virtual-document.png)

### シンボル詳細付きアウトライン

[#109](https://github.com/DEVSENSE/phptools-docs/issues/109)の提案に感謝し、ドキュメントのアウトラインにより詳細を追加しました。メソッドのアクセス、クラスのアクセス、`interface`、`trait`、`enum`の種類を表示します。

![Symbol outline with details](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/outline-with-details.png)

### 修正

- VS Codeまたはワークスペースを閉じる際の遅延を修正。
- `use`ステートメントのソートを修正。
- `trait`で定義されたメソッドへのgo-to-defを修正。
- `@psalm-import-type` phpdocタグのサポートを修正。
- パラメータなしの`new`がある際のインレイヒントを修正。
- 静的メソッドのリファクタリングの名前変更を修正。
- 最適化。
- 名前空間で予約語を使用する際に発生するフォーマットの問題を修正。

## 1.37.13534 (2023年8月4日)




### 補完用ネームスペースラベル

新機能として、コード補完時にクラス名の横にネームスペースが表示されます。この機能はデフォルトで**有効**になっており、設定で `"php.completion.showNamespaceLabel"` で制御できます。

![completion namespace label and colored tool tips](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/color-completion-and-namespace-label.png)

### 補完のカラー詳細

コード補完のポップアップがフォーマットされ、カラー化されます。

### インテリセンス

- シングルクォートで囲まれた文字列内のクラス名補完が追加されました。

### 修正

- 無限RAM使用の問題を修正しました（[#343](https://github.com/DEVSENSE/phptools-docs/issues/343#issuecomment-1664221959)）
- 配列が自動的に整列されない問題を修正しました [#364](https://github.com/DEVSENSE/phptools-docs/issues/364)
- 重複した警告が修正されました。
- HTMLタグの折りたたみ時、閉じタグが表示されたままになります。[#363](https://github.com/DEVSENSE/phptools-docs/issues/363)
- 可変引数のスペース除去を修正しました [#1639-2](https://community.devsense.com/d/1639-wrongly-detected-problems-for-constructor-arguments/2)
- HTMLタグとPHPタグのネスティングと組み合わせに関する複数の問題を解決しました。[#1634](https://community.devsense.com/d/1634-indentation-problems-with-auto-format-in-vs-code)

## 1.36.13417 (2023年7月1日)



### デバッガと`trigger`設定

新しい起動設定`"trigger"`を使用すると、特定のリクエストをデバッグするか無視するかを制御できます。

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

上記の`launch.json`設定は、組み込みのWebサーバーを起動し、すべてのXdebugディレクティブを構成し、リクエストを待ちます。`GET`パラメータ`XDEBUG_TRIGGER=THIS`を持つリクエストのみがデバッグされます。他のリクエストはデバッガによって無視されます。すなわち、`http://localhost?XDEBUG_TRIGGER=THIS`へのリクエストはデバッグを開始しますが、`http://localhost`は開始しません。

### IntelliSenseと`IteratorIterator`

`IteratorIterator`および`RecursiveIteratorIterator`が一般型引数`TInner`、`@mixin TInner`を拡張し、`__construct()`がこの`TInner`を推論するようになりました。したがって、IntelliSenseは内部イテレータの型を認識し、内部イテレータのメンバーを提供できるようになりました。（[#1613](https://community.devsense.com/d/1613)）

### 新しいIntelliSense機能

- `@phpstan-type`と`@phpstan-import-type`がサポートされました（[#1543](https://community.devsense.com/d/1543-local-type-aliases)）。
- 含まれるディレクトリでの`phpstan.neon`（および`.dist`の代替ファイル）の処理; そのグローバル型エイリアスをサポート（`phpstan.neon`ファイルの[`"typeAliases"`](https://phpstan.org/writing-php-code/phpdoc-types#global-type-aliases)設定）。
- `Collection<TValue>`、`Iterator<TInner>`の正しい取り扱い。
- マジック`__get()`を使用してアクセスされる未定義のプロパティが低い重大度で報告されます。
- トレイト適応とクラス継承分析の修正。トレイト`use`を持つ複雑な継承を持つクラスが正しく分析され、不足しているメソッドの実装についての有用な洞察を提供します。
- 特定の`try`/`finally`ブロックの制御フロー分析を修正しました。
- Laravel IntelliSenseを改善しました。

### 名前空間の自動インポート

すでに名前空間の自動インポート機能があり、コード補完を使用すると対応する`use`または完全修飾名がシームレスに追加されます。また、新しい名前空間をインポートするためのコードアクションもあります。さらに、コマンドバー（`F1`）とクイックピックウィンドウを介して名前空間をインポートするコマンド`Import class ...`および`Fqn class ...`を追加しています（[#450](https://community.devsense.com/d/450)）。

### 安定性の修正

- ソリューション内に`.phar`ファイルがある場合のメモリリークが修正されました。

## 1.35.13327 (2023年6月20日)




### `use` の整理

_Organize Imports_として知られるアクションが、ソースコード内のどこからでも呼び出せるようになりました（[#349](https://github.com/DEVSENSE/phptools-docs/issues/349)）。`use`文の削除と並べ替えは、単一行ではなく、コード全体のブロックに影響します。

### Composer

`composer.phar`へのパスを設定`composer.bin`を使って明示的に設定できます。また、`composer.phar`の解決が改善され、ほとんどの場合、すでにインストールされている独自のComposerが使用されます。ユーザーがComposerをインストールしていない場合は、自動的にダウンロードされシームレスに使用されます。

### リファクタリング

トレイトの関数メンバーは、セマンティックハイライト、参照の検索、メソッドのオーバーライドを含むコードレンズ、および名前の変更リファクタリングで解決されます。

### デバッガー & Phar

拡張機能は`.phar`ファイルを解析して理解します。この更新以降、`.phar`ファイル内のコードをデバッグしてステップスルーすることが可能です。Pharファイルはデコードされ、開かれ、現在のステートメントが通常の`.php`ファイルのようにハイライトされます。ローカル変数も調査でき、インラインデバッグの値も動作します。

### 安定性

このアップデートは、`code`が閉じられた際にプロセスが終了しない問題を修正しました。

## 1.34.13295 (2023年6月15日)




### IntelliSense &amp; `@phpstan-type` と `@psalm-type`

これからは、ローカルタイプエイリアスの基本サポートがあります。

### IntelliSense &amp; ジェネリックを持つTraits

新たに、`trait` の使用は、トレイトのジェネリック引数を指定するために `@use` ドックコメントで注釈を付けることができます ([#840](https://community.devsense.com/d/840-generics-allow-template-for-trait-usages))。例：

```php
class MyClass {
    /** @use MyTrait<int, string> */
    use MyTrait;
}
```

### IntelliSense &amp; `static` 型

`static` や `$this` をトレイト内、保護されたプロパティ、そして一般的なクラス継承に関して使用する様々なケースのために、内部を再実装し、型の解析を改良しました。さらに、ジェネリック引数とトレイトのメンバーは、より継承された型情報でより良く解決されます ([#931](https://community.devsense.com/d/931-inherit-and-static-array-type/))。

### PHPUnit テスト &amp; 連続実行

新たに、テストを連続実行することが可能になりました。*Testing* パネルの *watch* アイコンで、すべてのテスト、テストスイート、または特定のテストケースだけを常に最新に保つことができます ([#1479](https://community.devsense.com/d/1479-autorun-test-suite-on-file-save))。

### 小さな改善点

- 名前付き引数のコード補完が末尾に `:` を完了します。 ([#1600](https://community.devsense.com/d/1600-improved-autocomplete))
- シングルクオート内のヒント付き配列キーのコード補完。 ([#1600](https://community.devsense.com/d/1600-improved-autocomplete))
- `instanceof` キーワードの後に SPACE を入力した後に補完がトリガーされる。

### 修正

- いくつかのメモリリークを修正しました！
- `match`、`fn`、そして `interface` が修飾名内で構文エラーとして報告されなくなりました (PHP 8.0+)。
- PHP 8.2 のスタンドアロンの `true`、`false`、および `null` の型名 ([#338](https://github.com/DEVSENSE/phptools-docs/issues/338))。
- いくつかの型推論ケースを修正しました。
- `@ignore` タグで注釈が付けられた関数が未知数として報告されるのを修正しました。
- `if` の上の `/** @var */` を通じた型ヒントを修正しました。
- `define()` のチェックを修正しました ([#340](https://github.com/DEVSENSE/phptools-docs/issues/340))。
- 抽象メソッド後のフォーマット時に新しい行が削除される問題を修正しました [#1525](https://community.devsense.com/d/1525-formatting-issue)。
- アロー関数が php.format.rules.spaceWithinDeclParens を尊重し、括弧内にスペースを追加する問題を修正しました [#1536](https://community.devsense.com/d/1536-space-within-fn-parenthesis)。
- 関数がキーワードとして命名された場合の不要なスペースを修正しました [#335](https://github.com/DEVSENSE/phptools-docs/issues/335)。
- 前の兄弟ノードが同じ行で終了する場合、インデントを増加しないようにしました [#333](https://github.com/DEVSENSE/phptools-docs/issues/333)。
- キーが単純なリテラルでない場合の配列項目の揃えを修正しました [#1602](https://community.devsense.com/d/1602-auto-format-woes)。

## 1.34.13120 (2023年5月5日)




### IntelliSense

#### トレイト適応ブロック

`trait` 適応ブロックでのコード補完とツールチップが実装されました。 ([#582](https://community.devsense.com/d/582))

#### その他の改善

- `is_a()` のコンテキストでの型推論が正しく解析されるようになりました。
- `__callStatic()` マジックメソッドが存在する場合、静的に呼び出される非静的メソッドに対する警告が減少しました。
- コードアクションによる新しい迅速なリファクタリング。
- 統合されたPHPマニュアルとローカライズの更新。

### 欠落PHPDocの追加

`Add Missing PHPDoc` コードアクションは、ドックコメントをスニペットとして挿入します ([#157(comment)](https://github.com/DEVSENSE/phptools-docs/issues/157#issuecomment-1512313864))。これによりテンプレート変数が置き換えられ、プレースホルダーに入力できるようになります。

### フォーマッティング

コメント `// @php-format off` または `/* @php-format off */` と、それに対応するコメント `// @php-format on` または `/* @php-format on */` の間のコードがフォーマットされないように、指定されたコード範囲内でフォーマットをオンまたはオフにするオプションを追加しました。

さらに、新しいオプション `php.format.rules.declKeepRightParenAndOpenBraceOnOneLine` を追加し、関数またはメソッド宣言ヘッダーの右括弧 `)` をボディ `{` の開きブレースと同じ行に保持します。

その他、フォーマットのカスタマイズを可能にするオプションには以下が含まれます:
- `php.format.rules.openBraceOnNewLineForNamespaces` は、名前空間宣言のために新しい行に開きブレース `{` を配置します。
- `php.format.rules.openBraceOnNewLineForBlocks` は、他のフォーマットルールによって制御されるものを除くすべての種類のコードブロックに新しい行に開きブレース `{` を配置します。
- `php.format.rules.spaceBeforeParenthesesInControlStatements` は、制御文内の括弧の前にスペースを挿入します。
- `php.format.rules.spaceBeforeParenthesesInCalls` は、メソッド、関数、およびコンストラクタの呼び出し括弧の前にスペースを挿入します。
- `php.format.rules.spaceBeforeParenthesesInDeclarations` は、メソッド、関数、およびコンストラクタ宣言括弧の前にスペースを挿入します。

### インレイヒント

名前付き関数のみに戻り値の型インレイヒントを表示し、匿名関数および矢印関数には表示しないオプションを追加しました ([#326](https://github.com/DEVSENSE/phptools-docs/issues/326))。

### 修正

- 型チェックおよび型推論チェック内での `class_alias()` の対応。
- `@return $this` を `static` な戻り値型ヒントとして扱う。
- 関数の上に **PHPDoc** を生成する際に `"php.completion.autoimport-docblock"` 設定を考慮 ([#896](https://community.devsense.com/d/896))。
- `"mongodb"` スタブが更新され、いくつかの欠落しているMongoDBクラスと関数が修正されました。使用するには設定 `"php.stubs": {"*", "mongodb"}` を使用してください ([#927](https://community.devsense.com/d/927))。
- すべての参照を見つけるときに、必要に応じて型解析を実行し、より良い結果を提供する ([#322](https://github.com/DEVSENSE/phptools-docs/issues/322))。
- PHPDocの `@method` タグで導入されたメソッドの名前付きパラメータの使用を修正 ([#921](https://community.devsense.com/d/921))。
- 値が `?static` を許容するように正しく処理。
- コード診断の改善、不正な警告を回避。
- ユーザースニペットを補完する際の内部エラーを修正。
- JavaScript文字列内に複数行のPHPコードが存在する際に、フォーマッティングが正しく機能しない問題を修正 [#908](https://community.devsense.com/d/908-tab-stop-indentation-with-open-curly-braces/5)。
- 複数行の静的関数呼び出しで名前付き引数が使用された場合の不正なインデントを修正。
- 複数のforeachコロンブロックが使用された場合の不要な改行の詰め込みを修正。 [#893-12](https://community.devsense.com/d/893-another-formatting-issue/12)
- 特定のケースでの名前付き引数の不正なインデントを修正 [#928](https://community.devsense.com/d/928-wrong-formatting-of-named-arguments)。
- 擬似クラス定数の不正なインデントを修正 [#932](https://community.devsense.com/d/932-formatting-issue)。
- スクリプト/スタイルタグ内のPHPフォーマットの修正。 [#1460](https://community.devsense.com/d/1460-codeigniter-4)
- `/*` で区切られた複数行のコメントでのインデント喪失の修正 [#1489](https://community.devsense.com/d/1489-code-formatting-issue-in-visual-studio-code-using-php-tools/3)。
- `/*` コメントでの空行削除のフォーマット修正 [#1522](https://community.devsense.com/d/1522-comment-block-issue)。
- 複数ネストされた複数行ラムダ関数での不正なインデントを修正 [#1500](https://community.devsense.com/d/1500-formating-issue)。

## 1.33.12934 (2023年4月8日)




### IntelliSense

`.phpstorm.meta.php` の `expectedArgments()` および `argumentsSet()` をサポートしました。

![expectedarguments](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/meta-expectedarguments.png)

### 修正

- フォーマッティングがアロー関数やラムダ関数の後で空白を圧縮していました ([#913](https://community.devsense.com/d/913-after-update-formatting-deletes-empty-lines-and-moves-curly-braces-up))。
- 定義へのナビゲーション時の内部例外修正 ("定義へ移動" コマンド)。
- Drupal の巨大なファイルでの希少なケースでのクラッシュ修正。
- 関数本体でのコード補完に欠けていた `static` キーワードを追加しました。
- IntelliSense/コード分析で `iterable<K,T>` (2つのジェネリック引数) を PHPStan と同様に処理するようにしました ([#914](https://community.devsense.com/d/914-generic-of-traverable/2))。

## 1.33.12924 (2023年4月5日)




### Test Explorer

_Test Explorer_ は、グロブパターン `**/phpunit*.xml` または `**/phpunit.xml.dist` に一致する _PHPUnit_ XML 設定ファイルを（`vendor` フォルダーの外で）探して監視します [#313](https://github.com/DEVSENSE/phptools-docs/issues/313)。これにより、カスタム名を持つ**複数の設定ファイル**を同じディレクトリに持つことができます。

![multiple phpunit configurations](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/test-multiple-configs.png)

さらに、以下の問題を修正しました：

- 設定ファイル内のすべてのテストを実行する。
- 単一のテストスイート内のすべてのテストを実行する。
- テストのデバッグ時に不要な警告が発生しないよう正しい Xdebug の指示を行う。

### ParaTest

このアップデートにより、[ParaTest](https://github.com/paratestphp/paratest) を PHPUnit テストと同じ方法で実行できるようになりました。操作方法は次の通りです：

- コマンド `Composer: require dev package` を使用して ParaTest composer パッケージをインストールし、`brianium/paratest` パッケージを検索します。
- ワークスペース設定を更新します：
  ```json
  {
    "phpunit.phpunit": "./vendor/bin/paratest"
  }
  ```
- _Testing_ パネルに移動し、テストを実行またはデバッグします。

### 保存時の`use`文のソート

以下の設定は、保存時に `use` 文をソートおよび整理するために機能します：

```json
{
  "editor.codeActionsOnSave": { "source.organizeImports": true },
}
```

### IntelliSense

現在、`@inheritdoc` 上で `Ctrl`+`Click`（または `F12` を使用して移動）することで、基底のドキュメントコメントに直接遷移することが可能です。[#897](https://community.devsense.com/d/897-jump-to-phpdoc-via-clicking-on-inheritdoc)

さらに、シグネチャヘルプでの戻り値型ヒントはテンプレート（ジェネリック）引数を考慮しています。

### Composer `"composer.workingPath"` 設定

フィードバック [#909](https://community.devsense.com/d/909-setup-a-working-directory-for-composer) に感謝し、ユーザーが `composer.json` および `vendor` フォルダーの相対パスを指定できる設定 `"composer.workingPath"` を追加しました。

### 修正

- ワークスペース内の `.phar` ファイルを更新/削除する際に発生するメモリリークを修正しました。（通常、`composer update` および `require` 時に発生します）[#291](https://github.com/DEVSENSE/phptools-docs/issues/291)
- `array`、`require`/`include`、`exit`、および `die` の後の括弧 `()` を自動補完しない。
- 複数行の HTML 属性がシングルクォートで囲まれ、PHP ブロック内にある場合、毎回フォーマットセッションでインデントされていました。[882](https://community.devsense.com/d/882-one-more-auto-format-creeper)
- 混在した HTML/PHP フォーマットの結果、フォーマッターが停止する稀なケースを修正しました。[887-B](https://community.devsense.com/d/887-cannot-format-code-with-syntax-errors)

## 1.32.12895 (2023年3月28日)



### IntelliSense

- ドキュメントコメントの `@param` タイプとして指定された `null` が無効として報告されます。
- `true` 擬似型は、ユニオン型内で正しく処理されます。
- `new()` と名付けられたメソッドは、マウスホバーおよびコード補完で正しく処理されます。
- Laravel サービスの検出が改善されました。
- `expectedArguments()` PHPStorm メタの初期実装。
- `<?php` タグの後に `declare` および `declare(strict_types=1);` を補完。

### リファクタリング

- PHPDoc の `@see` および `@uses` がリネームリファクタリング、すべての参照の検索、および発生箇所の強調表示中に認識されます。
- 設定 **problems** がオフの場合でも、未使用の `use` チェックが機能します。
- 任意の単純なクラス名に対する **ネームスペースのインポート**。同じ名前を持つクラスが複数ある場合、ネームスペースのインポートやクラス名の完全修飾のコードアクションの提案があります。

#### インポートの整理

ドキュメントを保存する際に自動的にインポートを整理（別名 **不要な使用の削除**）できる VS Code の **"インポートの整理"** コマンドおよび最終的な `"editor.codeActionsOnSave"` 設定のサポートを追加しました。

![organize uses](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/source.organizeimports.png)

### 修正

- 安定性の改善。
- スマートセレクトの修正。
- ファイルの冒頭にある `#!` が構文エラーとして報告されません。
- 一部の `mixed` タイプのプロパティが未知として報告されません。
- PHP8 アトリビュートの書式設定が複数行に渡る場合にインデントをサポートします [#879](https://community.devsense.com/d/879-php-8-attribute-code-formatting)
- `readonly` または `static` が関数引数名として使用された場合に、フォーマットが空白を削除していた問題を修正しました。
- フォーマッターが `new` と `()` の間に余分なスペースを追加していたケースを修正しました [#883](https://community.devsense.com/d/883-formatting-new-function-issue)

## 1.31.12821 (2023年3月20日)



### 修正

- パンくずリストを修正しました。([#302](https://github.com/DEVSENSE/phptools-docs/issues/302))
- 認識されないPsalmおよびPHPStanの特殊タイプ名を修正しました。([#860](https://community.devsense.com/d/860-breadcrumb-bar-strange-behavior))
- グローバル変数のタイプチェックを修正しました。([#303](https://github.com/DEVSENSE/phptools-docs/issues/303))
- マウスホバーで`@mixin`のプロパティを参照します。
- IntelliSense: Laravel ファサードと DocComment `@method` のメソッドが期待通りに解決されます。
- VS Codeによって生成された`rg`プロセスを修正しました。([#877](https://community.devsense.com/d/877))
- 複雑なhtml/php混在フォーマットの問題を修正しました。[#852](https://community.devsense.com/d/852-another-auto-format-error)
- 複数行のチェインコールのインデントの誤りを修正しました。[#862](https://community.devsense.com/d/862-formatting-bug)
- `PSR-12`にプロバイダーされたマルチラインヘッダーでのメソッドまたは関数宣言の開き中括弧の位置を修正しました。[#305](https://github.com/DEVSENSE/phptools-docs/issues/305)
- メソッドまたは関数に引数として渡されたラムダ関数の後に不要な改行が入るのを修正しました。[#306](https://github.com/DEVSENSE/phptools-docs/issues/306)
- インターフェイスを実装するバックタイプを持つ列挙型のフォーマットを修正しました。
- 関数呼び出しが複数行の場合、名前付き引数のインデントを修正しました。[#863](https://community.devsense.com/d/863-php-named-parameters-do-not-get-formatted-correctly)
- html/phpの混合で呼び出された場合に選択範囲のフォーマットが機能しないケースを修正しました。
- フォーマットはhtmlコメント内でphpコードブロックをインデントしません。[#872-3](https://community.devsense.com/d/872-syntax-highlighting-and-another-auto-format-creeper)

## 1.31.12740 (2023年3月4日)




### インレー・ヒント

PHPコード用の新しい**インレー・ヒント**が利用可能です！

![inlay hints](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vsc-inlay-hints.png)

インレーは、パラメータ名、参照渡しの引数、推論された関数の戻り値の型に利用できます。

![inlay hints](https://docs.devsense.com/vscode/imgs/vsc-inlay-parameter-byref.png)

インレー・ヒントを有効または無効にするには、次の**設定**を変更してください：

- `"editor.inlayHints.enabled"`
- `"php.inlayHints.parameters.enabled"`
- `"php.inlayHints.parameters.byReference"`
- `"php.inlayHints.types.return"`
- `"php.inlayHints.types.variable"`

詳細は[ドキュメント](https://docs.devsense.com/vscode/editor/inlay-hints)を参照してください。

### ドキュメントコメントが欠落している場合のクイック修正

新しいコードアクションでは、推論された型情報と要約のプレースホルダーを含むドキュメントコメントの欠落を補います。この機能は、`/**`を関数/クラス/プロパティ/定数または`define()`呼び出しの上に入力するのと同じですが、コードアクションを通じて呼び出したり、一度に複数の宣言に対してコード全体にわたって呼び出したりできます。([#226](https://github.com/DEVSENSE/phptools-docs/issues/226))

### スマートセレクト

Visual Studio Codeのセレクションレンジ機能は、構文要素を迅速に選択することができます；PHP拡張はすべての文、宣言、コードブロックの選択範囲を提供します。

### フォーマット

要望の多かった`Drupal`コードスタイルの導入がついに実現しました。[#795](https://community.devsense.com/d/795-add-drupal-code-style-to-list) このバージョンで`Drupal`コードスタイルが導入されたことをお知らせします。

フォーマッタは、`files.InsertFinalNewLine`オプションを尊重するようになりました。[#837](https://community.devsense.com/d/837-formatter-removes-a-new-line-after-a-class-closing-brace)

### 修正

- 定義を参照する際の範囲の強調表示を修正しました（[#288](https://github.com/DEVSENSE/phptools-docs/issues/288)）
- 一部の内部例外を修正しました。
- コードが文法的に無効な場合のマウスホバーを修正しました。
- リモートの`://`や `git://`ファイルがワークスペースに存在する場合、または git マージ、あるいは diff ウィンドウの後に "Search TODO" コマンドを修正しました。
- 変更されたときの`.git`およびその他の特殊なディレクトリ内のディレクトリのインデックス作成を修正しました。
- ドキュメントコメントで指定された型は、`self`のエイリアスとして`$this`キーワードを使用できます。すなわち、`callable($this)`（[#843](https://community.devsense.com/d/843-error-in-parameter-type-with-docblock)）。

### フォーマット修正

- オブジェクトが括弧内にあった場合の複数のメソッド呼び出しのチェーンのフォーマットを修正しました。[#820/8](https://community.devsense.com/d/820-heredoc-with-interpolated-variables-breaks-auto-formatting-for-the-entire-file/8)
- 混合JSとPHPのフォーマットを修正しました。[#820/5](https://community.devsense.com/d/820-heredoc-with-interpolated-variables-breaks-auto-formatting-for-the-entire-file/5)
- PHPコード内にJSがある場合のフォーマットで`}`が各フォーマットで移動するケースを修正しました。[#820/7](https://community.devsense.com/d/820-heredoc-with-interpolated-variables-breaks-auto-formatting-for-the-entire-file/7)
- マルチラインHTML属性、コメント、CDATAの内部が各フォーマットでインデントされるケースを修正しました。[#820/12](https://community.devsense.com/d/820-heredoc-with-interpolated-variables-breaks-auto-formatting-for-the-entire-file/12)
- Linuxの行末が異なるフォーマット出力を引き起こす場合のケースを修正しました。
- エイリアスがクラスと同じ場合の`use`がフォーマッタを停止するケースを修正しました。
- 配列アクセスとメンバー使用が複合されたマルチライン式での二重インデントを修正しました。[#842](https://community.devsense.com/d/842-formatter-adds-unnecessary-tabs)
- 参照代入時のアンパサンド後の不要なスペースを修正しました（[#846](https://community.devsense.com/d/846-spaces-after-symbol-ampersand-to-define-reference)）、同時にこの記法も尊重します `$a =& $b;`。
- 配列項目アクセスを含むマルチライン式における不要な二重インデントを修正しました。
- `elseif`、`catch`、`finally`の前に行コメントがあるときの不要な新しい行を修正しました。
- オブジェクトの新しいインスタンスを作成する際の`static`または`self`と`(`間の不要なスペースを修正しました。
- フォーマッタがビット演算子`&`周囲のスペースを削除するケースを修正しました。
- マルチラインにまたがるコンストラクタ呼び出しの際のオブジェクトのフィールドアクセスの不要な二重インデントを修正しました。
- `php.format.rules.alignConsecutiveAssignments`と異なる種類の左側の式が組み合わさっている場合を修正しました。
- 予約された型が型ヒントとして使用されたときのスペースの欠如を修正しました。
- マルチラインで連鎖された関数呼び出しで使用されるコメントのインデントを修正しました。
- `php.format.rules.keepControlStatementsInOneLine`オプションが使用されるときの`)`後のスペースの欠如を修正しました。[#852-2](https://community.devsense.com/d/852-another-auto-format-error/2)
- マルチライン条件演算子の不要なスペースを修正しました。
- PHPキーワードと同じ名前の関数後の不要なスペースを修正しました。
- `static`キーワードが使用された際の静的メンバーアクセスの二重インデントを修正しました。
- マルチラインコンストラクタ呼び出しでメンバーがアクセスされた際のインデントの誤りを修正しました。
- `default`という名前の識別子の後の不要なスペースを修正しました。
- 関数宣言のパラメータに属性がある場合のフォーマッタの停止を修正しました。
- ネームスペース内のトレイトの使用がフォーマッタを停止する可能性がある場合を修正しました。
- 公開に可視性を変更するトレイトの使用がフォーマッタを停止する場合を修正しました。

## 1.30.12484 (2023年2月10日)




### 修正

- コードフォーマッタの修正。
- 様々な標準関数の欠落、および不明瞭な箇所の修正。
- Homebrewの`php`がmacOSで認識されるようになりました。
- 変数が挿入されたheredocのフォーマットを修正しました [#820](https://community.devsense.com/d/820-heredoc-with-interpolated-variables-breaks-auto-formatting-for-the-entire-file)

## 1.30.12450 (2023年2月9日)




### エディター

**Folding `use`** が追加されました。これにより、`use` ステートメントのブロックを折りたたむことができます ([ツイート](https://twitter.com/JoelPiccoli/status/1622633203818176512))。

### ゲッター/セッター

新たに、ゲッターとセッターを追加して挿入されるコードは、設定 `"php.completion.getterSnippet"` と `"php.completion.setterSnippet"` を使用してカスタマイズ可能です。この方法により、さまざまな値の処理を追加し、戻り値をカスタマイズしたり、自分用のコメントを追加したりすることができます ([#813](https://community.devsense.com/d/813-setter-without-self-reference))。例：

```json
"php.completion.setterSnippet": "{PROPERTY} = sanitize(${NAME}) ?? throw new InvalidArgumentException('Invalid ${NAME}!');\n//done\nreturn {THIS};",
```

### フォーマッティング

 - バック列挙型がサポートされました。
 - 新しい設定 `php.format.rules.keepControlStatementsInOneLine`。[#810](https://community.devsense.com/d/810-is-there-an-option-to-not-auto-indent-one-liners)
 - 設定 `php.format.rules.SpaceBeforeColonInControlflowStatements` が `php.format.rules.SpaceBeforeColonInControlStatements` に名称変更されました。
 - 型宣言における不要なスペースを修正しました [#271](https://github.com/DEVSENSE/phptools-docs/issues/271)
 - `php.format.rules.alignConsecutiveAssignments` は、直接続く場合のみ代入を揃えるようになりました。代入の間に新しい行を挿入すると、異なった方法で揃えるように強制されます。

 ### 修正

 - 差分ビューで開かれたドキュメントがシンボル検索とシンボルナビゲーションに二重に現れないようにしました ([#549](https://community.devsense.com/d/549-intellisense-remembers-old-method-parameters/11))。
 - Unixでのシンボリックリンクの再帰を修正しました ([#269](https://github.com/DEVSENSE/phptools-docs/issues/269))。
 - 空白のWhat's New画面を修正しました。

## 1.30.12417 (2023年2月7日)




### ドキュメントコメント

ドキュメントコメント内でリテラルと定数をサポート（例：`key-of<>`や`value-of<>`内）、ドキュメントコメント内の型情報が解析され、IntelliSenseが機能するようになりました（[#801](https://community.devsense.com/d/801-key-of-and-value-of-support)）。

### 診断

- 重複する昇格プロパティが報告されます。
- 読み取り専用プロパティの変更を報告します。
- `__get`/`__set`があるが`@property`ドキュメントコメントの宣言もある場合に未定義プロパティの使用を報告します。
- 不明な属性クラスに対する診断を追加しました。

### 名前変更のリファクタリング

`class`、`interface`、`trait`、または`enum`をリネームする際に、該当するファイル名のリネームも提案されます。

### ホバーツールチップ

新たに、ホバーツールチップを設定するための2つの設定が追加されました。

- `"php.hover.fullname"` は、ツールチップの上部に完全なクラスメンバー名を追加します（クラスの完全修飾名を含む）（デフォルトでは無効）（[#808](https://community.devsense.com/d/808-show-class-name-in-function-description-on-hover-popup)）。
- `"php.hover.containingClass"` では、関数ツールチップの一部としてクラス名を表示するかどうかを有効/無効にできます（デフォルトでは有効）。

### 修正

- ワークスペース全体の処理時間（ソースコードの解析）が最適化されました。
- 欠けていた`ZipArchive::`定数を追加しました（[#256](https://github.com/DEVSENSE/phptools-docs/issues/256)）。
- ラムダ関数内で定義された定数がIntelliSenseとコード診断に表示されます（[#257](https://github.com/DEVSENSE/phptools-docs/issues/257)）。
- コンストラクタ昇格プロパティの名前変更のリファクタリングとセマンティックハイライティング。
- `extends`/`implements`キーワードの後にコンテキストに応じた補完。
- ワークスペースに多くの`.gitignore`ファイルが存在する場合の`"Problems: Exclude Git Ignore"`の修正。
- 関数宣言の上部に定義された`@global`タイプの使用を修正。
- 末尾カンマの上に`/**`を置いたときにドキュメントコメントを生成する際の修正（[#265](https://github.com/DEVSENSE/phptools-docs/issues/265)）。
- ワークスペースのパスと重なる`includePath`を使用するときの問題とコード解析の更新を修正。

## 1.29.12304 (2023年1月29日)




### IntelliSenseの改善

**`@internal` アノテーションの尊重**

`@internal` ドキュメンテーションコメントタグでアノテートされたシンボルは、補完リストに表示されなくなりました。

**正しい順序**

コード補完の順序をコンテキストとこれまでに入力されたテキストに基づいて更新しました。インポートされた名前空間のシンボルが最初にリストされ、次にトップレベルのシンボルが続き、最後には自動インポート可能なシンボルがあります。

**非推奨クラス**

さらに、コード補完リストやソースコード内で使用された際に、非推奨のクラスやインターフェースが取り消し線で表示されます。以前は、これを関数のみで行っていました。

![deprecated classes and interfaces](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vscode-deprecated-types.png)

**パフォーマンス**

より頻繁な操作がバックグラウンドスレッドに移動され、ユーザーエクスペリエンスがスムーズで途切れないようになっています。

### ショートオープンタグ `<?`

デフォルトでショートオープンタグ (`<?`) 内のPHPコードを解析できるようにしました。ソースコードの冒頭に `<?xml` があるケースに対応しています。

ショートオープンタグ内の解析は、設定 `"php.workspace.shortOpenTag"` を使用して無効にすることができます。

### Composer

ローカル開発バージョンの `composer.phar` は、30日ごとに自動更新されます。

### 修正

- `pcntl` 定数がIntelliSenseに追加されました。
- `#region`/`#endregion` の折りたたみを修正しました。
- 様々な状況での折りたたみを修正しました。
- `composer update` 後のIntelliSenseの更新を修正しました。
- ツールチップに表示される不正な `integer` 型名を修正しました。
- グローバル変数のリネームを修正しました ([#242](https://github.com/DEVSENSE/phptools-docs/issues/242))。
- 非英語ローカライゼーションでの警告メッセージを修正しました ([#249](https://github.com/DEVSENSE/phptools-docs/issues/249))。
- `switch` 文での到達不能コード警告が欠落しているのを修正しました。
- `throw new` の直後の補完で `Exception` クラスが欠落しているのを修正しました。
- 文法エラーがある場合の自動インポートを修正しました ([#671](https://community.devsense.com/d/671))。
- フォーマッタが `yield from` の後のスペースを除去しないようにしました ([#248](https://github.com/DEVSENSE/phptools-docs/issues/248))。
- 先頭に `/` を持つ `use` がフォーマッタを停止させる問題を修正しました。
- `;` で終了するコロンブロックがコロンブロック閉鎖トークンから空白で区切られている場合にフォーマッタを停止させる問題を修正しました。

## 1.28.12200 (2023年1月21日)



### 新しいコードアクション

より便利なリファクタリングがPHP拡張機能とVS Codeに追加されます。以下は、一般的なPHP 8構文をコードに導入するリファクタリングです。

**条件 `?:` を `?->` に置き換えることができます**

以下のような条件式を簡略化します：

![simplify conditional expression](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vsc-code-action-conditional.gif)

**代入を簡素化できます**

代入を簡略化します：

![simplify assignment expression](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vsc-code-action-assignment.gif)

**`switch` を `match` に変換**

特定のケースでは、`switch` 文を新しい `match` 式に変換できます。

### PHPStan 条件付き戻り値の型

このアップデートにより、新しいPHPStanの条件付き戻り値の型がサポートされました。この方法で指定された戻り値の型は、ソースコード内で適切に認識され、対応する色で表示され、IntelliSenseは指定された型を適切に使用します。

![phpstan conditional return types](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/phpdoc-phpstan-confitional-return.png)

### 型チェックとIntelliSenseの改善

**破壊的変更:** デフォルトでは、開かれているドキュメント内でのみ診断を報告します。これは設定 `"php.problems.scope"` を使用して変更できます。例外は構文エラーで、これはワークスペース全体から報告されます。

加えて、さまざまな _falsy_ 警告が修正されました。特にジェネリック型との組み合わせで修正されました。型分析が全般的に改善されました。

さらに、ほとんどのポリフィルがコード補完やシンボルナビゲーションに影響を与えなくなります。組み込みのマニュアルはジェネリック型引数とともに注釈されており、サードパーティーパッケージのポリフィルよりも優先されます（[#241](https://github.com/DEVSENSE/phptools-docs/issues/241)）。

### コード補完の順序の改善

コード補完自体が改善され、_ローカル_ シンボルが最初に一覧表示されるようになりました。この機能は現在も開発中で、可能な限り改善を続けています。

### 修正

- メモリリークとランゲージサーバークラッシュを修正しました。
- `/**` を入力した後のPHPDocスニペットのテキストの破損を修正。
- 欠落していたPsalmスカラー型注釈を追加しました。
- `@mixin` メンバーの解決順序を修正しました（[#777](https://community.devsense.com/d/777)）。
- `html` ファイルを `php` 言語サポートに関連付けることができます。
- `//region`/`//endregion` フォールディング（[#788](https://community.devsense.com/d/788-region-comments-won-t-fold)）。

### フォーマット

- null許容の戻り値型の `?` トークン後の不要な余白を削除しました [#752](https://community.devsense.com/d/752-extra-space-after-optional-type)
- **Wordpress** コードスタイルの修正
  - 型および関数宣言では開き中括弧 `{` を新しい行に配置しません。
  - `Unset` 呼び出しは括弧内にスペースを挿入していませんでした。
  - `exit()` または `die()` は括弧内にスペースがありません。
- `php.format.rules.alignConsecutiveAssignments` が特定のケースでフォーマッタを停止させました。
- 等しくない演算子 `<>` を `!=` の代わりに使用するとフォーマッタが停止しました。
- プロパティプロモーションのコンストラクタヘッダーにおけるオプションのカンマがフォーマッタを停止させました。
- HTMLとPHPを組み合わせた特定の状況でフォーマッタが停止しました。
- `switch` 内の `case` が `:` の代わりに `;` に続く場合にフォーマッタが停止しました。

## 1.27.12010 (2023年1月9日)



### ドキュメントコメント構文

Doc Blocksで一般的に使用される型構文の全範囲を認識するために取り組んできました。現在ではPHPStanおよび他の人気のあるリンティングフレームワークのほとんどをサポートしています。

このリリースでは、Doc Blocks、および関連する型解析とコード診断に向けて、より多くの互換性と機能を導入しています。

### カラー化とセマンティックトークン

PHP Doc Commentsは非常に複雑になっており、PHPStanのようなフレームワークがさらに多くの構文と複雑さを追加しています。ジェネリック型、テンプレート、型エイリアス、ユニオン、インターセクション、`callable`構文、配列の形状など、拡張された構文のほとんどをサポートしています。今リリースでは、そのような_ドキュメントコメント_内の型が適切にカラー化されています。

![php callable specification](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/callable-type-def.png)

型表現全体が解析され、カラー化され、認識されます。ツールチップは`Closure`の引数と戻り型を表示するシグネチャヘルプを示します。

_注:_ より見やすいツールチップが進行中です！

### PHPStan配列の形状、`callable`、`list`、その他

このリリース以降、エディターは配列の形状とcallableのすべての構文をサポートしています。さらに、型解析は指定されたPHPStan型を適切に処理します。

PHP Doc Commentsで指定されたPHPStanとPsalmの**配列の形状**は許可され、解析され、カラー化され、コード補完と型解析に使用されます。

加えて、`list`と`non-empty-list`型も処理されます。`<`と`>`で指定されたジェネリック対応も含みます。

PHP Doc Commentsのすべての**callable**構文も現在サポートされています。

### より多くのジェネリック注釈

この更新はジェネリックテンプレート型で注釈を付けられた標準型を提供します。これはLaravelやSymfonyフレームワークで特に有用で、全てのコレクション、反復可能なもの、`Generator`、`DOMNodeList`等の型推論を提供します。

これにより、すべての種類の反復可能なものに対して`foreach`内で推定された値が改善されます。

### 変数用Docコメントスニペット

変数の割り当ての上やグローバル変数の上にDoc Blockを作成する際に、作成されるスニペットを設定できるようになりました。さらに、スニペット設定には新しいプロパティ `"singleline": true|false`（変数の場合はデフォルトで`true`）が追加され、Doc Blockを単一行で作成するか（例: `/** @var Type */`）を指定できます。

設定例:

```json
{
    "php.docblock.variableSnippet": {
        "singleline": false
    }
}
```

### 修正点

- `integer`、`boolean`、`list`型がDoc Blockで正しく処理されるようになりました。
- 未使用の`use`解析が修正され、Doc Blocksで指定された型名を扱うようになりました。
- `session_set_cookie_params()`の診断とパラメータ補完が、可能な両方の定義で動作するようになりました。
- 欠落していた`Imagick`定数が追加されました。
- ジェネリック型および様々な端ケースにおける型推論を改善しました。

## 1.26.11866 (2023年1月3日)




### IntelliSense &amp; Enums

PHP 8.1の`enum`オブジェクトは暗黙的に`UnitEnum`と`BackedEnum`インターフェイスを実装しています。`BackedEnum<TValue>`インターフェイスはテンプレート型引数で注釈されており、ドキュメントコメント内でバックド型を用いてより良い型解析を行うことができます。例：

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

**ジェネリックタイプ &amp; ドキュメントコメントの型注釈**

PHPドキュメントコメント内の型注釈が再実装され、複雑な構造でも処理され、補完、リファクタリング、ハイライト、プレビューが可能になりました。入れ子になったジェネリックタイプでもハイライトが機能し、リネームリファクタリングやコード補完も可能です。

```php
/**
 * @template TElement of \BackedEnum<string>
 * @return (Collection<int, TElement>|array<int, TElement>)[] 複雑なジェネリック型注釈 */
```

**複数行の構造化配列型**

このリリースでは、複数行の構造化配列型注釈への対応が追加されました。これにより、配列のキーと対応するエントリーの型を指定することができます。以下の例をご覧ください：

```php
/**
 * @return array
 *         {
 *           name: string,
 *           age: int,
 *         }
 */
```

### コード診断の改善

コード解析と関連する診断の改善に常に取り組んでいます。今回のリリースでは、多くの誤警告が回避されます。

### フォーマット

新しい**Laravel**コードスタイルを導入しました。`php.format.codestyle`を`laravel`に設定するだけです。

また、フォーマッターに連続する代入を自動的に整列させることも可能になりました。`php.format.rules.alignConsecutiveAssignments`オプションを使います。 [#692](https://community.devsense.com/d/692-sug-formatting-add-auto-align-option)

```php
$a     = 1;
$bbb   = 2;
$ccccc = 3;
```

そして、追加された他のフォーマットルールは以下の通りです：

|設定|説明|
|-------|-----------|
|`php.format.rules.spaceBeforeColonInControflowStatements`|制御フローブロック内のコロンの前にスペースを挿入します。|
|`php.format.rules.spaceBeforeColonInReturnType`|戻り型のコロンの前にスペースを挿入します。|
|`php.format.rules.spaceWithinCallParens`|メソッド、関数、コンストラクター呼び出しの括弧内にスペースを挿入します。|
|`php.format.rules.spaceWithinDeclParens`|メソッド、関数、コンストラクター宣言の括弧内にスペースを挿入します。|
|`php.format.rules.spaceWithinArrayInitilizersParens`|配列初期化子の括弧内にスペースを挿入します。|
|`php.format.rules.spaceWithinIfParens`|`if`文のヘッダ括弧内にスペースを挿入します。|
|`php.format.rules.spaceWithinWhileParens`|`while`文のヘッダ括弧内にスペースを挿入します。|
|`php.format.rules.spaceWithinForParens`|`for`文のヘッダ括弧内にスペースを挿入します。|
|`php.format.rules.spaceWithinForeachParens`|`foreach`文のヘッダ括弧内にスペースを挿入します。|
|`php.format.rules.spaceWithinSwitchParens`|`switch`文のヘッダ括弧内にスペースを挿入します。|
|`php.format.rules.spaceWithinCatchParens`|`catch`文のヘッダ括弧内にスペースを挿入します。|
|`php.format.rules.spaceWithinBrackets`|ブラケット内にスペースを挿入します。|
|`php.format.rules.spaceWithinBracketsAroundExpression`|式の周りのブラケット内にスペースを挿入します。|
|`php.format.rules.spaceWithinExpressionParens`|式の周りの括弧内にスペースを挿入します。|

いくつかのフォーマットの問題も修正されています：
- 名前空間での`readonly`がフォーマッタを停止させる原因となっていた問題
- 関数宣言での`readonly`と`enum`が括弧の前にスペースを追加しない問題
- PHP 8.2のDisjunctive Normal Form Typesをサポート
- マルチライン式での定数の使用が二重にインデントされる問題 [#748](https://community.devsense.com/d/748-constant-arrays-are-being-double-indented)
- HTMLとPHPコードを組み合わせた際に期待通りの整ったコードにならない場合がある問題を改善しました。特に**WordPress**テンプレートで顕著です。

### 修正

組み込みPHP関数の型解析のホットフィックス。

## 1.26.11753 (2022年12月28日)



### タイプ分析の改善

- `assert()` 言語構造内の式が変数の型を決定するために使用されるようになりました。([#744](https://community.devsense.com/d/744-support-assert-to-determine-type))
- 特定の型注釈がより正確になりました。
- 矢印関数内の暗黙的クロージャ変数が適切に初期化されるようになりました。これにより、入れ子になった矢印関数内での初期化されていない変数使用に対する偽警告が修正されます。
- より多くのコアタイプがテンプレート型引数で注釈されており、`@template` や類似のものが使用される場所での型推論が向上します ([#746](https://community.devsense.com/d/746))。
- ジェネリックのサポートが改善され、拡張された `@template` 構文を使用する doctrine/collections や他のテンプレートタイプを適切に処理します ([#746](https://community.devsense.com/d/746))。

### エディタの改善

- `readonly` および `enum` キーワードが、名前空間または関数宣言の一部として使用される場合、誤ってシンタックスエラーとして報告されません。
- 言語サーバーがコード補完中に割り当てるメモリが大幅に削減されました。これにより、全体的なパフォーマンスが向上します。

### フォーマット

- **Wordpress** コードスタイルでは、空の場合に括弧と中括弧の間にスペースを挿入しないようになりました。例えば `foo()` の場合は、`foo( 1, 2 )`。
- 配列初期化子のキー値ペアが別の行にない場合、これらを整列させない（`php.format.rules.arrayInitializersAlignKeyValuePairs` が有効な場合）。
- 複数行の式での定数の誤ったアウトデントを修正します。

### Apple Silicon

Apple **M1** および **M2** チップ（**Apple Silicon**）のサポートを導入します。`arm64-x64` アーキテクチャを持つこれらのCPUは、以前のリリースでは完全にサポートされておらず、これらのアーキテクチャ向けの言語サーバーを提供できることを嬉しく思います。

## 1.25.11652 (2022年12月21日)




### PHP 8.2

組み込みのIntelliSenseが更新され、最新のPHP 8.2クラス、関数、定数、ドキュメントがすべての利用可能な言語で提供されるようになりました ([#215](https://github.com/DEVSENSE/phptools-docs/issues/215))。

PHP 8.2の一環として、新しい`Random`拡張子の統合マルチランゲージドキュメントを追加しました。

### フォーマット

よく受けるフィードバックの一つは、フォーマットが時々遅いというものでした。これに対処し、今でははるかに良くなったはずです。ただし、速くないケースがあればお知らせください。

**Wordpress**コードスタイルを導入できたことを嬉しく思います。`php.format.codestyle`を`wordpress`に設定するだけです。ただし、まだ実装すべきルールがいくつかありますが、ほぼ準備が整っています。

このリリースでは、混在したhtml/css/js/phpのコードフォーマットにも焦点を当てています。htmlコードのインデントがphpコードに影響を与え、その逆もまた然りという点でこれは難しい問題です [#171](https://github.com/DEVSENSE/phptools-docs/issues/171)。これで正しく動作するはずなので、フォーマットされた際に、**Wordpressテンプレート**が良く見えることを願っています。

### 修正

- 初回のフォーマット要求では、VSCodeを初めて起動した直後に、phpコードのみがフォーマットされました。
- html内にphpタグがある場合でも、HTML対応タグがハイライトされるべきです。[#172](https://github.com/DEVSENSE/phptools-docs/issues/172)
- 末尾のカンマを伴う関数引数リストの折り返しがフォーマッターを停止させました。
- ネームスペースの逆スラッシュを前に付けた関数呼び出しのインデントが不正確でした。
- Javascript内のphpコードに不要なスペースが挿入される問題。 [#222](https://github.com/DEVSENSE/phptools-docs/issues/222)
- フォーマット時、phpコードのインデントがオープンタグの位置によって誤っている場合がありました。フォーマッターは正しくするために2回目のパスが必要でした。
- コード診断の修正:
  - 特定の場合に`parent::`が静的呼び出しとして報告されなかった。
  - ネストされた矢印関数内のローカル変数が初期化されていないと報告されない。
  - Doc Commentがなければ、基底クラスから`@param`型を継承。
  - 古い`@param`構文のサポートを削除 [#740](https://community.devsense.com/d/740)。
  - ネストされた二項式の制御フロー分析を修正。
  - 代替のDoc Comment配列構文、例えば`(int|string)[]`のサポートを追加。
  - より複雑な一般型継承の型解析を修正。
  - 一般的な`IteratorAggregate<TValue>`のサポートを追加。
  - 一般型がツールチップで正しく伝播され、置換される。

## 1.25.11537 (2022年12月11日)




### ホバーツールチップの改善

新しく、マウスホバーツールチップは**パラメータの説明**を表示します。この動作は、設定 `"php.hover.parameters"` を使って変更できます。

マウスホバーツールチップのドキュメントリンクは、新しい設定 `"php.hover.documentation"` を使用して有効または無効にできます。

### ジェネリクス

テンプレート型の推論と置換は、より複雑な型階層を扱うように改善されました。（[#723](https://community.devsense.com/d/723), [#733](https://community.devsense.com/d/733), [#731](https://community.devsense.com/d/731)）

### 修正

- 生成された**ドックコメント**は `yield` を尊重し、関数に `Generator` 型ヒントを正しく注釈します。さらに、コード診断は `Generator` を返す関数を尊重し、戻り値の型を正しく分析します。

- `'enum'` キーワードはPHP自体の小さなハックです。PHP 5, 7, 8, 8.1以降を正しく尊重するように解析方法を修正しました（[#205](https://github.com/DEVSENSE/phptools-docs/issues/205)）。

- 自動関数オーバーライド生成時に括弧 `()` のオートコンプリートが一度だけ挿入されます（[#730](https://community.devsense.com/d/730)）。

- _定義に移動_ が修正されました。

### フォーマッティング

#### 新しいカスタマイズ設定

約束した通り、皆さんのフィードバックに基づいて、より多くのフォーマッティングオプションを追加しています。

|設定|説明|
|---|---|
|`php.format.rules.spaceBeforeParenthesesInArrowFunctions`|アロー関数の括弧の前のスペース|
|`php.format.rules.spaceAroundConcatenation`|連結 `.` の周囲のスペース|
|`php.format.rules.spaceAfterUnaryNot`|単項否定 `!` の後のスペース|
|`php.format.rules.groupUseWrap`|グループuseの折り返し動作を定義|
|`php.format.rules.groupUseNewLineBeforeFirstDeclaration`|最初のグループuse宣言前に新しい行を配置|

#### `foreach`

`foreach` 文のヘッダーを、デフォルトで1行にまとめています（`PSR-12`で定義されている通り）。

```php
<?php 
foreach ($iterable as $key => $value) {
}
```

#### `PSR-12`

`PSR-12` のコードスタイルを若干改善しました。現在、標準で指定されたように、マルチラインのグループuse宣言を自動で折り返します。

```php
<?php
use Vendor\Package\SomeNamespace\{
    SubnamespaceOne\ClassA,
    SubnamespaceOne\ClassB,
    SubnamespaceTwo\ClassY,
    ClassZ,
};
```

#### 修正

- 匿名クラスのimplementsリストが複数行で定義されたとき、正しくインデントされていませんでした
- 匿名クラスにも適用可能なimplementsリストの折り返し設定

## 1.24.11420 (2022年12月1日)



### 配列シェイプ

エディタは、Doc Comments内で指定されたインライン配列シェイプを今後扱います。以下の構文は正しく、PHPエディタによって理解されます:

```php
<?php

/**
 * @param array{ name: string, id: int, data: \App\Model\User } $a The entity.
 */
function foo($a) { .. }
```

配列シェイプは、配列のキーに対するコード補完を提供し、指定されたインデックスに基づいて配列アイテムの型を解決するため、コード補完と推論された型が向上します。

### IntelliSense の改善

**括弧の補完**

IntelliSenseが新たに関数を補完するときに括弧を補完します。キーボードカーソルは括弧の間に配置されます。オプションとして、この機能を無効にすることも、関数の完全なシグネチャをスニペットとして補完することもできます。これにより、`[tab]`キーでパラメータ間を移動し、引数を埋めることができます。

この機能は設定`"php.completion.parameters"`を通じて構成可能です。デフォルトでは`"parentheses"`に設定されており、括弧`()`のみを補完します。

![php complete parentheses](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vsc-complete-parentheses.gif)

**Xdebug スタブ**

**Xdebug** 拡張のスタブを追加しました。設定に移動し、`"xdebug"`を`"php.stubs"`設定に追加してください:

```json
{ "php.stubs": ["*", "xdebug"] }
```

これにより、_Xdebug_ 関数がIntelliSense、コード診断に追加され、型推論分析が向上します。

**非推奨メッセージ**

非推奨のシンボルが使用されると、そのシンボルが取り消し線で表記され、対応する警告が表示されます。さらに今回のリリースで、コード補完ツールチップに非推奨メッセージを追加しています。

![php deprecation message](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vsc-deprecated-message.png)

注意: 関数を非推奨としてマークするには、以下のように`@deprecated` ドックコメントタグを追加してください:

```php
/** @deprecated この関数はバージョン1.2.3以降維持されていないため、使用しないでください！ */
function getEntity(array $row) : object { ... }
```

### カスタマイズ可能なフォーマッタ

多くの企業は、事前定義されたコードスタイルとは異なるソースコードを作成するときのコーディングガイドラインを持っています。非常にカスタマイズ可能なフォーマッタを導入し、およそ30の異なるコードフォーマットオプションから始めています。これは始まりに過ぎず、次に優先するオプションの提案を受け付けています。

これらのより詳細なコードフォーマットオプションは`PREMIUM`ユーザーのみが利用可能ですが、Communityバージョンユーザーは`php.format.codestyle`オプションでフォーマットに影響を与えられます。

例えば、`php.format.rules.arrayInitializersAlignKeyValuePairs`オプションで配列初期化子のキーと値のペアを自動的に揃えるようフォーマッタに指示できます[#692](https://community.devsense.com/d/692-sug-formatting-add-auto-align-option)。

```php
$x = [
    1    => 'foo',
    1234 => 'bar'
];
```

また、あなたの会社が`Whitesmiths`スタイルを好む場合は、`php.format.codestyle`を`allman`に設定し、`php.format.rules.indentBraces`を`true`に設定することで、それをセットアップできます[#689](https://community.devsense.com/d/689-whitesmiths-style-sometimes-termed-wishart-style)。

```php
function foo()
    {
    echo "Hello";
    }
```

一般に`php.format.rules.*`設定を使用してフォーマッタが希望通りに動作するように構成してください。フォーマットオプションの詳細リストについては、設定エディタ（`Ctrl+,`）を開いて検索バーに`php format`と入力するか、弊社の[ドキュメントページ](https://docs.devsense.com/vscode/editor/customize-formatting)をご覧ください。

### タイプ時のフォーマット

タイプ時のフォーマットがどのように動作するかを再実装しました。これにより、編集しているコードの部分を正確に把握し、`;`や`}`を入力したときにフォーマットします。この方法で、コードは常に正しくフォーマットされ、フォーマットコマンドを明示的に呼び出す必要がありません。

この機能を有効にすることをお勧めします。デフォルトではVS Codeで無効になっています。

PHP用にだけ有効にしたい場合は、`settings.json`で次のように設定できます:

```json
"[php]": {
  "editor.formatOnType": true
}
```

### フォーマット修正

- 複数のパラメータを持つ関数で、`func_get_args`や`funct_num_args`をボディに含むとフォーマッタが停止していた。
- 複数行のuseトレイトが二重にインデントされていた。
- 特定のステートメントヘッダにネストされたラムダ関数のインデント修正。
- チェーンメソッド呼び出しの連続において、チェーンの一部がフィールドである場合のインデントを修正しました。[#715](https://community.devsense.com/d/715-if-expression-without-braces-indents)
- 複数行にわたる静的メソッド呼び出しの引数を正しくインデントします。
- 静的フィールドや定数を含む複数行フィールドの使用のインデントを修正しました。
- Nullセーフ演算子がサポートされます。
- 属性がサポートされます。

### IntelliSenseの修正

**制御フロー**

戻らない関数（つまり、戻り値の代わりに例外をスローする）の場合の制御フロー分析を修正しました。これにより、到達不能なコードに関する偽警告が修正され、対応する変数の型推論も修正されました。

**ラムダ`use ()`における末尾カンマ**

ラムダ宣言内でのサポートされていない末尾カンマの問題を修正しました([#207](https://github.com/DEVSENSE/phptools-docs/issues/207))。

**Blade**

`.blade.php`ファイル内の`@can`、`@endcan`、`@forelse`、および`@empty`の使用を修正しました。

**`"php.stubs"`**

設定項目 `"php.stubs"` が修正されました。ワークスペースをリロードした後に動作しませんでした。

## 1.23.11234 (2022年11月10日)




### `"envfile"`オプションを含む`launch.json`

新たに、組み込みのPHPサーバーで使用する`.env`ファイルを指定できるようになりました。これは特に**Laravel**アプリケーションを開発する際に重要です！以下のような起動構成例になります。

```json
{
    "name": "Start Built-in Server with .env",
    "type": "php",
    "request": "launch",
    "runtimeArgs": ["-S", "localhost:8888", "-t", "public"],
    "envfile": ".env"
}
```

### ドックコメントジェネレーター

生成されるPHPドックが改善されました。可能であれば、プロパティやクラス定数の上に`@var`を指定します。さらに、関数が**決して**値を返さないと認識された場合、戻り値の型を`@return never`として注釈します（[#193](https://github.com/DEVSENSE/phptools-docs/issues/193)）。

### クイックフィックス

ゲッターとセッターのクイックフィックスは、`PSR-12`に従うようになりました。さらに、正しい形式で型ヒントを指定します。

`__construct()`の生成に対するクイックフィックス（[#198](https://github.com/DEVSENSE/phptools-docs/issues/198)）は、正しい形式でドックコメントを生成するようになりました。生成された関数もPSR-12に準拠しています。

さらに、インターフェースの実装に対するクイックフィックスも更新され、PSR-12に従い、型名を正しく生成します。

### PHP 8.2

残りのPHP 8.2の機能がPHPエディターでサポートされています。

- コード補完で特別な属性`#[SensitiveParameter]`が新たに含まれています。
- また、定数表現において`enum`のケース値が使用可能になっています。RFCに指定されています。

### フォーマット

#### `PSR-12`

このバージョンでは、`PSR-12`コードスタイルの新しいルールをいくつか導入しています。特に、複数行に渡る制御文ヘッダーのフォーマット方法をフォーマッターに指示します。

例：
```php
for ($i = 0; $i < 10; $i++
    ) {
    // for body
}
```

次のようにフォーマットされます：

```php
for (
    $i = 0;
    $i < 10;
    $i++
) {
    // for body
}
```

同様に、`implements`のリストが複数行に分かれる場合、最初のアイテムを次の行に、各インターフェースを別々の行に配置します。

関数またはメソッド呼び出しを折り返す際に、どのような引数が使用されているかを考慮します。配列やラムダ関数のように、単一の引数が複数行に渡る場合、引数リストを折り返す理由として考慮しません。（この動作は[PSR12の仕様](https://www.php-fig.org/psr/psr-12/#47-method-and-function-calls)に従っています）

```php
<?php

somefunction($foo, $bar, [
  // ...
], $baz);

$app->get('/hello/{name}', function ($name) use ($app) {
    return 'Hello ' . $app->escape($name);
});
```

#### 選択範囲のフォーマット

選択範囲のフォーマットの動作を改善しました。これにより、`editor.formatOnType`と`editor.formatOnPaste`が有効な場合に影響します。

#### 修正

JavaScriptフォーマッターがPHPコードにスペースを追加する問題を修正しました（[#203](https://github.com/DEVSENSE/phptools-docs/issues/203)）。
また、HTMLフォーマッターがPHPコードの内容を編集する問題も修正しました。これは主に`editor.formatOnPaste`オプションが有効な場合に発生しました。

その他、いくつかのフォーマット問題を解決しました：
  - コンストラクタの閉じカッコ`)`が、ステートメントが複数行の場合に正しくインデントされていなかった問題を修正。
  - 特定のケースでコメントが誤ったインデントになっていた問題を修正。
  - 単一行のメソッド呼び出しは折り返すべきではありません。 [#693](https://community.devsense.com/d/693-sug-formatting-don-t-wrap-when-there-is-no-data-in-brackets)
  - 本文に`func_get_args`や`funct_num_args`が含まれる関数がフォーマッターを停止させていた問題を修正。 [#691](https://community.devsense.com/d/691-bug-formatting-not-working-when-there-are-specific-functions)
  - `*`で始まるマルチラインコメントのみインデントを+1。
  - 配列初期化子の後に不要な新しい行が追加されていた問題。
  - ラムダが包含要素を折り返していた場合、改行されない問題を修正。
  - コンストラクタが複数行配列にあった場合の二重インデントを修正。
  - 複数のラムダを含む配列のインデントのバグ。 [#702](https://community.devsense.com/d/702-code-format-array-with-multiple-anonymous-functions)
  - 括弧付きの式がインデントされませんでした。 [#700](https://community.devsense.com/d/700-code-format-if-condition-with-braces)
  - マルチラインの`use`トレイト文が正しくインデントされるようになりました。
  - オプションの戻り値型の後の新しい行が折り返されていた問題を特定のケースで修正しました。 [#704](https://community.devsense.com/d/704-code-format-abstract-function)

## 1.22.11089 (2022年10月31日)



### PSR-12 フォーマット

**PSR-12** コードスタイルの導入を発表できることを嬉しく思います。前回のリリースでは、PSR-12 準拠のフォーマッタに必要な重要なルールをほぼすべて網羅しました。まだ改善すべき小さな点がありますが、ほぼ完成です。また、デフォルトのフォーマットコードスタイルを古い PSR-2 から PSR-12 に切り替えました。

![PSR-12 code style](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/psr-12.png)

準拠するために次のルールを追加しました：
 - `catch (OtherThrowableType | AnotherThrowableType $e)` の例外タイプ間のスペースを追加
 - 関数宣言ヘッダーの空白をコンパクト化し、戻り値の型を `)` 括弧と同じ行に配置

`PSR-12` に準拠することは重要ですが、フォーマット後のコードの見た目も重要です。美しさの面でも引き続き取り組んでいます。このリリースで行ったことのひとつは、配列イニシャライザの扱いです。配列内のどこかに改行がある場合、すべての配列要素を新しい行に移動し、インデントします。[#683](https://community.devsense.com/d/683-code-format-array-new-line)。

![Array initializer](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/array_initializers.gif)

同様に、呼び出しパラメータや関数/メソッド宣言でも類似の動作を適用しますが、これは `PSR-12` コードスタイルにのみ適用されます。

また、いくつかの軽微なフォーマットの問題を修正しました。

### Composer の改善

`create-project` コマンドが更新されました。新しいプロジェクトの作成場所が明確でない場合、Open Folder ダイアログを開くようになりました。最後に、新しく作成したプロジェクトを VS Code で開きます。

### 新しいコード診断

新たに、インターフェース内のプロパティの無効な宣言が報告されます。([#174](https://github.com/DEVSENSE/phptools-docs/issues/174))

また、コード分析はデフォルトの **Laravel** クラスエイリアスを処理します。これにより IntelliSense に影響を与え、誤ったコード警告を回避します。

下記の **修正** セクションをご覧ください。

### 修正

コード診断は型の変換 (`int` -> `float` の `for` ループ内での型変換) に関して厳しくなくなり、配列要素の型推論も改善されました（[#185](https://github.com/DEVSENSE/phptools-docs/issues/185)）。

次に、可変引数を `func_get_args()` を使用している関数のコード診断を修正しました。 ([#677](https://community.devsense.com/d/677-problem-with-func-get-args-and-phpdoc/5))

また、composer パッケージが削除または更新された後、問題や IntelliSense が更新されない問題もありましたが、これを回避するための変更を行い、すべてがシームレスに更新されるようになりました。 ([#182](https://github.com/DEVSENSE/phptools-docs/issues/182))

## 1.21.10985 (2022年10月23日)



### 関数パラメータ上の`@var`

エディターは関数パラメータの定義直上のドキュメンタリーブロックを処理します。型指定を伴う`@var`がある場合、IntelliSense、ツールチップ、およびコード診断全体でパラメータの型として使用されます。

```php
class MyClass {
    function __construct(
        /** @var T[] */
        public readonly $list, // $listはT[]型です
    ) { }
}
```

### フォーマット

見た目は重要です。そのため、私たちはそれを美しくする努力を続けています：

 - プロパティへのアクセスやメソッド呼び出し時、マルチライン式でインデントレベルが増加します [#530](https://community.devsense.com/d/530-formatting-keep-braces-in-the-same-line/18)
 - すべてのコードスタイルでPHPタグ内のコードをインデントしています。[#173](https://github.com/DEVSENSE/phptools-docs/issues/173)
 - HTMLがPHPと組み合わされた場合に予期しない新しい行が挿入されていました [#173](https://github.com/DEVSENSE/phptools-docs/issues/173#issuecomment-1280021048)
 - PHP終了タグ`?>`は、前の`<?php`開始タグに従ってインデントされます

### 改善点

#### PHPUnitテストビュー

このアップデートでは、_テストビュー_ パネルでのPHPUnitテストの解決を改善しました。テストファイルの処理がより高速になり、ディスクからの冗長な読み取りと解析を避けます。また、テストビューは継承クラスからのテストをサポートするようになりました（[#678](https://community.devsense.com/d/678-phpunit-test-explorer-ignores-tests-inside-abstract-parent-testcase-class)）。

## 1.20.10937 (2022年10月19日)



### エディターの改善

#### 制御構造のハイライト

制御構造とそれに対応するキーワードのハイライトが追加されました。今後は、カーソルを制御構造上に移動させると、エディターが `for`、`foreach`、`while`、`do` などの制御構造を、対応する `continue` や `break` と共にハイライトします。また、関数内のすべての `return`、`case`、および `default` ラベルもハイライトされます。

また、一致するペアの `switch`/`endswitch`、`if`/`elseif`/`endif`、`try`/`catch`/`finally` などもハイライトされます。

![highlight if/elseif/endif](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/highlight-control-structure.png)

#### ワークスペース内のシンボルのファジー検索

ワークスペース内の検索はファジークエリをサポートしています。つまり、シンボル名がクエリ内の文字に一致します。さらに、大文字を使用して検索する場合は大文字小文字が区別され、キャメルケース記法を迅速に検索できます。

![fuzzy search symbols in worksspace](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/fuzzy-search.gif)

#### フォーマット

より多くのケースに対応してフォーマットサポートを改良しています。

- キャスト演算子がスペースで分けられるようになりました。([#175](https://github.com/DEVSENSE/phptools-docs/issues/175))
- コンストラクタのプロパティ昇格が正しくフォーマットされます。[#176](https://github.com/DEVSENSE/phptools-docs/issues/176)
- 特定のケースで `::class` の後に不要なスペースが追加されました。[#530](https://community.devsense.com/d/530-formatting-keep-braces-in-the-same-line/26)
- `else` または `elseif` がステートメントの後に続くときには新しい行に配置されます。[#530](https://community.devsense.com/d/530-formatting-keep-braces-in-the-same-line/25)
- 参照型が、三項演算子の一部である場合、`?` からスペース1つで分けられます。[#530](https://community.devsense.com/d/530-formatting-keep-braces-in-the-same-line/19)

### 診断の改善

#### 新設定 `"php.problems.scope": "opened"`

新たにエディターで開かれているPHPファイルのみを診断可能になりました。なお、パースエラーはワークスペース全体で報告されます。

設定 `"php.problems.scope": "opened"` を設定して、どのように動作するか確認してください。

#### 引数の多すぎるチェック

`func_get_args`、`func_get_arg`、または `func_num_args` の使用をチェックし、可変数の引数を持つ関数が検出されると、_too_many_args_ 警告は報告されなくなります。

## 1.19.10893 (2022年10月16日)



### 新しいフォーマッタ

組み込みPHPコードフォーマッタを再設計して更新しました。設定 `"php.format.codeStyle"` を通じていくつかの新しいフォーマットスタイルを提供します。

#### **`Allman`**

`Allman` スタイルは、Eric Allmanにちなんで名付けられています。このスタイルは中括弧を次の行に置きます。これはすべての制御文および宣言に適用されます。

```php
while ($x == $y)
{
    foo();
}
```

#### **`K&R`**

`K&R` スタイル（Kernighan & Ritchie Style）は、制御構造、型、関数およびメソッドのために中括弧を同じ行に保持します。

```php
while ($x == $y) {
    foo();
}
```

引き続き以前にサポートされていたコードスタイルを使用できます：

- `"PSR-2"` スタイル、
- `"PHP Tools"` と呼ばれるVisual Studioに似たスタイル、
- および `"Off"`、

フォーマッタはHTML/JS/CSSと連携し、範囲をフォーマットし、ドキュメント全体をフォーマットし、コードブロックまたはステートメントを閉じた後にタイプ時にフォーマットを行います。

![Formatting multi-line expression](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/format-document.gif)

#### フォーマットの修正

以下は修正および実装したフォーマットの問題のリストです：

- アロー関数のフォーマットの修正。
- ネストされた関数呼び出しをフォーマットがサポート。
- 列挙のフォーマットの修正。
- `match` 式に関連するフォーマットの修正。
- *Heredoc* および *Nowdoc* 式はフォーマット中に変更されません。
- グループ化された `use` 文を正しくインデント。
- 複数行の制御文のヘッダーをインデント。
- ラムダ内の複数行の式がインデントされます。
- コメント付きの空のブロックがインデントされます。
- グループ化された `use` 文および `match` 式はオプションの末尾のカンマを尊重します。
- 関数パラメータをフォーマットする際の型とアンパサンド `type &$x` の間のスペース。
- コメント付きの空のブロックをインデント。
- 匿名型内の複数行の式がインデントされます。
- 複数行の関数およびメソッド呼び出しが正しくインデントされます。
- 新しい行に関数またはメソッドヘッダーのカッコがある場合はインデントされません。
- ラムダ式の後の不正な改行の修正。
- シングルラインPHPブロックをフォーマットが残します。
- 終了タグは常に前のトークンから分離されます。
- 関数の名前付き引数がフォーマットされます。
- 匿名クラスは、クラスヘッダーと同じ行に保持されている場合、 `{` の前にスペースがあります。
- HTML属性内のPHPコードのフォーマットの修正（例: `<div style="<?php echo "something" ?>">`）。フォーマッタはこれ以上追加の空白を追加しません。

### To-Doコメントのハイライト

新しくエディターがコード内のTo-Do注釈をハイライトします。これにより、未完成の作業や保留中の問題を追跡するのに役立ちます。

![highlight todo](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/highlight-todo.png)

以下の設定を使用してスタイルをカスタマイズできます：

```json
"php.highlight-todo.style" : {
    "backgroundColor": "#ec0"
}
```

または、設定 `"php.highlight-todo.enable": false` を使用して機能を完全にオフにすることもできます。

### デバッガーのコード補完

デバッグ中に、_デバッグコンソール_ に入力すると、既存のローカル変数の名前が提案されます。`$` または補完ショートカット（デフォルトでは `Ctrl`+`Space`）を入力すると、利用可能なローカル変数が提案されます。

![debugger code completion](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vsc-debug-completion.gif)

### 新しい診断

エディターは以下の診断をチェックおよび報告します：

- インスタンスメソッドを静的に呼び出すこと。([#641](https://community.devsense.com/d/641-static-call-to-instance-method-not-detected))
- 型プロパティへの無効な代入。([#647](https://community.devsense.com/d/647-assigning-wrong-types-is-not-detected))
- 関数呼び出しに提供された引数が多すぎる。([#645](https://community.devsense.com/d/645-wrong-number-of-function-call-arguments-not-detected))
- 定数にオブジェクトを使用でき、`@var` を伴う Doc Comment を `const` の上で扱います。

### 新しい設定

新しい設定 `"php.problems.excludeGitIgnore"` ([#169](https://github.com/DEVSENSE/phptools-docs/issues/169)) を追加しました。これは、ワークスペースの `.gitignore` に指定されたファイル/フォルダー内のコード診断を無視することをシンプルにします。

### 修正

- `__construct()` を生成するためのコードアクションは、テキストエディタのタブとスペース設定を尊重します。
- Doc Comment (`/**`) の生成がインデントを尊重します。
- 関数の上にDoc Commentを生成することが、カスタマイズされたDoc Commentスニペット（`php.docblock.functionSnippet`設定）を尊重します。
- Composerパッケージ追加後にIntelliSenseが更新されないいくつかのケースを修正しました。

## 1.18.10692 (2022年9月30日)




### プロファイラーサポート 🔥

PHPコードのプロファイリングにより、コード内の各関数に対してどれだけの時間と呼び出しが行われたかを確認できます。

[詳細はこちら (docs.devsense.com) ...](https://docs.devsense.com/vscode/profiling)

**Xdebugプロファイリングのサポートを追加しました！** Xdebugプロファイルファイル（cachegrind形式）は開いて表示し、検査することができます。拡張機能はまた、プロファイリング結果に基づいてコード内のホットパスを強調表示します。

**呼び出し時間ビュー:**

![php call times view](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/profile-calltimes.png)

**呼び出し元/呼び出し先ビュー**

呼び出し元と呼び出し先の詳細ビュー、時間を含む。

![php callers callees](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/profile-details.png)

**ホットパスデコレーション**

プロファイリング結果ファイルが分析され、ソースコード内でホットパスが強調表示されます：

![profiling hot path decoration](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/profile-highlight.png)

### コード診断の更新

- アロー関数内で使用される変数は、もう未初期化として報告されません ([#664](https://community.devsense.com/d/664-bug-when-use-use-keyword-inside-arrow-function-inside-anonymous-function))。
- 診断 `PHP1408` および `PHP1409` は、今後より低い深刻度で報告されます。

### Open-VSX

拡張機能全体が [open-vsx.org](https://open-vsx.org/extension/devsense/phptools-vscode) で利用可能になりました。

### その他の改善

- 自動インポートされた 'use' がソートされます ([#666](https://community.devsense.com/d/666-auto-import-alphabetically))。
- HTMLコードのフォーマット修正。
- コンストラクタープロパティプロモーションのフォーマット修正。

## 1.17.10641 (2022年9月26日)




### **新機能**を紹介

多くの有用な機能リクエストやフィードバックをいただいており、できるだけ多くの改善を追加するよう努めています。その一環として、新しい内容を簡単に知らせる機能が加わりました。このリリースでは、主要な更新と共に**What's New**ウィンドウを表示し始めました。

ウィンドウはコマンド `"PHP Tools: Release Notes"` で手動で開くことができます。各主要アップデート後に自動で開く機能は、ウィンドウの下部にあるチェックボックスで無効にすることができます。

  ![release notes command](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vsc-open-releasenotes.png)

### デバッグ

デバッグにはいくつかの便利な機能があります！プロファイリングを有効にするための設定が追加され、`var_dump()` はより見やすく詳細なメッセージを生成し、PHP のための Xdebug はデバッグ開始時に判別されます。

#### デバッグ `develop` モード

このリリース以降、`develop` Xdebug モードを有効にしました。これにより、`var_dump()` 出力がより見やすく情報豊富になります。

通常の`var_dump()`メッセージを好む場合は、`launch.json` プロファイルの `"noDevelop"` 設定を変更してください。

#### デバッグ `profile` モード

`profile` モードを今すぐ有効にすることができます。`launch.json` プロファイルで `"profile": true` 設定を行ってください:

```json
{
    "name": "Launch & Profile built-in Server",
    "type": "php",
    "request": "launch",
    "runtimeArgs": ["-S", "localhost:8000", "-t", "."],
    "noDebug": true, // <-- デバッグを開始しない
    "profile": true // <-- xdebug.mode "profile" を有効にする
}
```

#### キャッチされない例外フィルタ

新たに、デバッグビューでは**キャッチされない例外**を停止するか無視するかのオプションを提供しています。このオプションは「デバッグと実行」ビューの「ブレークポイント」パネルにあります。

### コード診断

- `enum` のケース値に対する重複キーの検査を修正しました。([#658](https://community.devsense.com/d/658-problem-with-enums-as-keys))
- `void` の戻り値型ヒントの際の戻り値型チェックを修正しました。
- 未使用の`use`変数を持つ無名関数を報告します。
- 無名関数の`use`変数が初期化されていないことを報告します。
- 空の名前空間を報告します。
- `void` を返す関数からの値が使用されていることを確認します。
- `void` 上でのプロパティへのアクセスを報告します。
- 文字列補間内の式が`string`に変換可能であることをチェックします。
- プロパティの型が定義されていることをチェックします。
- ユーザーがワークスペースやフォルダーを開かずに単一のファイルを開いている場合、未知のクラスや関数の診断が抑制されます。
- 診断 `0412` の重大度は*エラー*に、コード `1412`（未割り当ての変数使用）に変更されました。

### Composer

オールインワンの**Composer**統合が追加されました！パッケージの要求、削除、閲覧のための有用なコマンドを実装し、`composer.phar`を自動的にインストールするので手間がかかりません。また、`composer.json`のためのインテリセンス、スクリプト実行のためのコードレンズ、インストールされたパッケージに対するわかりやすいツールチップ、放棄されたパッケージのチェックなども提供します！

### その他の改善点

PHP フォーマッタに修正があります。`(integer)`、`(boolean)`、または `(real)`のようなあまり一般的でないデータ型のエイリアスと共に明示的キャストが使用されたときに、フォーマットが実行されない問題が修正されました。

## 1.15.10535 (2022年9月14日)




### コマンド `PHP: Search todo ...`

PHPコード内のすべてのToDoコメントを素早く閲覧する方法を導入しました。コマンド `"PHP: Search todo ..."` は、すべてのToDoを含むクイックピックを開きます。選択したアイテムをフィルタリング、検索、ナビゲートすることができます。

  ![searching to-do in PHP code](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vsc-search-todo.gif)

### ツールチップがより良くなる

関数のシグネチャのホバーチップが長すぎる場合、複数行に分割されます。また、オプションのパラメーターはもう `[` `]` で示されません。([#159](https://github.com/DEVSENSE/phptools-docs/issues/159))

  ![long function tool-tip](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vsc-long-tooltip.png)

さらに、コードコメント内の安全なHTMLタグがツールチップで適切にレンダリングされるようになりました。ドキュメントコメント内に `<br/>`、 `<b>`、 `<i>`、 `<ul>`、 `<li>`、 `<code>` といったタグを含めることが許可され、ツールチップで表示されるときには、きちんとレンダリングされフォーマットされます。

  ![html tool-tip](https://raw.githubusercontent.com/DEVSENSE/phptools-docs/master/docs/vscode/imgs/vsc-html-tooltip.png)

### コード診断

さらに多くの診断を追加し、コードフロー分析の珍しいケースをいくつか修正しました。

- 許可されていないスコープの外で `break` または `continue` を使用した場合の無効な使用 `break;` に対する診断があります。
- `try`/`finally` に関するコード到達可能性の診断が修正されました。
- 型ヒント `mixed` があるのに関数が何も返さない場合の関数の戻り値の診断が改善されました。

### その他の改善

内部例外の修正や、いくつかのパフォーマンスおよびメモリ使用の最適化があります。

## 1.14.10471 (2022年9月7日)



- 新しい `"php"` **タスク定義**; 現在設定されている "php" 実行ファイルを使用して、PHPスクリプトを実行するVS Codeタスクを定義できます:
  ```json
  // .vscode/tasks.json
  {
      "type": "php",
      "file": "${workspaceFolder}/script1.php",
      "args": ["argument"]
  }
  ```
- **設定** `"phpunit.preTask"` と `"phpunit.postTask"` は、テストの前後に実行される `tasks.json` からタスクまたはタスクリストを指定することができます ([#154](https://github.com/DEVSENSE/phptools-docs/issues/154#issuecomment-1207248667))。
  - `phpunit.preTask` と `phpunit.postTask` 内で実行されるタスクは、`${command:phpunit.filter}` または `${command:phpunit.testsuite}` 変数を使用できます
- `/**` を入力することによって生成される DocComments (_PHPDoc_) をカスタマイズするための**設定**
- **診断**:
  - 重複したフィールド宣言が報告されました
  - 重複したクラス定数宣言が報告されました
  - 対応する `__get`/`__set`、または `@property` アノテーションがない場合、動的プロパティが報告されました
  - foreach 制御変数は DocBlock で注釈を付けることができます
- **IntelliSense**: PHP 8 `Attribute` クラス宣言がそのメンバーと共に更新されました
- **getter/setter** コードアクションは `static` プロパティを考慮します

## 1.13.10390 (2022年8月30日)



- 貼り付け時のフォーマットを修正

## 1.13.10378 (2022年8月29日)



- HTML/CSS/JSエディタ機能の修正
- PHPファイルでのHTML/CSS/JSフォーマットが有効化
- フォーマットが後続のコードを壊す問題の修正 ([#156](https://github.com/DEVSENSE/phptools-docs/issues/156))

## 1.13.10301 (2022年8月16日)



- **PHP 8.2** 読み取り専用クラスをサポート。
- 一部の **PHP 8.2** 互換性チェック。
- _定義へ移動_ コマンドが `include`/`require` 対象ファイルに移動します。
- 擬似定数のツールチップに正しい値を表示。
- スペースキー（`space` を押す）を `new`、`use`、`extends`、または `implements` の後に押すとコード補完をトリガーします。
- 非標準の Doc Block タイプ名がサポートされます（[#622](https://community.devsense.com/d/622-nonstandard-external-library-docblocks)）。

## 1.13.10239 (2022年8月11日)



- 未知プロパティに対するコード診断 (`PHP0416`)
  - 未知プロパティに対するクイック修正（小さなタイプミスと大文字小文字の違いを修正）
  - `stdClass` および `__get()` マジックメソッドを持つクラスは無視される（[PHP 8.2 RFC](https://wiki.php.net/rfc/deprecate_dynamic_properties)で指定されているように）
- 自動インポート (FQN) は競合名の作成を回避
- `extends` の後のコード補完は、含まれるクラス自体を提案することを回避
- プロパティ名の大文字小文字の違いのチェックを修正

## 1.12.10140 (2022年8月4日)



- `Go to Type Definition`コマンドが追加されました。`new` 式における `__construct` の代わりに型定義に移動します。
- PHPUnitビュー: 失敗したテストの場所の追跡を修正しました（[#150](https://github.com/DEVSENSE/phptools-docs/issues/150#issuecomment-1192046307)）

## 1.12.10040 (2022年7月26日)



- IntelliSenseに含まれる追加のディレクトリを指定できる`php.workspace.includePath`設定。
- ワークスペースの読み込みを改善し、ファイルをより効率的に並行処理。

## 1.12.10022 (2022年7月25日)



- アクティベーションの修正

## 1.12.9985 (2022年7月20日)



- **PHPUnit テスト統合**
  - PHPUnit テスト用の新しい UI
  - **インラインで失敗メッセージを表示**
  - 新しい UI を使用して PHPUnit テストを**デバッグ**
  - 期待値と実際の値の**差分**
  - 拡張機能のサイズを縮小
  - 古い `ms-vscode.test-adapter-converter` への依存を回避 **（アンインストール可能）**
  - 古い `hbenl.vscode-test-explorer` への依存を回避 **（アンインストール可能）**
- 拡張機能の読み込みを最適化し、インストールパッケージを縮小
- 型ヒントに基づいて新しいパラメーター名を提案
- 新しく生成された Doc Comment にユニオン型を適切に挿入（関数の上で `/**` を入力する際）
- 生成された Doc Comment はスローされる例外を注釈（`@throws` PHPDoc タグ）
- 外部変更を処理し、composer パッケージのインストール/更新時の再インデックスを修正
- PHPDoc の補完で全クラスを表示し、コミット時に自動的にインポートされる（設定 `php.format.autoimport` に従う）
- **Alpine Linux Arm64** プラットフォームの修正
- さまざまなテキスト（さまざまな組み込み関数と定数の要約）に対する `phpTools.language` 設定の修正
- 未使用の `use` 警告が二重に表示される問題の修正
- Doc コメント内の変数のリファクタリングのリネーム修正
- テンプレートファイルでの `$this` の誤使用を報告しない
- .phpstorm.meta ファイルに記載された関数後の補完を改善
- トレイト内でジェネリック型として注釈されたメソッド後の補完を改善
- Doc Block 内の型名の補完を設定する `php.format.autoimport-docblock` 設定、デフォルトは `"FQN"`

## 1.11.9762 (2022年7月1日)



- `enum` の case の後の補完を修正（補完が表示されない）
- 変数のツールチップの修正、解決された型名が正しく短縮されるように修正

## 1.11.9761 (2022年6月29日)



- エラーを修正 [#147](https://github.com/DEVSENSE/phptools-docs/issues/147)

## 1.10.9721 (2022年6月25日)



- 組み込みの`enum`メンバーを補完する際の言語サーバークラッシュを修正しました。

## 1.10.9716 (2022年6月25日)



- 組み込みの`enum`メソッドとプロパティのIntelliSenseサポート。
- 配列型プロパティの型推論を改善。
- Laravelのリアルタイムファサードが認識され、コード補完でサポート。
- Eloquentのローカルスコープをコード補完にリストアップ。
- 未使用のDoc Commentで使用される場合の未使用`use`のハイライトを修正。
- `@test` Doc Commentで注釈されたテストのためのTest Explorerを修正。

## 1.9.9585 (2022年6月7日)




- `@template` 型を `class-string<T>` 型アノテーションと組み合わせて推測
- 一部の非標準ファイル拡張子を自動的にPHPファイルとして認識するように（*Drupal*上でのコード補完が改善）
- 予約された型名（`self`、`parent`、`static`）の後の補完を修正
- 定数とクラス定数の後の `->` 構文を修正（*PHP 8.1*）
- 式チェーン中の `new` を使用した `->` の後の補完を修正
- PHPバージョン変更を修正

## 1.9.9479 (2022年5月25日)



- マルチコアCPUでのLaravel Facadesの推論を改善
- ドキュメンタリーコメントの処理を改善、phpstanとpsalmのより多くの規約を尊重
- ジェネリック型およびジェネリック`@mixin`型でのコード補完を改善
- 大規模プロジェクトでのクラッシュの可能性を修正 (StackOverflowの修正)
- サードパーティ拡張が無効なLSPプロトコルデータを渡すときの補完問題の可能性を修正
- 多数の同時要求がある場合のブレークポイント処理の問題を修正
- デバッガーの安定性の向上

## 1.9.9277 (2022年4月29日)




- **IntelliSense**
  - **ジェネリクスのサポート**
  - IntelliSenseは特殊な型名を処理します
  - テンプレート型は束縛されたジェネリック引数に対して解決されます
  - ジェネリック型は`new()`に渡されたコンストラクタ引数から推論されます
  - ツールチップはジェネリック引数を表示します
  - IntelliSenseは`@template`引数と拡張されたPHPDoc構文（ジェネリクス、psalm、phpstan）を理解します
  - IntelliSenseはジェネリクスのために使用される特別なPHPDocタグを補完します
  - コード補完は、値が束縛されていない場合、テンプレート`of`型を使用します
  - コード分析はジェネリクスを尊重します
- 更新されたPHP構文パーサー、`instanceof`構文を修正
- composerパッケージのインストール/更新後にIntelliSenseで項目が欠落する問題を修正
- HTML/CSS/JS IntelliSenseの修正
- 外部ファイルの変更後にIntelliSenseで項目を修正
- デフォルトで`zip`と`zlib`を含むスタブ
- サードパーティ拡張のためのAPIを提供

## 1.8.8970 (2022年3月23日)



- 欠落している `MYSQLI_` 定数を追加
- PHPUnit ランナーを修正; 正しい `phpunit` PHP スクリプトを解決
- 空行とインデントを含む HEREDOC および NEWDOC 構文の処理を修正
- PHP 8の `readonly` 修飾子をコンストラクタのプロパティに許可するようにパーサーを修正
- `phpTools.language` 設定を修正し、PHP マニュアルが適切にローカライズされる
- 未使用の `use` チェックが `@Method` PHPDoc タグを尊重
- PHP 実行ファイルと関連する PHP 情報の解決中のフリーズを修正
- `php.linkedEditing.variables`: ローカル変数のリンク編集を有効にする設定（デフォルトは `false`、`editor.linkedEditing` を有効にする必要あり）
- `editor.linkedEditing`: 変数名全体が削除されたときに不適切な編集を回避
- `editor.linkedEditing`: 削除後もリンクされた変数名を保持
- デバッガーはIPv4とIPv6の両方をリッスンし、省略可能な起動構成 `"hostname"` をサポート
- 配列のためのデバッガー修正
- `php.version` 設定は、適合する `php` 実行ファイルがない場合でもエディターによって認識される
- `php.version` 設定が設定されていない場合、`composer.json` は最低 PHP バージョンがチェックされる
- **web** 拡張機能により、PHP 言語レベルを表示および変更が可能

---

- 拡張機能は外部依存関係をダウンロードせず、初回実行のスピードと信頼性向上
- 拡張機能はシステムに `dotnet` ランタイムがインストールされていることを期待しない
- 言語サーバーはプロトコル負荷を軽減するために増分テキスト編集をサポート
- 新しいプラットフォームのサポート: `alpine-x64`, `win32-arm64`, `darwin-arm64`

## 1.7.8766 (2022年3月8日)



- IntelliSense に `ctype` のブックを更新
- IntelliSense に STD 定数を更新
- `@ignore` でマークされた関数は補完とシグネチャヘルプに表示されない
- `new` の後の補完に変数もリスト表示
- 最適化

## 1.7.8717 (2022年3月4日)



- ORM記法を使用する際に発生する可能性のある言語サーバーの安定性の修正
- `"php.debug.port"` をワークスペーススコープ設定に設定可能
- テストのデバッグを修正; デフォルトで `"php.debug.port"` または `9003` の正しいポートを使用
- Laravelの静的FacadeがIntelliSenseで認識される
- LaravelのクラスエイリアスがIntelliSenseで認識される
- PHPDocによるコードパーサーの改善

## 1.7.8637 (2022年2月26日)



- web 拡張機能の読み込み修正

## 1.7.8627 (2022年2月25日)




- デバッガが、1つまたはすべてのポートが利用できない場合に正しく報告します
- IntelliSenseで不足している `E_` 定数を修正
- PHPUnitデバッガがハードコードされたポート `9000` を使用する代わりに、Xdebugポート設定 "`php.debug.port`" を尊重します

## 1.6.8588 (2022年2月19日)



- デバッガーの "exclude" 起動設定で `!` を接頭辞として使用することでパスを否定できます。例：
  ```json
  "exclude": ["!**/app/**", "!**/vendor/mypackage/**"]
  ```
- 使用可能な Xdebug ポートがない場合、デバッグは開始されません
- Xdebug ポートが使用できない場合、詳細なメッセージがデバッグ出力パネルに報告されます
- インストール: 代替場所での依存関係のダウンロード
- IntelliSense は型ヒントよりも PHPDoc の型注釈を優先します（より具体的な補完）
- Doctrine ORM 属性注釈がプロパティの型注釈に使用されました
- 言語サーバーは Unix ベースシステムでのパフォーマンス向上のためにファイルシステムウォッチャーの使用を避けます ([#521](https://community.devsense.com/d/521))
- 小さいインストールパッケージ
- `"php.stubs"` 設定により、IntelliSense、ローカライズされたマニュアル、およびコード分析に含める拡張機能の名前を明示的に設定可能
- ローカル変数用の**リンク編集** (`"editor.linkedEditing": true`) のサポートが追加されました

---

- 新しいプラットフォームのサポート: `web`

## 1.6.8479 (2022年2月11日)



- 文字列値のプレビューを修正
- ファイル解析を最適化

## 1.6.8448 (2022年2月10日)



- コード分析でPHP 8.1 `readonly` プロパティの不正な宣言を表示
- 仮想PHPマニュアルファイルでのコードレンズの修正（Go To Def (`F12`) で組み込みPHPに移動した場合）
- 仮想PHPマニュアルがVS Codeの仮想ドキュメントとして表示される（ディスクに一時ファイルを作成しない）
- **PHPUnitランナーとデバッガー** `phpunit.phpunit` 設定でphpunitバイナリを指定する

## 1.6.8324 (2022年1月28日)



- **デバッグ装飾**
- 拡張された互換性
- enumケース用コードレンズ
- `php.debug.port`および起動ポート設定により、複数のポートでのリスニングが可能。デフォルトは`[9003, 9000]`。

## 1.5.8292 (2022年1月25日)



- デバッグツールチップとデバッグウォッチを修正

## 1.5.8280 (2022年1月24日)




- **デバッグ** 起動の改善、現在のファイルまたはワークスペースに応じてデバッグを開始するためのすべてのオプションを提供
- PHPファイルおよびプロジェクトの実行とデバッグのための高度なコマンドを提供
- `php.debug.port` 設定が既定のXdebugポートを指定
- エディターは、特に指定がない限りデフォルトでPHP 8.1に準拠
- コードレンズの小さな更新
- "php" が欠如しているという誤った警告を修正
- 拡張機能の依存関係を修正
- 拡張機能の起動時間を修正

## 1.5.8204 (2022年1月17日) プレビュー




- **コードレンズ**
  - 参照、メソッドのオーバーライド、トレイトの使用、型の実装、メソッドプロトタイプの実装
  - 参照ウィンドウで参照をピーク
  - 有効/無効を切り替える設定: `php.codeLens.enabled`。デフォルトは `true`。
- ワークスペースに `php` が設定されていない場合、エディタは `php.executables` 設定で定義された最高のものを選択します
- ヌラブル型ヒント後の補完とツールチップを改善
- プライベート抽象関数を持つ `trait` のコード解析を改善
- `[]` の使用に関するコード解析を改善
- グローバルコードにおける `isset` のコード解析を改善
- 抽象メソッドの未実装に関する分析を改善
- PHP 8.1 のインターセクション型の検証 (スカラの使用チェック、有効な型の使用チェック)
- 関数ヘッダー内での補完に欠けている修飾子キーワードを追加
- **テスト**を修正し、すべてのテストを実行可能に (`*Testing*` パネルの `Run all tests`)

## 1.4.8059 (2021年12月20日) プレビュー



- 検出されたPHPバイナリが無効な構成を持っている可能性があり、ユーザーが希望する場合にはPHP Toolsは警告を報告し、それでもバイナリを使用します。
- パラメータータイプヒントで`static`の不適切な使用を診断報告します
- 現在のネームスペースに従って、ツールチップ内のPHP 8.1交差型のタイプ名を短縮します
- PHP 8.1構文を用いた色ツールチップを更新しました

## 1.4.8033 (2021年12月17日) プレビュー



- *doubleへのオーバーフロー*問題の下線位置を修正
- デバッガーが強制引数よりもユーザーの引数を優先
- いくつかの場合において、すでに存在する`use`を追加することを提案しないように修正 ([#127](https://github.com/DEVSENSE/phptools-docs/issues/127))
- PHPマニュアルを更新
- PHP 8の属性内でのコード補完を更新
- ByRef問題をエラーではなく警告として報告するように変更
- HEREDOCブロックの折りたたみ
- Windowsでの既存の`php`の解決を可能な限り修正
- PHP 8.1 交差型（解析済み、解決済み）

> *注: 型推論とツールチップはまだ交差型を完全には処理していません*

## 1.4.7597 (2021年9月30日) プレビュー



- 組み込み関数の推論型解析を更新
- `switch` 内の `case` をハイライト
- スタックオーバーフロー例外の可能性を修正

## 1.4.7534 (2021年9月21日) プレビュー



- 大きくネストされた式を含むコードでクラッシュする問題を修正
- 言語サーバープロトコルを修正
- `array_pad()`、`array_fill()` のコード分析を改善
- LValueでの`[]`の連続使用に関する誤検知警告を修正
- メモリ最適化

## 1.4.7520 (2021年9月19日) プレビュー



- メモリ最適化
- コードに巨大なネストされた式が含まれる場合のクラッシュ修正

## 1.4.7494 (2021年9月15日) プレビュー



- 関数の戻り値の概要がツールチップに表示される
- リファクタリングのアクションを修正
- コードアクションを修正
- PHPDoc ジェネレーターを修正
- プロトコルを最適化

## 1.4.7449 (2021年9月7日) preview



- `$this` の解析を改善
- 未使用変数のエラーレポートを改善
- ドキュメント全体のフォーマットを修正
- 変数のない `catch` のフォーマットを修正
- デバッグポートが指定されていない場合の時折発生する問題を修正
- JSONプロトコルの内部パフォーマンスを改善
- ワークスペースなしでのドキュメントデバッグを修正 *(ワークスペースやフォルダなしで開かれた単一ファイル)*
- PHPマニュアルを更新
- PHPパーサーを修正 - `readonly` がPHPバージョンに応じて適切に扱われるように修正

## 1.4.7295 (2021年8月17日) preview



- **PHP 8.1** 構文、コードセンス、およびチェック
  - read-only プロパティ
  - final クラス定数
  - 初期化子での new
  - 新しい callable 構文
- PHP マニュアル更新
- 誤って報告される非推奨の訂正
- 'null' タイプヒント付きの誤ったパラメータの修正

## 1.4.7254 (2021年8月15日) プレビュー



- **デバッグ**
  - 複合起動を許可
  - より多くのデバッグセッションを同時に許可
  - Xdebug ポートを指定する必要がない (`"port"` 起動設定)

## 1.4.6982 (2021年7月15日) preview



- 自動インポートが有効なとき、補完で可能なすべての名前空間内の型を表示
- 自動インポート時に既存のエイリアスと競合がある場合、完全修飾名を自動的に補完
- 自動インポートが発生する場合、補完に *(auto import)* を表示
- 変数の補完リストを改善
- 最適化
- 自動インポートする複数の型がある場合、補完リストにすべて表示して選択可能にする

## 1.4.6842 (2021年6月22日) プレビュー



- 補完時のエイリアスの自動インポート
- 設定 `php.format.autoimport`
  - **自動インポートオプション**: ネームスペースのスコープ外で型/関数/定数を補完する際にエイリアスを自動インポート
  - **fqn**: 補完時に完全修飾名を挿入
  - **none**: 名をそのまま挿入
  - **hide**: コード補完においてアクセスできないシンボルを表示しない
- 名前を完全修飾するためのコードアクションの電球の位置を修正
- コード補完で非推奨のシンボルを取り消し線で表示

## 1.4.6822 (2021年6月19日) preview



- コード分析とコード補完の更新
- より多くの未記載の`.phpstorm.meta.php`構造を認識するように ([#102](https://github.com/DEVSENSE/phptools-docs/issues/102))
- PHPUnit TestCase MockObject 型解析を修正 ([#102](https://github.com/DEVSENSE/phptools-docs/issues/102))
- 完全修飾名を簡素化するためのコードアクション ([#88](https://github.com/DEVSENSE/phptools-docs/issues/88))

## 1.4.6762 (2021年6月7日) preview



- PHPバージョン選択ツール ([ドキュメントでPHPの選択を参照](https://docs.devsense.com/en/vscode/editor/php-version-select))
- `.editorconfig` 問題規約 ([ドキュメントで問題を参照](https://docs.devsense.com/en/vscode/problems#editorconfig))
- `"php.problems.scope"` 設定（デフォルトで "vendor" フォルダーを無視） ([ドキュメントで問題を参照](https://docs.devsense.com/en/vscode/problems#phpproblemsscope))
- デバッグの改善
- 例外処理 - 常に致命的なエラーでブレークし、処理されたエラー/例外でブレークするかどうかを選択するオプション

## 1.3.6645 (2021年5月25日) プレビュー



- デバッグの修正と改善
- デバッグのUX改善

## 1.3.6632 (2021年5月21日) プレビュー



- **テストエクスプローラー** はテストを実行せずにリスト表示
- テストエクスプローラーはデータセットを持つテストを適切にサポート
- ソースが変更された場合、テストは再試行され、（グレー表示）
- 最適化された**デバッグプロトコル**

## 1.3.6616 (2021年5月21日) プレビュー



- 新しい**テストエクスプローラー** ( `hbenl.vscode-test-explorer` が必要です)
- 複数リクエスト処理のサポート、安定性の向上、正確性を伴ったデバッグの更新
- デバッグでデタッチをサポート
- Xdebugプロトコルを最適化
- **PHP 8.1** 構文サポート、`never` 返り値の型、`enum`、8進数表記
- `$this->` の後の静的メソッド補完
- `#[NoReturn]` 属性がサポートされました

---

## 1.2.6549 (2021年5月12日) preview



- デバッグ実装の修正（予期しないデバッグセッションの終了）
- デバッグブレークポイントの修正
- Xdebugプロトコルの最適化
- HEREDOCパーサーの修正
- 特定の名前に対する名前付きパラメータ解析の修正
- PHP 8の解析と無効な構文エラーの修正
- 最適化

## 1.2.6469 (2021年4月24日) プレビュー



- **ソート使用** のコードアクション（PSR-12）
- PHP 8.0以降で非推奨のカールブレースとして報告
- リモートファイルシステムのサポート
- 型解析の改善

## 1.2.6305 (2021年4月4日) preview



- ステータスバーにPHPバージョンをサフィックスなしで表示
- macOS用のホットフィックス、ランタイムパッケージをダウンロード

## 1.2.6273 (2021年3月30日) preview



- **コンストラクタ生成**のコードアクション
- フィールドの静的性に対応した**getter/setter**のコードアクション
- コードアクションの修正
- より高速なコード補完ポップアップ
- 変数のツールチップ表示をより高速化

## 1.2.6177 (2021年3月17日) プレビュー



- メモリ最適化
- IA-32アーキテクチャ上の Node.JS の修正
- あいまいな関数宣言のための`PHP0423`を修正
- 補完で匿名クラスの名前を一覧表示しない

## 1.2.6021 (2021年2月17日) preview



- ユーザーが `/**` をローカル変数やグローバル変数の上で入力したときに、PHPDoc が生成されるようになりました
- PHP 8 の宣言をより多く含むように PHP マニュアルを更新しました
- `::class` および `fn` に関する整形表示を修正しました
- 誤って報告される問題をいくつか回避しました
- PHPDoc の `@return` タグ内で予約キーワードの型解析を修正しました
- 組み込み型キーワードに関するツールチップに詳細を追加しました
- Xdebug ホームページからダウンロードされるサーバーに対する DBGp プロキシサポートの修正を行いました

## 1.2.5988 (2021年2月10日) preview



- 言語サーバーのクラッシュ修正（スタックオーバーフロー例外）
- より寛容な問題の検証
- コード分析の改善

## 1.2.5973 (2021年2月8日) プレビュー



- コード分析の全体的な改善、finallyブロックの修正、制約された定数が報告されない問題
- 名前空間内のグローバル定数に関するリファクタリングと強調表示の出現の修正
- パフォーマンスの向上
- (linux, macOs) VSCodeのシャットダウンやフォルダを閉じた後にサーバーが閉じられない問題の修正

## 1.2.5931 (2021年1月31日) preview



- リファクタリングのリネームで動的な名前の変更が可能に
- `__construct` に末尾カンマが含まれるときの言語サーバークラッシュの修正
- pcre チェックの更新
- タイプ解析の改善により、誤警告が減少
- 標準関数の解析の向上
- try/catch ブロックの解析の向上
- プロパティの PHPDoc タイプ注釈の不一致に寛容
- タイプチェックがトレイトとインターフェースのサブタイプを考慮し、厳格すぎない
- コードアクションとクイックフィックスの修正

## 1.2.5887 (2021年1月23日) プレビュー



- プレビューを伴うリネームリファクタリング
- `use` グループの整形表示
- .NET 5.0上でビルド（`.NET 5.0 Runtime`を持っていると追加のダウンロードが不要）
- メソッドを解決する際にサブタイプを処理
- トレイトのユーザを処理し、トレイトの分析やサブタイプのメソッドの定義への移動を改善
- コード解析と型解析の改善
- 多くの誤警告を回避
- 無名クラスの親の定義への移動の修正

## 1.2.5843 (2021年1月18日) preview



- ソースが管理されているフォルダー内のファイルは変更時に無視される (.git, .history, .svn)
- ステータスバーのPHPバージョンを修正 - PHPファイルを編集している時のみ表示される
- 最適化
- PCREチェックを更新
- ドキュメントの終端でのコード補完を修正

## 1.2.5783 (2021年1月4日) preview



- PHPDocの`@template`アノテーションを考慮
- インラインの`@var`アノテーションを処理
- 曖昧なコンストラクタに対するシグネチャヘルプ（`new \ReflectionMethod`）
- PHPDoc配列型のユニオン要素アノテーション（`array<A\B\C>`）
- PHPDocでnullable型のアノテーションを許可（例：`?int`）
- 最適化
- コード分析を改善、一部の偽陽性を回避
- コードフロー分析、isset()、is_resource()、および型推論を改善
- ラムダ関数の使用変数に対する分析を改善
- CLI特定の定数と変数を許可し、コード補完をサポート
- 型推論のために`.phpstorm.meta.php`パーサを更新
- PHP 7.1+使用時にPHP4スタイルのコンストラクタを無視
- 匿名クラスの場合の「実装へ移動」を修正
- ジェネレーター関数の戻り値チェックを修正
- `__clone()`マジックメソッドのチェックを修正、private可能
- `\SplObjectStorage`に対する配列アクセスのチェックを修正
- 非表示文字のケースと配列キーの重複チェックを修正

---

## 1.1.5686 (2020年12月23日) preview



- `@mixin`注釈のサポート
- `$this`戻り値タイプの`@method`注釈のサポート
- PHPDocでのnullable型注釈を処理
- PHPDocブロック内の型名の解決を修正
- 一部の誤報された警告を修正（主に未知のメソッド警告）
- pcreチェックを更新
- linux-arm64にインストール可能
- ツールチップ内の型名を改善
- `match`式のコードフォーマット
- クラス宣言のコードバリデーションを修正
- 統合されたPHPマニュアルを更新

## 1.1.5620 (2020年12月12日) プレビュー



- 構文チェックは現在のPHPバージョン（8.0を含む）を尊重します。
- 無効なユニオン型に対するクイックフィックスを追加
- pcreチェックを更新
- ツールチップの型名が短く表示されるようになりました。

## 1.1.5595 (2020年12月4日) preview



- 名前付き引数のコード補完 (PHP 8)
- 名前付き引数のホバー情報
- `#[Deprecated]`属性で注釈された関数が診断で報告される
- 一致または不明な名前付き引数の診断 (PHP 8)
- `iterable` 型ヒントの診断
- nullable 型の診断
- ユニオン型の診断 (PHP 8)
- ユニオン内の `null` 型名 (PHP 8)
- 改良された `.phpstorm.metadata.php` 注釈
- Xdebug 3.0 および PHP 8.0 デバッグのサポート

## 1.1.5532 (2020年11月21日) preview



- PSR-2コードフォーマットを更新しました
- 未定義定数の使用に対する警告 `PHP0415`
- 未定義メソッドの使用に対する警告 `PHP0418`
- ローカル変数の可能性がある場合の`PHP0415`のコード修正
- コード補完内のドクトリンアノテーション
- PHPDoc内のクラス名補完を修正しました
- コード補完と解析のグローバル定数を更新しました
- PHPマニュアルの翻訳を更新しました

---

## 1.0.5403 (2020年10月28日) プレビュー



- クラスプロパティの解析
- マジックメソッドの型ヒントの修正
- 安定性の修正

## 1.0.5342 (2020年10月20日) preview



- PHP 8の新しい属性構文 `#[]`
- より多くのコード提案
- PHPDocで使用されている場合の未使用の`use`診断を改善
- 入力中に開いたドキュメントの問題の下線を改善
- クラス/関数内で指定した警告を無視するための `@suppress` および `@SuppressWarnings` PHPDocタグ
- より多くのPHPDoc配列構文の規約をサポート
- `isset()` および `new static()` の分析を改善

## 1.0.5264 (2020年9月30日) preview



- 変数のコード補完での二重ドル記号 `$$` に関する修正

## 1.0.5229 (2020年9月22日) プレビュー



- 簡略化できる名前に対する診断とクイック修正
- コンストラクタおよびプライベート関数内の未使用パラメータに対する診断
- 外部で変更されたファイル（`*.php`）の更新

## 1.0.5153 (2020年8月28日) プレビュー版



- `@dataProvider` PHPDoc属性; コードセンス、ナビゲーション、補完
- 欠落した抽象メソッドの実装クイックフィックスは元の `public` キーワードを尊重
- PHP 8.0 のヌルセーフ演算子に対応
- PHP 8.0 `match` 構文に対応（PHP >=8.0 `phpExecutable`が必要）
- 問題が重複する場合の`クイック修正`の修正
- 安定性の修正

## 1.0.5087 (2020年8月17日) preview



- 重複したクイックフィックスを削除
- 括弧で囲まれた式の型分析を改善
- PHPDocで不明な型名に対するクイックフィックス
- マウスホバーで関数が`null`を返すかどうかを表示（`void`が最終的に`null`として表示される）
- メソッドの*実装に移動*
- 無効な基底クラスに対するクイックフィックスを提供
- `namespace`キーワードの後のコード補完

## 1.0.5044 (2020年8月11日) プレビュー




- PHPDocで不明なクラス名のクイックフィックス
- 不要な`use`を削除するクイックフィックス
- `iterable` phpdoc 型ヒント
- 左側のステータスバーにロードステータスインジケーター
- ステータスバー（右下）に現在のPHPバージョンのインジケーター
- コードが変更されたときにワークスペースが遅延再分析されます（無効にするには [`"php.problems.workspaceAnalysis": false`](https://docs.devsense.com/en/vscode/configuration#configuration-options) を設定）

## 1.0.5029 (2020年8月7日) プレビュー



- 「実装に移動」をサポート
- `SonarSource.sonarlint-vscode` が非互換として報告されない
- `extends` キーワードの後にあるインターフェース名の「移動」機能を修正
- 非推奨の項目は取り消し線で表示される

## 1.0.5015 (2020年8月6日) preview



- `__construct`の「すべての参照を検索」にクラスのインスタンス化を含める
- 「すべての参照を検索」のパフォーマンス
- 問題の分析の改善
- インラインPHPDocタイプヒントの分析を改善
- 他の問題に関連するいくつかの問題が報告されない
- パーサーの修正

## 1.0.4975 (2020年7月29日) preview



- パフォーマンスの改善
- 問題解析の改善
- ワークスペースの読み込みの向上
- ワークスペース読み込み失敗のログ記録

## 1.0.4934 (2020年7月19日) プレビュー



- 単独の `@deprecated` が無視されないように
- いくつかのパフォーマンス向上
- 報告された問題の重複を修正
- 他の問題によって引き起こされるいくつかの問題が報告されない
- ワークスペースの読み込みとコード編集の改善

## 1.0.4908 (2020年7月13日) プレビュー



- 誤検知警告を減少
- `static`およびプロパティの型解析を改善
- PHP 8.0 (Alpha 1) 構文をサポート
- 新しいPHP 8.0互換性警告
- トレイトメンバーの抽象実装を修正
- タブ使用時のフォーマットを改善

## 1.0.4698 (2020年5月19日) preview



- `use` クイックアクションの配置を改善しました

## 1.0.4666 (2020年5月6日) プレビュー



- .NET Runtime (3.x または 5.x) がインストールされていないシステム向けの修正

## 1.0.4654 (2020年5月5日) preview



- すべてのテストの実行が改善されました（現在単一プロセス内で実行されます）
- `@method` のPHPDocタイプヒントが現在の名前空間を尊重
- アロー関数内のローカルが親スコープから使用され、適切に注釈付けされました

## 1.0.4608 (2020年4月17日) preview



- `現在のスクリプトをコンソールで起動` 用の設定スニペットを修正
- PHPスクリプト内のHTMLツールチップ
- `<`がHTML補完をトリガー
- PCREパターンチェック (`preg_*` 関数内)
- PHPDocの`@method`で可変長引数をサポート
- 未使用の`use`ハイライトでカスタムPHPDocタグを考慮
- テストエクスプローラーの修正:
  - テスト終了後にデバッグセッションが閉じる
  - 追加設定なしでテストケースをデバッグ可能
  - テスト実行時の例外を修正

## 1.0.4394 (2020年1月23日) プレビュー



- 変数の補完を修正（`$` プレフィックスが重複しない）

## 1.0.4277 (2019年12月10日) プレビュー



- `finally` ブロックのコードフロー解析の改善
- システムにインストールされていれば `dotnet` 3.1 を使用
- マイナーな修正、および安定性の問題への更新

## 1.0.4229 (2019年11月22日) プレビュー



- `Implement abstracts` **コードアクション** & **クイック修正**（インターフェースと抽象メンバー）
- `Add getter/setter` フィールドおよび複数のフィールド用の**コードアクション**
- 安定性の問題に関する更新

## 1.0.4187 (2019年11月10日) プレビュー



- コードエディタの修正（保存時のフォーマット、貼り付け時のフォーマット時に発生）
- PHPDoc内の補完

## 1.0.4168 (2019年11月4日) プレビュー



- ドキュメント/ワークスペース内のシンボルの一覧表示を改善
- `$`で始まるプロパティを検索して一覧表示
- トレイトの使用箇所へのナビゲーション

## 1.0.4145 (2019年10月24日) プレビュー




- 未実装の関数に対する問題チェック
- トレイトに対する問題チェック
- ツールチップとパフォーマンスの改善
- 組み込みPHPマニュアルの更新
- デバッガが一般的な問題をわかりやすく報告

## 1.0.4009 (2019年9月23日) プレビュー



- ツールチップに表示されるハイパーリンクとしての `{@link}`
- PHPDoc仕様に従って置き換えられる `{@inheritdoc}`
- Bladeテンプレート編集の更新 (`@section`, `@yield`) とフォーマット修正
- 埋め込みHTML修正
- 安定性の向上、内部エラーログの改善
- 問題報告の改善

## 1.0.3951 (2019年9月9日) プレビュー



- 生成された PHPDoc が型ヒントに従うように
- 生成された PHPDoc がnullable型を正しく扱うように
- 言語サーバーのクラッシュ修正
- `composer install|update` を実行する際に `rg.exe` の生成を回避（システムフリーズを修正）

## 1.0.3936 (2019年9月5日) プレビュー



- ワークスペース内のPHARファイルが解析される
- **コード補完**にPHARファイルからの宣言が含まれる
- **定義へ移動**はPHARファイル内のコンテンツをサポートする
- PHARファイル内のエントリを通じた**ナビゲーション**
- PHARファイル内の宣言に対する**シグネチャヘルプ**と**ツールチップ**
- 軽微な修正と改善

## 1.0.3774 (2019年8月1日) preview



- 型付きプロパティのフォーマット
- `use` の後の補完がクラス名でフィルターされる
- Xdebugからの長いデータの取得

## 1.0.3748 (2019年7月24日) プレビュー



- 現在の名前空間または使用しているものに存在しないクラス/インターフェイス/トレイトがコード補完に表示されない
- 動的クラスエイリアスがコード補完と型解析でサポートされる（`class_alias()`とJoomla登録エイリアス）
- Bladeブロック内のPHP（`.blade.php`）（構文ハイライトを除く）
- 参照渡しされた引数の型解析が改善されました
- `Format on Paste`が有効な場合の貼り付けの問題を修正しました（HTMLが破損していた）

## 1.0.3703 (2019年7月17日) プレビュー



- パフォーマンス最適化
- ワークスペース全体の問題分析を有効/無効にするための `php.problems.workspaceAnalysis` 設定
- 配列アンパックの型チェック

**PHP 7.4サポート**

- PHP 7.4サポート（アロー関数、型付きプロパティ、スプレッド配列、`??=` 演算子、数値のアンダースコア）
- PHP < 7.4 使用時に報告されるPHP 7.4の機能
- PHP 7.4機能分析、型分析、問題分析
- スプレッド配列の型チェック

## 1.0.3645 (2019年7月11日) プレビュー



- プロジェクトのロードとバックグラウンド解析を改善
- `.phpstorm.meta.php`（バージョン2016.2+）が処理されるように
- IoCのコード補完と解析
- nullableタイプのフォーマットが修正
- 開始ブレース `{` のフォーマットが美しく印刷されるように
- コードスタイルのフォーマットがデフォルトで `PSR-2` に設定

## 1.0.3603 (2019年7月8日) プレビュー



- 一部の警告が消えた後、数秒後に再表示される問題を修正
- ドキュメントの開閉時のCPU使用量を改善
- `?:` と `::` 周辺のフォーマットを修正
- コード解析の評価を改善
- 未初期化変数の使用に関する解析の厳格性を緩和
- `use` の後の補完が完全修飾名になるように修正

## 1.0.3593 (2019年7月5日) プレビュー



- マジックメソッドの診断
- 重複した関数パラメーターの診断
- 数値の型解析の改善
- デバッガー起動機能の強化
- PSR-2フォーマッターの修正

## 1.0.3574 (2019年7月2日) プレビュー




- `explode()`, `microtime()`, Oxidフレームワークの型解析を改善
- `catch` 変数の診断と解析

## 1.0.3547 (2019年6月27日) preview




- フォーマッターの改善
- DBGP プロキシサポート
- 未使用変数診断の改善

## 1.0.3525 (2019年6月24日) プレビュー



- 無名関数の型解析
- PHPDocで注釈された無名関数
- ツールチップでの無名関数の詳細
- 関数の返り値型を含む署名ヘルプ
- 未使用変数の薄暗い表示
- プロジェクトの読み込みパフォーマンス、応答性

## 1.0.3507 (2019年6月22日) プレビュー



- コードフォーマット時に無題ドキュメントの数が増加する問題を修正
- 型解析の改善
- dbgpプロキシの初期サポート

## 1.0.3483 (2019年6月17日) プレビュー



- PHPマニュアルの更新
- `define()`に渡される値の検証
- PHP >= 7.3での`define()`の使用に関する検証

## 1.0.3471 (2019年6月12日) プレビュー




- ログポイントのサポート
- `php.format.codeStyle` をワークスペーススコープで設定可能
- コードフォーマットの修正、オープニングタグ後のインデント、新しい行でのブロック
- `html`+`php` のフォーマット修正、重複する範囲のエラー

## 1.0.3435 (2019年5月28日) プレビュー




- ブレークポイントの無効化に関する修正
- デバッグプロトコルを最適化

## 1.0.3428 (2019年5月27日) preview



- 最新のPHP 7.3およびPHP 7.4構文に対応するようにPHPマニュアルを更新
- 読本を更新

## 1.0.3386 (2019年5月9日) プレビュー



- foreachでオブジェクトを渡すときの警告PHP0424を無効化
- ラムダ関数内でのuseパラメータの解析
- 軽微なコードナビゲーションの修正
- 軽微なコードフォーマットの修正

## 1.0.3348 (2019年4月23日) preview



- シグネチャヘルパーの修正、正しいパラメータを表示
- `dotnet` がない場合に拡張機能が動作するように修正
- `dotnet` 3.0 に対応

## 1.0.3241 (2019年3月4日) preview



- パラメータ名を使用したPHPDocの生成

## 1.0.3230 (2019年2月27日) プレビュー



- プレースホルダー付きで挿入されるPHPDocブロック（スニペット）
- PHPDocタグのスニペット
- PHP互換性警告
- ファイル削除後に消えない警告を修正
- `die()`構文の整形表示を修正
- 関数ヘッダーとプロパティのフォーマットを修正

## 1.0.3202 (2019年2月20日) プレビュー



- PHPマニュアルを更新
- タイプ時のフォーマット (`;` および `}`)
- フォーマットプロファイル `Off`
- コードの構文が無効な場合はフォーマットが適用されない

## 1.0.3185 (2019年2月14日) プレビュー




- `@`の後のPHPDocキーワードのためのコード補完
- PHPDoc内の誤字や未知の型名に対するコードアクション

## 1.0.3174 (2019年2月12日) preview



- 適用可能な場合に `use ;` を追加するコードアクション
- 必要に応じて型名を完全修飾するコードアクション
- ユーザーが `/**` とタイプしたときに `PHPDoc` を生成（`formatOnType` を有効にする必要があります）
- 選択フォーマット
- ローカライズされたメッセージ - en, de, ja, tz, es

## 1.0.3058 (2018年12月30日) preview



- コードフォーマットの改善
- いくつかのテキストをドイツ語にローカライズ

## 1.0.3031 (2018年12月3日) preview



- 折りたたみが内部の範囲を縮小します
- コードスタイル設定 `php.format.codeStyle` のフォーマット
- 複数の `@var`/`@global` タグを持つローカル変数の PHPDoc
- 該当する場合に `$this->` を追加するコード提案

## 1.0.3003 (2018年11月26日) プレビュー



- 未知のクラスエラーに対するコードサジェスション
- 不必要な `use` ディレクティブがフェードアウトとして表示される
- `F10` と `F11` はデバッグを開始し、エントリで停止
- `exclude` ランチ構成 - ステッピング時にデバッグからスキップされるパターン
- デバッガーは変数やプロパティの値を設定可能
- デバッガーは長い文字列をサポート
- デバッガーは大きな配列のページングをサポート
- テストエクスプローラーの最適化
- 生成されたファイルはユーザーのワークスペースに含まれない
- テストエクスプローラーはユーザーのテストのみを表示し、ルートに `phpunit.xml` がない場合のみ、再帰的なディレクトリ内のすべてのテストが表示される

## 1.0.2930 (2018年11月3日) プレビュー



- 表示言語設定 `phpTools.language` がワークスペースを再読み込みせずに変更可能
- 設定 `php.problems.exclude` の変更が問題ウィンドウを更新
- エディター外で変更されたファイルが更新される
- 安定性の修正

## 1.0.2915 (2018年10月30日) preview



- デバッガーはスタックフレームとローカル値を検査可能
- 試験的機能: 設定 `files.exclude` が処理される
- 試験的機能: 設定 `php.problems.exclude` により、指定したフォルダーおよびすべてまたは指定した問題コードを無視可能
- <?の直後に項目を補完しない
- キャレット下の参照のハイライト最適化

## 1.0.2895 (2018年10月23日) preview



- ワークスペースがロードされた後にプロジェクトの問題が更新される
- 一部の誤警告が報告されない
- `pathMappings` の起動構成
- 修正: Unix システムで言語サーバープロセスを閉じる
- 修正: 大規模な混在HTML/JS/CSS/PHPコードの作業
- 新しいオブジェクトの署名ヘルプ
- メモリと性能の最適化
- 安定性の修正
- プロジェクト起動の最適化
- 全ての括弧に対するコード折りたたみ

## 1.0.2802 (2018年10月11日) プレビュー



- ライセンスをアクティブ化/オフラインで試用をリクエストするオプション
- PHPが見つからない場合の警告をミュートするオプション
- テストは自動でロードおよび実行されません（`autorun`を有効にするか、`reload`/`start`をクリックしてください）
- デバッグウォッチのツールチップで展開可能なオブジェクトプロパティを提供
- デバッグ/テストに使用されるPHPとXdebugについて、より詳細な出力ログ
- `launch.json`設定がなくても`F5`で現在のスクリプトのデバッグ開始  
- `:`の後に基本的な補完を提供しません（ただし`::`は提供）
- コード補完が曖昧なトレイト宣言を処理

## 1.0.2765 (2018年10月8日) preview



- ワークスペース機能内のシンボル。
- `php` 言語にマッピングされたすべてのファイルの処理。
- コード補完の改善。

## 1.0.2738 (2018年10月3日) プレビュー



- テストエクスプローラーは phpunit.xml.dist を検出して有効化
- コード補完が曖昧な型をより良く処理
- 通常のオープンタグ `<?php` がない場合に短いオープンタグ `<?` が許可
- readme とドキュメントを更新
- $ の後の補完を再有効化 (VSCode の最近の更新による修正)

## 1.0.2681 (2018年9月27日) preview




- トライアルライセンスをリクエストするオプション
- CDNからの依存関係のダウンロード
- 拡張機能の発行者IDを更新

## 1.0.2590 (2018年9月14日) preview



- `->`, `$`, `\`, `::` の後の補完のトリガー
- ブロック、コメント、PHPDoc、およびリージョンのコード折りたたみ
- 言語サーバーの提供
    - コード補完
    - ホバー
    - フォーマット
    - コード構造
    - シグネチャヘルプ
    - すべての参照を検索
    - ナビゲーション
    - 定義へ移動
    - リファクタリング
    - ハイライト
- コード分析と検証
- デバッグサポート
    - ウォッチ
    - デバッグマウスウォッチ
    - ブレークポイント
    - UNC パス
    - パスマッピング
    - リモートデバッグ、コンソール、組み込みサーバー
- ワークスペース
- UNC パス
- 組み込み PHP サーバー
- PHPUnit テストエクスプローラー
    - ライブテスト
    - テストデバッガー
    - テストブラウザ
- VS Code 向け PHP Tools の初期バージョン
