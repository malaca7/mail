import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

// Ensure backups directory exists
const backupRootDir = path.resolve("backups");
if (!fs.existsSync(backupRootDir)) {
  fs.mkdirSync(backupRootDir, { recursive: true });
}

// Get today's date string YYYY-MM-DD
const today = new Date().toISOString().split("T")[0]; // e.g. '2026-07-29'
const todayBackupDir = path.join(backupRootDir, `backup-${today}`);
const todayBackupZip = path.join(backupRootDir, `backup-${today}.zip`);

function isBackupDoneToday() {
  if (fs.existsSync(todayBackupDir) || fs.existsSync(todayBackupZip)) {
    return true;
  }
  try {
    const tags = execSync("git tag -l", { encoding: "utf-8" });
    if (tags.includes(`backup-${today}`)) {
      return true;
    }
  } catch {
    // ignore git tag error
  }
  return false;
}

function createDailyBackup() {
  if (isBackupDoneToday()) {
    console.log(`[daily-backup] Backup for today (${today}) already exists. Skipping.`);
    return;
  }

  console.log(`[daily-backup] First change of the day detected for ${today}. Creating backup...`);

  // Create local snapshot folder
  fs.mkdirSync(todayBackupDir, { recursive: true });

  const sourceDirs = ["src", "public", "scripts"];
  const sourceFiles = ["package.json", "vite.config.ts", "tsconfig.json", "index.html", "README.md"];

  for (const file of sourceFiles) {
    if (fs.existsSync(file)) {
      fs.copyFileSync(file, path.join(todayBackupDir, file));
    }
  }

  for (const dir of sourceDirs) {
    if (fs.existsSync(dir)) {
      copyRecursiveSync(dir, path.join(todayBackupDir, dir));
    }
  }

  // Create git tag for daily backup if inside git repo
  try {
    execSync(`git tag -a backup-${today} -m "Daily Backup ${today}"`, { stdio: "ignore" });
    console.log(`[daily-backup] Git tag backup-${today} created.`);
  } catch {
    // tag might exist or git not ready
  }

  console.log(`[daily-backup] Daily backup created successfully at backups/backup-${today}`);
}

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else if (exists) {
    fs.copyFileSync(src, dest);
  }
}

createDailyBackup();
