import type { EventInput } from "@fullcalendar/core";
import {
  AppointmentStatus,
  appointmentStatusLabels,
  type AdminAppointment,
} from "../features/appointments/appointmentsApi";

/** Mobil ile uyumlu: en fazla 7 günlük randevu penceresi */
export const APPOINTMENT_BOOKING_WINDOW_DAYS = 7;

const STATUS_FC_CLASS: Record<AppointmentStatus, string> = {
  [AppointmentStatus.Pending]: "Warning",
  [AppointmentStatus.Approved]: "Primary",
  [AppointmentStatus.Completed]: "Success",
  [AppointmentStatus.Cancelled]: "Danger",
  [AppointmentStatus.Rejected]: "Danger",
  [AppointmentStatus.Unanswered]: "Warning",
};

export function getBookingWindow() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + APPOINTMENT_BOOKING_WINDOW_DAYS);
  return { start, end };
}

function parseDateOnly(iso?: string | null): Date | null {
  if (!iso) return null;
  const part = iso.includes("T") ? iso.split("T")[0] : iso.slice(0, 10);
  const d = new Date(`${part}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseTimeOnDate(date: Date, time?: string | null): Date {
  const base = new Date(date);
  if (!time) {
    base.setHours(9, 0, 0, 0);
    return base;
  }
  if (/^\d{2}:\d{2}/.test(time)) {
    const [h, m] = time.split(":").map(Number);
    base.setHours(h, m ?? 0, 0, 0);
    return base;
  }
  const t = new Date(time);
  if (!Number.isNaN(t.getTime())) {
    base.setHours(t.getHours(), t.getMinutes(), 0, 0);
  }
  return base;
}

export function isAppointmentInBookingWindow(
  appt: AdminAppointment,
  windowStart: Date,
  windowEnd: Date,
) {
  const d = parseDateOnly(appt.appointmentDate);
  if (!d) return false;
  return d >= windowStart && d < windowEnd;
}

export function filterAppointmentsForSchedule(
  appointments: AdminAppointment[],
  opts: {
    ownerType?: "store" | "freebarber";
    ownerId?: string;
    windowStart: Date;
    windowEnd: Date;
  },
) {
  return appointments.filter((a) => {
    if (!isAppointmentInBookingWindow(a, opts.windowStart, opts.windowEnd)) return false;
    if (opts.ownerType === "store" && opts.ownerId) return a.storeId === opts.ownerId;
    if (opts.ownerType === "freebarber" && opts.ownerId) return a.freeBarberId === opts.ownerId;
    return true;
  });
}

export function appointmentsToCalendarEvents(
  appointments: AdminAppointment[],
): EventInput[] {
  const events: EventInput[] = [];
  for (const a of appointments) {
    const day = parseDateOnly(a.appointmentDate);
    if (!day) continue;

    const start = parseTimeOnDate(day, a.startTime);
    let end = a.endTime ? parseTimeOnDate(day, a.endTime) : new Date(start);
    if (!a.endTime) end = new Date(start.getTime() + 60 * 60 * 1000);
    if (end <= start) end = new Date(start.getTime() + 60 * 60 * 1000);

    const customer = a.customerName ?? "Müşteri";
    const statusLabel = appointmentStatusLabels[a.status] ?? "";
    const fcClass = STATUS_FC_CLASS[a.status] ?? "Primary";

    events.push({
      id: a.id,
      title: `${customer} · ${statusLabel}`,
      start: start.toISOString(),
      end: end.toISOString(),
      extendedProps: {
        calendar: fcClass,
        appointment: a,
      },
    });
  }
  return events;
}
