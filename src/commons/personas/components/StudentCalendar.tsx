import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

import { getCalendarEvents } from "../../../api/calendar";
import TaskModal from "../components/taskmodal";

import "../styles/calendar.css";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string | null;
  className?: string;
  extendedProps?: {
    tipo: "TASK" | "EVENT";
    curso?: string;
    materia?: string;
    descripcion?: string;
    readonly?: boolean;
  };
}

const StudentCalendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await getCalendarEvents();
      setEvents(data);
    } catch (err) {
      console.error("Error cargando calendario", err);
    }
  };

  return (
    <div className="calendar-wrapper">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale="es"
        height="auto"
        events={getCalendarEvents}
        eventClick={(info) => {
          if (info.event.extendedProps?.tipo === "TASK") {
            setSelectedEvent(info.event);
          }
        }}
      />

      {selectedEvent && (
        <TaskModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onGoToTask={() => {
            setSelectedEvent(null);
            window.dispatchEvent(new CustomEvent("goToTasks"));
          }}
        />
      )}
    </div>
  );
};

export default StudentCalendar;