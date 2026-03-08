import fetch from 'node-fetch';
import cron from 'node-cron';
import dotenv from 'dotenv';

dotenv.config();

const TOKEN = process.env.TODOIST_TOKEN;
const START = new Date('2026-03-09');

function getWeekType() {
  const now = new Date();
  const weeks = Math.floor((now - START) / (1000 * 60 * 60 * 24 * 7));

  return weeks % 2 === 0
    ? '🚀 Development Week at Office'
    : '🌿 Light Week at Office';
}

async function createTask() {
  const content = getWeekType();

  await fetch('https://api.todoist.com/rest/v2/tasks', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content,
    }),
  });

  console.log('Task created:', content);
}

cron.schedule('0 22 * * 0', () => {
  createTask();
});
