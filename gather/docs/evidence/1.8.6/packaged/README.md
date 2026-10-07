# Extracted-package verification

The development ZIP was extracted to a separate temporary directory. Its own Node suite passed 130 checks; its own rendered toolbar journey passed 22 groups and stabilization passed 10. These reruns exercise packaged modules rather than serving the working checkout. Chrome APIs remain controlled doubles; no native extension acceptance is implied.

The final development ZIP adds these external verification records after that run. Runtime bytes are identical to the tested extracted package and are compared individually against both final ZIPs and SHA256.json. CRC, matching version/entry points, safe archive paths, unchanged permissions and preserved 1.8.5 hashes are independently verified. Final full-archive SHA-256 values belong in the external delivery receipt to avoid circular hashing. Counts in TESTING do not double-count these reruns.
