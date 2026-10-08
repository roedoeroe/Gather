# Gather 1.8.7 evidence

Fresh release checks: **132 Node tests, 85 rendered groups and 10 actual worker groups passed**, zero failures/errors/skips. The 85 rendered groups comprise capture 21, toolbar 22, case/privacy 18, stabilization 10, case clipboard 7 and installed-runner interface 7. Chrome extension APIs remain controlled doubles. Standard DOM/canvas/IndexedDB/clipboard and worker lifecycle are real where the individual scripts describe them. These are not native installed-extension passes.

The new clipboard journey produced **seven failing groups against untouched runtime 1.8.6** before these fixes (`clipboard-before-*`). The failures covered missing decision/context/date labels, invisible denial feedback, stale account/coverage/deleted-case text and copying after Cancel. The final 1.8.7 run passes all seven. Two Node tests independently check separate cross-scan observations, renames, stable references and same-named case isolation.

The new journey checks actual text clipboard bytes, injects a denied write to check visible recovery/manual selection, changes an association, switches the global destination, delays validation then cancels, updates coverage and deletes the case through another actual rendered workspace. The denied-copy dialog also fits 400px with no horizontal overflow. Its desktop/narrow and deleted-case images were opened and visually inspected; they contain fictional fixtures only. No native OS/permission-dialog or screen-reader validation is claimed.

The known administrator restriction remains unchanged; no prohibited native loading retry or policy/sandbox/TLS change. [Plain-language explanation](../../BROWSER-TEST-BLOCKER.md). Live platforms were not tested. The cloud configuration dialog is separate from user-computer installation.

The extracted development package independently passed its 132 Node checks and 7 case clipboard groups. Every extracted runtime byte matches the final source; ZIP CRC/safe paths/versions are verified by packaging. These reruns do not increase the unique release count; the independent delivery receipt records final download hashes without circular archive contents. Prior 1.8.6 ZIPs remain unchanged.
