---
title: Sharing and permissions
description: Roles, sharing a notebook with people, public links, and removing access.
order: 2
---

Access is set per notebook. Everyone in a workspace sees the list of notebooks, but opens only the ones shared with them.

## Roles

| Role | Read | Comment | Edit notes | Manage access |
| --- | --- | --- | --- | --- |
| Viewer | Yes | No | No | No |
| Commenter | Yes | Yes | No | No |
| Editor | Yes | Yes | Yes | No |
| Owner | Yes | Yes | Yes | Yes |

Workspace admins are owners of every notebook.

## Share a notebook

```ts
await sakura.notebooks.share("nb_8f2k", {
  email: "lan@example.com",
  role: "editor",
});
```

People outside the workspace get an email invitation and join as guests. Guests only see what is shared with them, and
they are free on every plan.

## Public links

A public link lets anyone with the address read a notebook without signing in. It is off by default, and only owners can
turn it on.

```ts
const { url } = await sakura.notebooks.publish("nb_8f2k", { expiresIn: "30d" });
```

> [!NOTE]
> Public pages are read-only and are not indexed by search engines. Comments and history stay private.

## Remove access

```ts
await sakura.notebooks.unshare("nb_8f2k", { email: "lan@example.com" });
await sakura.notebooks.unpublish("nb_8f2k");
```

Removing someone takes effect at once on every device. Copies they exported before are not affected.
