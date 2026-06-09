# Lumen Client

A curated Minecraft utility mod — fork of [Meteor Client](https://github.com/MeteorDevelopment/meteor-client).

**Current Minecraft version:** `26.1.2`  
**Fabric Loader:** `0.19.2`  
**Output JAR:** `lumen-client-{mc_version}-{build}.jar`

---

## Download

Get the latest release from the [Releases](https://github.com/Minirick0-0/Lumen-Launcher/releases/latest) page.

---

## Building

```bash
git clone https://github.com/Minirick0-0/Lumen-Launcher
cd lumen-client
./gradlew build
# Output: build/libs/lumen-client-{version}-local.jar
```

---

## Switching Minecraft Version

All version pins live in **one file: `gradle/libs.versions.toml`**.

```toml
[versions]
minecraft     = "26.1.2"                  # change this first
fabric-loader = "0.19.2"                  # https://fabricmc.net/develop
fabric-api    = "0.146.1+26.1.2"          # must match MC version
baritone      = "26.1-SNAPSHOT"           # meteor's baritone fork
sodium        = "mc26.1.1-0.8.9-fabric"
lithium       = "mc26.1.2-0.24.2-fabric"
iris          = "1.10.9+26.1-fabric"
```

**Steps:**
1. Go to https://fabricmc.net/develop — copy `minecraft`, `fabric-loader`, `fabric-api` for the new version.
2. Update `gradle/libs.versions.toml`.
3. Update `baritone`, `sodium`, `lithium`, `iris` to versions matching the new MC (check their GitHub releases).
4. Run `./gradlew build` and fix any API breakage.
5. Tag: `git tag v{mcversion}-lumen-{n}` then `git push --tags`.

**Version history:**

| Lumen Version | Minecraft | Tag |
|---|---|---|
| 1.0 | 26.1.2 | `v26.1.2-lumen-1.0` |

---

## Keeping Up with Upstream Meteor

The remote `upstream` is already configured:
```bash
git remote -v
# upstream  https://github.com/MeteorDevelopment/meteor-client (fetch)
```

Pull new Meteor changes:
```bash
git fetch upstream
git merge upstream/master
# Resolve conflicts — especially in Modules.java (we removed modules there)
git push origin main
```

See `.github/workflows/sync-upstream.yml` — auto-checks for new Meteor releases weekly.

---

## Credits

See [CREDITS.md](CREDITS.md). Powered by Meteor Client (GPL-3.0).
