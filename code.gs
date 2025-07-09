function fetchWorkTimeData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Worktime");
  const logSheet = ss.getSheetByName("WT_Log") || ss.insertSheet("WT_Log");

  const timezone = "Asia/Jakarta";
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const dateStr = Utilities.formatDate(yesterday, timezone, "yyyy-MM-dd");
  const displayDate = Utilities.formatDate(yesterday, timezone, "MM/dd/yyyy");

  const users = [
    { name: "User1", wakaApiKey: "YOUR_WAKATIME_API_KEY_1", clockifyUserId: "CLOCKIFY_USER_ID_1" },
    { name: "User2", wakaApiKey: "YOUR_WAKATIME_API_KEY_2", clockifyUserId: null },
    { name: "User3", wakaApiKey: null, clockifyUserId: "CLOCKIFY_USER_ID_3" },
    { name: "User4", wakaApiKey: null, clockifyUserId: null }
  ];

  const CLOCKIFY_API_KEY = "YOUR_GLOBAL_CLOCKIFY_API_KEY";
  const CLOCKIFY_WORKSPACE_ID = "YOUR_CLOCKIFY_WORKSPACE_ID";

  users.forEach(user => {
    let wakaHours = 0;
    let clockifyHours = 0;

    if (user.wakaApiKey) {
      try {
        wakaHours = fetchWakaTime(user.wakaApiKey, dateStr, user.name, displayDate, logSheet);
      } catch (e) {
        logDetailed(logSheet, user.name, "WakaTime", displayDate, "Error fetching data", 0);
      }
    }

    if (user.clockifyUserId) {
      try {
        clockifyHours = fetchClockifyTime(CLOCKIFY_API_KEY, CLOCKIFY_WORKSPACE_ID, user.clockifyUserId, dateStr, user.name, displayDate, logSheet);
      } catch (e) {
        logDetailed(logSheet, user.name, "Clockify", displayDate, "Error fetching data", 0);
      }
    }

    sheet.appendRow([user.name, displayDate, wakaHours, clockifyHours]);
  });
}

function fetchWakaTime(apiKey, date, username, displayDate, logSheet) {
  const url = `https://wakatime.com/api/v1/users/current/summaries?start=${date}&end=${date}`;
  const headers = { Authorization: "Basic " + Utilities.base64Encode(apiKey) };
  const response = UrlFetchApp.fetch(url, { headers });
  const data = JSON.parse(response.getContentText());

  let totalSeconds = 0;

  const projects = data.data[0]?.projects || [];
  projects.forEach(p => {
    const seconds = p.total_seconds || 0;
    totalSeconds += seconds;

    logDetailed(
      logSheet,
      username,
      "WakaTime",
      displayDate,
      p.name || "Unknown Project",
      Math.round((seconds / 3600) * 100) / 100
    );
  });

  return Math.round((totalSeconds / 3600) * 100) / 100;
}

function fetchClockifyTime(apiKey, workspaceId, userId, date, username, displayDate, logSheet) {
  const parts = date.split("-");
  const startUTC = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 0, 0, 0));
  const endUTC = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 23, 59, 59));
  const startISOString = startUTC.toISOString();
  const endISOString = endUTC.toISOString();

  let totalSeconds = 0;
  let page = 1;
  const pageSize = 50;
  const taskDurations = {};

  while (true) {
    const url = `https://api.clockify.me/api/v1/workspaces/${workspaceId}/user/${userId}/time-entries?start=${startISOString}&end=${endISOString}&page=${page}&page-size=${pageSize}`;
    const options = {
      method: "get",
      headers: { "X-Api-Key": apiKey },
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(url, options);
    const entries = JSON.parse(response.getContentText());

    if (!Array.isArray(entries) || entries.length === 0) break;

    entries.forEach(entry => {
      const durationStr = entry.timeInterval?.duration;
      if (!durationStr) return;

      const duration = parseClockifyDuration(durationStr);
      totalSeconds += duration;

      let taskName = "Uncategorized";

      if (entry.project && entry.project.name) {
        taskName = entry.project.name;
      } else if (entry.description) {
        taskName = entry.description;
      }

      if (!taskDurations[taskName]) {
        taskDurations[taskName] = 0;
      }

      taskDurations[taskName] += duration;
    });

    if (entries.length < pageSize) break;
    page++;
  }

  // Log grouped task durations
  for (let task in taskDurations) {
    const hours = Math.round((taskDurations[task] / 3600) * 100) / 100;
    logDetailed(logSheet, username, "Clockify", displayDate, task, hours);
  }

  return Math.round((totalSeconds / 3600) * 100) / 100;
}

function parseClockifyDuration(durationStr) {
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const match = regex.exec(durationStr);
  if (!match) return 0;
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);
  return hours * 3600 + minutes * 60 + seconds;
}

function logDetailed(sheet, name, source, date, activity, durationHours) {
  const timestamp = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");
  sheet.appendRow([timestamp, name, source, date, activity, durationHours]);
}
