import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const TODOIST_TOKEN = process.env.TODOIST_TOKEN;
const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK;

const START = new Date('2026-03-09');

function getNextWeekInfo() {
  const now = new Date();
  const START = new Date('2026-03-09');

  const diffWeeks = Math.floor((now - START) / (1000 * 60 * 60 * 24 * 7));

  const weekType =
    diffWeeks % 2 === 0 ? '🚀 Development Week' : '🌿 Light Week';

  const monday = new Date(now);
  monday.setDate(now.getDate() + (8 - now.getDay()));

  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);

  const options = { month: 'short', day: 'numeric' };

  const start = monday.toLocaleDateString('en-US', options);
  const end = friday.toLocaleDateString('en-US', options);

  const text = `${weekType} (${start}–${end})`;

  return { text, weekType, start, end };
}

async function createTasks(data) {
  const tasks = [];

  if (data.weekType.includes('Development')) {
    tasks.push({
      content: '🔁 Sprint Planning + Retro',
      due_string: 'monday 10am',
    });

    ['tuesday', 'wednesday', 'thursday', 'friday'].forEach((day) => {
      tasks.push({
        content: '🧠 Day Learnings',
        due_string: `${day} 12pm`,
      });
    });
  } else {
    ['monday', 'tuesday', 'wednesday', 'thursday'].forEach((day) => {
      tasks.push({
        content: '🧠 Day Learnings',
        due_string: `${day} 12pm`,
      });
    });

    tasks.push({
      content: '🎤 Demo Day',
      due_string: 'friday 3pm',
    });
  }

  for (const task of tasks) {
    await fetch('https://api.todoist.com/rest/v2/tasks', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.TODOIST_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });
  }
}
async function createTodoistTask(content) {
  await fetch('https://api.todoist.com/rest/v2/tasks', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TODOIST_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content,
      due_string: 'monday',
      priority: 3,
    }),
  });
}

async function sendSlack(content, weekType, start, end) {
  await fetch(process.env.SLACK_WEBHOOK, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🏢 Office Week Reminder',
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Week Type*\n${weekType}`,
            },
            {
              type: 'mrkdwn',
              text: `*Dates*\n${start} – ${end}`,
            },
          ],
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: 'Automated by Todoist Week Bot',
            },
          ],
        },
      ],
    }),
  });
}

async function run() {
  const data = getNextWeekInfo();

  await createTodoistTask(data.text); // main week reminder
  await createTasks(data); // additional workflow tasks
  await sendSlack(data);
}

run();
