import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

import { getCalendarEvents } from "@/api/calendar";
import TeacherEventModal from "./TeacherEventModal";

import "../styles/calendar.css";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  className?: string;
  extendedProps?: {
    tipo: "TASK" | "EVENT";
    curso?: string;
    materia?: string;
    descripcion?: string;
    readonly?: boolean;
  };
}

type TeacherEventExtendedProps = NonNullable<CalendarEvent["extendedProps"]>;

const TeacherCalendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    const data = await getCalendarEvents();
    setEvents(data);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDate(null);
    setSelectedEvent(null);
  };

  return (
    <>
      <div className="calendar-wrapper">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale="es"
          height="auto"
          events={events}
          dateClick={(info) => {
            setSelectedDate(info.dateStr);
            setSelectedEvent(null);
            setShowModal(true);
          }}
          eventClick={(info) => {
            const eventDate = info.event.startStr || info.event.start?.toISOString() || "";
            const extendedProps = info.event.extendedProps as Partial<TeacherEventExtendedProps>;

            setSelectedDate(eventDate);
            setSelectedEvent({
              id: info.event.id,
              title: info.event.title,
              start: eventDate,
              end: info.event.endStr || undefined,
              className: info.event.classNames[0],
              extendedProps: {
                tipo: extendedProps.tipo === "TASK" ? "TASK" : "EVENT",
                curso: extendedProps.curso,
                materia: extendedProps.materia,
                descripcion: extendedProps.descripcion,
                readonly: extendedProps.readonly,
              },
            });
            setShowModal(true);
          }}
        />
      </div>

      {showModal && selectedDate && (
        <TeacherEventModal
          date={selectedDate}
          event={selectedEvent}
          onClose={closeModal}
          onSaved={loadEvents}
        />
      )}
    </>
  );
};

export default TeacherCalendar;
