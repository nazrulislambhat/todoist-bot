import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const TOKEN = process.env.TODOIST_TOKEN;
const START = new Date('2026-03-09');

function getNextWeekInfo() {
  const now = new Date();

  const diffWeeks = Math.floor((now - START) / (1000 * 60 * 60 * 24 * 7));

  const weekType =
    diffWeeks % 2 === 0 ? '🚀 Development Week' : '🌿 Light Week';

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() + (8 - now.getDay())); // next Monday

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 4); // Friday

  const options = { month: 'short', day: 'numeric' };

  const startLabel = startOfWeek.toLocaleDateString('en-US', options);
  const endLabel = endOfWeek.toLocaleDateString('en-US', options);

  return `${weekType} (${startLabel}–${endLabel})`;
}

async function createTask() {
  const content = getNextWeekInfo();

  await fetch('https://api.todoist.com/rest/v2/tasks', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content,
      due_string: 'monday',
      priority: 3,
    }),
  });

  console.log('Task created:', content);
}

createTask();
