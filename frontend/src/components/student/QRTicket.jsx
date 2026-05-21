import { useRef, useCallback } from "react";
import { QRCodeCanvas } from "qrcode.react";
import dayjs from "dayjs";
import { FaDownload, FaCalendarAlt, FaMapMarkerAlt, FaUserTie, FaTicketAlt } from "react-icons/fa";

const QRTicket = ({ event, registration, qrPayload }) => {
  const ticketRef = useRef(null);

  const handleDownload = useCallback(() => {
    const ticketEl = ticketRef.current;
    if (!ticketEl) return;

    // Create a canvas from the ticket
    const canvas = document.createElement("canvas");
    const scale = 2;
    const width = 440;
    const height = 680;
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    ctx.scale(scale, scale);

    // Background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#003049");
    gradient.addColorStop(1, "#001c2b");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(0, 0, width, height, 20);
    ctx.fill();

    // Header accent
    ctx.fillStyle = "#c1121f";
    ctx.fillRect(0, 0, width, 6);

    // Title
    ctx.fillStyle = "#fdf0d5";
    ctx.font = "bold 22px Outfit, sans-serif";
    ctx.fillText("🎫 EVENTRA TICKET", 24, 44);

    // Divider
    ctx.strokeStyle = "rgba(102, 155, 188, 0.3)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(24, 62);
    ctx.lineTo(width - 24, 62);
    ctx.stroke();
    ctx.setLineDash([]);

    // Event title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px Outfit, sans-serif";
    const eventTitle = event?.title || "Event";
    const maxTitleWidth = width - 48;
    const truncatedTitle =
      ctx.measureText(eventTitle).width > maxTitleWidth
        ? eventTitle.substring(0, 30) + "..."
        : eventTitle;
    ctx.fillText(truncatedTitle, 24, 92);

    // Event details
    ctx.fillStyle = "#a4c3d7";
    ctx.font = "14px Outfit, sans-serif";
    ctx.fillText(
      `📅  ${dayjs(event?.date).format("DD MMM YYYY, dddd")}`,
      24,
      120
    );
    ctx.fillText(`📍  ${event?.location || "—"}`, 24, 144);
    ctx.fillText(`👤  ${event?.organizerName || "—"}`, 24, 168);

    // Status badge
    const isPaid = registration?.paymentStatus === "paid";
    const badgeText = isPaid
      ? `PAID — ₹${registration?.amountPaid || event?.price || 0}`
      : "FREE";
    ctx.fillStyle = isPaid ? "#f5ae22" : "#669bbc";
    ctx.font = "bold 13px Outfit, sans-serif";
    ctx.fillText(badgeText, 24, 192);

    // Group size and coupon details (if any)
    const numPeople = registration?.numberOfPeople || 1;
    const couponVal = registration?.couponCode || null;
    const discountVal = registration?.discountAmount || 0;

    if (numPeople > 1) {
      ctx.fillStyle = "#e0aaff";
      ctx.font = "bold 13px Outfit, sans-serif";
      ctx.fillText(`👥  Group Size: ${numPeople} seats`, 24, 214);
    }

    if (couponVal) {
      ctx.fillStyle = "#80ed99";
      ctx.font = "13px Outfit, sans-serif";
      ctx.fillText(`🏷️  Coupon: ${couponVal} (-₹${discountVal})`, 24, 236);
    }

    // QR Code - draw directly from canvas
    const qrCanvas = ticketEl.querySelector(".qr-canvas");
    if (qrCanvas) {
      const qrSize = 180;
      const qrX = (width - qrSize) / 2;
      const qrY = 260;

      // QR background
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(qrX - 12, qrY - 12, qrSize + 24, qrSize + 24, 16);
      ctx.fill();

      // Draw QR code canvas directly onto the ticket canvas
      ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);
    }

    // Ticket ID
    ctx.fillStyle = "#a4c3d7";
    ctx.font = "11px Outfit, monospace";
    ctx.textAlign = "center";
    const ticketId = registration?.qrToken
      ? registration.qrToken.substring(0, 16).toUpperCase()
      : "—";
    ctx.fillText(`TICKET: ${ticketId}`, width / 2, 260 + 180 + 36);

    // Bottom dashed divider
    ctx.strokeStyle = "rgba(102, 155, 188, 0.3)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(24, height - 80);
    ctx.lineTo(width - 24, height - 80);
    ctx.stroke();
    ctx.setLineDash([]);

    // Footer
    ctx.fillStyle = "#669bbc";
    ctx.font = "12px Outfit, sans-serif";
    ctx.fillText("Present this QR code at the venue for entry", width / 2, height - 50);
    ctx.fillText("eventra.app", width / 2, height - 28);

    ctx.textAlign = "start";

    // Download link
    const link = document.createElement("a");
    link.download = `eventra-ticket-${event?.title?.replace(/\s+/g, "-")?.toLowerCase() || "event"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [event, registration]);

  if (!qrPayload) return null;

  const isPaid = registration?.paymentStatus === "paid";
  const ticketId = registration?.qrToken
    ? registration.qrToken.substring(0, 16).toUpperCase()
    : "—";

  const numPeople = registration?.numberOfPeople || 1;
  const couponVal = registration?.couponCode || null;
  const discountVal = registration?.discountAmount || 0;

  return (
    <div className="space-y-4">
      {/* Ticket Card */}
      <div
        ref={ticketRef}
        className="relative bg-gradient-to-b from-navy-500 to-navy-300 rounded-3xl overflow-hidden border border-navy-400/30 shadow-2xl max-w-sm mx-auto"
      >
        {/* Top accent */}
        <div className="h-1.5 bg-brick-500"></div>

        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cream-500">
              <FaTicketAlt />
              <span className="text-sm font-bold tracking-wider uppercase">
                Eventra Ticket
              </span>
            </div>
            <span
              className={`px-3 py-1 text-[11px] font-bold uppercase rounded-full ${
                isPaid
                  ? "bg-cream-300/20 text-cream-300"
                  : "bg-steel-500/20 text-steel-500"
              }`}
            >
              {isPaid ? `Paid ₹${registration?.amountPaid || event?.price || 0}` : "Free"}
            </span>
          </div>

          {/* Event Info */}
          <div>
            <h3 className="text-xl font-bold text-white mb-3 leading-tight">
              {event?.title}
            </h3>
            <div className="space-y-2 text-sm text-steel-700">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-cream-400 text-xs" />
                {dayjs(event?.date).format("DD MMM YYYY, dddd")}
              </div>
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-cream-400 text-xs" />
                {event?.location}
              </div>
              <div className="flex items-center gap-2">
                <FaUserTie className="text-cream-400 text-xs" />
                {event?.organizerName}
              </div>
              {numPeople > 1 && (
                <div className="flex items-center gap-2 font-bold text-purple-300 text-xs mt-1 bg-purple-500/10 w-max px-2.5 py-0.5 rounded-full border border-purple-500/20">
                  👥 Group Size: {numPeople} seats
                </div>
              )}
              {couponVal && (
                <div className="flex items-center gap-2 font-bold text-green-300 text-xs mt-1 bg-green-500/10 w-max px-2.5 py-0.5 rounded-full border border-green-500/20">
                  🏷️ Coupon: {couponVal} (-₹{discountVal})
                </div>
              )}
            </div>
          </div>

          {/* Dashed divider */}
          <div className="border-t border-dashed border-steel-300/30"></div>

          {/* QR Code */}
          <div className="flex flex-col items-center py-2">
            <div className="bg-white rounded-2xl p-4 shadow-inner">
              <QRCodeCanvas
                className="qr-canvas"
                value={qrPayload}
                size={160}
                level="H"
                includeMargin={false}
                bgColor="#ffffff"
                fgColor="#003049"
              />
            </div>
            <p className="text-[11px] text-steel-500 mt-3 font-mono tracking-wider">
              TICKET: {ticketId}
            </p>
          </div>

          {/* Dashed divider */}
          <div className="border-t border-dashed border-steel-300/30"></div>

          {/* Footer */}
          <p className="text-center text-xs text-steel-500">
            Present this QR code at the venue for entry
          </p>
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        className="w-full max-w-sm mx-auto flex items-center justify-center gap-2 py-3 rounded-2xl bg-navy-500/10 dark:bg-navy-500/20 text-navy-600 dark:text-steel-500 hover:bg-navy-500/20 dark:hover:bg-navy-500/30 font-semibold text-sm transition-all"
      >
        <FaDownload />
        Download Ticket (PNG)
      </button>
    </div>
  );
};

export default QRTicket;
