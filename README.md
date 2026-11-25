# 🩷 cute collab whiteboard

*a tiny real-time whiteboard where you draw, stamp hearts, and (soon) do it all together with friends*

🌱 **status: work in progress.** started on a library afternoon with one spare hour. still growing, still cute.

---

## what it does

- ✏️ draw on a canvas with your mouse
- 🩷 stamp little hearts anywhere you want
- 🔌 sends every stroke over a websocket as tiny json messages
- 👯 syncing between tabs is the next thing on my list

## controls

| key / action | what happens |
| --- | --- |
| click + drag | draw a line |
| press `h`, then click | stamp a 🩷 |
| press `d` | back to drawing |

## run it

you need [Node.js](https://nodejs.org) installed.

```bash
cd whiteboard
npm install
node server/index.js
```

then open <http://localhost:3000> in your browser. once syncing works, open it in two tabs and watch them mirror each other.

## how it works (the simple version)

```
you draw a line
  -> browser sends it to the server as json
  -> server passes it to everyone else
  -> their browser draws the same line
```

the part that clicked for me: **sending** happens inside the mouse events, **receiving** happens inside the websocket `message` listener, and they never mix. one small function (`drawLine`) is shared by both, so the lines look identical on every screen.

## folder structure

```
whiteboard/
  server/
    index.js      # express + ws server
  public/
    index.html    # the page
    style.css
    client.js     # drawing + websocket client
```

## built with

- Node.js + Express
- [ws](https://github.com/websockets/ws) for websockets
- plain JavaScript and the HTML canvas (no frameworks, on purpose)

## roadmap

- [x] draw on the canvas
- [x] heart stamp tool
- [x] send strokes to the server
- [ ] server broadcasts to every other tab
- [ ] colors + brush size
- [ ] clear button
- [ ] new tabs see what's already drawn
- [ ] rooms, so friends get their own board

## what i'm learning

- how a websocket connection lives: open, send, receive, broadcast
- giving messages a `type` so one connection can carry lots of different actions
- keeping drawing code separate from networking code
- that being rusty is not the same as being bad at this 🩷

---

made with 🩷 by [@agricompsciers](https://github.com/agricompsciers)
