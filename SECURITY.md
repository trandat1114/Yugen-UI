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
