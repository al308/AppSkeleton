# Google Play metadata (template)

| Field | Limit | Value |
| --- | --- | --- |
| App name | 30 | MyApp |
| Short description | 80 | One line shown in search |
| Full description | 4000 | … |

- **Category:** Games → Puzzle (+ tags)
- **Contact email / website:** you@example.com · https://example.com/
- **Privacy Policy:** https://example.com/legal/privacy-policy.html (live before submit)
- **Pricing:** Free (no ads, no IAP)

## Data Safety form

For a fully offline, single-player app with local-only storage:

| Question | Answer |
| --- | --- |
| Does your app collect or share required user data types? | **No** |
| Is collected data encrypted in transit? | **N/A** (nothing collected) |
| Can users request data deletion? | **N/A** (nothing collected) |

> If you later add ads (e.g. AdMob), update this: declare "Advertising ID" and
> "Approximate location" as collected by third-party SDKs.

## ⚠️ Closed testing requirement (the long pole)

Google requires **12+ active testers over ≥ 14 days** on a closed track before
you can promote to production. **Start this first**, in parallel with everything
else. Tester instructions to paste into the Closed Testing "Instructions" field:

```
Thanks for testing MyApp!
1. Accept the email invitation from Google Play
2. Open the Play Store link and install MyApp (it shows "Closed test")
3. Try the main flows; toggle settings; close & reopen to check persistence
Send feedback to you@example.com — thanks!
```

## Assets

512×512 icon, 1024×500 feature graphic, phone screenshots — see `assets-checklist.md`.
