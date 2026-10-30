# Running Memory in production

For the people who install the app and look after it.

## What runs

| Part        | Details                                                                                   |
| ----------- | ----------------------------------------------------------------------------------------- |
| Process     | One Node.js process (`npm start`) listening on port **3000**.                             |
| Database    | None to install. Accounts, settings and metadata are small JSON files in the data folder. |
| Files       | Every upload, its resized copies and the converted videos, in the data folder.            |
| Video tools | ffmpeg and ffprobe, installed by `npm install` as static binaries.                        |
| Runtime     | Node.js 20.9 or newer. The Docker image has it.                                           |

There is nothing else to run: no database server, no queue, no cache. Run a single instance; the files are the
database.

**Resources.** Photos are light. Converting a video uses every CPU core for roughly the video's length, and
the app converts one video at a time. Plan disk space for about twice the size of the uploaded videos: the
original is kept next to the converted copy.

## The data folder

Everything worth keeping lives in **one folder**: `/app/data` in the container, `./data` otherwise (change it
with `DATA_DIR`). `docker-compose.yml` mounts a named volume there. If you write your own compose file or run
the image directly, mount a volume too, or every photo and account is gone when the container is replaced:

```yaml
services:
  memory:
    image: memory
    volumes:
      - /srv/memory/data:/app/data
```

The container runs as the unprivileged `node` user (uid 1000). A folder mounted from the host must be writable
by it: `chown -R 1000:1000 /srv/memory/data`.

At every start the app logs where the data is and warns when it is not on a mounted volume.

```
data/
  users.json       staff accounts (passwords hashed)
  settings.json    the secret that signs sessions, the friends passcode (hashed), the branding
  events.json      events
  branding/        the uploaded logo
  photos/<id>/     one folder per photo or video: the original, resized copies, video.mp4, meta.json
  tmp/             uploads in progress
```

`users.json` and `settings.json` are readable by the app's user only. Treat the whole folder as confidential:
it holds the private photos.

## First start

1. Start the app with an empty data folder.
2. Read the setup code from the log: `docker compose logs memory | grep '\[setup\]'`
3. Open `/setup`, enter the code, name the archive, and choose the super admin's username and password and,
   when the friends area is on, the friends passcode.

The code proves that whoever does the setup can read the server log. A new code is printed at every start
until the setup is done; after that `/setup` is closed and sign-in happens at `/admin/login`.

## Settings

Every setting is an optional environment variable. Nothing secret has to be configured: the app creates its
own signing secret, and accounts are created on `/setup` and in the dashboard.

| Variable                | Default                   | Meaning                                                                                           |
| ----------------------- | ------------------------- | ------------------------------------------------------------------------------------------------- |
| `DATA_DIR`              | `./data`                  | Data folder. Relative paths start from the app folder.                                            |
| `FRIENDS_ENABLED`       | `true`                    | `false` removes the friends area: no passcode, no unlock page, private items for admins only.     |
| `SITE_NAME`             | `Memory`                 | Starting name. The super admin changes it in Dashboard › Branding.                                |
| `SITE_ORGANIZATION`     | `Your organisation`       | Starting organisation name (footer, home page).                                                   |
| `SITE_TAGLINE`          | `Photo and video archive` | Starting small line above the home page heading.                                                  |
| `SITE_DESCRIPTION`      | a sentence                | Starting text under the home page heading.                                                        |
| `BRAND_PRIMARY_COLOR`   | `#2f5bd0`                 | Starting primary colour as `#rrggbb`.                                                             |
| `BRAND_SECONDARY_COLOR` | `#0e8a83`                 | Starting secondary colour as `#rrggbb`.                                                           |
| `MAX_UPLOAD_MB`         | `100`                     | Largest photo accepted, in MB.                                                                    |
| `MAX_VIDEO_UPLOAD_MB`   | `2048`                    | Largest video accepted, in MB.                                                                    |
| `SESSION_SECRET`        | generated                 | Fixed signing secret (32+ characters). Changing it signs everyone out.                            |
| `COOKIE_SECURE`         | automatic                 | `true` or `false` to force the `Secure` cookie flag. Automatic follows HTTPS.                     |
| `TRUST_PROXY`           | `true`                    | Trust `X-Real-IP` / `X-Forwarded-For` from the reverse proxy. Set `false` when there is no proxy. |
| `FFMPEG_PATH`           | bundled                   | Use this ffmpeg binary instead of the one installed by npm.                                       |
| `FFPROBE_PATH`          | bundled                   | Use this ffprobe binary instead of the one installed by npm.                                      |

