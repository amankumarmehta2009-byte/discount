# Security and launch checklist

- [ ] Replace demo credentials and keep secrets in environment variables.
- [ ] Add authentication, email verification, secure sessions and password reset.
- [ ] Add role-based authorization to every admin and marketplace operation.
- [ ] Validate and sanitize all inputs; use parameterised SQL.
- [ ] Add API rate limits, abuse detection and request size limits.
- [ ] Configure exact CORS origins; do not use wildcard origins with credentials.
- [ ] Use HTTPS in production and restrict extension host permissions.
- [ ] Never collect shopping passwords, OTPs, card numbers or bank credentials.
- [ ] Add privacy notice, consent, retention and account deletion workflows.
- [ ] Add audit logging for admin actions and marketplace transactions.
- [ ] Verify provider licences and retailer terms for all feeds.
- [ ] Test price accuracy, variant matching, offer stacking and stale data.
- [ ] Add database backups, monitoring, error reporting and recovery runbooks.
- [ ] Run dependency, static analysis and penetration/security testing.
