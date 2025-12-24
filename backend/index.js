import "dotenv/config";

import { hashPdf } from "./utils/hashPdf.js";
import { pdfToImages } from "./utils/pdfToImages.js";
import { uploadImageToGithub } from "./utils/uploadToGithub.js";
import { githubFolderExists } from "./utils/githubFolderExists.js";
import { listGithubFolder } from "./utils/listGithubFolder.js";

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import fs from "fs-extra";

import dashboardState from "./dashboardState.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ---------- Startup tmp cleanup (recommended) ----------
await fs.ensureDir("./tmp");

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// ---------- Socket ----------
io.on("connection", (socket) => {
  console.log("TV connected");
  socket.emit("INIT_STATE", dashboardState);
});

// ---------- APIs ----------
app.post("/update-layout", (req, res) => {
  dashboardState.layout = req.body.layout;
  io.emit("DASHBOARD_UPDATE", dashboardState);
  res.send({ success: true });
});

app.post("/update-widget", (req, res) => {
  const { widget, data } = req.body;

  if (!dashboardState.widgets[widget]) {
    return res.status(400).send({ error: "Invalid widget" });
  }

  dashboardState.widgets[widget] = data;
  io.emit("DASHBOARD_UPDATE", dashboardState);

  res.send({ success: true });
});

// ---------- Playlist Update ----------
app.post("/update-playlist", async (req, res) => {
  const { playlist } = req.body;

  try {
    const finalSlides = [];

    for (const item of playlist) {

      // -------- IMAGE --------
      if (item.type === "image") {
        finalSlides.push({
          type: "image",
          url: item.url,
          duration: item.duration
        });
      }

      // -------- PDF --------
      if (item.type === "pdf") {
        const workDir = `./tmp/${Date.now()}-${Math.random().toString(36).slice(2)}`;

        try {
          await fs.ensureDir(workDir);

          const pdfPath = `${workDir}/input.pdf`;
          const response = await fetch(item.url);
          const buffer = await response.arrayBuffer();
          await fs.writeFile(pdfPath, Buffer.from(buffer));

          const hash = hashPdf(pdfPath);
          const folder = `slides/${hash}`;

          let imageUrls = [];

          // ---- Reuse if exists ----
          if (await githubFolderExists(folder)) {
            imageUrls = await listGithubFolder(folder);
          } 
          // ---- Convert & upload ----
          else {
            const images = await pdfToImages(pdfPath, workDir);

            for (let i = 0; i < images.length; i++) {
              const remote = `${folder}/page_${i + 1}.png`;
              const url = await uploadImageToGithub(images[i], remote);
              imageUrls.push(url);
            }
          }

          imageUrls.forEach(url => {
            finalSlides.push({
              type: "image",
              url,
              duration: item.duration
            });
          });

        } finally {
          // ✅ AUTO CLEANUP (always runs)
          await fs.remove(workDir);
        }
      }
    }

    dashboardState.widgets.mediaSlideshow = finalSlides;
    io.emit("DASHBOARD_UPDATE", dashboardState);

    res.send({ success: true, slides: finalSlides.length });

  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to update playlist" });
  }
});

// ---------- Start Server ----------
server.listen(PORT, "0.0.0.0", () => {
  console.log("Backend running on port " + PORT);
});
