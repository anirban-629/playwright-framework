### Commit Message Rule

| Type                                                              | Meaning                                             |
| ----------------------------------------------------------------- | --------------------------------------------------- |
| `FEAT`                                                            | New feature added                                   |
| `FIX`                                                             | Bug fix                                             |
| `PERF`                                                            | Performance improvement                             |
| `DOCS`                                                            | Documentation only changes                          |
| `STYLE`                                                           | Formatting and style (no functional change)         |
| `REFACTOR`                                                        | Code changes without adding features or fixing bugs |
| `TEST`                                                            | Adding or updating tests                            |
| `BUILD`                                                           | Build or tooling related                            |
| `CI`                                                              | CI configuration changes                            |
| `CHORE`                                                           | Misc maintenance tasks                              |
| `DEPS`                                                            | Dependency updates                                  |
| _(Supported by Conventional Commits)_ ([Conventional Commits][1]) |                                                     |

[1]: https://www.conventionalcommits.org/en/v1.0.0-beta/?utm_source=chatgpt.com "Conventional Commits"

### Test Cases

#### 🧾 Lead Management (1–7)

- Verify lead creation with mandatory fields
- Verify lead creation with complete details
- Verify lead update before conversion
- Verify lead assignment to sales user
- Verify duplicate lead detection
- Verify lead status progression
- Verify lead conversion to account, contact, and opportunity

#### 🏢 Account Management (8–12)

- Verify account creation during lead conversion
- Verify account details auto-populated from lead
- Verify account edit after conversion
- Verify account hierarchy association
- Verify duplicate account handling

#### 👤 Contact Management (13–16)

- Verify contact creation during lead conversion
- Verify contact details mapping from lead
- Verify contact update functionality
- Verify primary contact association with account

#### 💼 Opportunity Management (17–24)

- Verify opportunity creation during lead conversion
- Verify opportunity stage progression from qualification to close
- Verify opportunity amount calculation
- Verify opportunity close date update
- Verify opportunity product association
- Verify opportunity price book assignment
- Verify opportunity probability update by stage
- Verify opportunity forecast category update

#### 📦 Products, Price Books & Quotes (25–31)

- Verify product selection for opportunity
- Verify price book entry selection
- Verify opportunity line item pricing calculation
- Verify quote creation from opportunity
- Verify quote synchronization with opportunity
- Verify quote approval process
- Verify quote PDF generation

#### 🤝 Contract & Closure (32–39)

- Verify contract creation from accepted quote
- Verify contract start and end date calculation
- Verify contract association with account and opportunity
- Verify contract activation
- Verify contract status update
- Verify opportunity closed as won after contract activation
- Verify revenue reflected in sales reports
- Verify account status update after deal closures
