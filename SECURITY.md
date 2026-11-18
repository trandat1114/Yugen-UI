# Security Policy

## Supported versions

Yugen UI is pre-1.0. Security fixes are released for the latest minor version only
([npm](https://www.npmjs.com/package/yugen-ui) shows the current one).

| Version | Supported |
|---|---|
| Latest minor (`0.x.y` with the highest `x`) | Yes |
| Older minors | No |

## Reporting a vulnerability

**Please do not open a public issue for security problems.**

Report vulnerabilities privately through GitHub's **"Report a vulnerability"** button (Security tab → Advisories) of
the Yugen UI repository, or by contacting the maintainer, **[trandat1114](https://github.com/trandat1114)**, privately. Please include:

- the affected version(s) and component(s);
- a description of the issue and its impact;
- steps or a minimal reproduction (a code snippet or repository).

You can expect an acknowledgement within **7 days** and a status update at least every **14 days** until the issue
is resolved. Once a fix is published we will credit you in the release notes, unless you prefer to stay anonymous.

## Scope

Yugen UI is a client-side React component library. Relevant reports include, for example, cross-site scripting
through component props, unsafe HTML rendering, or a vulnerable runtime dependency that the library actually
exercises. Vulnerabilities in third-party packages that do not affect Yugen UI should be reported upstream.

## The CLI (`@yugen-ui/cli`)

- Registry items are checked: each CLI release ships the sha256 of every item of the `yugen-ui` version its templates
  use and reads them from `https://trandat1114.github.io/Yugen-UI/r/<version>/`, built from the release tag. A
  mismatch stops `add`, `init`, `update` and `diff` before any file is written. A registry passed with `--registry`, or
  set in `yugen.json` / `components.json`, is not checked (the CLI prints a notice).
- Hosts: `trandat1114.github.io` (registry), `registry.npmjs.org` (`doctor`, and installs run by your package
  manager), `api.github.com` and `raw.githubusercontent.com` (`create --ref` only, unauthenticated).
- No credentials are read. Environment variables used: `CI`, `npm_config_user_agent`, `npm_execpath`, `NO_COLOR`,
  `FORCE_COLOR`. Package managers run without a shell when `npm_execpath` is set; otherwise every argument is
  validated first.
- No runtime dependencies. Both packages are published from GitHub Actions with npm provenance.