What is set in the dashboard wins over the `SITE_*` and `BRAND_*` variables, which win over the defaults.
Examples: [.env.example](../.env.example).

## Behind a reverse proxy

Allow large uploads, stream them straight to the app, and pass the visitor's address on (it is used to slow
down password guessing):

```nginx
server {
    listen 443 ssl;
    server_name photos.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        client_max_body_size 2100m;      # a bit more than MAX_VIDEO_UPLOAD_MB
        proxy_request_buffering off;     # stream uploads instead of buffering them
        proxy_read_timeout 600s;
        proxy_send_timeout 600s;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name photos.example.com;
    return 301 https://$host$request_uri;
}
```

With `X-Forwarded-Proto https` the app marks its cookies `Secure` and sends `Strict-Transport-Security`.
`GET /api/health` answers `200` once the server accepts requests.

## Updating

```bash
git pull
docker compose up -d --build
```

The data folder is not part of the image, so an update never changes or removes data. Video conversions that
were interrupted continue after the restart.

## Backups

Back up the data folder; it is the only thing that matters.

```bash
rsync -a --delete /srv/memory/data/ /backup/memory/
```

Every file is written in one step (a temporary file renamed into place), so copying while the app runs is
safe; an upload that happens during the copy may just be missing from that copy. To restore: stop the app, put
the folder back, start the app.

## Logs worth knowing

| Log line starts with | Meaning                                                                              |
| -------------------- | ------------------------------------------------------------------------------------ |
| `[storage]`          | Where the data is; a warning if it is not on a mounted volume.                       |
| `[setup]`            | The setup code (until the first super admin exists), and when it was used.           |
| `[video]`            | ffmpeg or ffprobe missing, conversions resumed after a restart, a failed conversion. |
| `[session]`, `[api]` | Unexpected server errors. The visitor saw a generic message.                         |

## When the super admin password is lost

1. Stop the app. It keeps the accounts in memory and would overwrite your edit.
2. Open `data/users.json` and delete the one entry whose `"role"` is `"superadmin"`.
3. Start the app, read the new setup code from the log and open `/setup` again.

Photos, videos, events and the other admins are kept.

## Troubleshooting

| What you see                                           | What to do                                                                                      |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| Photos are gone after a deploy                         | The data folder was not a volume. Mount it; the lost uploads cannot come back.                  |
| The app cannot write to the data folder                | The mounted folder is not writable by uid 1000. `chown` it (see above).                         |
| "This file is too large"                               | Raise `MAX_UPLOAD_MB` / `MAX_VIDEO_UPLOAD_MB` and the proxy's `client_max_body_size`.           |
| Upload stops at 100 % and fails after a while          | Proxy timeout. Raise `proxy_read_timeout` and turn off request buffering.                       |
| "Video support is not available: ffmpeg was not found" | Install ffmpeg in the image, or set `FFMPEG_PATH` and `FFPROBE_PATH`.                           |
| A video stays "Waiting"                                | Videos are converted one after another. It starts when the one before it ends.                  |
| A video shows "Failed"                                 | The file is damaged or in a format ffmpeg cannot read. Admins see the reason when they open it. |
| "Too many attempts. Try again in a few minutes."       | Several wrong passwords or passcodes from one address or for one account. Wait 10 minutes.      |
| Everyone gets "Too many attempts" at once              | The proxy does not set `X-Real-IP`, so all visitors look like one address.                      |
| The home page shows the minimal style                  | Too few public photos for the chosen style yet. It appears once there are more.                 |
| The photos on the home page do not move                | "Reduce motion" is on in the visitor's system settings. They stay still on purpose.             |
| Everyone was signed out                                | Normal after `SESSION_SECRET` changes. Friends are signed out when the passcode changes.        |
| `/admin/login` keeps sending you to `/setup`           | No super admin exists yet. Complete the setup.                                                  |
