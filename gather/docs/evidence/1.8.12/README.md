# Gather 1.8.12 evidence

Fresh final-source run: 191 Node tests, 105 rendered workflow groups, 10 actual ServiceWorkerGlobalScope groups and 5 real Chromium isolated-world reader groups. Chrome extension APIs are controlled doubles; profile-reader network is intercepted fictional data. These are distinct from native installed-extension checks. Native runner exits 2/blocked with zero groups under the administrator's wildcard extension policy. No new live-platform check in this release.

The JSON files retain executed scenario descriptions. Current-profile popup, settings and saved-selection screenshots were actually inspected. Public evidence uses fictional data only. Package verification and extracted-package evidence are recorded in releases/1.8.12. Repeat runs do not increase unique counts. Review HARDENING-REVIEW-1.8.12.md for scanner and security-review limitations.
