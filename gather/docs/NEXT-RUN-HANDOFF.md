# Gather 1.8.19 RC handoff

Use the existing /workspace/Gather checkout, historical branch develop/1.8.0-r3. Inspect status, remote refs and release receipts before changing anything. Preserve user edits and immutable previous packages/tags. Read README, TESTING, POST-DATES, RELEASE-CANDIDATE-1.8.19, ENVIRONMENT-SETUP and FUTURE-PLANS.

The user requested one exact-post-date button across social platforms and author ID copying from posts. Implementation is in post-date.js, post-read-client.js, post-tools.js and core.js. The static profile-reader.js is generated from the same modules; run scripts/build-profile-reader.py after edits. No new permissions or storage schemas. X works through explicit current-page activeTab, not background pasted-only fetch. Post dates are transient and are not added to account history. Existing manual image editing, Reference, source images, SOC filing and local privacy work remain.

Do not infer dates from relative labels or IDs. Never return a commenter/viewer/quoted-author or post ID as the account ID. Keep exact strings, bounded same-document reads, navigation guards, immediate loaded lookup and conditional two-second Instagram readiness. Date-only/minute precision is explicit. No universal site reliability claim.

Current tests and their boundaries are in TESTING and evidence/1.8.19. Native pages are fictional; signed-in Windows/live-platform verification remains outstanding. Browser-post-tools exercises actual toolbar invocation, activeTab and OS clipboard. One headed suite per authenticated display; do not edit runtime/tests while suites execute. ENVIRONMENT-SETUP documents retained signed Edge, Xvfb and Xauthority restoration. Never weaken policy/sandbox/TLS.

Release attachment is only Gather-1.8.19-extension.zip. Check package and GitHub receipts before claiming publication. Update the same installed folder and Reload. Keep 1.8.18 for rollback in a separate profile. Public source/evidence must remain fictional; user attachments and private corpora stay outside packaging inputs.

Priorities: target Windows/work-app acceptance and evidence-driven parser fixes. Other deferred features remain deferred; do not restart old roadmaps. Save final cloud startup/ref without changing network/secrets or adding a runtime install script.
