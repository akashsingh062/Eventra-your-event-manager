import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import api from "../../services/api";
import { toast } from "react-toastify";
import {
  FaQrcode,
  FaKeyboard,
  FaCheckCircle,
  FaTimesCircle,
  FaUser,
  FaEnvelope,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaUserCheck,
  FaUsers,
  FaTicketAlt,
} from "react-icons/fa";
import dayjs from "dayjs";

const CheckIn = () => {
  const [activeTab, setActiveTab] = useState("camera"); // 'camera' | 'manual'
  const [manualCode, setManualCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [ticketDetails, setTicketDetails] = useState(null);
  const [scanError, setScanError] = useState("");

  const scannerRef = useRef(null);

  // Initialize html5-qrcode scanner
  useEffect(() => {
    if (activeTab !== "camera") {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err) => console.log("Error clearing scanner", err));
        scannerRef.current = null;
      }
      return;
    }

    // Delay start slightly to ensure container is rendered
    const timer = setTimeout(() => {
      try {
        const scanner = new Html5QrcodeScanner(
          "qr-reader-container",
          {
            fps: 10,
            qrbox: { width: 260, height: 260 },
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true,
          },
          /* verbose= */ false
        );

        scanner.render(
          async (decodedText) => {
            // Success callback
            // Sound feedback
            playBeep();
            scanner.clear().catch((err) => console.log(err));
            scannerRef.current = null;
            setActiveTab("manual"); // Switch to detail view mode (manual tab is fine)
            await handleVerifyPayload(decodedText);
          },
          () => {
            // Verbose error logging (can ignore spammy frame errors)
          }
        );

        scannerRef.current = scanner;
      } catch (err) {
        console.error("Scanner init error", err);
        setScanError("Unable to access camera or load scanner.");
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err) => console.log("Cleanup: Error clearing scanner", err));
        scannerRef.current = null;
      }
    };
  }, [activeTab]);

  // Audio cue on successful QR read
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.15); // play for 150ms
    } catch (e) {
      console.log("Audio feedback error", e);
    }
  };

  const handleVerifyPayload = async (payloadStr) => {
    setVerifying(true);
    setScanError("");
    setTicketDetails(null);
    try {
      const { data } = await api.post("/api/admin/checkin/verify", {
        qrPayload: payloadStr,
      });

      if (data.valid) {
        setTicketDetails(data.registration);
        toast.success("Ticket verified! Review details below to confirm check-in.");
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || "Invalid ticket code or format";
      setScanError(errMsg);
      toast.error(errMsg);
    } finally {
      setVerifying(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) {
      toast.warn("Please enter a QR payload token");
      return;
    }
    handleVerifyPayload(manualCode);
  };

  const handleConfirmCheckin = async () => {
    if (!ticketDetails?._id) return;
    setConfirming(true);
    try {
      const { data } = await api.post("/api/admin/checkin/confirm", {
        registrationId: ticketDetails._id,
      });
      toast.success(data.message);
      // Refresh local state to show checked-in
      setTicketDetails((prev) => ({
        ...prev,
        checkedIn: true,
        checkedInAt: data.registration.checkedInAt,
        ticketStatus: "used",
      }));
    } catch (err) {
      const errMsg = err.response?.data?.message || "Check-in failed";
      toast.error(errMsg);
    } finally {
      setConfirming(false);
    }
  };

  const handleResetScanner = () => {
    setTicketDetails(null);
    setScanError("");
    setManualCode("");
    setActiveTab("camera");
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8 bg-transparent">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Event Check-In
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Scan student ticket QR codes or enter details manually to confirm attendance
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-white dark:bg-navy-200 p-1.5 rounded-2xl border border-gray-100 dark:border-navy-400/30 w-max shadow-sm">
        <button
          onClick={() => {
            handleResetScanner();
            setActiveTab("camera");
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            activeTab === "camera"
              ? "bg-brick-500 text-white shadow-md shadow-brick-500/25 dark:shadow-none"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-navy-300/30"
          }`}
        >
          <FaQrcode /> Camera Scanner
        </button>
        <button
          onClick={() => setActiveTab("manual")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            activeTab === "manual"
              ? "bg-brick-500 text-white shadow-md shadow-brick-500/25 dark:shadow-none"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-navy-300/30"
          }`}
        >
          <FaKeyboard /> Manual Entry
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Scanner Container */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white dark:bg-navy-200 border border-gray-200 dark:border-navy-400/30 rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col items-center">
            {activeTab === "camera" ? (
              <div className="w-full space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-navy-400/20 pb-4 w-full">
                  <h3 className="font-bold text-gray-900 dark:text-cream-500">Live QR Scanner</h3>
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brick-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brick-500"></span>
                  </span>
                </div>

                {/* html5-qrcode container */}
                <div className="overflow-hidden rounded-2xl bg-gray-950 border border-gray-800 w-full relative">
                  <div id="qr-reader-container" className="w-full"></div>
                </div>

                <p className="text-xs text-center text-gray-500 dark:text-steel-400">
                  Align the ticket QR code within the scanner box to scan automatically.
                </p>
              </div>
            ) : (
              <form onSubmit={handleManualSubmit} className="w-full space-y-5">
                <div className="border-b border-gray-100 dark:border-navy-400/20 pb-4">
                  <h3 className="font-bold text-gray-900 dark:text-cream-500">Manual Code Lookup</h3>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500 dark:text-steel-500 uppercase tracking-wider">
                    Paste ticket payload token
                  </label>
                  <textarea
                    rows={4}
                    placeholder='e.g. {"t":"...", "r":"...", "e":"..."}'
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-navy-300/10 border border-gray-200 dark:border-navy-400/20 text-gray-900 dark:text-cream-500 placeholder-gray-400 dark:placeholder-steel-500 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:border-transparent transition-all text-sm font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={verifying}
                  className="w-full py-3.5 bg-navy-500 text-white rounded-2xl font-bold text-sm hover:bg-navy-600 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                >
                  {verifying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Verifying...
                    </>
                  ) : (
                    "Verify Code"
                  )}
                </button>
              </form>
            )}

            {/* Error box */}
            {scanError && (
              <div className="mt-6 w-full p-4 bg-brick-900/10 dark:bg-brick-500/10 border border-brick-500/30 rounded-2xl flex items-start gap-3">
                <FaTimesCircle className="text-brick-500 shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="font-semibold text-brick-500 text-sm">Verification Failed</h4>
                  <p className="text-xs text-brick-500/90 mt-0.5">{scanError}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Ticket details / Confirm check-in */}
        <div className="lg:col-span-6">
          {ticketDetails ? (
            <div className="bg-white dark:bg-navy-200 border border-gray-200 dark:border-navy-400/30 rounded-3xl p-6 md:p-8 shadow-md space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-navy-400/20 pb-4">
                <h3 className="font-bold text-gray-900 dark:text-cream-500 text-lg">Ticket Verification Details</h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    ticketDetails.checkedIn
                      ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                  }`}
                >
                  {ticketDetails.checkedIn ? "Checked In" : "Pending Admission"}
                </span>
              </div>

              {/* Event card details */}
              <div className="bg-cream-900 dark:bg-navy-300/30 rounded-2xl p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <FaCalendarAlt className="text-navy-600 dark:text-steel-500 mt-1 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                      {ticketDetails.event?.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-steel-400 mt-1">
                      {dayjs(ticketDetails.event?.date).format("dddd, DD MMMM YYYY")}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-steel-400 flex items-center gap-1 mt-1">
                      <FaMapMarkerAlt size={10} /> {ticketDetails.event?.location}
                    </p>
                  </div>
                </div>
              </div>

              {/* Attendee details */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 dark:text-steel-400 uppercase tracking-wider">Attendee Info</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-navy-300/50 flex items-center justify-center text-gray-500 dark:text-cream-500 shrink-0">
                      <FaUser />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-steel-500">Name</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-cream-300">{ticketDetails.user?.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-navy-300/50 flex items-center justify-center text-gray-500 dark:text-cream-500 shrink-0">
                      <FaEnvelope />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-steel-500">Email Address</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-cream-300 truncate max-w-[160px]">
                        {ticketDetails.user?.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-navy-300/50 flex items-center justify-center text-gray-500 dark:text-cream-500 shrink-0">
                      <FaMoneyBillWave />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-steel-500">Payment Status</p>
                      <p className="text-sm font-bold text-green-600 dark:text-green-400 uppercase">{ticketDetails.paymentStatus}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-navy-300/50 flex items-center justify-center text-gray-500 dark:text-cream-500 shrink-0">
                      <FaUserCheck />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-steel-500">Ticket Status</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-cream-300 capitalize">
                        {ticketDetails.ticketStatus}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-navy-300/50 flex items-center justify-center text-gray-500 dark:text-cream-500 shrink-0">
                      <FaUsers />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-steel-500">Group Size</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-cream-300">
                        {ticketDetails.numberOfPeople || 1} {ticketDetails.numberOfPeople > 1 ? "people" : "person"}
                      </p>
                    </div>
                  </div>

                  {ticketDetails.couponCode && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-navy-300/50 flex items-center justify-center text-gray-500 dark:text-cream-500 shrink-0">
                        <FaTicketAlt />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-steel-500">Coupon Used</p>
                        <p className="text-sm font-bold text-green-600 dark:text-green-400 uppercase">
                          {ticketDetails.couponCode} (-₹{ticketDetails.discountAmount || 0})
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Confirm check-in button or checked-in message */}
              <div className="pt-6 border-t border-gray-100 dark:border-navy-400/20 space-y-4">
                {ticketDetails.checkedIn ? (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-3">
                    <FaCheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                    <div>
                      <h4 className="font-semibold text-emerald-500 text-sm">Checked In Successfully</h4>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400/90 mt-0.5">
                        Attendance confirmed at {dayjs(ticketDetails.checkedInAt).format("DD MMM, h:mm A")}
                      </p>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleConfirmCheckin}
                    disabled={confirming}
                    className="w-full py-4 bg-brick-500 text-white rounded-2xl font-bold text-lg hover:bg-brick-400 disabled:opacity-60 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brick-500/25 dark:shadow-none"
                  >
                    {confirming ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Confirming Check-In...
                      </>
                    ) : (
                      "Confirm Check-In & Admit"
                    )}
                  </button>
                )}

                <button
                  onClick={handleResetScanner}
                  className="w-full py-3 bg-gray-50 dark:bg-navy-300/30 text-gray-700 dark:text-cream-500 font-semibold rounded-2xl text-sm border border-gray-200 dark:border-navy-400/20 hover:bg-gray-100 transition-colors"
                >
                  Scan / Lookup Another Ticket
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-navy-200 border border-gray-200 dark:border-navy-400/30 rounded-3xl p-12 text-center shadow-sm">
              <div className="text-gray-300 dark:text-navy-400 flex justify-center mb-4">
                <FaQrcode size={56} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-cream-500">Awaiting Ticket Scan</h3>
              <p className="text-sm text-gray-500 dark:text-steel-400 mt-2 max-w-xs mx-auto">
                Scan a ticket QR code using your camera or enter the payload manually on the left to see details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckIn;
