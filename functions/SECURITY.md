# Security Policy

This document outlines the security posture of this project and documents any accepted risks.

## Vulnerability Management

This project endeavors to resolve all critical and high-severity vulnerabilities in its dependencies. Moderate and low-severity vulnerabilities are assessed for their real-world exploitability within the context of this application.

## Accepted Risks

The dependency tree currently contains several moderate-severity vulnerabilities that cannot be resolved without introducing breaking changes to the `firebase-admin` package. 

After a thorough architectural review, the decision has been made to accept these risks on a temporary basis. A complete analysis of these vulnerabilities, the associated risks, and the architectural mitigation strategies in place can be found in the following document:

**[./VULNERABILITY_DEBT.md](./VULNERABILITY_DEBT.md)**

This document serves as the single source of truth for our vulnerability debt and our long-term resolution plan. All developers must review it to understand the environment's constraints.
