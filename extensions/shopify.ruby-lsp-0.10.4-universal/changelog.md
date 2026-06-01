# vscode-ruby-lsp-v0.10.3
## 🐛 Bug Fixes

- Avoid indenting after endless method definition (https://github.com/Shopify/ruby-lsp/pull/4041) by @vinistock
- Use --pre flag for global installs and updates when betaServer is enabled (https://github.com/Shopify/ruby-lsp/pull/4068) by @vinistock
- Prevent `<<10` inside interpolation from being parsed as a HEREDOC start and document numeric-delimiter limitation (https://github.com/Shopify/ruby-lsp/pull/4075) by @Copilot

## 📦 Other Changes

- Search for shadowenv in ~/.local/bin too (https://github.com/Shopify/ruby-lsp/pull/4076) by @vinistock



# vscode-ruby-lsp-v0.10.2


# vscode-ruby-lsp-v0.10.1
## ✨ Enhancements

- Expand `${workspaceFolder}` in `bundleGemfile` setting (https://github.com/Shopify/ruby-lsp/pull/3952) by @rafaelfranca

## 🐛 Bug Fixes

- Improve heredoc end detection for embedded languages (https://github.com/Shopify/ruby-lsp/pull/3920) by @reese
- Fix test runner silent failure on dual-stack IPv4/IPv6 systems (https://github.com/Shopify/ruby-lsp/pull/3953) by @Copilot
- Fix yjit RUBYOPT concatenation for Ruby 3.2 (https://github.com/Shopify/ruby-lsp/pull/3968) by @vinistock

## 📦 Other Changes

- [DOC] Add security documentation (https://github.com/Shopify/ruby-lsp/pull/3928) by @st0012
- Add betaServer feature flag to enable pre-releases (https://github.com/Shopify/ruby-lsp/pull/3977) by @vinistock



# vscode-ruby-lsp-v0.10.0
## ✨ Enhancements

- Use configured shell from vscode.env.shell instead of process.env.SHELL (https://github.com/Shopify/ruby-lsp/pull/3917) by @rafaelfranca

## Other Changes

- `customRubyCommand` setting now requires machine scope (cannot be set in workspace settings)

# vscode-ruby-lsp-v0.9.33
## ✨ Enhancements

- add support for rv version manager (https://github.com/Shopify/ruby-lsp/pull/3878) by @matheuscumpian

## 🐛 Bug Fixes

- Avoid failing if the git extension is disabled (https://github.com/Shopify/ruby-lsp/pull/3822) by @vinistock
- Fix multiline RBS signature dimming (https://github.com/Shopify/ruby-lsp/pull/3864) by @matheuscumpian
- Fix syntax highlighting for line-ending forward slashes (https://github.com/Shopify/ruby-lsp/pull/3902) by @reese
- Fix bare heredoc syntax highlighting (https://github.com/Shopify/ruby-lsp/pull/3909) by @reese

## 📦 Other Changes

- Rollout launcher mode to 30% of users (https://github.com/Shopify/ruby-lsp/pull/3841) by @vinistock



# vscode-ruby-lsp-v0.9.32
## 🐛 Bug Fixes

- Disable spring when running tests through the explorer (https://github.com/Shopify/ruby-lsp/pull/3711) by @vinistock



# vscode-ruby-lsp-v0.9.31
## 📦 Other Changes

- Remove RUBYOPT from ruby-lsp-test-exec (https://github.com/Shopify/ruby-lsp/pull/3673) by @vinistock
- Retain editor focus after Run In Terminal (https://github.com/Shopify/ruby-lsp/pull/3679) by @andyw8



# vscode-ruby-lsp-v0.9.30
## 🚧 Breaking Changes

- Use -r instead of RUBYOPT to require LSP reporters (https://github.com/Shopify/ruby-lsp/pull/3661) by @vinistock



# vscode-ruby-lsp-v0.9.29
## ✨ Enhancements

- Allow users to disable test related code lenses (https://github.com/Shopify/ruby-lsp/pull/3632) by @vinistock

## 🐛 Bug Fixes

- Show message when trying to run a test that hasn't been discovered (https://github.com/Shopify/ruby-lsp/pull/3631) by @vinistock

## 📦 Other Changes

- Collect add-ons versions for issue reporting (https://github.com/Shopify/ruby-lsp/pull/3611) by @snutij



# vscode-ruby-lsp-v0.9.28
## ✨ Enhancements

- feat: register profile command (https://github.com/Shopify/ruby-lsp/pull/3560) by @maxveldink

## 📦 Other Changes

- Pass workspace to telemetry on every error log (https://github.com/Shopify/ruby-lsp/pull/3580) by @egiurleo
- Increase the full test discovery rollout to 100% (https://github.com/Shopify/ruby-lsp/pull/3589) by @alexcrocha



# vscode-ruby-lsp-v0.9.27
## 🐛 Bug Fixes

- Remove git scheme from document selector (https://github.com/Shopify/ruby-lsp/pull/3540) by @vinistock
- Move chruby activation script into a file (https://github.com/Shopify/ruby-lsp/pull/3551) by @vinistock
- Automatically clear Ruby workspace cache if the path no longer exists (https://github.com/Shopify/ruby-lsp/pull/3573) by @vinistock

## 📦 Other Changes

- chore: remove deprecated activationEvents from extension package.json (https://github.com/Shopify/ruby-lsp/pull/3564) by @maxveldink
- Increase the full test discovery rollout to 70% (https://github.com/Shopify/ruby-lsp/pull/3574) by @alexcrocha
- add mise install path for `apt` installations (https://github.com/Shopify/ruby-lsp/pull/3532) by @jtannas


