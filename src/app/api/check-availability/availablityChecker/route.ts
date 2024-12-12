import { NextResponse } from 'next/server';
interface Participant {
  name: string;
  threshold: number;
}
interface Availability {
  [day: string]: { start: string; end: string }[];
}
interface Schedule {
  [date: string]: { start: string; end: string }[];
}
interface InputData {
  participant_ids: number[];
  date_range: {
    start: string;
    end: string;
  };
}
const participants: { [id: number]: Participant } = {
  1: { "name": "Adam", "threshold": 4 },
  2: { "name": "Bosco", "threshold": 4 },
  3: { "name": "Catherine", "threshold": 5 }
};
const participantAvailability: { [id: number]: Availability } = {
  1: {
    "Monday": [{ "start": "09:00", "end": "11:00" }, { "start": "14:00", "end": "16:30" }],
    "Tuesday": [{ "start": "09:00", "end": "18:00" }]
  },
  2: {
    "Monday": [{ "start": "09:00", "end": "18:00" }],
    "Tuesday": [{ "start": "09:00", "end": "11:30" }]
  },
  3: {
    "Monday": [{ "start": "09:00", "end": "18:00" }],
    "Tuesday": [{ "start": "09:00", "end": "18:00" }]
  }
};
const schedules: { [id: number]: Schedule } = {
  1: { "2024-10-28": [{ "start": "09:30", "end": "10:30" }, { "start": "14:30", "end": "15:00" }, { "start": "15:00", "end": "16:30" }] },
  2: { "2024-10-28": [{ "start": "13:00", "end": "13:30" }], "2024-10-29": [{ "start": "09:00", "end": "10:30" }] }
};
async function fetchParticipants() {
  return participants;
}
async function fetchAvailability() {
  return participantAvailability;
}
async function fetchSchedules() {
  return schedules;
}
function timeToDate(date: string, time: string) {
  const [hour, minute] = time.split(':').map(Number);
  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return d;
}
function getThirtyMinuteIncrements(startTime: string, endTime: string, date: string): { start: string, end: string }[] {
  const increments: { start: string; end: string }[] = [];
  const start = timeToDate(date, startTime);
  const end = timeToDate(date, endTime);
  let current = new Date(start.getTime());
  while (current < end) {
    const next = new Date(current.getTime() + 30 * 60 * 1000);
    if (next <= end) {
      const hhStart = current.getHours().toString().padStart(2, '0');
      const mmStart = current.getMinutes().toString().padStart(2, '0');
      const hhEnd = next.getHours().toString().padStart(2, '0');
      const mmEnd = next.getMinutes().toString().padStart(2, '0');
      increments.push({ start: `${hhStart}:${mmStart}`, end: `${hhEnd}:${mmEnd}` });
    }
    current = next;
  }
  return increments;
}
function timeRangesOverlap(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
  return (startA < endB && endA > startB);
}
const isSlotAvailable = (
  participantId: number,
  date: string,
  startTime: string,
  endTime: string,
  schedules: { [id: number]: Schedule },
  participantAvailability: { [id: number]: Availability }
): boolean => {
  const dayOfWeek = getDayOfWeek(date);
  const availability = participantAvailability[participantId]?.[dayOfWeek] || [];
  const slotFitsAvailability = availability.some((slot) => {
    const slotStart = timeToDate(date, slot.start);
    const slotEnd = timeToDate(date, slot.end);
    const checkStart = timeToDate(date, startTime);
    const checkEnd = timeToDate(date, endTime);
    return slotStart.getTime() <= checkStart.getTime() && slotEnd.getTime() >= checkEnd.getTime();
  });
  if (!slotFitsAvailability) return false;
  const participantScheduleForDate = schedules[participantId]?.[date] || [];
  const checkStart = timeToDate(date, startTime);
  const checkEnd = timeToDate(date, endTime);
  for (const schedule of participantScheduleForDate) {
    const scheduleStart = timeToDate(date, schedule.start);
    const scheduleEnd = timeToDate(date, schedule.end);
    if (timeRangesOverlap(checkStart, checkEnd, scheduleStart, scheduleEnd)) {
      return false;
    }
  }
  return true;
};
function getDayOfWeek(dateString: string): string {
  const date = new Date(dateString);
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[date.getUTCDay()];
}
async function getAvailableSlots(input: InputData): Promise<any> {
  const { participant_ids, date_range } = input;
  const { start, end } = date_range;
  const participants = await fetchParticipants();
  const participantAvailability = await fetchAvailability();
  const schedules = await fetchSchedules();
  const startDate = new Date(start);
  const endDate = new Date(end);
  const dateRange = Array.from({ length: Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1 })
    .map((_, index) => new Date(startDate.getTime() + index * (1000 * 3600 * 24)))
    .map((date) => date.toISOString().split('T')[0]); // YYYY-MM-DD format
  const availableSlots: { [date: string]: string[] } = {};
  for (const date of dateRange) {
    const dayOfWeek = getDayOfWeek(date);
    let commonIncrements: { start: string; end: string }[] = [];
    for (let i = 0; i < participant_ids.length; i++) {
      const pid = participant_ids[i];
      const pAvailability = participantAvailability[pid]?.[dayOfWeek] || [];
      let incrementsForParticipant: { start: string; end: string }[] = [];
      for (const slot of pAvailability) {
        const slotIncrements = getThirtyMinuteIncrements(slot.start, slot.end, date);
        const freeIncrements = slotIncrements.filter((increment) =>
          isSlotAvailable(pid, date, increment.start, increment.end, schedules, participantAvailability)
        );
        incrementsForParticipant.push(...freeIncrements);
      }
      if (i === 0) {
        commonIncrements = incrementsForParticipant;
      } else {
        commonIncrements = commonIncrements.filter(ci =>
          incrementsForParticipant.some(pi => pi.start === ci.start && pi.end === ci.end)
        );
      }
      if (commonIncrements.length === 0) {
        break;
      }
    }
    if (commonIncrements.length > 0) {
      availableSlots[date] = commonIncrements.map(ci => `${ci.start}-${ci.end}`);
    }
  }

  const slotAvailability = Object.keys(availableSlots).reduce((slots: any, date) => {
    const exceedsThreshold = participant_ids.some((id) => {
      const dailyMeetings = schedules[id]?.[date]?.length || 0;
      return dailyMeetings >= participants[id].threshold;
    });

    if (!exceedsThreshold) {
      slots[date] = availableSlots[date];
    }

    return slots;
  }, {});

  return slotAvailability;
}

export async function POST(req: Request) {
  try {
    const inputData: InputData = await req.json();
    if (!inputData.participant_ids || !inputData.date_range.start || !inputData.date_range.end) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
    const availableSlots = await getAvailableSlots(inputData);
    return NextResponse.json(availableSlots);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
