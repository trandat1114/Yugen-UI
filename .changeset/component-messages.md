---
"yugen-ui": minor
---

Every built-in component string can be replaced. `YugenProvider` takes `messages` (by component namespace, partial overrides allowed, nested providers inherit) and `locale` (default Intl locale for dates, times and numbers). `messagesEn` switches all built-in strings to English; each component also exports its own `…Messages` defaults and `…MessagesEn`. Vietnamese stays the default, and label props such as `dismissLabel` still take priority.
