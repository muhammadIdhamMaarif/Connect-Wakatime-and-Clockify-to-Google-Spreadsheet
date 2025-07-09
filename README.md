# 📊 Worktime Tracker Logger (WakaTime + Clockify)

This Google Apps Script automatically fetches and logs developer work hours from **WakaTime** and **Clockify** into a Google Spreadsheet. It calculates daily work durations, breaks them down by project/task, and logs them for each registered user.

## ✅ Features

- ⏰ Collects **yesterday’s** worktime data automatically.
- 🔄 Integrates with:
  - **[WakaTime](https://wakatime.com/)** for coding activity tracking.
  - **[Clockify](https://clockify.me/)** for general time tracking.
- 📁 Stores daily total work hours in the `Worktime` sheet.
- 📄 Logs detailed per-project/task data in the `WT_Log` sheet.
- 🛡️ Robust error handling for missing data or invalid API keys.

---

## 🧪 Example Output

**Worktime Sheet**
| Name    | Date       | WakaTime (hrs) | Clockify (hrs) |
|---------|------------|----------------|----------------|
| Idham   | 07/08/2025 | 2.3            | 1.5            |
| Syafa   | 07/08/2025 | 0.5            | 0              |

**WT_Log Sheet**
| Timestamp           | Name    | Source    | Date       | Activity          | Hours |
|---------------------|---------|-----------|------------|-------------------|--------|
| 2025-07-08 09:00:00 | Idham   | WakaTime  | 07/08/2025 | Project Alpha     | 1.3    |
| 2025-07-08 09:00:00 | Idham   | Clockify  | 07/08/2025 | Meeting / Review  | 1.5    |

---

## 🛠️ How to Use

Follow these steps to install and run the script:

---

### 📂 1. Open Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com) and open or create a new spreadsheet.
2. Create these two sheets inside it:
   - Rename the first sheet to: `Worktime`
   - Add a second sheet and name it: `WT_Log`  
     *(Optional: If missing, the script will create it automatically)*

---

### 🧑‍💻 2. Open Apps Script Editor (Linked to Spreadsheet)

1. Click `Extensions` → `Apps Script`.
2. A script editor will open — this script is now **linked to your spreadsheet project**.

---

### 💾 3. Paste the Script

1. Delete any default code in the editor.
2. Paste the full script from this repository.
3. Click `File` → `Save`, and give your project a name (e.g., `Worktime Tracker`).

---

### 🔧 4. Set Up Your Users and Keys

Inside the `fetchWorkTimeData()` function:

- Replace the example users with your real user data.
- Use the following placeholders:

```javascript
const users = [
  { name: "YourName", wakaApiKey: "YOUR_WAKATIME_API_KEY", clockifyUserId: "YOUR_CLOCKIFY_USER_ID" },
  { name: "AnotherUser", wakaApiKey: null, clockifyUserId: null }
];

const CLOCKIFY_API_KEY = "YOUR_GLOBAL_CLOCKIFY_API_KEY";
const CLOCKIFY_WORKSPACE_ID = "YOUR_CLOCKIFY_WORKSPACE_ID";
```
You can leave wakaApiKey or clockifyUserId as null if not used by a particular user.

### ⏰ 5. Schedule Automatic Daily Updates (Recommended)
To automate fetching data daily:

1. In the Apps Script editor, click the clock icon (🕒) or open Triggers from the left sidebar.
2. Click + Add Trigger.
3. Set it up like this:
   
    - Function to run: fetchWorkTimeData
    - Deployment: Head
    - Event source: Time-driven
    - Type of trigger: Day timer
    - Time of day: Pick your desired time (e.g., 6:00 AM)

### ✅ 6. You're Done!
Now your spreadsheet will automatically track and log WakaTime and Clockify hours for each user — daily, with detailed project/task breakdowns in WT_Log.

---

## 🔧 Configuration Variables

| Variable | Type | Description |
|---------|------|-------------|
| `timezone` | `string` | Timezone used for formatting date/time (`Asia/Jakarta` by default) |
| `users` | `array` | List of users to fetch data for, with their WakaTime and/or Clockify credentials |
| `wakaApiKey` | `string` | Individual user’s WakaTime API Key |
| `clockifyUserId` | `string` | Individual user’s Clockify user ID |
| `CLOCKIFY_API_KEY` | `string` | Global Clockify API Key for the account |
| `CLOCKIFY_WORKSPACE_ID` | `string` | Clockify workspace ID |

---

## 👤 Adding a New User

1. Add a new object inside the `users` array like so:

```javascript
{ name: "NewUser", wakaApiKey: "your_waka_api", clockifyUserId: "your_clockify_user_id" }
```
2. Leave either wakaApiKey or clockifyUserId as null if the user only uses one service.

## 📤 API Permissions
- WakaTime: Needs basic API access, use your secret API key from WakaTime settings.

- Clockify: Needs X-Api-Key access (can be found in your Clockify account).

## 🛡️ Error Handling
- If data cannot be fetched, it will log a fallback row in WT_Log with error notes.

- Invalid or missing API credentials are safely ignored for each user.

## 📅 Scheduling Automation
To auto-run daily:

- In Apps Script, click on the clock icon (Triggers).

- Create a new trigger for fetchWorkTimeData.

- Set it to run daily, preferably early in the morning (e.g. 6:00 AM).

## 📜 License
MIT License — Use this script freely, modify it as needed, and give credit when appropriate.
