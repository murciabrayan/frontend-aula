import { useState } from "react";
import type { FormEvent } from "react";

import { useFeedback } from "@/context/FeedbackContext";
import { sendLandingContactMessage } from "@/landing/landing.api";

const contactCards = [
  {
    title: "Sede principal",
    text: "Cl. 8 # 6-87, Simijaca, Simijaca, Cundinamarca. Sede principal del colegio con espacios académicos y comunitarios.",
  },
  {
    title: "Línea de atención",
    text: "3213982405 - 3112756838. Equipo disponible para orientar procesos institucionales, matrículas y vida escolar.",
  },
  {
    title: "Correo institucional",
    text: "ieloscerros@gmail.com. Respuesta prioritaria para aspirantes, familias y comunidad académica.",
  },
];

const initialForm = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

const ContactPage = () => {
  const [form, setForm] = useState(initialForm);
  const [sending, setSending] = useState(false);
  const { showNotice } = useFeedback();

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSending(true);

    try {
      const response = await sendLandingContactMessage(form);
      setForm(initialForm);
      await showNotice({
        title: "Mensaje enviado",
        message:
          response.message ||
          "Tu mensaje fue enviado correctamente al equipo institucional.",
        buttonText: "Entendido",
        tone: "success",
      });
    } catch (error: any) {
      await showNotice({
        title: "No se pudo enviar",
        message:
          error.response?.data?.error ||
          "Ocurrió un problema al enviar tu mensaje. Intenta nuevamente.",
        buttonText: "Entendido",
        tone: "error",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="landing-page">
      <section className="landing-inner-hero landing-inner-hero--dark">
        <div className="landing-section-heading landing-section-heading--dark">
          <span className="landing-section-tag">Contacto</span>
          <h1>Estamos listos para acompañarte en tu proceso</h1>
          <p>
            Conecta con nuestro equipo institucional para resolver dudas sobre matrículas,
            vida escolar, servicios y orientación para familias.
          </p>
        </div>
      </section>

      <section className="landing-contact-workspace">
        <article className="landing-contact-form-card">
          <div className="landing-section-heading">
            <span className="landing-section-tag landing-section-tag--light">Escríbenos</span>
            <h2>Envíanos tu mensaje</h2>
            <p>
              Comparte tus datos y el motivo de contacto. Nuestro equipo institucional
              te dará respuesta a través de los canales oficiales.
            </p>
          </div>

          <form className="landing-contact-form" onSubmit={handleSubmit}>
            <div className="landing-contact-form__grid">
              <label>
                <span>Nombre completo</span>
                <input
                  type="text"
                  name="name"
                  placeholder="Tu nombre"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                <span>Correo electrónico</span>
                <input
                  type="email"
                  name="email"
                  placeholder="correo@ejemplo.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                <span>Teléfono</span>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+57 300 000 0000"
                  value={form.phone}
                  onChange={handleChange}
                />
              </label>
              <label>
                <span>Asunto</span>
                <input
                  type="text"
                  name="subject"
                  placeholder="Matrículas, información, convivencia..."
                  value={form.subject}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            <label className="landing-contact-form__full">
              <span>Mensaje</span>
              <textarea
                name="message"
                rows={6}
                placeholder="Cuéntanos cómo podemos ayudarte"
                value={form.message}
                onChange={handleChange}
                required
              />
            </label>

            <div className="landing-contact-form__footer">
              <button
                type="submit"
                className="landing-btn landing-btn--primary"
                disabled={sending}
              >
                {sending ? "Enviando..." : "Enviar mensaje"}
              </button>
            </div>
          </form>
        </article>

        <article className="landing-map-card">
          <div className="landing-section-heading">
            <span className="landing-section-tag landing-section-tag--light">Ubicación</span>
            <h2>Encuéntranos fácilmente</h2>
            <p>
              Consulta la ubicación del colegio y orienta tu visita con una referencia visual clara.
            </p>
          </div>

          <div className="landing-map-frame">
            <iframe
              title="Ubicación de la institución"
              src="https://www.google.com/maps?q=5.503327,-73.852606&z=17&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </article>
      </section>

      <section className="landing-contact-grid">
        {contactCards.map((item) => (
          <article key={item.title} className="landing-contact-card">
            <h2>{item.title}</h2>
            <p>{item.text}</p>
          </article>
        ))}
      </section>
    </div>
  );
};

export default ContactPage;
