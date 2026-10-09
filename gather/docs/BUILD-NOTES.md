# Gather 1.8.15 RC engineering notes

The lookup change is a conditional **two-second readiness buffer**. It does not rewrite the extractor, add endpoints or change storage.

- Read the intended Instagram profile immediately. If the account-bound ID exists, return it immediately.
- On missing metadata only, recheck every 250 ms within a two-second deadline. Reuse the packaged reader in the pinned document. If data still has not arrived, use the existing bounded same-origin/public fallback from 1.8.14.
- Permit a still-loading tab when its explicit URL or pending URL identifies the requested profile. Reject a different pending destination. Check the account and document again before accepting a result. Cancellation stops waiting; sign-in, security checks and conflicting IDs do not trigger hydration polling.
- Existing exact string IDs, all five adapters and source parsing remain unchanged. No mandatory sleep for a successful read. No new HTTP request type, credential behavior, temporary tab or lookup batch. Successful hydration can avoid a fallback request.
- One local Help page serves popup, side panel, workspace and full account tools. Search is ephemeral and local. Account-tools Settings retains its existing browser-fallback preference. Coworker Quick Start ships in the extension ZIP.

Permissions, host permissions, storage schema, retention, capture engine, export behavior and case-data network behavior are unchanged. No new dependency, analytics, cloud endpoint, automatic redaction, identity inference or background collection.

The new native test environment uses Microsoft-signed Edge 155.0.4283.45 and the matching official WebDriver download. Tests drive Edge through Playwright; WebDriver is installed/version-checked but is not the test driver. Chromium's managed policy remains intact. Edge loads this unpacked extension normally with its sandbox enabled. An authenticated local X display allows normal OS keyboard/mouse action invocation without overriding activeTab permissions. No unsafe extension-debugging, policy, TLS or sandbox switches were used.

See TESTING and RELEASE-CANDIDATE-1.8.15 for exact completed tests, timing, known limitations and the distinction between native Linux Edge, mocked APIs, live signed-out access and untested signed-in Windows behavior.
