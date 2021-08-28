require("dotenv").config();

const express = require("express");
const { google } = require("googleapis");

const app = express();
const port = 8000;

app.get("/", (req, res) => {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.KEY_FILE,
    scopes: ["https://www.googleapis.com/auth/calendar.events.readonly"],
  });

  const calendar = google.calendar({ version: "v3", auth });

  calendar.events.list(
    {
      calendarId: process.env.CALENDAR_ID,
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime",
    },
    (error, caledarRes) => {
      // Send back the error if there is one.
      if (error) {
        res.send(
          JSON.stringify({ message: `The API returned an error: ${error}` })
        );
      }

      // Set a few values for later.
      let currentMeeting = false;

      const now = Date.now();
      const events = caledarRes.data.items;

      // If there aren't any found, return a message.
      if (!events.length) {
        res.send(JSON.stringify({ message: "No events found." }));
      }

      events.map((event) => {
        if (event.start.dateTime && event.end.dateTime) {
          const startTime = Date.parse(event.start.dateTime);
          const endTime = Date.parse(event.end.dateTime);

          // We want current meeting to be true if this meeting is happening now.
          if (now >= startTime && now <= endTime) {
            currentMeeting = true;
          }
        }
      });

      res.send(
        JSON.stringify({
          currentMeeting,
        })
      );
    }
  );
});

app.listen(port, () => {
  console.log(`We are live on port ${port}.`);
});
