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

const TeacherCalendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    const data = await getCalendarEvents();
    setEvents(data);
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
            setShowModal(true);
          }}
        />
      </div>

      {showModal && selectedDate && (
        <TeacherEventModal
          date={selectedDate}
          onClose={() => setShowModal(false)}
          onSaved={loadEvents}
        />
      )}
    </>
  );
};

export default TeacherCalendar;