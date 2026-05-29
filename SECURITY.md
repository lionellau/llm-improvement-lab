# Security

This project is a static, client-side web app. No user input ever leaves the
browser — there is no backend, no analytics, no telemetry, no remote API call.

## Threat surface

| Surface                | Reality                                                                 | Mitigation                                                                        |
| ---------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Cross-site scripting   | App is rendered by React; no `dangerouslySetInnerHTML`; no user input.  | Strict CSP (`script-src 'self'`). No `eval` in production.                        |
| Clickjacking           | Site embeddable in a frame.                                              | `X-Frame-Options: DENY` + CSP `frame-ancestors 'none'`.                           |
| MIME sniffing          | Old browsers re-interpret file types.                                    | `X-Content-Type-Options: nosniff`.                                                |
| Mixed content / leaks  | Served over HTTPS via GitHub Pages.                                      | `Strict-Transport-Security`, `Referrer-Policy: no-referrer`.                      |
| Dependency supply chain| npm packages may go bad.                                                 | Locked transitive versions; `npm audit` in CI; Dependabot configured for monthly. |
| Data exfiltration      | The app does not collect or transmit data.                               | CSP `connect-src 'self'` blocks outbound calls; no `fetch()` to third parties.    |
| Stored credentials     | None. App is anonymous.                                                  | n/a.                                                                              |

## Headers in effect

In production (GitHub Pages via `public/_headers` and equivalent in
`vite.config.ts` for `vite preview`):

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'none'
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
```

The `'unsafe-inline'` on `style-src` is required because React emits inline
style attributes for some components. There is no `'unsafe-inline'` on
`script-src` in production builds.

## Dependency audit

Run `npm audit` locally; CI fails on high or critical advisories.

## Verdict

Static educational site. No user data, no PII, no external services. Risk is
limited to dependency-chain CVEs which are addressed by routine updates.

## Reporting

If you find a real issue, please open a private security advisory in the
GitHub repository. Do not file a public issue.
