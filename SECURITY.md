# Security Guidelines

## 🔒 Sensitive Information

This repository contains **NO** sensitive information in the codebase. All private keys, wallet addresses, and sensitive configuration have been removed or replaced with placeholders.

## ⚠️ Important Security Notes

### Private Keys
- **NEVER** commit private keys to version control
- Use environment variables for sensitive data
- The `.env.example` file contains only placeholder values
- Always use `.env` files for local development (already in `.gitignore`)

### Environment Files
- `.env` files are automatically ignored by Git
- Copy `.env.example` to `.env` and add your real values
- Never share your `.env` file or commit it to version control

### Test Files
- Test files containing sensitive data are excluded from the repository
- Pattern `test-*.js` and `check-*.js` are in `.gitignore`
- Create local test files for development but don't commit them

## 🛡️ Security Checklist Before Pushing

- [ ] No private keys in any files
- [ ] No real wallet addresses in examples
- [ ] `.env` files are in `.gitignore`
- [ ] Test files with sensitive data are excluded
- [ ] Only placeholder values in `.env.example`
- [ ] Hardhat config uses environment variables

## 🔍 How to Check for Sensitive Data

Before pushing, run these commands to check for sensitive information:

```bash
# Check for private keys (should return no results)
grep -r "0x[a-fA-F0-9]{64}" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=build

# Check for specific test addresses (should return no results)
grep -r "0x0E17561FEd60D7966Ab9d22A32D7B01dB9F02818" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=build

# Check for the test private key (should return no results)
grep -r "3cf90f4acdaee72ab90c0da7eda158ec1e908a5698aaf11a99070bba5da18b17" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=build
```

## 📝 Safe Development Practices

1. **Use Environment Variables**: Store all sensitive data in `.env` files
2. **Local Testing**: Create local test files that are ignored by Git
3. **Placeholder Values**: Use clear placeholder values in example files
4. **Regular Audits**: Regularly check for accidentally committed sensitive data
5. **Pre-commit Hooks**: Consider adding pre-commit hooks to scan for sensitive data

## 🚨 If Sensitive Data is Accidentally Committed

If you accidentally commit sensitive data:

1. **Immediately** change any compromised private keys
2. Move funds from compromised wallets
3. Use `git filter-branch` or BFG Repo-Cleaner to remove sensitive data from history
4. Force push the cleaned repository
5. Notify team members to re-clone the repository

## 📞 Reporting Security Issues

If you find any security issues in this repository, please:

1. **DO NOT** create a public issue
2. Contact the maintainers privately
3. Provide details about the security concern
4. Allow time for the issue to be addressed before public disclosure
