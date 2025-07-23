---
name: Bug report
about: Create a report to help us improve
title: '[BUG] '
labels: 'bug'
assignees: 'sw3do'

---

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment (please complete the following information):**
 - OS: [e.g. macOS 14.0, Ubuntu 22.04, Windows 11]
 - Node.js version: [e.g. 18.16.0]
 - npm version: [e.g. 9.5.1]
 - Package version: [e.g. 1.0.0]

**Command used**
```bash
# Paste the exact command you ran
node-package-builder build --platforms linux,darwin,win32
```

**Error output**
```
# Paste the complete error output here
```

**Additional context**
Add any other context about the problem here.

**Configuration**
If using programmatic API, please share your configuration:
```javascript
const builder = new NodePackageBuilder({
  // Your configuration here
});
```