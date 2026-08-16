# ReqScope

**ReqScope** brings your requirement specifications directly into your editor, allowing you to hover over requirements strings and view key metadata about the requirement through your providers API.

## Features

* **On-Hover Tooltips**: Hover over any requirement key in your code to view the live requirement.
* **Direct Web Linking**: Click open direct links to the requirement.
* **Secure Authentication**: Uses SecretStorage for secure OAuth.

![ReqScope Hover Demo](images/demo-hover.png)

## Setup & Requirements

### Prerequisites
1. API credentials for your selected requirements tool.

### Settings and Configuration
1. Open Settings (`Ctrl+,` / `Cmd+,`)
1. Select requirements provider
1. Apply any settings for the requirements software you want to use
1. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
1. Run the corresponding **ReqScope** credential setting command
1. Enter your API credentials

## Extension Settings

This extension contributes the following workspace settings:

* `reqscope.jamaCompanyID`: Your Jama Cloud company domain ID (e.g., enter `mycompany` for `mycompany.jamacloud.com`).

## Extension Commands

* `reqscope.setJamaCredentials`: Prompts for your Jama Client ID and Client Secret, saving them securely to your operating system's native keychain.

## Known Issues

* **Custom Fields**: If your organization uses non-standard field names for requirements, they may not appear correctly.

## Release Notes

See the [CHANGELOG.md](CHANGELOG.md) for full details on version updates and bug fixes.