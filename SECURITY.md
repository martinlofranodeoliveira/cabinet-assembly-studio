# Security

## Reporting

Report suspected vulnerabilities privately using GitHub private vulnerability reporting:

https://github.com/martinlofranodeoliveira/cabinet-assembly-studio/security/advisories/new

Do not include secrets, real personal information or private client models. Provide a minimal synthetic reproducer, affected version, expected/observed behavior and relevant environment details. No response-time SLA is offered. General contact: https://lofranotecnologia.com.br .

## Scope and boundaries

Development 0.1.0 is the current documented line. There is no production-readiness or support-duration guarantee.

The application has no account, server persistence, telemetry or runtime API. It treats imported documents as untrusted, checks file metadata before reading, bounds encoded text before JSON decoding, validates exact schema and recomputes geometry. These checks are not a pre-decoder recursion or process-memory sandbox. Browser JSON decoding and file reading still use host resources within the documented input cap.

Names are text; SVG export escapes XML and does not import arbitrary SVG or mesh markup. Local storage is unencrypted, origin-scoped, single-tab/last-write-wins and not a backup. Use only synthetic non-sensitive concepts. Export files can be shared intentionally by the user; the application itself sends no model data.

Storage denial/corruption must preserve current work and keep export available. Dependency vulnerabilities and browser-specific rendering issues should be reported with exact installed versions. Never interpret this conceptual geometry as a structural, manufacturing or safety assessment.
