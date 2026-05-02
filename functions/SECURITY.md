# Security Policy

This document outlines the security posture of this project and documents any accepted risks.

## Vulnerability Management

This project endeavors to resolve all critical and high-severity vulnerabilities in its dependencies. Moderate and low-severity vulnerabilities are assessed for their real-world exploitability within the context of this application.

## Accepted Risks

The following vulnerabilities are present in the dependency tree but have been assessed as low-risk and are formally accepted.

| Vulnerability | Package | Severity | Details & Justification |
| --- | --- | --- | --- |
| `uuid` < 14.0.0 | `uuid` | Moderate | **Reason for Acceptance:** This vulnerability (GHSA-w5hq-g745-h8pq) relates to a missing buffer bounds check. It is deeply nested within `firebase-admin` and `firebase-tools`. The likelihood of an attacker controlling the buffer input to the `uuid` function within the trusted, server-side execution environment of a Firebase Function is negligible. All critical and high-severity vulnerabilities have been patched. This moderate finding is accepted as a low-priority, non-exploitable issue in this context. |
| `@tootallnate/once` < 3.0.1 | `@tootallnate/once` | Moderate | **Reason for Acceptance:** This vulnerability (GHSA-vpq2-c234-7xj6) relates to incorrect control flow scoping. It is a transitive dependency, deeply nested within `firebase-admin`, and is not directly called by application code. The risk of this being exploited in a server-side, trusted execution environment is extremely low. Given that all high-severity vulnerabilities are patched, this is accepted as a low-risk, non-exploitable finding. |
