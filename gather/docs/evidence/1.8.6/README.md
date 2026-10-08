# Gather 1.8.6 evidence

130 Node checks; 21 capture/UX, 22 toolbar/capture/lookup, 18 case/privacy, 10 stabilization and 10 actual worker groups passed. These are scenario groups, not a count of every assertion. Current run logs/results are included. Before-fix logs deliberately contain failed regression assertions; they are distinct from the release pass.

Chrome extension APIs are controlled doubles. DOM/canvas/IndexedDB/BroadcastChannel, ordinary toolbar image/text clipboard and applicable Web Locks/worker stop-restart behavior are real. Delay/failure gates are mocked. Screenshots contain fictional fixtures and rendered product documents; they are not native installed-extension acceptance. Offscreen lazy history thumbnails may be unpainted in a full-page test screenshot. Direct toolbar, narrow history and deleted-during-copy screenshots were visually inspected.

Native loading remains administrator-blocked; live platforms/native FireShot were not tested. The untouched 1.8.5 baseline and ZIP CRC/runtime bytes/checksums were reverified. Packaged-build checks are recorded separately. See ../../TESTING.md for practical scope and commands.

One toolbar timing failure was diagnosed and corrected by waiting for expected group rendering, retaining all assertions. Its diagnostic log is separate from the fresh successful release log. All browser harnesses remove stale results.json at startup.
