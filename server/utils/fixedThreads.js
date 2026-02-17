// server/utils/fixedThreads.js
const FIXED_THREADS = [
  {
    key: 'educational',
    title: 'Educational',
    description: 'Subjects, exams, notes, and academic doubts.',
  },
  {
    key: 'career',
    title: 'Career',
    description: 'Internships, placements, skills, and resume advice.',
  },
  {
    key: 'hobbies',
    title: 'Hobbies',
    description: 'Clubs, coding, music, art, sports, and side projects.',
  },
  {
    key: 'faculties',
    title: 'Faculties',
    description: 'Discuss courses, faculty feedback, and teaching styles.',
  },
  {
    key: 'rejuvenation',
    title: 'Rejuvenation',
    description: 'Events, meetups, fun, mental health, and chill topics.',
  },
  {
    key: 'campus_life',
    title: 'Campus Life & Facilities',
    description: 'Hostels, mess, transport, campus facilities and issues.',
  },
];

const THREAD_KEYS = FIXED_THREADS.map((t) => t.key);

const findThread = (key) => FIXED_THREADS.find((t) => t.key === key);

module.exports = {
  FIXED_THREADS,
  THREAD_KEYS,
  findThread,
};