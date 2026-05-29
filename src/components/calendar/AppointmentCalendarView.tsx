import { useMemo, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import trLocale from "@fullcalendar/core/locales/tr";
import type { EventClickArg, EventContentArg, SlotLabelContentArg } from "@fullcalendar/core";
import {
  APPOINTMENT_BOOKING_WINDOW_DAYS,
  appointmentsToCalendarEvents,
  filterAppointmentsForSchedule,
  getBookingWindow,
} from "../../utils/appointmentCalendar";
import {
  useGetAppointmentsQuery,
  AppointmentFilter,
  AppointmentStatus,
  appointmentStatusBadgeColor,
  appointmentStatusLabels,
  type AdminAppointment,
} from "../../features/appointments/appointmentsApi";
import AppointmentDetailDrawer from "../../features/appointments/AppointmentDetailDrawer";
import { useState } from "react";
import Badge from "../ui/badge/Badge";

function formatHourRange(hour: number) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const start = `${pad(hour)}:00`;
  const end = hour >= 23 ? "24:00" : `${pad(hour + 1)}:00`;
  return `${start}-${end}`;
}

function renderSlotLabel(arg: SlotLabelContentArg) {
  const hour = arg.date.getHours();
  return { html: `<span class="appointment-slot-label">${formatHourRange(hour)}</span>` };
}

function renderEventContent(eventInfo: EventContentArg) {
  const colorClass = `fc-bg-${String(eventInfo.event.extendedProps.calendar ?? "Primary").toLowerCase()}`;
  return (
    <div className={`event-fc-color flex fc-event-main ${colorClass} rounded-sm p-1`}>
      <div className="fc-daygrid-event-dot" />
      {eventInfo.timeText ? (
        <div className="fc-event-time text-[10px]">{eventInfo.timeText}</div>
      ) : null}
      <div className="fc-event-title truncate text-xs">{eventInfo.event.title}</div>
    </div>
  );
}

export default function AppointmentCalendarView({
  ownerType,
  ownerId,
  ownerLabel,
}: {
  ownerType?: "store" | "freebarber";
  ownerId?: string;
  ownerLabel?: string;
}) {
  const calendarRef = useRef<FullCalendar>(null);
  const { start: windowStart, end: windowEnd } = useMemo(() => getBookingWindow(), []);
  const { data: allAppointments = [], isLoading, isFetching } = useGetAppointmentsQuery(
    AppointmentFilter.All,
  );

  const [selected, setSelected] = useState<AdminAppointment | null>(null);

  const filtered = useMemo(
    () =>
      filterAppointmentsForSchedule(allAppointments, {
        ownerType,
        ownerId,
        windowStart,
        windowEnd,
      }),
    [allAppointments, ownerType, ownerId, windowStart, windowEnd],
  );

  const events = useMemo(() => appointmentsToCalendarEvents(filtered), [filtered]);

  const handleEventClick = (info: EventClickArg) => {
    const appt = info.event.extendedProps.appointment as AdminAppointment | undefined;
    if (appt) setSelected(appt);
  };

  const windowLabel = useMemo(() => {
    const fmt = (d: Date) =>
      d.toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
    const last = new Date(windowEnd);
    last.setDate(last.getDate() - 1);
    return `${fmt(windowStart)} – ${fmt(last)}`;
  }, [windowStart, windowEnd]);

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {ownerLabel ? (
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">{ownerLabel}</p>
          ) : null}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {APPOINTMENT_BOOKING_WINDOW_DAYS} günlük randevu penceresi (mobil ile aynı): {windowLabel}
            {" · "}
            <strong>{filtered.length}</strong> randevu
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              AppointmentStatus.Pending,
              AppointmentStatus.Approved,
              AppointmentStatus.Completed,
              AppointmentStatus.Cancelled,
              AppointmentStatus.Rejected,
            ] as const
          ).map((s) => (
            <Badge key={s} size="sm" color={appointmentStatusBadgeColor[s]}>
              {appointmentStatusLabels[s]}
            </Badge>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {isLoading || isFetching ? (
          <p className="p-8 text-center text-sm text-gray-500">Randevular yükleniyor...</p>
        ) : (
          <div className="custom-calendar appointment-schedule-calendar p-4 sm:p-6">
            <FullCalendar
              ref={calendarRef}
              plugins={[timeGridPlugin, interactionPlugin]}
              initialView="timeGridSevenDay"
              views={{
                timeGridSevenDay: {
                  type: "timeGrid",
                  duration: { days: APPOINTMENT_BOOKING_WINDOW_DAYS },
                  buttonText: "7 Gün",
                },
              }}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "timeGridSevenDay",
              }}
              locales={[trLocale]}
              locale="tr"
              buttonText={{
                today: "Bugün",
                prev: "",
                next: "",
              }}
              firstDay={1}
              slotMinTime="00:00:00"
              slotMaxTime="23:00:00"
              slotDuration="01:00:00"
              slotLabelInterval="01:00:00"
              slotLabelContent={renderSlotLabel}
              allDaySlot={false}
              height="auto"
              validRange={{
                start: windowStart.toISOString().slice(0, 10),
                end: windowEnd.toISOString().slice(0, 10),
              }}
              events={events}
              eventClick={handleEventClick}
              eventContent={renderEventContent}
              nowIndicator
            />
          </div>
        )}
      </div>

      <AppointmentDetailDrawer
        appointment={selected}
        isOpen={!!selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
